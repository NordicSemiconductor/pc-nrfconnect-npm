/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BatteryModel, BatteryModelCharacterization } from './types';

// parse strings like value is: XXX mV
export const parseColonBasedAnswer = (message: string) =>
    message.split(':')[1]?.trim();

export const parseToNumber = (message: string) =>
    Number.parseInt(parseColonBasedAnswer(message), 10);

export const parseToBoolean = (message: string) =>
    Number.parseInt(parseColonBasedAnswer(message), 10) === 1;

export const parseBatteryModel = (message: string) => {
    const valuePairs = message.replaceAll(/("|}),/g, ';').split(';');
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
