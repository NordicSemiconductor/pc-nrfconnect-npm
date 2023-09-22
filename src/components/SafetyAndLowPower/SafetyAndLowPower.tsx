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
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    NpmDevice,
    POF,
    POFPolarity,
    POFPolarityValues,
    TimerConfig,
    TimerMode,
    TimerModeValues,
    TimerPrescaler,
    TimerPrescalerValues,
} from '../../features/pmicControl/npm/types';
import { splitMS } from '../Profiling/TimeComponent';

interface GPIOProperties {
    npmDevice: NpmDevice;
    pof: POF;
    timerConfig: TimerConfig;
    disabled: boolean;
}

const pofPolarityValuesItems = POFPolarityValues.map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

const timerModeValuesItems = TimerModeValues.map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

const timerPrescalerItems = TimerPrescalerValues.map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

export default ({ npmDevice, pof, timerConfig, disabled }: GPIOProperties) => {
    const [internalPOFThreshold, setInternalPOFThreshold] = useState(
        pof.threshold
    );

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

        if (split.seconds) {
            return `~${split.seconds} second${split.seconds > 1 ? 's' : ''}`;
        }

        return '';
    }, [internalTimerPeriod]);

    // NumberInputSliderWithUnit do not use pof.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalPOFThreshold(pof.threshold);
    }, [pof]);

    // NumberInputSliderWithUnit do not use timerConfig.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalTimerPeriod(timerConfig.period * prescalerMultiplier);
    }, [timerConfig, prescalerMultiplier]);

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <span>Safety And Low Power</span>
                </div>
            }
        >
            <Toggle
                label="POF Enabled"
                onToggle={npmDevice.setPOFEnabled}
                disabled={disabled}
                isToggled={pof.enable}
            />
            <NumberInputSliderWithUnit
                label={
                    <div>
                        <span>VSYS</span>
                        <span className="subscript">POF</span>
                    </div>
                }
                unit="V"
                disabled={disabled}
                range={npmDevice.getPOFThresholdRange()}
                value={internalPOFThreshold}
                onChange={setInternalPOFThreshold}
                onChangeComplete={npmDevice.setPOFThreshold}
            />
            <Dropdown
                label="POF Polarity"
                items={pofPolarityValuesItems}
                onSelect={item =>
                    npmDevice.setPOFPolarity(item.value as POFPolarity)
                }
                selectedItem={
                    pofPolarityValuesItems[
                        Math.max(
                            0,
                            pofPolarityValuesItems.findIndex(
                                item => item.value === pof.polarity
                            )
                        ) ?? 0
                    ]
                }
                disabled={disabled}
            />

            <Dropdown
                label="Time Mode"
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
                label="Time Prescaler"
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
                label="Time Period"
                unit={<span>{`ms ${timeString}`} </span>}
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
                    npmDevice.setTimerConfigPeriod(v / prescalerMultiplier)
                }
            />
        </Card>
    );
};
