/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { combineReducers } from 'redux';

import settings from './settingsReducer';

const rootReducer = combineReducers({
    settings,
});

export default rootReducer;
