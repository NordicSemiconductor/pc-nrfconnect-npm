/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { useDispatch } from 'react-redux';
import {
    classNames,
    DialogButton,
    GenericDialog,
    Group,
    NumberInlineInput,
    Slider,
} from 'pc-nrfconnect-shared';

import { showSaveDialog } from '../../../actions/fileActions';
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
    const [validName, setValidName] = useState(!!projectSettings);
    const [name, setName] = useState(projectSettings?.project.name ?? '');

    const [capacity, setCapacity] = useState(800);
    const dispatch = useDispatch();
    const maxLength = 20;

    return (
        <GenericDialog
            title={`${projectSettings ? 'Edit' : 'Add'} Project ${
                name.length > 0 ? `- ${name}` : ''
            }`}
            isVisible
            size="sm"
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
                                                        capacity,
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
            <Group>
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

                <div className="slider-container">
                    <FormLabel className="flex-row">
                        <div>
                            <span>Capacity</span>
                        </div>
                        <div className="flex-row">
                            <NumberInlineInput
                                value={capacity}
                                range={{ min: 32, max: 3000 }}
                                onChange={setCapacity}
                            />
                            <span>mAh</span>
                        </div>
                    </FormLabel>
                    <Slider
                        values={[capacity]}
                        onChange={[setCapacity]}
                        range={{ min: 32, max: 3000 }}
                    />
                </div>
            </Group>
        </GenericDialog>
    );
};
