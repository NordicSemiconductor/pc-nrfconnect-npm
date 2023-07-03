/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NrfConnectState } from 'pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import confirmBeforeCloseReducer from './features/confirmBeforeClose/confirmBeforeCloseSlice';
import pmicControlReducer from './features/pmicControl/pmicControlSlice';
import profilingProjectsReducer from './features/pmicControl/profilingProjectsSlice.';
import profilingReducer from './features/pmicControl/profilingSlice';
import serialReducer from './features/serial/serialSlice';

type AppState = ReturnType<typeof appReducer>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RootState extends NrfConnectState<AppState> {}

const appReducer = combineReducers({
    confirmBeforeClose: confirmBeforeCloseReducer,
    profilingProjects: profilingProjectsReducer,
    profiling: profilingReducer,
    pmicControl: pmicControlReducer,
    serial: serialReducer,
});

export default appReducer;
