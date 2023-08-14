/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { SerialPort } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import { ShellParser } from '../../hooks/commandParser';

interface SerialState {
    availableSerialPorts: string[];
    selectedSerialport?: string;
    serialPort?: SerialPort;
    shellParser?: ShellParser;
    isPaused: boolean;
}

const initialState: SerialState = {
    availableSerialPorts: [],
    selectedSerialport: undefined,
    serialPort: undefined,
    isPaused: false,
};

const serialSlice = createSlice({
    name: 'serial',
    initialState,
    reducers: {
        setSerialPort: (
            state,
            action: PayloadAction<SerialPort | undefined>
        ) => {
            state.serialPort = action.payload;
        },
        setShellParser: (
            state,
            action: PayloadAction<ShellParser | undefined>
        ) => {
            if (state.shellParser) {
                state.shellParser.unregister();
            }
            state.shellParser = action.payload;
        },
        setIsPaused: (state, action: PayloadAction<boolean>) => {
            state.isPaused = action.payload;
        },
    },
});

export const getSerialPort = (state: RootState) => state.app.serial.serialPort;
export const getShellParser = (state: RootState) =>
    state.app.serial.shellParser;
export const isPaused = (state: RootState) => state.app.serial.isPaused;

export const { setSerialPort, setShellParser, setIsPaused } =
    serialSlice.actions;
export default serialSlice.reducer;
