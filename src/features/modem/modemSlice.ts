/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import { ShellParser } from '../../hooks/commandParser';
import { Modem } from './modem';

interface ModemState {
    availableSerialPorts: string[];
    selectedSerialport?: string;
    modem?: Modem;
    shellParser?: ShellParser;
}

const initialState: ModemState = {
    availableSerialPorts: [],
    selectedSerialport: undefined,
    modem: undefined,
};

const modemSlice = createSlice({
    name: 'modem',
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
        setModem: (state, action: PayloadAction<Modem | undefined>) => {
            state.modem?.close();
            state.modem = action.payload;
        },
        setShellParser: (
            state,
            action: PayloadAction<ShellParser | undefined>
        ) => {
            state.shellParser = action.payload;
        },
    },
});

export const getModem = (state: RootState) => state.app.modem.modem;
export const getSelectedSerialport = (state: RootState) =>
    state.app.modem.selectedSerialport;
export const getAvailableSerialPorts = (state: RootState) =>
    state.app.modem.availableSerialPorts;
export const getShellParser = (state: RootState) => state.app.modem.shellParser;

export const {
    setModem,
    setAvailableSerialPorts,
    setSelectedSerialport,
    setShellParser,
} = modemSlice.actions;
export default modemSlice.reducer;
