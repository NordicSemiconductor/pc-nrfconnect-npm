/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Button,
    classNames,
    DialogButton,
    Dropdown,
    GenericDialog,
    Group,
    NumberInputSliderWithUnit,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { selectDirectoryDialog } from '../../../actions/fileActions';
import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    CCProfile,
    NTCThermistor,
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

export default ({ isVisible }: { isVisible: boolean }) => {
    const [vLowerCutOff, setLowerVCutOff] = useState(3);
    const [vUpperCutOff, setUpperVCutOff] = useState(4.2);
    const [validName, setValidName] = useState(false);
    const [name, setName] = useState('');

    const [capacity, setCapacity] = useState(800);
    const [ntcThermistor, setNTCThermistor] = useState<NTCThermistor>('10 kΩ');
    const [temperatures, setTemperatures] = useState<number[]>([25]);
    const [ratedChargingCurrent, setRatedChargingCurrent] = useState(
        capacity / 2
    );
    const dispatch = useDispatch();
    const maxLength = 20;

    const ntcThermistorItems = NTCValues.map(item => ({
        label: `${item}`,
        value: `${item}`,
    }));

    return (
        <GenericDialog
            title={`Battery Profiling ${name.length > 0 ? `- ${name}` : ''}`}
            isVisible={isVisible}
            size="sm"
            className="app-dialog"
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
                                        vCutoff: vUpperCutOff - 0.3,
                                    },
                                    {
                                        tLoad: 300000, // 5Min
                                        tRest: 1800000, // 30Min
                                        iLoad: capacity / 5 / 1000, // A
                                        iRest: 0,
                                        vCutoff: vLowerCutOff + 0.5,
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
                                    ntcThermistor,
                                    temperatures,
                                    baseDirectory: dirPath,
                                    restingProfiles,
                                    profilingProfiles,
                                };

                                const project: Omit<
                                    ProfilingProject,
                                    'appVersion'
                                > = {
                                    name,
                                    capacity,
                                    vLowerCutOff,
                                    vUpperCutOff,
                                    profiles: profile.temperatures.map(
                                        temperature => ({
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
                <NumberInputSliderWithUnit
                    label={
                        <DocumentationTooltip card="charger" item="VTERM">
                            <div>
                                <span>V</span>
                                <span className="subscript">TERM</span>
                            </div>
                        </DocumentationTooltip>
                    }
                    unit="V"
                    value={vUpperCutOff}
                    range={{
                        min: 4,
                        max: 4.4,
                        step: 0.05,
                        decimals: 2,
                    }}
                    onChange={setUpperVCutOff}
                />

                <NumberInputSliderWithUnit
                    label={
                        <DocumentationTooltip card="profiling" item="Capacity">
                            <div>
                                <span>Discharge cut-off voltage</span>
                            </div>
                        </DocumentationTooltip>
                    }
                    unit="V"
                    value={vLowerCutOff}
                    range={{
                        min: 2.7,
                        max: 3.1,
                        step: 0.05,
                        decimals: 2,
                    }}
                    onChange={setLowerVCutOff}
                />

                <NumberInputSliderWithUnit
                    label={
                        <DocumentationTooltip card="profiling" item="Capacity">
                            <div>
                                <span>Capacity</span>
                            </div>
                        </DocumentationTooltip>
                    }
                    unit="mAh"
                    value={capacity}
                    range={{ min: 32, max: 3000 }}
                    onChange={c => {
                        setCapacity(c);
                        if (ratedChargingCurrent > c) {
                            setRatedChargingCurrent(c);
                        }
                    }}
                />

                <NumberInputSliderWithUnit
                    label={
                        <DocumentationTooltip card="charger" item="ICHG">
                            <div>
                                <span>I</span>
                                <span className="subscript">CHG</span>
                            </div>
                        </DocumentationTooltip>
                    }
                    unit="mA"
                    value={ratedChargingCurrent}
                    range={{
                        min: 32,
                        max: Math.min(800, capacity),
                    }}
                    onChange={setRatedChargingCurrent}
                />

                <Dropdown
                    label={
                        <DocumentationTooltip
                            card="charger"
                            item="NTCThermistor"
                        >
                            <span>NTC thermistor</span>
                        </DocumentationTooltip>
                    }
                    items={ntcThermistorItems}
                    onSelect={item =>
                        setNTCThermistor(item.value as NTCThermistor)
                    }
                    selectedItem={
                        ntcThermistorItems[
                            Math.max(
                                0,
                                ntcThermistorItems.findIndex(
                                    item => item.value === ntcThermistor
                                )
                            ) ?? 0
                        ]
                    }
                />
                {temperatures.map((temp, index) => (
                    <React.Fragment key={`temp-${index + 1}`}>
                        <div className="tw-flex tw-flex-row tw-items-center">
                            <NumberInputSliderWithUnit
                                className="tw-flex-grow"
                                label={
                                    <DocumentationTooltip
                                        card="profiling"
                                        item="Temperature"
                                    >
                                        <div>
                                            <span>Temperature</span>
                                        </div>
                                    </DocumentationTooltip>
                                }
                                unit="°C"
                                value={temp}
                                range={{
                                    min: 0,
                                    max: 60,
                                }}
                                onChange={value => {
                                    const data = [...temperatures];
                                    data[index] = value;
                                    setTemperatures(data);
                                }}
                            />
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
