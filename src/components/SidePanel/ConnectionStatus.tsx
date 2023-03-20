/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CollapsibleGroup, Steppers } from 'pc-nrfconnect-shared';
import { Step } from 'pc-nrfconnect-shared/src/Steppers/Steppers';

import {
    getPmicState,
    isSupportedVersion,
    isUsbPowered,
} from '../../features/pmicControl/pmicControlSlice';
import { isPaused } from '../../features/serial/serialSlice';

const CONNECTION_SUCCESS_STATE: Step = {
    title: 'CONNECTION',
    state: 'success',
    caption: 'Connected to EK',
};
const CONNECTION_OFFLINE_STATE: Step = {
    title: 'CONNECTION',
    caption: 'Offline Mode',
};

const SHELL_OFFLINE_STATE: Step = {
    title: 'SHELL',
};

const SHELL_FREE_STATE: Step = {
    title: 'SHELL',
    state: 'success',
    caption: 'Shell is free',
};

const SHELL_BUSY_STATE: Step = {
    title: 'SHELL',
    state: 'warning',
    caption: 'Shell is busy',
};

const SHELL_WRONG_FW_STATE: Step = {
    title: 'SHELL',
    state: 'failure',
    caption: 'Wrong firmware',
};

const PMIC_OFFLINE_STATE: Step = {
    title: 'PMIC',
};

const PMIC_UNKNOWN_STATE: Step = {
    title: 'PMIC',
    state: 'active',
    caption: 'PMIC connecting to PMIC',
};

const PMIC_NO_POWER_STATE: Step = {
    title: 'PMIC',
    state: 'failure',
    caption: 'PMIC is not powered',
};

const PMIC_NO_USB_POWER_STATE: Step = {
    title: 'PMIC',
    state: 'warning',
    caption: 'PMIC is not powered with USB',
};

const PMIC_SUCCESS_POWER_STATE: Step = {
    title: 'PMIC',
    state: 'success',
    caption: 'Connected Successfully',
};

export default () => {
    // Handle trace state
    const pmicState = useSelector(getPmicState);
    const supportedVersion = useSelector(isSupportedVersion);
    const usbPowered = useSelector(isUsbPowered);
    const paused = useSelector(isPaused);
    const [steps, setSteps] = useState<Step[]>([]);

    useEffect(() => {
        let connectionStep = CONNECTION_OFFLINE_STATE;
        let shellStep = SHELL_OFFLINE_STATE;
        let pmicStep = PMIC_OFFLINE_STATE;

        if (pmicState !== 'ek-disconnected') {
            connectionStep = CONNECTION_SUCCESS_STATE;

            shellStep = SHELL_FREE_STATE;
            if (paused) {
                shellStep = SHELL_BUSY_STATE;
            } else if (!supportedVersion) {
                shellStep = SHELL_WRONG_FW_STATE;
            }

            pmicStep = PMIC_SUCCESS_POWER_STATE;
            if (pmicState === 'pmic-unknown') {
                pmicStep = PMIC_UNKNOWN_STATE;
            } else if (pmicState === 'pmic-disconnected') {
                pmicStep = PMIC_NO_POWER_STATE;
            } else if (!usbPowered) {
                pmicStep = PMIC_NO_USB_POWER_STATE;
            }
        }

        setSteps([connectionStep, shellStep, pmicStep]);
    }, [paused, pmicState, supportedVersion, usbPowered]);

    return (
        <CollapsibleGroup heading="Connection Status" defaultCollapsed={false}>
            <div className="connection-status-container">
                <Steppers steps={steps} />
            </div>
        </CollapsibleGroup>
    );
};
