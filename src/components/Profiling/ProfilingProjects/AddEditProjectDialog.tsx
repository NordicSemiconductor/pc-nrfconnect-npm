/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    classNames,
    DialogButton,
    GenericDialog,
    NumberInput,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { showSaveDialog } from '../../../actions/fileActions';
import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import { getNpmDevice } from '../../../features/pmicControl/pmicControlSlice';
import { readAndUpdateProjectSettings, saveProjectSettings } from '../helpers';
import { ProfilingProject } from '../types';

import '../profiling.scss';

export default ({
    projectSettings,
    onClose,
}: {
    projectSettings?: {
        project: ProfilingProject;
        projectSettingsPath: string;
    };
    onClose: () => void;
}) => {
    const npmDevice = useSelector(getNpmDevice);
    const [validName, setValidName] = useState(!!projectSettings);
    const [name, setName] = useState(projectSettings?.project.name ?? '');

    const [vLowerCutOff, setLowerVCutOff] = useState(
        projectSettings?.project.vLowerCutOff ?? 3
    );
    const [vUpperCutOff, setUpperVCutOff] = useState(
        projectSettings?.project.vUpperCutOff ?? 4.2
    );

    const [capacity, setCapacity] = useState(800);
    const dispatch = useDispatch();
    const maxLength = 20;

    if (!npmDevice || !npmDevice.chargerModule?.ranges.vLowerCutOff)
        return null;

    return (
        <GenericDialog
            title={`${projectSettings ? 'Edit' : 'Add'} Project ${
                name.length > 0 ? `- ${name}` : ''
            }`}
            isVisible
            size="sm"
            className="app-dialog"
            closeOnEsc={false}
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        disabled={!validName}
                        onClick={() => {
                            if (projectSettings) {
                                dispatch(
                                    readAndUpdateProjectSettings(
                                        projectSettings.projectSettingsPath,
                                        currentProject => ({
                                            ...currentProject,
                                            name,
                                            capacity,
                                            vLowerCutOff,
                                            vUpperCutOff,
                                        })
                                    )
                                );
                            } else {
                                showSaveDialog({
                                    title: 'New Project',
                                    defaultPath: `profileSettings.json`,
                                    filters: [
                                        {
                                            name: 'JSON',
                                            extensions: ['json'],
                                        },
                                    ],
                                }).then(result => {
                                    if (!result.canceled && result.filePath) {
                                        if (result.filePath)
                                            dispatch(
                                                saveProjectSettings(
                                                    result.filePath,
                                                    {
                                                        name,
                                                        deviceType:
                                                            npmDevice?.deviceType,
                                                        capacity,
                                                        vLowerCutOff,
                                                        vUpperCutOff,
                                                        profiles: [],
                                                    }
                                                )
                                            );
                                    }
                                });
                            }
                            onClose();
                        }}
                    >
                        Save
                    </DialogButton>

                    <DialogButton onClick={onClose}>Cancel</DialogButton>
                </>
            }
        >
            <div className="tw-flex tw-flex-col tw-gap-2">
                <div
                    className={classNames(
                        'name-input',
                        !validName && 'invalid'
                    )}
                >
                    <div className="max-length">{`${name.length}/${maxLength}`}</div>
                    <input
                        maxLength={maxLength}
                        placeholder="Name your battery"
                        onChange={event => {
                            setName(event.target.value);
                            const match =
                                event.target.value.match(/^[a-zA-Z0-9]+$/);
                            setValidName(!!match);
                        }}
                        value={name}
                    />
                </div>
                <NumberInput
                    showSlider
                    label={
                        <div>
                            <span>Capacity</span>
                        </div>
                    }
                    unit="mAh"
                    value={capacity}
                    range={{ min: 32, max: 3000 }}
                    onChange={setCapacity}
                />
                <NumberInput
                    showSlider
                    label={
                        <div>
                            <span>V</span>
                            <span className="subscript">TERM</span>
                        </div>
                    }
                    unit="V"
                    value={vUpperCutOff}
                    range={npmDevice.chargerModule.ranges.voltage}
                    onChange={setUpperVCutOff}
                />
                <NumberInput
                    showSlider
                    label={
                        <DocumentationTooltip card="profiling" item="Capacity">
                            <div>
                                <span>Discharge cut-off voltage</span>
                            </div>
                        </DocumentationTooltip>
                    }
                    unit="V"
                    value={vLowerCutOff}
                    range={npmDevice.chargerModule.ranges.vLowerCutOff}
                    onChange={setLowerVCutOff}
                />
            </div>
        </GenericDialog>
    );
};
