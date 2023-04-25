/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';
import { getPersistentStore, logger } from 'pc-nrfconnect-shared';
import { v4 as uuid } from 'uuid';

import { ShellParser } from '../../../hooks/commandParser';
import { TDispatch } from '../../../thunk';
import { dequeueDialog, requestDialog } from '../pmicControlSlice';
import {
    BatteryModel,
    BatteryModelCharacterization,
    LoggingEvent,
    PmicDialog,
} from './types';

export const noop = () => {};

// parse strings like value is: XXX mV
export const parseColonBasedAnswer = (message: string) =>
    message.split(':')[1]?.trim();

export const parseToNumber = (message: string) =>
    Number.parseInt(parseColonBasedAnswer(message), 10);

export const parseToBoolean = (message: string) =>
    Number.parseInt(parseColonBasedAnswer(message), 10) === 1;

export const parseBatteryModel = (message: string) => {
    const valuePairs = message
        .trim()
        .replaceAll(/("|}),/g, ';')
        .split(';');
    const characterizations: BatteryModelCharacterization[] = [];
    let temperature: number[] = [];
    let capacity: number[] = [];
    let name = '';

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
    (pmicDialog: PmicDialog) => (dispatch: TDispatch) => {
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

export const registerCommandCallbackLoggerWrapper = (
    command: string,
    onSuccess: (data: string, command: string) => void,
    onError: (error: string, command: string) => void,
    eventEmitter: EventEmitter,
    shellParser: ShellParser
) => {
    const loggerWrapper = (
        cmd: string,
        error: boolean,
        result: string,
        action: () => void
    ) => {
        const event: LoggingEvent = {
            timestamp: Date.now(),
            module: 'shell_commands',
            logLevel: error ? 'err' : 'inf',
            message: `command: "${cmd}" response: "${result}"`,
        };

        eventEmitter.emit('onLoggingEvent', {
            loggingEvent: event,
            dataPair: false,
        });

        if (action) action();
    };

    return shellParser.registerCommandCallback(
        command,
        (response, cmd) =>
            loggerWrapper(cmd, false, response, () => onSuccess(response, cmd)),
        (error, cmd) => {
            logger.error(error);
            loggerWrapper(cmd, true, error, () => onError(error, cmd));
        }
    );
};

export const MAX_TIMESTAMP = 359999999; // 99hrs 59min 59sec 999ms
export const DOWNLOAD_BATTERY_PROFILE_DIALOG_ID = 'downloadBatteryProfile';
