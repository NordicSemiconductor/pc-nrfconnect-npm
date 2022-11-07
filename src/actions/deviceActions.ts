/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Device, logger } from 'pc-nrfconnect-shared';

import { TAction } from '../thunk';

export const closeDevice = (): TAction => dispatch => {
    logger.info('Closing device');
};

export const openDevice =
    (device: Device): TAction =>
    dispatch => {};
