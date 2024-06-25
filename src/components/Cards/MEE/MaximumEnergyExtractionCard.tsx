/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Card, Toggle } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmDevice } from '../../../features/pmicControl/npm/types';

interface BuckCardProperties {
    npmDevice: NpmDevice;
    cardLabel?: string;
    disabled: boolean;
}

export default ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    npmDevice,
    cardLabel = `Maximum Energy Extraction`,
    disabled,
}: BuckCardProperties) => (
    <Card
        title={
            <div className="tw-flex tw-justify-between">
                <span>{cardLabel}</span>

                <div className="d-flex">
                    <Toggle
                        label="Enable"
                        isToggled={false}
                        onToggle={() => {}}
                        disabled={disabled || true}
                    />
                </div>
            </div>
        }
    >
        <div className="tw-text-l tw-font-bold">
            Coming soon for batteries with high series resistance
        </div>
    </Card>
);
