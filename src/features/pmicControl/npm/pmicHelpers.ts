/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    AppThunk,
    Device,
    getPersistentStore,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import EventEmitter from 'events';
import { v4 as uuid } from 'uuid';

import { RootState } from '../../../appReducer';
import { dequeueDialog, requestDialog } from '../pmicControlSlice';
import {
    BatteryModel,
    BatteryModelCharacterization,
    LoggingEvent,
    PartialUpdate,
    PmicDialog,
} from './types';

export const noop = () => {};

const parseTime = (timeString: string) => {
    const time = timeString.trim().split(',')[0].replace('.', ':').split(':');
    const msec = Number(time[3]);
    const sec = Number(time[2]) * 1000;
    const min = Number(time[1]) * 1000 * 60;
    const hr = Number(time[0]) * 1000 * 60 * 60;

    return msec + sec + min + hr;
};

export const isModuleDataPair = (module: string) =>
    module === 'module_pmic_adc' ||
    module === 'module_pmic_irq' ||
    module === 'module_cc_profiling';

export const parseLogData = (
    logMessage: string,
    callback: (loggingEvent: LoggingEvent) => void
) => {
    const endOfTimestamp = logMessage.indexOf(']');

    const strTimeStamp = logMessage.substring(1, endOfTimestamp);

    const endOfLogLevel = logMessage.indexOf('>');

    const logLevel = logMessage.substring(
        logMessage.indexOf('<') + 1,
        endOfLogLevel
    );
    const module = logMessage.substring(
        endOfLogLevel + 2,
        logMessage.indexOf(':', endOfLogLevel)
    );
    const message = logMessage
        .substring(logMessage.indexOf(':', endOfLogLevel) + 2)
        .trim();

    callback({ timestamp: parseTime(strTimeStamp), logLevel, module, message });
};

// parse strings like value is: XXX mV
export const parseColonBasedAnswer = (message: string) =>
    message.split(':')[1]?.trim();

export const parseToNumber = (message: string) =>
    Number.parseInt(parseColonBasedAnswer(message), 10);

export const parseToBoolean = (message: string) =>
    Number.parseInt(parseColonBasedAnswer(message), 10) === 1;

export const parseBatteryModel = (message: string) => {
    const slot = message.split(':')[1];
    if (slot && slot.trim() === 'Empty') return null;
    if (slot) {
        message = slot;
    }

    const valuePairs = message
        .trim()
        .replaceAll(/("|}),/g, ';')
        .split(';');

    const characterizations: BatteryModelCharacterization[] = [];
    let temperature: number[] = [];
    let capacity: number[] = [];
    let name = '';

    if (valuePairs.length !== 3) return null;

    valuePairs.forEach(value => {
        const pair = value.split('=');
        switch (pair[0].replace(',', '')) {
            case 'name':
                name = pair[1].replaceAll('"', '');
                break;
            case 'T':
                temperature = pair[1]
                    .replaceAll(/({|}|},)/g, '')
                    .split(',')
                    .map(Number.parseFloat);
                break;
            case 'Q':
                capacity = pair[1]
                    .replaceAll(/({|}|},)/g, '')
                    .split(',')
                    .map(Number.parseFloat);
                break;
        }

        while (temperature.length > 0 && capacity.length > 0) {
            const t = temperature.pop();
            const q = capacity.pop();
            if (t !== undefined && q !== undefined)
                characterizations.push({
                    temperature: t,
                    capacity: q,
                });
        }
    });

    return {
        name,
        characterizations,
    } as BatteryModel;
};

export const toRegex = (
    command: string,
    getSet?: boolean,
    index?: number,
    valueRegex = '[0-9]+'
) => {
    const indexRegex = index !== undefined ? ` ${index}` : '';
    if (getSet)
        command += ` (set${indexRegex} ${valueRegex}( [^\\s-]+)?|get${indexRegex})`;
    else if (index !== undefined) command += indexRegex;

    command = command.replaceAll(' ', '([^\\S\\r\\n])+');
    return `${command}`;
};

export const dialogHandler =
    (pmicDialog: PmicDialog): AppThunk =>
    dispatch => {
        if (!pmicDialog.uuid) pmicDialog.uuid === uuid();

        if (
            pmicDialog.doNotAskAgainStoreID !== undefined &&
            getPersistentStore().get(
                `pmicDialogs:${pmicDialog.doNotAskAgainStoreID}`
            )?.doNotShowAgain === true
        ) {
            pmicDialog.onConfirm();
            return;
        }

        if (pmicDialog.cancelClosesDialog !== false) {
            const onCancel = pmicDialog.onCancel;
            pmicDialog.onCancel = () => {
                onCancel();
                dispatch(dequeueDialog());
            };
        }

        if (
            pmicDialog.doNotAskAgainStoreID !== undefined &&
            pmicDialog.onOptional
        ) {
            const onOptional = pmicDialog.onOptional;
            pmicDialog.onOptional = () => {
                onOptional();
                if (pmicDialog.optionalClosesDialog !== false) {
                    dispatch(dequeueDialog());
                }
                getPersistentStore().set(
                    `pmicDialogs:${pmicDialog.doNotAskAgainStoreID}`,
                    { doNotShowAgain: true }
                );
            };
        }

        if (pmicDialog.confirmClosesDialog !== false) {
            const onConfirm = pmicDialog.onConfirm;
            pmicDialog.onConfirm = () => {
                onConfirm();
                dispatch(dequeueDialog());
            };
        }

        dispatch(requestDialog(pmicDialog));
    };

export const updateAdcTimings =
    ({
        samplingRate,
        chargingSamplingRate,
        reportInterval,
    }: {
        samplingRate?: number;
        chargingSamplingRate?: number;
        reportInterval?: number;
    }): AppThunk<RootState> =>
    (_, getState) => {
        getState().app.pmicControl.npmDevice?.startAdcSample(
            reportInterval ?? getState().app.pmicControl.fuelGaugeReportingRate,
            getState().app.pmicControl.charger?.enabled
                ? chargingSamplingRate ??
                      getState().app.pmicControl.fuelGaugeChargingSamplingRate
                : samplingRate ??
                      getState().app.pmicControl
                          .fuelGaugeNotChargingSamplingRate
        );
    };

export const isNpm1300SerialApplicationMode = (device: Device) =>
    device.usb?.device.descriptor.idProduct === 0x53ab &&
    device.usb?.device.descriptor.idVendor === 0x1915;

export const isNpm1300SerialRecoverMode = (device: Device) =>
    device.usb?.device.descriptor.idProduct === 0x53ac &&
    device.usb?.device.descriptor.idVendor === 0x1915;

export const MAX_TIMESTAMP = 2 ** 32 - 1; //  2^32
export const DOWNLOAD_BATTERY_PROFILE_DIALOG_ID = 'downloadBatteryProfile';
export const GENERATE_BATTERY_PROFILE_DIALOG_ID = 'generateBatteryProfile';

export class NpmEventEmitter extends EventEmitter {
    emitPartialEvent<T>(eventName: string, data: Partial<T>, index?: number) {
        this.emit(
            eventName,
            index !== undefined
                ? ({
                      index,
                      data,
                  } as PartialUpdate<T>)
                : data
        );
    }
}
