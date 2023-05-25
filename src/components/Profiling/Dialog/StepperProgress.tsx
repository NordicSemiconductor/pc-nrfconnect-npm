/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Step, Stepper } from 'pc-nrfconnect-shared';

import { startProcessingCsv } from '../../../features/nrfutillNpm/csvProcessing';
import { getProjectProfileProgress } from '../../../features/pmicControl/profilingProjectsSlice.';
import {
    getCompleteStep,
    getProfile,
    getProfileIndex,
    getProfilingStage,
} from '../../../features/pmicControl/profilingSlice';
import { generateDefaultProjectPath } from '../helpers';

export default ({
    currentProfilingStepOverride,
}: {
    currentProfilingStepOverride?: Partial<Step>;
}) => {
    const dispatch = useDispatch();
    const profile = useSelector(getProfile);
    const currentProfilingIndex = useSelector(getProfileIndex);
    const completeStep = useSelector(getCompleteStep);
    const profilingStage = useSelector(getProfilingStage);
    const profileProgress = useSelector(getProjectProfileProgress).filter(
        p => p.path === generateDefaultProjectPath(profile)
    );

    const steps: Step[] = [];

    profile.temperatures.forEach((temp, index) => {
        let stepDataCollection: Step = {
            id: `DataCollection${index}`,
            title: `Profiling ${temp} °C`,
        };

        if (currentProfilingIndex > index) {
            stepDataCollection.state = 'success';
            stepDataCollection.caption = 'Ready';
        } else if (index === currentProfilingIndex) {
            if (completeStep) {
                switch (completeStep.level) {
                    case 'success':
                        stepDataCollection.state = 'success';
                        break;
                    case 'danger':
                        stepDataCollection.state = 'failure';
                        break;
                    case 'warning':
                        stepDataCollection.state = 'warning';
                        break;
                }

                stepDataCollection.caption = completeStep.message;
            } else {
                stepDataCollection.state = 'active';
                stepDataCollection.caption = `Step: ${profilingStage ?? ''}`;
            }

            stepDataCollection = {
                ...stepDataCollection,
                ...currentProfilingStepOverride,
            };
        }

        steps.push(stepDataCollection);

        const processingCSVProgress = profileProgress.find(
            progress => progress.index === index
        );

        const stepProcessing: Step = {
            id: `DataProcessing${index}`,
            title: `Data Processing for ${temp} °C`,
            caption: processingCSVProgress?.message ?? '',
        };

        if (processingCSVProgress?.ready && !processingCSVProgress.error) {
            stepProcessing.state = 'success';
        } else if (processingCSVProgress && !processingCSVProgress?.ready) {
            stepProcessing.state = 'active';
        } else if (processingCSVProgress && processingCSVProgress.error) {
            stepProcessing.state = 'failure';
            stepProcessing.caption = [
                {
                    id: '1',
                    caption: processingCSVProgress.message ?? 'Failed.',
                },
                {
                    id: '2',
                    caption: 'Try Again',
                    action: () => dispatch(startProcessingCsv(profile, index)),
                },
            ];
        }

        steps.push(stepProcessing);
    });

    return (
        <div className="mt-4">
            <Stepper steps={steps} />
        </div>
    );
};
