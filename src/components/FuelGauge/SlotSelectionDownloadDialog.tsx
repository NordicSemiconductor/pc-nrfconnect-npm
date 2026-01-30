/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    DialogButton,
    Dropdown,
    type DropdownItem,
    GenericDialog,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    closeDialog,
    getBuffer,
    getModelName,
    getShowDialog,
} from '../../features/pmicControl/downloadBatteryModelSlice';
import {
    getNpmDevice,
    getStoredBatterModels,
} from '../../features/pmicControl/pmicControlSlice';

export default () => {
    const dispatch = useDispatch();
    const npmDevice = useSelector(getNpmDevice);
    const storedBatterModels = useSelector(getStoredBatterModels);
    const [slot, setSlot] = useState(0);
    const buffer = useSelector(getBuffer);
    const showDialog = useSelector(getShowDialog);
    const modelName = useSelector(getModelName);

    const items: DropdownItem<number>[] = [];

    for (
        let i = 0;
        i < (npmDevice?.getNumberOfBatteryModelSlots() ?? 0);
        i += 1
    ) {
        const module = storedBatterModels?.find(m => m.slotIndex === i);

        items.push({
            value: i,
            label: `Slot ${i}:  ${module?.name ?? 'Empty'}`,
        });
    }

    return showDialog ? (
        <GenericDialog
            className="tw-preflight"
            title={`Write battery model${modelName ? ` - ${modelName}` : ''}`}
            footer={
                <>
                    <DialogButton
                        onClick={() => {
                            dispatch(closeDialog());
                            if (npmDevice && buffer) {
                                npmDevice.fuelGaugeModule?.actions.downloadFuelGaugeProfile(
                                    buffer,
                                    slot,
                                );
                            }
                        }}
                        variant="primary"
                    >
                        Write
                    </DialogButton>
                    <DialogButton
                        onClick={() => {
                            dispatch(closeDialog());
                        }}
                        variant="secondary"
                    >
                        Cancel
                    </DialogButton>
                </>
            }
            isVisible
        >
            <div className="tw-flex tw-flex-col tw-gap-2">
                <p>
                    {`You are about to write a new battery model to the nPM Controller that
                is running the Fuel Gauge algorithm in nPM PowerUP, and make it
                available in the Active Battery Model drop-down menu.`}
                </p>
                <p>
                    Select one of the available battery model slots in the nPM
                    Controller.
                </p>
                <Dropdown
                    label="Select slot"
                    items={items}
                    onSelect={item => {
                        setSlot(item.value);
                    }}
                    selectedItem={items[slot]}
                />
            </div>
        </GenericDialog>
    ) : null;
};
