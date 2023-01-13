/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { Card } from 'pc-nrfconnect-shared';

import Battery, { batteryProps } from '../../Battery/Battery';

const BatteryCard: FC<batteryProps> = ({ percent, state }) => (
    <Card title="Fuel Gauge">
        <Battery percent={percent} state={state} />
    </Card>
);

export default BatteryCard;
