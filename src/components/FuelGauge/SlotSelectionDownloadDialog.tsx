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
    DropdownItem,
    GenericDialog,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    closeDialog,
    getBuffer,
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

    console.log(items);

    return showDialog ? (
        <GenericDialog
            title="Write battery model"
            footer={
                <>
                    <DialogButton
                        onClick={() => {
                            dispatch(closeDialog());
                            if (npmDevice && buffer) {
                                npmDevice.downloadFuelGaugeProfile(
                                    buffer,
                                    slot
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
            <div>
                {`Writing battery profile will reset the current fuel gauge and
                overwrite the model in the slot. Click 'Write' to continue.`}
            </div>
            <Dropdown
                label="Programming slot"
                items={items}
                onSelect={item => {
                    setSlot(item.value);
                }}
                selectedItem={items[slot]}
            />
        </GenericDialog>
    ) : null;
};
