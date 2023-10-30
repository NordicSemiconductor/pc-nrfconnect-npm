/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
    Card,
    Dropdown,
    NumberInputSliderWithUnit,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    NpmDevice,
    TimerConfig,
    TimerMode,
    TimerModeValues,
    TimerPrescaler,
    TimerPrescalerValues,
} from '../../features/pmicControl/npm/types';
import { splitMS } from '../Profiling/TimeComponent';

interface GPIOProperties {
    npmDevice: NpmDevice;
    timerConfig: TimerConfig;
    disabled: boolean;
}

const timerModeValuesItems = TimerModeValues.map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

const timerPrescalerItems = TimerPrescalerValues.map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

export default ({ npmDevice, timerConfig, disabled }: GPIOProperties) => {
    const [internalTimerPeriod, setInternalTimerPeriod] = useState(
        timerConfig.period
    );

    const prescalerMultiplier = useMemo(
        () => (timerConfig.prescaler === 'Fast' ? 2 : 16),
        [timerConfig]
    );

    const timeString = useMemo(() => {
        const split = splitMS(internalTimerPeriod);

        if (split.days) {
            return `~${split.days} day${split.days > 1 ? 's' : ''}`;
        }

        if (split.hours) {
            return `~${split.hours} hr${split.hours > 1 ? 's' : ''}`;
        }

        if (split.minutes) {
            return `~${split.minutes} min${split.minutes > 1 ? 's' : ''}`;
        }

        if (split.seconds) {
            return `~${split.seconds} second${split.seconds > 1 ? 's' : ''}`;
        }

        return '';
    }, [internalTimerPeriod]);

    // NumberInputSliderWithUnit do not use timerConfig.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalTimerPeriod(timerConfig.period * prescalerMultiplier);
    }, [timerConfig, prescalerMultiplier]);

    const card = 'timer';

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card={card} item="Timer">
                        Timer
                    </DocumentationTooltip>
                </div>
            }
        >
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="TimeMode">
                        Time Mode
                    </DocumentationTooltip>
                }
                items={timerModeValuesItems}
                onSelect={item =>
                    npmDevice.setTimerConfigMode(item.value as TimerMode)
                }
                selectedItem={
                    timerModeValuesItems[
                        Math.max(
                            0,
                            timerModeValuesItems.findIndex(
                                item => item.value === timerConfig.mode
                            )
                        ) ?? 0
                    ]
                }
                disabled={disabled}
            />

            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="TimePrescaler">
                        Timer Prescaler
                    </DocumentationTooltip>
                }
                items={timerPrescalerItems}
                onSelect={item =>
                    npmDevice.setTimerConfigPrescaler(
                        item.value as TimerPrescaler
                    )
                }
                selectedItem={
                    timerPrescalerItems[
                        Math.max(
                            0,
                            timerPrescalerItems.findIndex(
                                item => item.value === timerConfig.prescaler
                            )
                        ) ?? 0
                    ]
                }
                disabled={disabled}
            />
            <NumberInputSliderWithUnit
                label={
                    <DocumentationTooltip card={card} item="TimePeriod">
                        Timer Period
                    </DocumentationTooltip>
                }
                unit={
                    <span>{`ms${timeString ? ` (${timeString})` : ''}`} </span>
                }
                disabled={disabled}
                range={{
                    min: 0,
                    max: 16777215 * prescalerMultiplier,
                    decimals: 0,
                    step: 1 * prescalerMultiplier,
                }}
                value={internalTimerPeriod}
                onChange={setInternalTimerPeriod}
                onChangeComplete={v =>
                    npmDevice.setTimerConfigCompare(v / prescalerMultiplier)
                }
            />
        </Card>
    );
};
