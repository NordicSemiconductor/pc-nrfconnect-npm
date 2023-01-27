/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { dialog } from '@electron/remote';
import Store from 'electron-store';
import { readFileSync } from 'fs';
import path from 'path';

import { RootState } from '../appReducer';
import { NpmExport } from '../features/pmicControl/npm/types';
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

export const openFileDialog = () => (dispatch: TDispatch) => {
    const dialogOptions = {
        title: 'Select a JSON file',
        filters: [
            {
                name: 'JSON',
                extensions: ['json'],
            },
        ],
        properties: ['openFile'],
        // eslint-disable-next-line no-undef
    } as Electron.OpenDialogOptions;
    dialog
        .showOpenDialog(dialogOptions)
        .then(
            ({ filePaths }: { filePaths: string[] }) =>
                filePaths.length === 1 && dispatch(parseFile(filePaths[0]))
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
