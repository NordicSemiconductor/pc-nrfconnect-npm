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

import { Charger, NpmDevice } from '../../features/pmicControl/npm/types';
import { getPmicChargingState } from '../../features/pmicControl/pmicControlSlice';

export default ({
    npmDevice,
    charger,
    disabled,
}: {
    npmDevice: NpmDevice;
    charger: Charger;
    disabled: boolean;
}) => {
    const pmicChargingState = useSelector(getPmicChargingState);

    const [internalChipThermal, setInternalChipThermal] = useState([
        charger.tChgResume,
        charger.tChgStop,
    ]);

    // NumberInputSliderWithUnit do not use charger.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalChipThermal([charger.tChgResume, charger.tChgStop]);
    }, [charger]);

    const updateInternal = (index: number, value: number) => {
        if (index === 0 && value >= internalChipThermal[1]) {
            return;
        }
        if (index === 1 && internalChipThermal[0] >= value) {
            return;
        }

        const temp = [...internalChipThermal];
        temp[index] = value;
        setInternalChipThermal(temp);
    };

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <span>Chip Thermal Regulation</span>
                </div>
            }
        >
            <div className="tw-flex tw-flex-col tw-justify-between tw-gap-1">
                <div className="tw-flex tw-flex-row tw-justify-between">
                    <div>
                        <span>T</span>
                        <span className="subscript">CHGRESUME</span>
                    </div>
                    <div className="tw-flex tw-flex-row">
                        <NumberInlineInput
                            value={internalChipThermal[0]}
                            range={npmDevice.getChargerChipThermalRange()}
                            onChange={v => updateInternal(0, v)}
                            onChangeComplete={npmDevice.setChargerTChgResume}
                            disabled={disabled}
                        />
                        °C
                    </div>
                </div>
                <div className="tw-flex tw-justify-between">
                    <div>
                        <span>T</span>
                        <span className="subscript">CHGSTOP</span>
                    </div>
                    <div className="tw-flex tw-flex-row">
                        <NumberInlineInput
                            value={internalChipThermal[1]}
                            range={npmDevice.getChargerChipThermalRange()}
                            onChange={v => updateInternal(1, v)}
                            onChangeComplete={npmDevice.setChargerTChgStop}
                            disabled={disabled}
                        />
                        °C
                    </div>
                </div>
                <Slider
                    values={internalChipThermal}
                    range={npmDevice.getChargerChipThermalRange()}
                    onChange={[0, 1].map(i => v => updateInternal(i, v))}
                    onChangeComplete={() => {
                        if (internalChipThermal[0] !== charger.tCold)
                            npmDevice.setChargerTChgResume(
                                internalChipThermal[0]
                            );
                        if (internalChipThermal[1] !== charger.tCool)
                            npmDevice.setChargerTChgStop(
                                internalChipThermal[1]
                            );
                    }}
                    disabled={disabled}
                />
            </div>

            <div className="tw-flex tw-flex-row tw-gap-4">
                <div className="tw-text-xs">Thermal Regulation</div>
                <div
                    className={` tw-h-4 tw-w-4 tw-rounded-full tw-border tw-border-solid tw-border-gray-200 ${classNames(
                        pmicChargingState.dieTempHigh
                            ? 'tw-bg-red'
                            : 'tw-bg-green'
                    )}`}
                />
            </div>
        </Card>
    );
};
