/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NrfConnectState } from 'pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import pmicControlReducer from './features/pmicControl/pmicControlSlice';
import profilingReducer from './features/pmicControl/profilingSlice';
import serialReducer from './features/serial/serialSlice';

type AppState = ReturnType<typeof appReducer>;

export type RootState = NrfConnectState<AppState>;

const appReducer = combineReducers({
    profiling: profilingReducer,
    pmicControl: pmicControlReducer,
    serial: serialReducer,
});

export default appReducer;
