/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SerialPort } from 'pc-nrfconnect-shared';

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
        setAvailableSerialPorts: (state, action: PayloadAction<string[]>) => {
            state.availableSerialPorts = action.payload;
        },
        setSelectedSerialport: (
            state,
            action: PayloadAction<string | undefined>
        ) => {
            state.selectedSerialport = action.payload;
        },
        setSerialPort: (
            state,
            action: PayloadAction<SerialPort | undefined>
        ) => {
            state.serialPort?.close();
            state.serialPort = action.payload;
        },
        setShellParser: (
            state,
            action: PayloadAction<ShellParser | undefined>
        ) => {
            state.shellParser = action.payload;
        },
        setIsPaused: (state, action: PayloadAction<boolean>) => {
            state.isPaused = action.payload;
        },
    },
});

export const getSerialPort = (state: RootState) => state.app.serial.serialPort;
export const getSelectedSerialport = (state: RootState) =>
    state.app.serial.selectedSerialport;
export const getAvailableSerialPorts = (state: RootState) =>
    state.app.serial.availableSerialPorts;
export const getShellParser = (state: RootState) =>
    state.app.serial.shellParser;

export const isPaused = (state: RootState) => state.app.serial.isPaused;

export const {
    setSerialPort,
    setAvailableSerialPorts,
    setSelectedSerialport,
    setShellParser,
    setIsPaused,
} = serialSlice.actions;
export default serialSlice.reducer;