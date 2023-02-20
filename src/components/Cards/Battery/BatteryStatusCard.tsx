/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Card } from 'pc-nrfconnect-shared';

import BatteryStatus from '../../Battery/BatteryStatus';

export default () => (
    <Card
        title={
            <div className="d-flex justify-content-between">
                <span>Battery Status</span>
            </div>
        }
    >
        <BatteryStatus />
    </Card>
);
