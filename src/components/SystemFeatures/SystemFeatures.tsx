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

import { SupportsErrorLogs } from '../../features/pmicControl/npm/pmicHelpers';
import {
    getNpmDevice,
    getPmicState,
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
    const pmicState = useSelector(getPmicState);

    return active ? (
        <MasonryLayout className="masonry-layout" minWidth={300}>
            {npmDevice?.shipModeModule && ship && (
                <ResetControl
                    shipModeModule={npmDevice?.shipModeModule}
                    ship={ship}
                    disabled={disabled}
                />
            )}
            {npmDevice?.timerConfigModule && timerConfig && (
                <Timer
                    timerConfigModule={npmDevice.timerConfigModule}
                    timerConfig={timerConfig}
                    deviceType={npmDevice.getDeviceType()}
                    disabled={disabled}
                />
            )}
            {npmDevice?.pofModule && pof && (
                <PowerFailure
                    pofModule={npmDevice.pofModule}
                    pof={pof}
                    disabled={disabled}
                />
            )}
            {npmDevice?.usbCurrentLimiterModule && usbPower && (
                <VBus
                    usbCurrentLimiterModule={npmDevice?.usbCurrentLimiterModule}
                    usbPower={usbPower}
                    disabled={disabled}
                />
            )}
            {pmicState !== 'ek-disconnected' &&
                npmDevice?.supportedErrorLogs &&
                SupportsErrorLogs(npmDevice) && (
                    <ErrorStatuses
                        disabled={disabled}
                        supportedErrorLogs={npmDevice.supportedErrorLogs}
                    />
                )}
        </MasonryLayout>
    ) : null;
};
