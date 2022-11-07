/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NrfConnectState } from 'pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import modemReducer from './features/modem/modemSlice';
import pmicControlReducer from './features/pmicControl/pmicControlSlice';

type AppState = ReturnType<typeof appReducer>;

export type RootState = NrfConnectState<AppState>;

const appReducer = combineReducers({
    pmicControl: pmicControlReducer,
    modem: modemReducer,
});

export default appReducer;
