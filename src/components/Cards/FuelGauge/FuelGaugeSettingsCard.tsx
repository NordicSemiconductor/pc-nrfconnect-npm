/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Card } from '@nordicsemiconductor/pc-nrfconnect-shared';

import FuelGaugeSettings from '../../FuelGauge/FuelGaugeSettings';

export default ({ disabled }: { disabled: boolean }) => (
    <Card
        title={
            <div
                className={`d-flex justify-content-between ${
                    disabled ? 'disabled' : ''
                }`}
            >
                <span>Settings</span>
            </div>
        }
    >
        <FuelGaugeSettings disabled={disabled} />
    </Card>
);
