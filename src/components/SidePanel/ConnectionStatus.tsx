/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CollapsibleGroup, Step, Stepper } from 'pc-nrfconnect-shared';

import {
    getNpmDevice,
    getPmicState,
    getProfilingState,
    isSupportedVersion,
    isUsbPowered,
} from '../../features/pmicControl/pmicControlSlice';
import { getShellParser, isPaused } from '../../features/serial/serialSlice';

export default () => {
    const shellParser = useSelector(getShellParser);
    const pmicState = useSelector(getPmicState);
    const supportedVersion = useSelector(isSupportedVersion);
    const usbPowered = useSelector(isUsbPowered);
    const paused = useSelector(isPaused);
    const profilingState = useSelector(getProfilingState);
    const npmDevice = useSelector(getNpmDevice);

    const [pauseFor10Ms, setPauseFor10ms] = useState(paused);

    useEffect(() => {
        const t = setTimeout(() => {
            setPauseFor10ms(paused);
        }, 100);

        return () => clearTimeout(t);
    }, [paused]);

    const connectionStep: Step = {
        id: '1',
        title: 'CONNECTION',
        caption: 'Offline Mode',
    };
    const shellStep: Step = {
        id: '2',
        title: 'SHELL',
    };
    const pmicStep: Step = {
        id: '3',
        title: 'PMIC',
    };

    if (pmicState !== 'ek-disconnected') {
        connectionStep.caption = 'Connected to EK';
        connectionStep.state = 'success';

        shellStep.caption = 'Shell is free';
        shellStep.state = 'success';

        if (pauseFor10Ms) {
            shellStep.state = 'warning';
            shellStep.caption = [
                { id: '1', caption: 'Shell is busy' },
                {
                    id: '2',
                    caption: 'unpause',
                    action: () => shellParser?.unPause(),
                },
            ];

            if (profilingState === 'Off') {
                pmicStep.caption = 'Waiting on shell';
                pmicStep.state = 'active';
            } else {
                pmicStep.caption = [
                    { id: '1', caption: 'Profiling Battery' },
                    {
                        id: '2',
                        caption: 'stop profiling',
                        action: () =>
                            npmDevice?.getBatteryProfiler()?.stopProfiling(),
                    },
                ];
                pmicStep.state = 'warning';
            }
        } else if (!supportedVersion) {
            shellStep.state = 'failure';
            shellStep.caption = 'Wrong firmware';
        } else if (pmicState === 'pmic-unknown') {
            pmicStep.caption = 'Connecting...';
            pmicStep.state = 'active';
        } else if (pmicState === 'pmic-disconnected') {
            pmicStep.caption = 'Not powered';
            pmicStep.state = 'failure';
        } else if (profilingState !== 'Off') {
            pmicStep.caption = [
                { id: '1', caption: 'Profiling Battery' },
                {
                    id: '2',
                    caption: 'stop profiling',
                    action: () =>
                        npmDevice?.getBatteryProfiler()?.stopProfiling(),
                },
            ];
            pmicStep.state = 'warning';
        } else if (!usbPowered) {
            pmicStep.caption = 'Not powered with USB';
            pmicStep.state = 'warning';
        } else {
            pmicStep.state = 'success';
            pmicStep.caption = 'In sync';
        }
    }

    return (
        <CollapsibleGroup heading="Connection Status" defaultCollapsed={false}>
            <div className="connection-status-container">
                <Stepper steps={[connectionStep, shellStep, pmicStep]} />
            </div>
        </CollapsibleGroup>
    );
};
