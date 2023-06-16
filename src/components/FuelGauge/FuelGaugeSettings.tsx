/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Dropdown, DropdownItem } from 'pc-nrfconnect-shared';

import { getProfileBuffer } from '../../actions/fileActions';
import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    dialogHandler,
    DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
} from '../../features/pmicControl/npm/pmicHelpers';
import { BatteryModel } from '../../features/pmicControl/npm/types';
import {
    canProfile,
    getActiveBatterModel,
    getHardcodedBatterModels,
    getLatestAdcSample,
    getNpmDevice,
    getStoredBatterModels,
} from '../../features/pmicControl/pmicControlSlice';
import { setProfilingStage } from '../../features/pmicControl/profilingSlice';

export default ({ disabled }: { disabled: boolean }) => {
    const dispatch = useDispatch();

    const npmDevice = useSelector(getNpmDevice);
    const activeBatteryModel = useSelector(getActiveBatterModel);
    const storedBatterModels = useSelector(getStoredBatterModels);
    const hardcodedBatterModels = useSelector(getHardcodedBatterModels);
    const latestAdcSample = useSelector(getLatestAdcSample);
    const profilingSupported = useSelector(canProfile);

    const getClosest = (
        batteryModel: BatteryModel | undefined,
        temperature: number
    ) =>
        batteryModel?.characterizations.reduce((prev, curr) =>
            Math.abs(curr.temperature - temperature) <
            Math.abs(prev.temperature - temperature)
                ? curr
                : prev
        ) ?? undefined;

    const batteryModelItems: DropdownItem[] = useMemo(() => {
        const items = [...hardcodedBatterModels];
        if (activeBatteryModel) {
            if (
                hardcodedBatterModels.filter(
                    v => v && v.name !== activeBatteryModel.name
                ).length > 0
            )
                items.push(activeBatteryModel);
        }

        storedBatterModels?.forEach(storedBatterModel => {
            if (storedBatterModel) items.push(storedBatterModel);
        });

        const keys = new Set(items.map(item => item.name));
        return Array.from(keys).map(key => ({
            label: `${key} (${
                getClosest(
                    items.find(batterModel => batterModel.name === key),
                    latestAdcSample?.tBat ?? 24
                )?.capacity ?? ''
            } mAh)`,
            value: key,
        }));
    }, [
        activeBatteryModel,
        hardcodedBatterModels,
        latestAdcSample?.tBat,
        storedBatterModels,
    ]);

    const selectedActiveItemBatteryMode = useMemo(
        () =>
            batteryModelItems.find(
                item => item.value === activeBatteryModel?.name
            ) ?? {
                label: 'N/A',
                value: '',
            },
        [activeBatteryModel, batteryModelItems]
    );

    return (
        <>
            <Dropdown
                label={
                    <DocumentationTooltip
                        placement="right-start"
                        card="sidePanel"
                        item="ActiveBatteryModel"
                    >
                        Active Battery Model
                    </DocumentationTooltip>
                }
                items={batteryModelItems}
                onSelect={(item: DropdownItem) => {
                    npmDevice?.setActiveBatteryModel(item.value);
                }}
                selectedItem={selectedActiveItemBatteryMode}
                disabled={disabled}
            />
            <DocumentationTooltip
                placement="right-start"
                card="sidePanel"
                item="WriteBatteryModel"
            >
                <Button
                    variant="secondary"
                    className="w-100"
                    onClick={() => {
                        getProfileBuffer()
                            .then(buffer => {
                                dispatch(
                                    dialogHandler({
                                        uuid: DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
                                        message: `Write battery profile will reset the current fuel gauge. Click 'Write' to continue.`,
                                        confirmLabel: 'Write',
                                        confirmClosesDialog: false,
                                        cancelLabel: 'Cancel',
                                        title: 'Write',
                                        onConfirm: () => {
                                            npmDevice?.downloadFuelGaugeProfile(
                                                buffer
                                            );
                                        },
                                        onCancel: () => {},
                                    })
                                );
                            })
                            .catch(res => {
                                dispatch(
                                    dialogHandler({
                                        uuid: DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
                                        message: (
                                            <>
                                                <div>
                                                    Write battery profile.
                                                </div>
                                                <br />
                                                <Alert
                                                    label="Error "
                                                    variant="danger"
                                                >
                                                    {res}
                                                </Alert>
                                            </>
                                        ),
                                        type: 'alert',
                                        confirmLabel: 'Write',
                                        confirmDisabled: true,
                                        cancelLabel: 'Cancel',
                                        title: 'Write',
                                        onConfirm: () => {},
                                        onCancel: () => {},
                                    })
                                );
                            });
                    }}
                    disabled={disabled}
                >
                    Write Battery Model
                </Button>
            </DocumentationTooltip>
            {profilingSupported && (
                <DocumentationTooltip
                    placement="right-start"
                    card="sidePanel"
                    item="ProfileBattery"
                    keepShowingOnHoverTooltip
                >
                    <Button
                        variant="secondary"
                        className="w-100"
                        onClick={() => {
                            npmDevice
                                ?.getBatteryProfiler()
                                ?.canProfile()
                                .then(result => {
                                    if (result) {
                                        dispatch(
                                            setProfilingStage('Configuration')
                                        );
                                    } else {
                                        dispatch(
                                            setProfilingStage(
                                                'MissingSyncBoard'
                                            )
                                        );
                                    }
                                });
                        }}
                        disabled={disabled}
                    >
                        Profile Battery
                    </Button>
                </DocumentationTooltip>
            )}
        </>
    );
};
