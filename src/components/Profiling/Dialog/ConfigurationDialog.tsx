/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { useDispatch } from 'react-redux';
import {
    Button,
    classNames,
    DialogButton,
    Dropdown,
    GenericDialog,
    Group,
    NumberInlineInput,
    Slider,
} from 'pc-nrfconnect-shared';

import { selectDirectoryDialog } from '../../../actions/fileActions';
import {
    CCProfile,
    NTCMode,
    NTCValues,
    Profile,
} from '../../../features/pmicControl/npm/types';
import {
    closeProfiling,
    setProfile,
    setProfilingStage,
} from '../../../features/pmicControl/profilingSlice';
import {
    generateDefaultProjectPath,
    REST_DURATION,
    saveProjectSettings,
} from '../helpers';
import { ProfilingProject } from '../types';

import '../profiling.scss';

export default () => {
    const [vLowerCutOff, setLowerVCutOff] = useState(3);
    const [vUpperCutOff, setUpperVCutOff] = useState(4.2);
    const [validName, setValidName] = useState(false);
    const [name, setName] = useState('');

    const [capacity, setCapacity] = useState(800);
    const [ntcMode, setNTCMode] = useState<NTCMode>('10kΩ');
    const [temperatures, setTemperatures] = useState<number[]>([25]);
    const [ratedChargingCurrent, setRatedChargingCurrent] = useState(
        capacity / 2
    );
    const dispatch = useDispatch();
    const maxLength = 20;

    const ntcModeItems = [...NTCValues].map(item => ({
        label: `${item}`,
        value: `${item}`,
    }));

    return (
        <GenericDialog
            title={`Battery Profiling ${name.length > 0 ? `- ${name}` : ''}`}
            isVisible
            size="sm"
            closeOnEsc={false}
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        disabled={!validName}
                        onClick={() => {
                            selectDirectoryDialog().then(dirPath => {
                                const restingProfiles: CCProfile[] = [
                                    {
                                        tLoad: 500,
                                        tRest: 500,
                                        iLoad: 0,
                                        iRest: 0,
                                        cycles: REST_DURATION,
                                    },
                                ];
                                const profilingProfiles: CCProfile[] = [
                                    {
                                        tLoad: 500,
                                        tRest: 500,
                                        iLoad: 0,
                                        iRest: 0,
                                        cycles: 300, // 5Min
                                    },
                                    {
                                        tLoad: 600000, // 10Min
                                        tRest: 2400000, // 40Min
                                        iLoad: capacity / 5 / 1000, // A
                                        iRest: 0,
                                        vCutoff: 3.9,
                                    },
                                    {
                                        tLoad: 300000, // 5Min
                                        tRest: 1800000, // 30Min
                                        iLoad: capacity / 5 / 1000, // A
                                        iRest: 0,
                                        vCutoff: 3.5,
                                    },
                                    {
                                        tLoad: 300000, // 5Min
                                        tRest: 1800000, // 30Min
                                        iLoad: capacity / 10 / 1000, // A
                                        iRest: 0,
                                    },
                                ];

                                const profile: Profile = {
                                    name,
                                    vLowerCutOff,
                                    vUpperCutOff,
                                    capacity,
                                    ratedChargingCurrent,
                                    ntcMode,
                                    temperatures,
                                    baseDirectory: dirPath,
                                    restingProfiles,
                                    profilingProfiles,
                                };

                                const project: ProfilingProject = {
                                    name,
                                    capacity,
                                    profiles: profile.temperatures.map(
                                        temperature => ({
                                            vLowerCutOff,
                                            vUpperCutOff,
                                            temperature,
                                            csvReady: false,
                                        })
                                    ),
                                };

                                dispatch(setProfile(profile));
                                dispatch(setProfilingStage('Checklist'));

                                const fileName =
                                    generateDefaultProjectPath(profile);
                                dispatch(
                                    saveProjectSettings(fileName, project)
                                );
                            });
                        }}
                    >
                        Select folder
                    </DialogButton>

                    <DialogButton
                        onClick={() => {
                            dispatch(closeProfiling());
                        }}
                    >
                        Cancel
                    </DialogButton>
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
                            <span>Upper V</span>
                            <span className="subscript">CUTOFF</span>
                        </div>
                        <div className="flex-row">
                            <NumberInlineInput
                                value={vUpperCutOff}
                                range={{
                                    min: 4,
                                    max: 4.4,
                                    step: 0.05,
                                    decimals: 2,
                                }}
                                onChange={setUpperVCutOff}
                            />
                            <span>V</span>
                        </div>
                    </FormLabel>
                    <Slider
                        values={[vUpperCutOff]}
                        onChange={[setUpperVCutOff]}
                        range={{
                            min: 4,
                            max: 4.4,
                            step: 0.05,
                            decimals: 2,
                        }}
                    />
                </div>
                <div className="slider-container">
                    <FormLabel className="flex-row">
                        <div>
                            <span>Lower V</span>
                            <span className="subscript">CUTOFF</span>
                        </div>
                        <div className="flex-row">
                            <NumberInlineInput
                                value={vLowerCutOff}
                                range={{
                                    min: 2.7,
                                    max: 3.1,
                                    step: 0.05,
                                    decimals: 2,
                                }}
                                onChange={setLowerVCutOff}
                            />
                            <span>V</span>
                        </div>
                    </FormLabel>
                    <Slider
                        values={[vLowerCutOff]}
                        onChange={[setLowerVCutOff]}
                        range={{
                            min: 2.7,
                            max: 3.1,
                            step: 0.05,
                            decimals: 2,
                        }}
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
                                onChange={c => {
                                    setCapacity(c);
                                    if (ratedChargingCurrent > c) {
                                        setRatedChargingCurrent(c);
                                    }
                                }}
                            />
                            <span>mAh</span>
                        </div>
                    </FormLabel>
                    <Slider
                        values={[capacity]}
                        onChange={[
                            c => {
                                setCapacity(c);
                                if (ratedChargingCurrent > c) {
                                    setRatedChargingCurrent(c);
                                }
                            },
                        ]}
                        range={{ min: 32, max: 3000 }}
                    />
                </div>
                <div className="slider-container">
                    <FormLabel className="flex-row">
                        <div>
                            <span>Rated charging current</span>
                        </div>
                        <div className="flex-row">
                            <NumberInlineInput
                                value={ratedChargingCurrent}
                                range={{
                                    min: 32,
                                    max: Math.min(800, capacity),
                                }}
                                onChange={setRatedChargingCurrent}
                            />
                            <span>mAh</span>
                        </div>
                    </FormLabel>
                    <Slider
                        values={[ratedChargingCurrent]}
                        onChange={[setRatedChargingCurrent]}
                        range={{ min: 32, max: Math.min(800, capacity) }}
                    />
                </div>
                <Dropdown
                    label="NTC mode"
                    items={ntcModeItems}
                    onSelect={item => setNTCMode(item.value as NTCMode)}
                    selectedItem={
                        ntcModeItems[
                            Math.max(
                                0,
                                ntcModeItems.findIndex(
                                    item => item.value === ntcMode
                                )
                            ) ?? 0
                        ]
                    }
                />
                {temperatures.map((temp, index) => (
                    <React.Fragment key={`temp-${index + 1}`}>
                        <div className="flex-row">
                            <div className="flex-grow-1 slider-container">
                                <FormLabel className="flex-row">
                                    <div>
                                        <span>Temperature</span>
                                    </div>

                                    <div className="flex-row">
                                        <NumberInlineInput
                                            value={temp}
                                            range={{
                                                min: -45,
                                                max: 85,
                                            }}
                                            onChange={value => {
                                                const data = [...temperatures];
                                                data[index] = value;
                                                setTemperatures(data);
                                            }}
                                        />
                                        <span>°C </span>
                                    </div>
                                </FormLabel>
                                <Slider
                                    values={[temperatures[index]]}
                                    onChange={[
                                        (value: number) => {
                                            const data = [...temperatures];
                                            data[index] = value;
                                            setTemperatures(data);
                                        },
                                    ]}
                                    range={{
                                        min: -45,
                                        max: 85,
                                    }}
                                />
                            </div>
                            <div>
                                {temperatures.length > 1 && (
                                    <Button
                                        className="ml-1"
                                        onClick={() => {
                                            const t = [...temperatures];
                                            t.splice(index, 1);
                                            setTemperatures(t);
                                        }}
                                        variant="secondary"
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>
                        {index + 1 === temperatures.length && (
                            <Button
                                onClick={() => {
                                    setTemperatures([...temperatures, 0]);
                                }}
                                variant="secondary"
                            >
                                + Add Temperature
                            </Button>
                        )}
                    </React.Fragment>
                ))}
            </Group>
        </GenericDialog>
    );
};
