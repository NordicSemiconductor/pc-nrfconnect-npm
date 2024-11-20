/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { dialog, getCurrentWindow } from '@electron/remote';
import { AppThunk, telemetry } from '@nordicsemiconductor/pc-nrfconnect-shared';
import {
    OpenDialogOptions,
    OpenDialogReturnValue,
    SaveDialogOptions,
} from 'electron';
import fs from 'fs';
import path from 'path';

import { RootState } from '../appReducer';
import { toBuckExport } from '../features/pmicControl/npm/npm1300/buck';
import { toLdoExport } from '../features/pmicControl/npm/npm1300/ldo';
import {
    AnyNpmExport,
    FuelGaugeExport,
    NpmExportLatest,
    NpmExportV1,
} from '../features/pmicControl/npm/types';
import { getNpmDevice } from '../features/pmicControl/pmicControlSlice';

const saveSettings =
    (filePath: string): AppThunk<RootState> =>
    (_dispatch, getState) => {
        const currentState = getState().app.pmicControl;

        if (!currentState.npmDevice) return;

        const out: NpmExportLatest = {
            boosts: [...currentState.boosts],
            charger: currentState.charger,
            bucks: [...currentState.bucks.map(toBuckExport)],
            ldos: [...currentState.ldos.map(toLdoExport)],
            gpios: [...currentState.gpios],
            leds: [...currentState.leds],
            pof: currentState.pof,
            ship: currentState.ship,
            timerConfig: currentState.timerConfig,
            fuelGaugeSettings: {
                enabled: currentState.fuelGaugeSettings.enabled,
                chargingSamplingRate:
                    currentState.fuelGaugeSettings.chargingSamplingRate,
            },
            firmwareVersion: currentState.npmDevice.getSupportedVersion(),
            deviceType: currentState.npmDevice.getDeviceType(),
            usbPower: currentState.usbPower
                ? { currentLimiter: currentState.usbPower.currentLimiter }
                : undefined,
            fileFormatVersion: 2,
        };

        telemetry.sendEvent('Export Configuration', {
            config: out,
        });

        const npmDevice = getNpmDevice(getState());

        if (filePath.endsWith('.json')) {
            fs.writeFileSync(filePath, JSON.stringify(out, null, 2));
        } else if (
            filePath.endsWith('.overlay') &&
            npmDevice?.generateOverlay !== undefined
        ) {
            fs.writeFileSync(filePath, npmDevice.generateOverlay(out));
        }
    };

const parseFile =
    (filePath: string): AppThunk<RootState> =>
    (_dispatch, getState) => {
        const currentState = getState().app.pmicControl;

        const pathObject = path.parse(filePath);
        if (pathObject.ext === '.json') {
            const config = JSON.parse(
                fs.readFileSync(filePath).toString()
            ) as unknown as AnyNpmExport;

            currentState.npmDevice?.applyConfig(upgradeToLatest(config));
        }
    };

const upgradeToLatest = (exportJson: AnyNpmExport): NpmExportLatest => {
    if (isNpmExportV1(exportJson)) {
        const fuelGaugeSettings: FuelGaugeExport = {
            enabled: exportJson.fuelGauge,
            chargingSamplingRate: exportJson.fuelGaugeChargingSamplingRate,
        };
        return {
            ...exportJson,
            ...fuelGaugeSettings,
            fileFormatVersion: 2,
        };
    }

    return exportJson;
};

const isNpmExportV1 = (exportJson: AnyNpmExport): exportJson is NpmExportV1 =>
    (exportJson as NpmExportV1).fuelGauge === undefined;

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

export const loadBatteryProfile = (filePath: string) =>
    new Promise<Buffer>((resolve, reject) => {
        const readerStream = fs.createReadStream(filePath);
        readerStream.setEncoding('utf8');

        stream2buffer(readerStream).then(resolve).catch(reject);
    });

export const getProfileBuffer = () =>
    new Promise<{ buffer: Buffer; filePath: string }>((resolve, reject) => {
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
                loadBatteryProfile(filePaths[0])
                    .then(buffer => {
                        resolve({ buffer, filePath: filePaths[0] });
                    })
                    .catch(reject);
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

export const saveFileDialog = (): AppThunk => (dispatch, getState) => {
    const isOverlaySupported =
        getNpmDevice(getState())?.generateOverlay !== undefined;

    showSaveDialog({
        title: 'Save Device Settings',
        defaultPath: isOverlaySupported ? 'config.overlay' : 'config.json',
        filters: [
            ...(isOverlaySupported
                ? [
                      {
                          name: 'Overlay',
                          extensions: ['overlay'],
                      },
                  ]
                : []),
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
