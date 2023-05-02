/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import {
    getPmicState,
    getProfilingState,
    isSupportedVersion,
} from './pmicControl/pmicControlSlice';
import { isPaused } from './serial/serialSlice';

export default () => {
    const paused = useSelector(isPaused);
    const supportedVersion = useSelector(isSupportedVersion);
    const pmicState = useSelector(getPmicState);
    const profilingState = useSelector(getProfilingState);

    const [pauseFor100Ms, setPauseFor100Ms] = useState(paused);
    const disabled =
        (!supportedVersion && pmicState !== 'ek-disconnected') ||
        pmicState === 'pmic-disconnected' ||
        pmicState === 'pmic-pending-reboot' ||
        pmicState === 'pmic-unknown' ||
        profilingState === 'Running' ||
        pauseFor100Ms;

    useEffect(() => {
        const t = setTimeout(() => {
            setPauseFor100Ms(paused);
        }, 100);

        return () => clearTimeout(t);
    }, [paused]);

    return disabled;
};
