/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import { NrfConnectState } from 'pc-nrfconnect-shared';
import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

export interface SettingsState {
    vTerm: number;
    iCHG: number;
    enableCharging: boolean;
    vOut1: number;
    enableV1Set: boolean;
    enableBuck1: boolean;
    vOut2: number;
    enableV2Set: boolean;
    enableBuck2: boolean;
    enableLoadSw1: boolean;
    enableLoadSw2: boolean;
}

interface AppState {
    settings: SettingsState;
}

export type RootState = NrfConnectState<AppState>;
export type TAction = ThunkAction<void, RootState, null, AnyAction>;
export type TDispatch = ThunkDispatch<RootState, null, AnyAction>;
