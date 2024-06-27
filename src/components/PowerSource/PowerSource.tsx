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

import { getBatteryAddonBoard } from '../../features/pmicControl/npm/npm2100/battery/BatteryAddonBoard';
import { BatteryModel } from '../../features/pmicControl/npm/types';
import {
    getActiveBatterModel,
    getBatteryAddonBoardId,
    getHardcodedBatterModels,
    getNpmDevice,
} from '../../features/pmicControl/pmicControlSlice';

type PowerSource = 'USB' | 'Battery';

function generateBatteryTypeItems(
    batteryModels: BatteryModel[]
): DropdownItem[] {
    return batteryModels.map(model => ({
        label: model.name.replace(/[_]/, ' '),
        value: model.name,
    }));
}

export default () => {
    const batteryAddonBoardId = useSelector(getBatteryAddonBoardId);

    const powerSourceType: PowerSource =
        batteryAddonBoardId !== 0 ? 'Battery' : 'USB';

    const powerSourceItems = ['Battery', 'USB'];

    return (
        <>
            <StateSelector
                disabled
                items={powerSourceItems}
                onSelect={() => {}}
                selectedItem={
                    powerSourceType === 'Battery'
                        ? powerSourceItems[0]
                        : powerSourceItems[1]
                }
            />
            <BatteryAddonBoardInfo />
        </>
    );
};

const BatteryAddonBoardInfo = () => {
    const batteryAddonBoardId = useSelector(getBatteryAddonBoardId);

    const batteryCellType = getBatteryAddonBoard(batteryAddonBoardId);

    if (batteryAddonBoardId === 0) {
        return (
            <div className="x tw-mb-6 tw-w-full tw-border tw-border-solid tw-border-gray-200 tw-p-2">
                No battery add-on board detected.
            </div>
        );
    }

    return (
        <div className="x tw-mb-6 tw-w-full tw-border tw-border-solid tw-border-gray-200 tw-p-2">
            Battery add-on board for
            <br />
            {batteryCellType}-batteries connected.
        </div>
    );
};

// V V V Battery model selection to be used later on V V V

interface BatteryModelDropdownAttr {
    disabled: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BatteryModelDropdown = ({ disabled }: BatteryModelDropdownAttr) => {
    const npmDevice = useSelector(getNpmDevice);
    const batteryModel = useSelector(getActiveBatterModel);
    const hardCodedBatteries = useSelector(getHardcodedBatterModels);
    const batteryTypeItems = generateBatteryTypeItems(hardCodedBatteries);

    const selectedBatteryType = batteryTypeItems.find(
        listItem => listItem.value === (batteryModel?.name ?? 'unknown')
    );
    return (
        <Dropdown
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
            disabled={disabled}
        />
    );
};
