/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import {
    Alert,
    DialogButton,
    GenericDialog,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { closeProfiling } from '../../../features/pmicControl/profilingSlice';

export default ({
    type,
}: {
    type: 'MissingSyncBoard' | 'ActiveLoadNotVSYS';
}) => {
    const dispatch = useDispatch();
    return (
        <GenericDialog
            title="Battery Profiling"
            isVisible
            closeOnEsc={false}
            className="app-dialog"
            footer={
                <DialogButton
                    onClick={() => {
                        dispatch(closeProfiling());
                    }}
                >
                    Close
                </DialogButton>
            }
        >
            {type === 'MissingSyncBoard' && (
                <Alert label="Error: " variant="danger">
                    nPM Fuel Gauge board is not connected. Turn off the EK and
                    connect nPM Fuel Gauge to the EK.
                </Alert>
            )}
            {type === 'ActiveLoadNotVSYS' && (
                <Alert label="Error: " variant="danger">
                    Set Active Load to VSYS to profile the battery.
                </Alert>
            )}
        </GenericDialog>
    );
};
