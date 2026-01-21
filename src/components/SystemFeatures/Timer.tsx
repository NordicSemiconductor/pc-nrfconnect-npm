/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
    Card,
    Dropdown,
    NumberInput,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    type TimerConfig,
    type TimerConfigModule,
    type TimerMode,
    type TimerPrescaler,
    TimerPrescalerValues,
} from '../../features/pmicControl/npm/types';
import { splitMS } from '../Profiling/TimeComponent';

interface TimerConfigProperties {
    timerConfigModule: TimerConfigModule;
    timerConfig: TimerConfig;
    disabled: boolean;
}

const timerPrescalerItems = TimerPrescalerValues.map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

export default ({
    timerConfigModule,
    timerConfig,
    disabled,
}: TimerConfigProperties) => {
    const [internalTimerPeriod, setInternalTimerPeriod] = useState(
        timerConfig.period,
    );

    const prescalerMultiplier =
        timerConfigModule.getPrescalerMultiplier?.(timerConfig) ?? 1;

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

    const periodRange =
        timerConfigModule.ranges.periodRange(prescalerMultiplier);

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
            {'enabled' in timerConfig && timerConfigModule.set.enabled && (
                <Toggle
                    label={
                        <DocumentationTooltip card={card} item="TimeState">
                            Start Timer
                        </DocumentationTooltip>
                    }
                    isToggled={timerConfig.enabled === true}
                    onToggle={value => timerConfigModule.set.enabled?.(value)}
                    disabled={disabled}
                />
            )}

            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="TimeMode">
                        Timer Mode
                    </DocumentationTooltip>
                }
                items={timerConfigModule.values.mode}
                onSelect={item =>
                    timerConfigModule.set.mode(item.value as TimerMode)
                }
                selectedItem={
                    timerConfigModule.values.mode.find(
                        item => item.value === timerConfig.mode,
                    ) ?? timerConfigModule.values.mode[0]
                }
                disabled={disabled}
            />

            {'prescaler' in timerConfig && timerConfigModule.set.prescaler && (
                <Dropdown
                    label={
                        <DocumentationTooltip card={card} item="TimePrescaler">
                            Timer Prescaler
                        </DocumentationTooltip>
                    }
                    items={timerPrescalerItems}
                    onSelect={item =>
                        timerConfigModule.set.prescaler?.(
                            item.value as TimerPrescaler,
                        )
                    }
                    selectedItem={
                        timerPrescalerItems[
                            Math.max(
                                0,
                                timerPrescalerItems.findIndex(
                                    item =>
                                        item.value === timerConfig.prescaler,
                                ),
                            ) ?? 0
                        ]
                    }
                    disabled={disabled}
                />
            )}

            <NumberInput
                label={
                    <DocumentationTooltip card={card} item="TimePeriod">
                        Timer Period
                    </DocumentationTooltip>
                }
                unit={
                    <span>{`ms${timeString ? ` (${timeString})` : ''}`} </span>
                }
                disabled={disabled}
                range={periodRange}
                value={internalTimerPeriod}
                onChange={setInternalTimerPeriod}
                onChangeComplete={v =>
                    timerConfigModule.set.period(v / prescalerMultiplier)
                }
                showSlider
            />
        </Card>
    );
};
