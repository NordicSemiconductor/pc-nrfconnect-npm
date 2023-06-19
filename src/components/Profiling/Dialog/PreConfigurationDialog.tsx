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
    Group,
} from 'pc-nrfconnect-shared';

import { closeProfiling } from '../../../features/pmicControl/profilingSlice';

export default () => {
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
            <Group>
                <Alert label="Error: " variant="danger">
                    nPM-FG board is not connected. Turn off EK and connect
                    nPM-FG to the EK
                </Alert>
            </Group>
        </GenericDialog>
    );
};
