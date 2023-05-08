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
    DialogButton,
    GenericDialog,
    Group,
    NumberInlineInput,
    Slider,
} from 'pc-nrfconnect-shared';

import { selectDirectoryDialog } from '../../actions/fileActions';
import { CCProfile } from '../../features/pmicControl/npm/types';
import {
    closeProfiling,
    setProfile,
    setProfilingStage,
} from '../../features/pmicControl/profilingSlice';
import { REST_DURATION } from './helpers';

import './profiling.scss';

export default () => {
    const [vLowerCutOff, setLowerVCutOff] = useState(3.1);
    const [vUpperCutOff, setUpperVCutOff] = useState(4);
    const [name, setName] = useState('');

    const [capacity, setCapacity] = useState(800);
    const [temperatures, setTemperatures] = useState<number[]>([25]);
    const dispatch = useDispatch();
    const maxLength = 20;

    return (
        <GenericDialog
            title={`Battery Profiling ${name.length > 0 ? `- ${name}` : ''}`}
            isVisible
            closeOnEsc={false}
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        disabled={name.length === 0}
                        onClick={() => {
                            selectDirectoryDialog().then(filePath => {
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

                                dispatch(
                                    setProfile({
                                        name,
                                        vLowerCutOff,
                                        vUpperCutOff,
                                        capacity,
                                        temperatures,
                                        baseDirector: filePath,
                                        restingProfiles,
                                        profilingProfiles,
                                    })
                                );
                                dispatch(setProfilingStage('Checklist'));
                            });
                        }}
                    >
                        Continue
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
                <div>Configuration</div>
                <div className="name-input">
                    <div className="max-length">{`${name.length}/${maxLength}`}</div>
                    <input
                        maxLength={maxLength}
                        placeholder="Name your battery"
                        onChange={event => setName(event.target.value)}
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
                                onChange={setCapacity}
                            />
                            <span>mAH</span>
                        </div>
                    </FormLabel>
                    <Slider
                        values={[capacity]}
                        onChange={[setCapacity]}
                        range={{ min: 32, max: 3000 }}
                    />
                </div>
                {temperatures.map((temp, index) => (
                    <React.Fragment key={`temp-${index + 1}`}>
                        <div className="flex-row">
                            <div className="flex-grow-1 slider-container">
                                <FormLabel className="flex-row">
                                    <div>
                                        <span>Temperature</span>
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
                                                x
                                            </Button>
                                        )}
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
                                {index + 1 === temperatures.length && (
                                    <Button
                                        onClick={() => {
                                            setTemperatures([
                                                ...temperatures,
                                                0,
                                            ]);
                                        }}
                                        variant="secondary"
                                    >
                                        + Add
                                    </Button>
                                )}
                            </div>
                        </div>
                    </React.Fragment>
                ))}
            </Group>
        </GenericDialog>
    );
};
