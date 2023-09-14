/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Card } from 'pc-nrfconnect-shared';

import BatteryStatus from '../../Battery/BatteryStatus';

export default ({ disabled }: { disabled: boolean }) => (
    <Card
        title={
            <div className="tw-flex tw-justify-between">
                <span>Battery Status</span>
            </div>
        }
    >
        <BatteryStatus disabled={disabled} />
    </Card>
);
