/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addConfirmBeforeClose,
    clearConfirmBeforeClose,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getProjectProfileProgress,
    getRecentProjects,
    setProfilingProjects,
    updateProfilingProject,
} from '../../../features/pmicControl/profilingProjectsSlice.';
import { readProjectSettingsFromFile, reloadRecentProjects } from '../helpers';

export const useProfilingProjects = () => {
    const dispatch = useDispatch();
    const recentProjects = useSelector(getRecentProjects);
    const progress = useSelector(getProjectProfileProgress);

    useEffect(() => {
        const processingOngoing =
            progress.filter(prog => !prog.errorLevel).length > 0;

        if (processingOngoing) {
            dispatch(
                addConfirmBeforeClose({
                    id: 'NRF_UTIL_PROCESSING',
                    message: (
                        <span>
                            <strong>Important:</strong> Processing is ongoing.
                            All progress will be lost if you close the app. Are
                            you sure you want to close the app?
                        </span>
                    ),
                    onClose() {
                        progress.forEach(prog => {
                            prog.cancel();
                        });
                    },
                })
            );
            return () => {
                dispatch(clearConfirmBeforeClose('NRF_UTIL_PROCESSING'));
            };
        }
    }, [dispatch, progress]);

    useEffect(() => {
        dispatch(reloadRecentProjects());
    }, [dispatch]);

    useEffect(() => {
        dispatch(
            setProfilingProjects(
                recentProjects.map(recentProject => ({
                    path: recentProject,
                    ...readProjectSettingsFromFile(recentProject),
                }))
            )
        );

        recentProjects.forEach(recentProject => {
            const profilingProject = readProjectSettingsFromFile(recentProject);

            dispatch(
                updateProfilingProject({
                    path: recentProject,
                    settings: profilingProject.settings,
                    error: profilingProject.error,
                })
            );
        });
    }, [dispatch, recentProjects]);
};
