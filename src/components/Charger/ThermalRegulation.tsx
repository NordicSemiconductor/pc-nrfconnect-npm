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
    NumberInputSliderWithUnit,
} from 'pc-nrfconnect-shared';

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

    const [tempChgStop, setTempChgStop] = useState(charger.tChgStop);
    const [tempChgResume, setTempChgResume] = useState(charger.tChgResume);

    // NumberInputSliderWithUnit do not use charger.<prop> as value as we send only at on change complete
    useEffect(() => {
        setTempChgStop(charger.tChgStop);
        setTempChgResume(charger.tChgResume);
    }, [charger]);

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <span>Chip Thermal Regulation</span>
                </div>
            }
        >
            <NumberInputSliderWithUnit
                label={
                    <div>
                        <span>T</span>
                        <span className="subscript">CHGSTOP</span>
                    </div>
                }
                unit="°C"
                value={tempChgStop}
                range={{
                    ...npmDevice.getChargerTChgStopRange(),
                    min: charger.tChgResume + 1,
                }}
                onChange={value => {
                    if (value) setTempChgStop(value);
                }}
                onChangeComplete={npmDevice.setChargerTChgStop}
                disabled={disabled}
            />
            <NumberInputSliderWithUnit
                label={
                    <div>
                        <span>T</span>
                        <span className="subscript">CHGRESUME</span>
                    </div>
                }
                unit="°C"
                value={tempChgResume}
                range={{
                    ...npmDevice.getChargerTChgResumeRange(),
                    max: charger.tChgStop - 1,
                }}
                onChange={value => {
                    if (value) setTempChgResume(value);
                }}
                onChangeComplete={npmDevice.setChargerTChgResume}
                disabled={disabled}
            />
            <div className="tw-flex tw-flex-row tw-justify-between ">
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
