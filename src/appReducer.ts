/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NrfConnectState } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import downloadBatteryModelSlice from './features/pmicControl/downloadBatteryModelSlice';
import pmicControlReducer from './features/pmicControl/pmicControlSlice';
import profilingProjectsReducer from './features/pmicControl/profilingProjectsSlice.';
import profilingReducer from './features/pmicControl/profilingSlice';
import serialReducer from './features/serial/serialSlice';

type AppState = ReturnType<typeof appReducer>;

export type RootState = NrfConnectState<AppState>;

const appReducer = combineReducers({
    profilingProjects: profilingProjectsReducer,
    profiling: profilingReducer,
    pmicControl: pmicControlReducer,
    serial: serialReducer,
    downloadBatteryModel: downloadBatteryModelSlice,
});

export default appReducer;
