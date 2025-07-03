/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    classNames,
    DialogButton,
    Dropdown,
    GenericDialog,
    NoticeBox,
    NumberInput,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { selectDirectoryDialog } from '../../../actions/fileActions';
import BaseNpmDevice from '../../../features/pmicControl/npm/basePmicDevice';
import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    CCProfile,
    ITerm,
    NTCThermistor,
    NTCValues,
    Profile,
    RestingCCProfile,
} from '../../../features/pmicControl/npm/types';
import { getCharger } from '../../../features/pmicControl/pmicControlSlice';
import {
    closeProfiling,
    setProfile,
    setProfilingStage,
} from '../../../features/pmicControl/profilingSlice';
import { generateDefaultProjectPath, saveProjectSettings } from '../helpers';
import { ProfilingProject } from '../types';

import '../profiling.scss';

export default ({
    isVisible,
    npmDevice,
}: {
    isVisible: boolean;
    npmDevice: BaseNpmDevice;
}) => {
    const [vLowerCutOff, setLowerVCutOff] = useState(3);
    const [vUpperCutOff, setUpperVCutOff] = useState(4.2);
    const [validName, setValidName] = useState(false);
    const [name, setName] = useState('');
    const [showValidationError, setShowValidationError] = useState(false);

    const [capacity, setCapacity] = useState(
        npmDevice.chargerModule?.ranges.current.max ?? 800
    );
    const [ntcThermistor, setNTCThermistor] = useState<NTCThermistor>('10 kΩ');
    const [temperatures, setTemperatures] = useState<number[]>([25]);
    const [ratedChargingCurrent, setRatedChargingCurrent] = useState(
        capacity / 2
    );
    const charger = useSelector(getCharger);

    if (!npmDevice.chargerModule) {
        return null;
    }

    const [iTerm, setITerm] = useState<ITerm>(
        charger?.iTerm ?? npmDevice.chargerModule.values.iTerm[0].value
    );
    const dispatch = useDispatch();
    const maxLength = 20;

    const ntcThermistorItems = NTCValues.map(item => ({
        label: `${item}`,
        value: `${item}`,
    }));

    const onSelectFolder = () => {
        if (!validName) {
            setShowValidationError(true);
            return;
        }

        selectDirectoryDialog().then(dirPath => {
            const restingProfiles: RestingCCProfile[] =
                npmDevice.batteryProfiler?.restingProfile() ?? [];
            const profilingProfiles: CCProfile[] =
                npmDevice.batteryProfiler?.loadProfile(
                    capacity,
                    vUpperCutOff,
                    vLowerCutOff
                ) ?? [];

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
                iTerm,
            };

            const project: Omit<ProfilingProject, 'appVersion'> = {
                name,
                deviceType: npmDevice.deviceType,
                capacity,
                vLowerCutOff,
                vUpperCutOff,
                profiles: profile.temperatures.map(temperature => ({
                    temperature,
                    csvReady: false,
                })),
                iTerm: iTerm.toString(),
            };

            dispatch(setProfile(profile));
            dispatch(setProfilingStage('Checklist'));

            const fileName = generateDefaultProjectPath(profile);
            dispatch(saveProjectSettings(fileName, project));
        });
    };

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
                        onClick={onSelectFolder}
                        disabled={showValidationError}
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
                            setShowValidationError(false);

                            const match =
                                event.target.value.match(/^[a-zA-Z0-9]+$/);
                            setValidName(
                                !!match && event.target.value !== 'default'
                            );
                        }}
                        value={name}
                    />
                </div>
                <NumberInput
                    showSlider
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
                    // Only nPM1300 which has the chargerModule will get access to this dialog
                    range={npmDevice.chargerModule.ranges.voltage}
                    onChange={setUpperVCutOff}
                />

                <NumberInput
                    showSlider
                    label={
                        <DocumentationTooltip
                            card="profiling"
                            item="DischargeCutOff"
                        >
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

                <NumberInput
                    showSlider
                    label={
                        <DocumentationTooltip card="profiling" item="Capacity">
                            <div>
                                <span>Capacity</span>
                            </div>
                        </DocumentationTooltip>
                    }
                    unit="mAh"
                    value={capacity}
                    range={npmDevice.chargerModule.ranges.batterySize}
                    onChange={c => setCapacity(c)}
                />

                <NumberInput
                    showSlider
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
                    range={npmDevice.chargerModule.ranges.current}
                    onChange={setRatedChargingCurrent}
                />

                <Dropdown
                    label={
                        <DocumentationTooltip card="charger" item="ITERM">
                            <>
                                <span>I</span>
                                <span className="subscript">TERM</span>
                            </>
                        </DocumentationTooltip>
                    }
                    items={npmDevice.chargerModule.values.iTerm}
                    onSelect={item => setITerm(item.value as ITerm)}
                    selectedItem={
                        npmDevice.chargerModule.values.iTerm.find(
                            item => item.value === iTerm
                        ) ?? npmDevice.chargerModule.values.iTerm[0]
                    }
                />

                <Dropdown
                    label={
                        <DocumentationTooltip card="JEITA" item="NTCThermistor">
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
                            <NumberInput
                                showSlider
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

                        {showValidationError && (
                            <div className="mt-2">
                                <NoticeBox
                                    mdiIcon="mdi-lightbulb-alert-outline"
                                    color="tw-text-red"
                                    title="Invalid name" // must be short string
                                    content={
                                        <p className="mb-0">
                                            Battery name must not be empty and
                                            must include only numbers or Latin
                                            characters (or both).
                                        </p>
                                    }
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </GenericDialog>
    );
};
