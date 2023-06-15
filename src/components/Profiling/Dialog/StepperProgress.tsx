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
            title: `Profiling ${temp}°C`,
        };

        let dataCollected = false;

        if (currentProfilingIndex > index) {
            stepDataCollection.state = 'success';
            stepDataCollection.caption = 'Ready';
            dataCollected = true;
        } else if (index === currentProfilingIndex) {
            if (completeStep) {
                if (!currentProfilingStepOverride?.state) {
                    switch (completeStep.level) {
                        case 'success':
                            stepDataCollection.state = 'success';
                            dataCollected = true;
                            break;
                        case 'warning':
                            stepDataCollection.state = 'warning';
                            dataCollected = true;
                            break;
                        case 'danger':
                            stepDataCollection.state = 'failure';
                            break;
                    }
                }

                stepDataCollection.caption = `${completeStep.message}\r\n
                    ${currentProfilingStepOverride?.caption ?? ''}`;
            } else {
                stepDataCollection.state = 'active';
                stepDataCollection.caption = `Step: ${profilingStage ?? ''}`;

                stepDataCollection = {
                    ...stepDataCollection,
                    ...currentProfilingStepOverride,
                };
            }
        }

        steps.push(stepDataCollection);

        const processingCSVProgress = profileProgress.find(
            progress => progress.index === index
        );

        const stepProcessing: Step = {
            id: `DataProcessing${index}`,
            title: `Data Processing ${temp}°C`,
            caption: `${
                processingCSVProgress?.message
                    ? `${processingCSVProgress?.message}`
                    : ''
            } `,
        };

        if (
            processingCSVProgress === undefined &&
            currentProfilingIndex >= index &&
            dataCollected
        ) {
            if (completeStep?.level === 'success') {
                stepProcessing.state = 'success';
            } else if (completeStep?.level === 'warning') {
                stepProcessing.state = 'warning';
                if (index === profile.temperatures.length - 1) {
                    stepProcessing.caption = [
                        {
                            id: '1',
                            caption: 'Data collected might not be correct.',
                        },
                        {
                            id: '2',
                            caption: 'Process now',
                            action: () =>
                                dispatch(startProcessingCsv(profile, index)),
                        },
                    ];
                } else {
                    stepProcessing.caption =
                        'Data collected might not be correct.';
                }
            }
        } else if (processingCSVProgress && !processingCSVProgress.errorLevel) {
            stepProcessing.state = 'active';
        } else if (processingCSVProgress && processingCSVProgress.errorLevel) {
            stepProcessing.state = 'failure';
            stepProcessing.caption = [
                {
                    id: '1',
                    caption: processingCSVProgress.message ?? `Failed.`,
                },
                {
                    id: '2',
                    caption: 'Press to try again',
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
