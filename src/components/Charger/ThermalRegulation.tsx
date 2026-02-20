/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Card,
    classNames,
    NumberInlineInput,
    Slider,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { RangeOrValues } from '@nordicsemiconductor/pc-nrfconnect-shared/typings/generated/src/Slider/range';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import { Charger, ChargerModule } from '../../features/pmicControl/npm/types';
import { getPmicChargingState } from '../../features/pmicControl/pmicControlSlice';

const card = 'chipThermalRegulation';

export default ({
    chargerModule,
    charger,
    disabled,
}: {
    chargerModule: ChargerModule;
    charger: Charger;
    disabled: boolean;
}) => {
    const pmicChargingState = useSelector(getPmicChargingState);

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip
                        card={card}
                        item="ChargerThermalRegulation"
                    >
                        <span>Charger Thermal Regulation</span>
                    </DocumentationTooltip>
                </div>
            }
        >
            <div className="tw-flex tw-flex-col tw-justify-between tw-gap-1">
                <TChgResumeAndTChgStop
                    charger={charger}
                    chargerModule={chargerModule}
                    disabled={disabled}
                />
                <TChgResumeAndTChgReduce
                    charger={charger}
                    chargerModule={chargerModule}
                    disabled={disabled}
                />
            </div>

            <div className="tw-flex tw-flex-row tw-gap-4">
                <DocumentationTooltip
                    card={card}
                    item="ThermalRegulationActive"
                >
                    <div className="tw-text-xs">Thermal Regulation Active</div>
                </DocumentationTooltip>
                <div
                    className={` tw-h-4 tw-w-4 tw-rounded-full tw-border tw-border-solid tw-border-gray-200 ${classNames(
                        pmicChargingState.dieTempHigh
                            ? 'tw-bg-red'
                            : 'tw-bg-green',
                    )}`}
                />
            </div>
        </Card>
    );
};

const TChgResume = ({
    value,
    range,
    onChange,
    onChangeComplete,
    disabled,
}: {
    value: number;
    range: RangeOrValues;
    onChange: (value: number) => void;
    onChangeComplete?: (value: number) => void;
    disabled: boolean;
}) => (
    <div className="tw-flex tw-flex-row tw-justify-between">
        <DocumentationTooltip card={card} item="Tchgresume">
            <div>
                <span>T</span>
                <span className="subscript">CHGRESUME</span>
            </div>
        </DocumentationTooltip>

        <div className="tw-flex tw-flex-row">
            <NumberInlineInput
                value={value}
                range={range}
                onChange={onChange}
                onChangeComplete={onChangeComplete}
                disabled={disabled}
            />
            °C
        </div>
    </div>
);

const TChgResumeAndTChgStop = ({
    chargerModule,
    charger,
    disabled,
}: {
    chargerModule: ChargerModule;
    charger: Charger;
    disabled: boolean;
}) => {
    const [internalTChgResume, setInternalTChgResume] = useState(
        charger.tChgResume,
    );
    const [internalTChgStop, setInternalTChgStop] = useState(charger.tChgStop);

    useEffect(() => {
        setInternalTChgResume(charger.tChgResume);
        setInternalTChgStop(charger.tChgStop);
    }, [charger]);

    if (
        !chargerModule.set.tChgStop ||
        charger.tChgStop === undefined ||
        internalTChgStop === undefined
    ) {
        return null;
    }

    const updateTChgResume = (value: number) => {
        if (value >= internalTChgStop) {
            return;
        }
        setInternalTChgResume(value);
    };
    const updateTChgStop = (value: number) => {
        if (value <= internalTChgResume) {
            return;
        }
        setInternalTChgStop(value);
    };

    return (
        <>
            <TChgResume
                value={internalTChgResume}
                range={chargerModule.ranges.chipThermal}
                onChange={v => updateTChgResume(v)}
                onChangeComplete={v => chargerModule.set.tChgResume(v)}
                disabled={disabled}
            />
            <div className="tw-flex tw-justify-between">
                <DocumentationTooltip card={card} item="Tchgstop">
                    <div>
                        <span>T</span>
                        <span className="subscript">CHGSTOP</span>
                    </div>
                </DocumentationTooltip>
                <div className="tw-flex tw-flex-row">
                    <NumberInlineInput
                        value={internalTChgStop}
                        range={chargerModule.ranges.chipThermal}
                        onChange={v => updateTChgStop(v)}
                        onChangeComplete={v => chargerModule.set.tChgStop?.(v)}
                        disabled={disabled}
                    />
                    °C
                </div>
            </div>
            <Slider
                values={[internalTChgResume, internalTChgStop]}
                range={chargerModule.ranges.chipThermal}
                onChange={[v => updateTChgResume(v), v => updateTChgStop(v)]}
                onChangeComplete={() => {
                    if (charger.tChgResume !== internalTChgResume) {
                        chargerModule.set.tChgResume(internalTChgResume);
                    }
                    if (charger.tChgStop !== internalTChgStop) {
                        chargerModule.set.tChgStop?.(internalTChgStop);
                    }
                }}
                disabled={disabled}
            />
        </>
    );
};

const TChgResumeAndTChgReduce = ({
    chargerModule,
    charger,
    disabled,
}: {
    chargerModule: ChargerModule;
    charger: Charger;
    disabled: boolean;
}) => {
    const [internalTChgResume, setInternalTChgResume] = useState(
        charger.tChgResume,
    );
    const [internalTChgReduce, setInternalTChgReduce] = useState(
        charger.tChgReduce,
    );

    useEffect(() => {
        setInternalTChgResume(charger.tChgResume);
        setInternalTChgReduce(charger.tChgReduce);
    }, [charger]);

    if (
        !chargerModule.set.tChgReduce ||
        charger.tChgReduce === undefined ||
        internalTChgReduce === undefined
    ) {
        return null;
    }

    const updateTChgResume = (value: number) => {
        if (value >= internalTChgReduce) {
            return;
        }
        setInternalTChgResume(value);
    };
    const updateTChgReduce = (value: number) => {
        if (value <= internalTChgResume) {
            return;
        }
        setInternalTChgReduce(value);
    };

    return (
        <>
            <TChgResume
                value={internalTChgResume}
                range={chargerModule.ranges.chipThermal}
                onChange={v => updateTChgResume(v)}
                onChangeComplete={v => chargerModule.set.tChgResume(v)}
                disabled={disabled}
            />
            <div className="tw-flex tw-justify-between">
                <DocumentationTooltip card={card} item="Tchgreduce">
                    <div>
                        <span>T</span>
                        <span className="subscript">CHGREDUCE</span>
                    </div>
                </DocumentationTooltip>
                <div className="tw-flex tw-flex-row">
                    <NumberInlineInput
                        value={internalTChgReduce}
                        range={chargerModule.ranges.chipThermal}
                        onChange={v => updateTChgReduce(v)}
                        onChangeComplete={v =>
                            chargerModule.set.tChgReduce?.(v)
                        }
                        disabled={disabled}
                    />
                    °C
                </div>
            </div>
            <Slider
                values={[internalTChgResume, internalTChgReduce]}
                range={chargerModule.ranges.chipThermal}
                onChange={[v => updateTChgResume(v), v => updateTChgReduce(v)]}
                onChangeComplete={() => {
                    if (charger.tChgResume !== internalTChgResume) {
                        chargerModule.set.tChgResume(internalTChgResume);
                    }
                    if (charger.tChgReduce !== internalTChgReduce) {
                        chargerModule.set.tChgReduce?.(internalTChgReduce);
                    }
                }}
                disabled={disabled}
            />
        </>
    );
};
