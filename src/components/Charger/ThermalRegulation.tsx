/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Card,
    classNames,
    NumberInputSliderWithUnit,
} from 'pc-nrfconnect-shared';

import { NpmDevice } from '../../features/pmicControl/npm/types';
import { getPmicChargingState } from '../../features/pmicControl/pmicControlSlice';

interface PowerCardProperties {
    index: number;
    npmDevice: NpmDevice;
    disabled: boolean;
}

export default ({ index, npmDevice, disabled }: PowerCardProperties) => {
    const pmicChargingState = useSelector(getPmicChargingState);

    const [tempChgStop, setTempChgStop] = useState(1);
    const [tempChgResume, setTempChgResume] = useState(1);

    // NumberInputSliderWithUnit do not use ldo.<prop> as value as we send only at on change complete
    // useEffect(() => {
    //     setInternalVTermr(ldo.voltage);
    // }, [ldo]);

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
                range={{ min: 0, max: 120 }}
                onChange={value => setTempChgStop(value)}
                onChangeComplete={() => {
                    // TODO
                }}
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
                range={{ min: 0, max: 120 }}
                onChange={value => setTempChgResume(value)}
                onChangeComplete={() => {
                    // TODO
                }}
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
