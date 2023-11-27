/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { dialog, getCurrentWindow } from '@electron/remote';
import { AppThunk } from '@nordicsemiconductor/pc-nrfconnect-shared';
import usageData from '@nordicsemiconductor/pc-nrfconnect-shared/src/utils/usageData';
import {
    OpenDialogOptions,
    OpenDialogReturnValue,
    SaveDialogOptions,
} from 'electron';
import fs from 'fs';
import path from 'path';

import { RootState } from '../appReducer';
import overlay from '../features/pmicControl/npm/overlay/overlay';
import { NpmExport } from '../features/pmicControl/npm/types';

const saveSettings =
    (filePath: string): AppThunk<RootState> =>
    (_dispatch, getState) => {
        const currentState = getState().app.pmicControl;

        if (!currentState.npmDevice) return;

        const out: NpmExport = {
            charger: currentState.charger
                ? { ...currentState.charger }
                : undefined,
            bucks: [...currentState.bucks],
            ldos: [...currentState.ldos],
            gpios: [...currentState.gpios],
            leds: [...currentState.leds],
            pof: currentState.pof,
            ship: currentState.ship,
            timerConfig: currentState.timerConfig,
            fuelGauge: currentState.fuelGauge,
            firmwareVersion: currentState.npmDevice.getSupportedVersion(),
            deviceType: currentState.npmDevice.getDeviceType(),
            fuelGaugeChargingSamplingRate:
                currentState.fuelGaugeChargingSamplingRate,
            usbPower: currentState.usbPower,
        };

        usageData.sendUsageData('Export Configuartion', {
            config: out,
        });

        if (filePath.endsWith('.json')) {
            fs.writeFileSync(filePath, JSON.stringify(out, null, 2));
        } else if (filePath.endsWith('.overlay')) {
            fs.writeFileSync(filePath, overlay(out, currentState.npmDevice));
        }
    };

const parseFile =
    (filePath: string): AppThunk =>
    (_dispatch, getState) => {
        const currentState = getState().app.pmicControl;

        const pathObject = path.parse(filePath);
        if (pathObject.ext === '.json') {
            const config = JSON.parse(
                fs.readFileSync(filePath).toString()
            ) as unknown as NpmExport;
            currentState.npmDevice?.applyConfig(config);
        }
    };

export const showOpenDialog = (options: OpenDialogOptions) =>
    dialog.showOpenDialog(getCurrentWindow(), options);

export const showSaveDialog = (options: SaveDialogOptions) =>
    dialog.showSaveDialog(getCurrentWindow(), options);

export const loadConfiguration = (): AppThunk => dispatch => {
    showOpenDialog({
        title: 'Select a JSON file',
        filters: [
            {
                name: 'JSON',
                extensions: ['json'],
            },
        ],
        properties: ['openFile'],
    }).then(
        ({ filePaths }: OpenDialogReturnValue) =>
            filePaths.length === 1 && dispatch(parseFile(filePaths[0]))
    );
};

const stream2buffer = (stream: fs.ReadStream) =>
    new Promise<Buffer>((resolve, reject) => {
        let buf = '';

        stream.on('data', chunk => {
            buf += chunk.toString();
        });
        stream.on('end', () =>
            resolve(
                Buffer.from(buf.replaceAll('\\s', '').replaceAll('\r\n', ''))
            )
        );
        stream.on('error', err =>
            reject(new Error(`error converting stream - ${err}`))
        );
    });

const loadBatteryProfile = (filePath: string) =>
    new Promise<Buffer>((resolve, reject) => {
        const readerStream = fs.createReadStream(filePath);
        readerStream.setEncoding('utf8');

        stream2buffer(readerStream).then(resolve).catch(reject);
    });

export const getProfileBuffer = () =>
    new Promise<Buffer>((resolve, reject) => {
        showOpenDialog({
            title: 'Select a JSON file',
            filters: [
                {
                    name: 'JSON',
                    extensions: ['json'],
                },
            ],
            properties: ['openFile'],
        }).then(({ filePaths }: OpenDialogReturnValue) => {
            filePaths.length === 1 &&
                loadBatteryProfile(filePaths[0]).then(resolve).catch(reject);
        });
    });

export const selectDirectoryDialog = () =>
    new Promise<string>((resolve, reject) => {
        const dialogOptions = {
            title: 'Select a Directory',
            properties: ['openDirectory'],
            // eslint-disable-next-line no-undef
        } as Electron.OpenDialogOptions;
        showOpenDialog(dialogOptions)
            .then(({ filePaths }: { filePaths: string[] }) => {
                if (filePaths.length === 1) {
                    resolve(filePaths[0]);
                }
            })
            .catch(reject);
    });

export const saveFileDialog = (): AppThunk => dispatch => {
    showSaveDialog({
        title: 'Save Device Settings',
        defaultPath: 'config.overlay',
        filters: [
            {
                name: 'Overlay',
                extensions: ['overlay'],
            },
            {
                name: 'JSON',
                extensions: ['json'],
            },
        ],
    }).then(
        result =>
            !result.canceled &&
            result.filePath &&
            dispatch(saveSettings(result.filePath))
    );
};
