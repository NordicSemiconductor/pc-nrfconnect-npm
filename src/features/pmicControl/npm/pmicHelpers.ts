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
    NpmDevice,
    PartialUpdate,
    PmicDialog,
    SupportedErrorLogs,
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
export const parseColonBasedAnswer = (message: string) => {
    const parsed = message.split(':')[1]?.trim();
    if (parsed.endsWith('.')) {
        return parsed.substring(0, parsed.length - 1);
    }

    return parsed;
};

export const parseToNumber = (message: string) =>
    Number.parseInt(parseColonBasedAnswer(message), 10);

export const parseToFloat = (message: string) =>
    Number.parseFloat(parseColonBasedAnswer(message));

export const parseToBoolean = (message: string) =>
    Number.parseInt(parseColonBasedAnswer(message), 10) === 1;

export const parseEnabled = (message: string): boolean => {
    const res = parseColonBasedAnswer(message).toLocaleLowerCase();

    return res === 'enable' || res === 'enabled';
};

export const parseOnOff = (message: string): boolean =>
    parseColonBasedAnswer(message).toLowerCase() === 'on';

// Select the type value from a type value array, ignoring case
// (search for 'ldo' in ['LDO','Load_switch] and find 'LDO')
export const selectFromTypeValues = (
    value: string,
    typeValues: readonly string[]
): string | undefined => {
    const lowerCaseValue = value.toLowerCase();
    return typeValues.find(
        typeValue => typeValue.toLowerCase() === lowerCaseValue
    );
};

export const parseBatteryModel = (message: string) => {
    const slot = message.split(':')[1];
    let slotIndex: number | undefined;
    if (slot && slot.trim() === 'Empty') return null;
    if (slot) {
        slotIndex = Number.parseInt(
            message.split(':')[0].replace('Slot ', ''),
            10
        );
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

    if (valuePairs.length <= 1) return null;

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

        if (temperature.length > 0 && capacity.length > 0) {
            while (temperature.length > 0 && capacity.length > 0) {
                const t = temperature.pop();
                const q = capacity.pop();
                if (t !== undefined && q !== undefined)
                    characterizations.push({
                        temperature: t,
                        capacity: q,
                    });
            }
        } else if (capacity.length === 1) {
            characterizations.push({
                capacity: capacity[0],
            });
        }
    });

    return {
        name,
        characterizations,
        slotIndex,
    } as BatteryModel;
};

export const toRegex = (
    command: string,
    getSet?: boolean,
    index?: number,
    valueRegex: string | RegExp = '[0-9]+'
) => {
    const indexRegex = index !== undefined ? ` ${index}` : '';
    if (getSet)
        command += ` (set${indexRegex} ${valueRegex}( [^\\s-]+)?|get${indexRegex})`;
    else if (index !== undefined) command += indexRegex;

    command = command.replaceAll(' ', '([^\\S\\r\\n])+');
    return `${command}`;
};

// Generate a regex to match a set of numbers [1,2,3] => '(1|2|3)'
export const toValueRegex = (values: readonly unknown[]) =>
    `(${values.join('|')})`;

// Generate a regex to match a set of strings
export const toValueRegexString = (values: readonly string[]) =>
    `(${values.map(str => caseIgnorantRegexString(str)).join('|')})`;

// Create a case ignorant regex string: 'yes' => '[yY][eE][sS]'
export const caseIgnorantRegexString = (str: string): string =>
    Array.from(str)
        .map(chr =>
            chr.match(/[a-zA-Z]/)
                ? `[${chr.toLowerCase()}${chr.toUpperCase()}]`
                : chr
        )
        .join('');

export const onOffRegex = '([Oo][Nn]|[Oo][Ff][Ff])';

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

export const updateNpm1300AdcTimings =
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
        const stateNotChargingSamplingRate =
            getState().app.pmicControl.fuelGaugeSettings
                .notChargingSamplingRate;
        const stateChargingSamplingRate =
            getState().app.pmicControl.fuelGaugeSettings.chargingSamplingRate ??
            stateNotChargingSamplingRate;
        getState().app.pmicControl.npmDevice?.startAdcSample(
            reportInterval ??
                getState().app.pmicControl.fuelGaugeSettings.reportingRate,
            getState().app.pmicControl.charger?.enabled
                ? chargingSamplingRate ?? stateChargingSamplingRate
                : samplingRate ?? stateNotChargingSamplingRate
        );
    };

export const isNpm1300SerialApplicationMode = (device: Device) =>
    device.usb?.device.descriptor.idProduct === 0x53ab &&
    device.usb?.device.descriptor.idVendor === 0x1915;

export const isNpm1300SerialRecoverMode = (device: Device) =>
    device.usb?.device.descriptor.idProduct === 0x53ac &&
    device.usb?.device.descriptor.idVendor === 0x1915;

export const isNpm2100SerialApplicationMode = (device: Device) =>
    device.usb?.device.descriptor.idProduct === 0x53ad &&
    device.usb?.device.descriptor.idVendor === 0x1915;

export const isNpm2100SerialRecoverMode = (device: Device) =>
    device.usb?.device.descriptor.idProduct === 0x53ae &&
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

export const SupportsErrorLogs = (npmDevice: NpmDevice): boolean =>
    npmDevice.supportedErrorLogs !== undefined &&
    Object.keys(npmDevice.supportedErrorLogs).some(
        k => npmDevice.supportedErrorLogs?.[k as keyof SupportedErrorLogs]
    );
