/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CollapsibleGroup, Steppers } from 'pc-nrfconnect-shared';
import { Step } from 'pc-nrfconnect-shared/src/Steppers/Steppers';

import {
    getPmicState,
    isSupportedVersion,
    isUsbPowered,
} from '../../features/pmicControl/pmicControlSlice';
import { getShellParser, isPaused } from '../../features/serial/serialSlice';

export default () => {
    // Handle trace state
    const shellParser = useSelector(getShellParser);
    const pmicState = useSelector(getPmicState);
    const supportedVersion = useSelector(isSupportedVersion);
    const usbPowered = useSelector(isUsbPowered);
    const paused = useSelector(isPaused);

    const connectionStep: Step = {
        title: 'CONNECTION',
        caption: 'Offline Mode',
    };
    const shellStep: Step = {
        title: 'SHELL',
    };
    const pmicStep: Step = {
        title: 'PMIC',
    };

    if (pmicState !== 'ek-disconnected') {
        connectionStep.caption = 'Connected to EK';
        connectionStep.state = 'success';

        shellStep.caption = 'Shell is free';
        shellStep.state = 'success';

        if (paused) {
            shellStep.state = 'warning';
            shellStep.caption = [
                'Shell is busy',
                {
                    caption: 'unpause',
                    action: () => shellParser?.unPause(),
                },
            ];

            pmicStep.caption = 'Waiting on shell';
            pmicStep.state = 'active';
        } else if (!supportedVersion) {
            shellStep.state = 'failure';
            shellStep.caption = 'Wrong firmware';
        } else if (pmicState === 'pmic-unknown') {
            pmicStep.caption = 'Connecting...';
            pmicStep.state = 'active';
        } else if (pmicState === 'pmic-disconnected') {
            pmicStep.caption = 'Not powered';
            pmicStep.state = 'failure';
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
                <Steppers steps={[connectionStep, shellStep, pmicStep]} />
            </div>
        </CollapsibleGroup>
    );
};
