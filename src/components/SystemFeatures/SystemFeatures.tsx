/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import {
    MasonryLayout,
    PaneProps,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getGPIOs,
    getLEDs,
    getNpmDevice,
    getPOF,
    getTimerConfig,
} from '../../features/pmicControl/pmicControlSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import GPIO from '../GPIO/GPIO';
import LEDs from '../LEDs/LEDs';
import SafetyAndLowPower from '../SafetyAndLowPower/SafetyAndLowPower';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const gpios = useSelector(getGPIOs);
    const leds = useSelector(getLEDs);
    const pof = useSelector(getPOF);
    const timerConfig = useSelector(getTimerConfig);

    return active ? (
        <MasonryLayout
            className="masonry-layout min-height-cards"
            minWidth={300}
        >
            {npmDevice &&
                gpios.map((gpio, index) => (
                    <GPIO
                        gpio={gpio}
                        npmDevice={npmDevice}
                        key={`GPIO${1 + index}`}
                        index={index}
                        disabled={disabled}
                    />
                ))}
            {npmDevice && (
                <LEDs npmDevice={npmDevice} leds={leds} disabled={disabled} />
            )}
            {npmDevice && (
                <SafetyAndLowPower
                    npmDevice={npmDevice}
                    pof={pof}
                    timerConfig={timerConfig}
                    disabled={disabled}
                />
            )}
        </MasonryLayout>
    ) : null;
};
