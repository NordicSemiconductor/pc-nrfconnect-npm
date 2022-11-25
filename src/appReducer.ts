/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NrfConnectState } from 'pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import graphReducer from './features/graph/graphSlice';
import modemReducer from './features/modem/modemSlice';
import pmicControlReducer from './features/pmicControl/pmicControlSlice';
import shelllReducer from './features/shell/shellSlice';

type AppState = ReturnType<typeof appReducer>;

export type RootState = NrfConnectState<AppState>;

const appReducer = combineReducers({
    pmicControl: pmicControlReducer,
    modem: modemReducer,
    shell: shelllReducer,
    graph: graphReducer,
});

export default appReducer;
