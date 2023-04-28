/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, PaneProps } from 'pc-nrfconnect-shared';

import {
    getPmicState,
    getProfilingState,
    isSupportedVersion,
} from '../../features/pmicControl/pmicControlSlice';
import { isPaused } from '../../features/serial/serialSlice';
import DashboardControlCard from './DasboardControlCard';

export default ({ active }: PaneProps) => {
    const paused = useSelector(isPaused);
    const supportedVersion = useSelector(isSupportedVersion);
    const pmicState = useSelector(getPmicState);
    const profilingState = useSelector(getProfilingState);

    const [pauseFor100Ms, setPauseFor100ms] = useState(paused);
    const disabled =
        (!supportedVersion && pmicState !== 'ek-disconnected') ||
        pmicState === 'pmic-disconnected' ||
        pmicState === 'pmic-unknown' ||
        profilingState !== 'Off' ||
        pauseFor100Ms;

    useEffect(() => {
        const t = setTimeout(() => {
            setPauseFor100ms(paused);
        }, 100);

        return () => clearTimeout(t);
    }, [paused]);

    return !active ? null : (
        <div>
            <Alert variant="info" label="nPM PowerUP​ 0.1​ - Preview release! ">
                This is an unsupported, experimental preview and it is subject
                to major redesigns in the future.
            </Alert>
            <div>
                <DashboardControlCard disabled={disabled} />
            </div>
        </div>
    );
};
