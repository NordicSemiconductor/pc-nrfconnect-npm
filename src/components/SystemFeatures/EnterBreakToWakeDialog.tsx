/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConfirmationDialog } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getBreakToWakeDialogVisible,
    getNpmDevice,
    setBreakToWakeDialogVisible,
} from '../../features/pmicControl/pmicControlSlice';

export default () => {
    const isVisible = useSelector(getBreakToWakeDialogVisible);
    const npmDevice = useSelector(getNpmDevice);
    const dispatch = useDispatch();

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Break-to-wake hardware setup"
            confirmLabel="Continue"
            cancelLabel="Cancel"
            onConfirm={() => {
                npmDevice?.lowPowerModule?.actions.enterBreakToWakeStep2?.();
                dispatch(setBreakToWakeDialogVisible(false));
            }}
            onCancel={() => {
                npmDevice?.lowPowerModule?.actions.exitBreakToWake?.();
            }}
        >
            To use the Break-to-wake mode, physically connect the SHPHLD pin to
            GND on the nPM2100 EK.
        </ConfirmationDialog>
    );
};
