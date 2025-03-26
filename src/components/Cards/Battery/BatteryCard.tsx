/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Toggle } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    getFuelGaugeSettings,
    getNpmDevice,
} from '../../../features/pmicControl/pmicControlSlice';
import Battery, {
    BatteryProperties as BatteryCardProperties,
} from '../../Battery/Battery';

export default ({ disabled }: BatteryCardProperties) => {
    const npmDevice = useSelector(getNpmDevice);
    const fuelGaugeSettings = useSelector(getFuelGaugeSettings);

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card="battery" item="FuelGauge">
                        <span>Fuel Gauge</span>
                    </DocumentationTooltip>
                    <Toggle
                        label="Enable"
                        isToggled={fuelGaugeSettings.enabled}
                        onToggle={enabled =>
                            npmDevice?.fuelGaugeModule?.set.enabled(enabled)
                        }
                        disabled={disabled}
                    />
                </div>
            }
        >
            {npmDevice?.fuelGaugeModule?.set.discardPosiiveDeltaZ !==
                undefined && (
                <Toggle
                    label={
                        <DocumentationTooltip
                            card="battery"
                            item="DiscardPositiveDeltaZ"
                        >
                            <span>Allow State of Charge to increase</span>
                        </DocumentationTooltip>
                    }
                    isToggled={!fuelGaugeSettings.discardPosiiveDeltaZ}
                    disabled={disabled}
                    onToggle={enabled =>
                        npmDevice?.fuelGaugeModule?.set.discardPosiiveDeltaZ?.(
                            !enabled
                        )
                    }
                />
            )}
            <Battery disabled={disabled} />
        </Card>
    );
};
