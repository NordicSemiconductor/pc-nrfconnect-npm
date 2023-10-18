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
    getNpmDevice,
    getPOF,
    getShip,
    getTimerConfig,
    getUsbPower,
} from '../../features/pmicControl/pmicControlSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import ErrorStatuses from './ErrorStatuses';
import PowerFailure from './PowerFailure';
import ResetControl from './ResetControl';
import Timer from './Timer';
import VBus from './VBus';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const pof = useSelector(getPOF);
    const ship = useSelector(getShip);
    const usbPower = useSelector(getUsbPower);
    const timerConfig = useSelector(getTimerConfig);

    return active ? (
        <MasonryLayout className="masonry-layout" minWidth={300}>
            {npmDevice && (
                <PowerFailure
                    npmDevice={npmDevice}
                    pof={pof}
                    disabled={disabled}
                />
            )}
            {npmDevice && (
                <Timer
                    npmDevice={npmDevice}
                    timerConfig={timerConfig}
                    disabled={disabled}
                />
            )}
            {npmDevice && (
                <ResetControl
                    npmDevice={npmDevice}
                    ship={ship}
                    disabled={disabled}
                />
            )}
            {npmDevice && (
                <VBus
                    npmDevice={npmDevice}
                    usbPower={usbPower}
                    disabled={disabled}
                />
            )}
            {npmDevice && <ErrorStatuses disabled={disabled} />}
        </MasonryLayout>
    ) : null;
};
