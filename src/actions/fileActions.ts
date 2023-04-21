/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { dialog } from '@electron/remote';
import { OpenDialogReturnValue } from 'electron';
import Store from 'electron-store';
import fs from 'fs';
import path from 'path';

import { RootState } from '../appReducer';
import { NpmExport } from '../features/pmicControl/npm/types';
import { setEventRecordingPath } from '../features/pmicControl/pmicControlSlice';
import { TDispatch } from '../thunk';

const saveSettings =
    (filePath: string) => (_dispatch: TDispatch, getState: () => RootState) => {
        const currentState = getState().app.pmicControl;

        if (!currentState.npmDevice) return;

        const pathObject = path.parse(filePath);
        const store = new Store<NpmExport>({
            cwd: pathObject.dir,
            name: pathObject.name,
        });

        const out: NpmExport = {
            chargers: [...currentState.chargers],
            bucks: [...currentState.bucks],
            ldos: [...currentState.ldos],
            fuelGauge: currentState.fuelGauge,
            firmwareVersion: currentState.npmDevice.getSupportedVersion(),
            deviceType: currentState.npmDevice.getDeviceType(),
        };

        store.set(out);
    };

const parseFile =
    (filePath: string) => (_dispatch: TDispatch, getState: () => RootState) => {
        const currentState = getState().app.pmicControl;

        const pathObject = path.parse(filePath);
        if (pathObject.ext === '.json') {
            const store = new Store<NpmExport>({
                cwd: pathObject.dir,
                name: pathObject.name,
            });

            const config = store.store;
            currentState.npmDevice?.applyConfig(config);
        }
    };

export const loadConfiguration = () => (dispatch: TDispatch) => {
    dialog
        .showOpenDialog({
            title: 'Select a JSON file',
            filters: [
                {
                    name: 'JSON',
                    extensions: ['json'],
                },
            ],
            properties: ['openFile'],
        })
        .then(
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
                Buffer.from(buf.replaceAll('"', '\\"').replaceAll('\\s', ''))
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
        dialog
            .showOpenDialog({
                title: 'Select a JSON file',
                filters: [
                    {
                        name: 'JSON',
                        extensions: ['json'],
                    },
                ],
                properties: ['openFile'],
            })
            .then(({ filePaths }: OpenDialogReturnValue) => {
                filePaths.length === 1 &&
                    loadBatteryProfile(filePaths[0])
                        .then(resolve)
                        .catch(reject);
            });
    });

export const openDirectoryDialog = () => (dispatch: TDispatch) => {
    const dialogOptions = {
        title: 'Select a Directory for events',
        properties: ['openDirectory'],
        // eslint-disable-next-line no-undef
    } as Electron.OpenDialogOptions;
    dialog
        .showOpenDialog(dialogOptions)
        .then(
            ({ filePaths }: { filePaths: string[] }) =>
                filePaths.length === 1 &&
                dispatch(setEventRecordingPath(filePaths[0]))
        );
};

export const saveFileDialog = () => (dispatch: TDispatch) => {
    const dialogOptions = {
        title: 'Save Device Settings',
        filters: [
            {
                name: 'JSON',
                extensions: ['json'],
            },
        ],
        // eslint-disable-next-line no-undef
    } as Electron.SaveDialogOptions;
    dialog
        .showSaveDialog(dialogOptions)
        .then(
            result =>
                !result.canceled &&
                result.filePath &&
                dispatch(saveSettings(result.filePath))
        );
};
