/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    DialogButton,
    GenericDialog,
    Group,
} from 'pc-nrfconnect-shared';

import {
    closeProfiling,
    getProfile,
    getProfileIndex,
} from '../../../features/pmicControl/profilingSlice';

export default () => {
    const profile = useSelector(getProfile);
    const index = useSelector(getProfileIndex);

    const dispatch = useDispatch();

    return (
        <GenericDialog
            title={`Battery Profiling ${
                profile.name.length > 0 ? `- ${profile.name}` : ''
            } @ ${profile.temperatures[index]} °C`}
            isVisible
            closeOnEsc={false}
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
                <Alert label="Error " variant="danger">
                    nPM-FG board is not connected. Turn off Evaluation Kit and
                    connect nPM-FG to the Evaluation Kit
                </Alert>
            </Group>
        </GenericDialog>
    );
};
