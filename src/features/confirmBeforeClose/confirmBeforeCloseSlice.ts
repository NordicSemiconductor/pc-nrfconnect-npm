/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';

export interface ConfirmBeforeCloseApp {
    id: string;
    message: React.ReactNode;
    onClose?: () => void;
}

interface confirmBeforeCloseState {
    confirmCloseApp: ConfirmBeforeCloseApp[];
    showCloseDialog: boolean;
}

const initialState: confirmBeforeCloseState = {
    confirmCloseApp: [],
    showCloseDialog: false,
};

const confirmBeforeCloseSlice = createSlice({
    name: 'confirmBeforeCloseControl',
    initialState,
    reducers: {
        addConfirmBeforeClose(
            state,
            action: PayloadAction<ConfirmBeforeCloseApp>
        ) {
            const index = state.confirmCloseApp.findIndex(
                confirmCloseApp => confirmCloseApp.id === action.payload.id
            );

            if (index !== -1) {
                state.confirmCloseApp[index] = action.payload;
            } else {
                state.confirmCloseApp = [
                    action.payload,
                    ...state.confirmCloseApp,
                ];
            }
        },
        clearConfirmBeforeClose(state, action: PayloadAction<string>) {
            state.confirmCloseApp = state.confirmCloseApp.filter(
                confirmCloseApp => confirmCloseApp.id !== action.payload
            );
        },
        setShowCloseDialog(state, action: PayloadAction<boolean>) {
            state.showCloseDialog = action.payload;
        },
    },
});

export const getNextConfirmDialog = (state: RootState) =>
    state.app.confirmBeforeClose.confirmCloseApp.length > 0
        ? state.app.confirmBeforeClose.confirmCloseApp[0]
        : undefined;

export const getShowConfirmCloseDialog = (state: RootState) =>
    state.app.confirmBeforeClose.showCloseDialog;

export const {
    addConfirmBeforeClose,
    setShowCloseDialog,
    clearConfirmBeforeClose,
} = confirmBeforeCloseSlice.actions;
export default confirmBeforeCloseSlice.reducer;
