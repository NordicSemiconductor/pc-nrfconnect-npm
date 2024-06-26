/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import {
    Dropdown,
    DropdownItem,
    StateSelector,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { BatteryModel } from '../../features/pmicControl/npm/types';
import {
    getActiveBatterModel,
    getHardcodedBatterModels,
    getNpmDevice,
} from '../../features/pmicControl/pmicControlSlice';

type PowerSource = 'USB' | 'Battery';

interface PowerSourceProps {
    disabled: boolean;
}

function generateBatteryTypeItems(
    batteryModels: BatteryModel[]
): DropdownItem[] {
    return batteryModels.map(model => ({
        label: model.name.replace(/[_]/, ' '),
        value: model.name,
    }));
}

export default ({ disabled }: PowerSourceProps) => {
    const npmDevice = useSelector(getNpmDevice);

    const batteryModel = useSelector(getActiveBatterModel);

    const hardCodedBatteries = useSelector(getHardcodedBatterModels);

    const powerSourceType: PowerSource = batteryModel ? 'Battery' : 'USB';

    const powerSourceItems = ['Battery', 'USB'];

    const batteryTypeItems = generateBatteryTypeItems(hardCodedBatteries);

    const selectedBatteryType = batteryTypeItems.find(
        listItem => listItem.value === (batteryModel?.name ?? 'unknown')
    );

    return !disabled ? (
        <>
            <StateSelector
                disabled={disabled}
                items={powerSourceItems}
                onSelect={() => {}}
                selectedItem={
                    powerSourceType === 'Battery'
                        ? powerSourceItems[1]
                        : powerSourceItems[0]
                }
            />
            <Dropdown
                label="Battery profile"
                items={batteryTypeItems}
                onSelect={item => {
                    const selectedBatteryModel = hardCodedBatteries.find(
                        model => model.name === item.value
                    );

                    if (selectedBatteryModel) {
                        npmDevice?.setActiveBatteryModel(item.value);
                    }
                }}
                selectedItem={selectedBatteryType || batteryTypeItems[0]}
                disabled={disabled || powerSourceType === 'USB'}
            />
        </>
    ) : null;
};
