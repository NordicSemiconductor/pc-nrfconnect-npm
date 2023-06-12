/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo, useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    Button,
    Dropdown,
    DropdownItem,
    NumberInlineInput,
    Slider,
} from 'pc-nrfconnect-shared';

import { getProfileBuffer } from '../../actions/fileActions';
import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    dialogHandler,
    DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
    updateAdcTimings,
} from '../../features/pmicControl/npm/pmicHelpers';
import { BatteryModel } from '../../features/pmicControl/npm/types';
import {
    canProfile,
    getActiveBatterModel,
    getFuelGaugeNotChargingSamplingRate,
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

    const fuelGaugeNotChargingSamplingRate = useSelector(
        getFuelGaugeNotChargingSamplingRate
    );
    const [
        fuelGaugeNotChargingSamplingRateInternal,
        setFuelGaugeNotChargingSamplingRateInternal,
    ] = useState(fuelGaugeNotChargingSamplingRate);
    useEffect(() => {
        setFuelGaugeNotChargingSamplingRateInternal(
            fuelGaugeNotChargingSamplingRate
        );
    }, [dispatch, fuelGaugeNotChargingSamplingRate]);

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
                        card="SidePanel"
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
            <DocumentationTooltip card="SidePanel" item="LoadBatteryModel">
                <Button
                    variant="secondary"
                    className="w-100"
                    onClick={() => {
                        getProfileBuffer()
                            .then(buffer => {
                                dispatch(
                                    dialogHandler({
                                        uuid: DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
                                        message: `Load battery profile will reset the current fuel gauge. Click 'Load' to continue.`,
                                        confirmLabel: 'Load',
                                        confirmClosesDialog: false,
                                        cancelLabel: 'Cancel',
                                        title: 'Load',
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
                                                <div>Load battery profile.</div>
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
                                        confirmLabel: 'Load',
                                        confirmDisabled: true,
                                        cancelLabel: 'Cancel',
                                        title: 'Load',
                                        onConfirm: () => {},
                                        onCancel: () => {},
                                    })
                                );
                            });
                    }}
                    disabled={disabled}
                >
                    Load Battery Model
                </Button>
            </DocumentationTooltip>
            {profilingSupported && (
                <DocumentationTooltip card="SidePanel" item="ProfileBattery">
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
            <div className={`slider-container ${disabled ? 'disabled' : ''}`}>
                <FormLabel className="flex-row">
                    <div>Sampling Rate</div>

                    <div className="flex-row">
                        <NumberInlineInput
                            value={fuelGaugeNotChargingSamplingRateInternal}
                            range={{ min: 500, max: 10000 }}
                            onChange={value =>
                                setFuelGaugeNotChargingSamplingRateInternal(
                                    value
                                )
                            }
                            onChangeComplete={() =>
                                dispatch(
                                    updateAdcTimings({
                                        samplingRate:
                                            fuelGaugeNotChargingSamplingRateInternal,
                                    })
                                )
                            }
                            disabled={disabled}
                        />
                        <span>ms</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[fuelGaugeNotChargingSamplingRateInternal]}
                    onChange={[
                        value =>
                            setFuelGaugeNotChargingSamplingRateInternal(value),
                    ]}
                    onChangeComplete={() =>
                        dispatch(
                            updateAdcTimings({
                                samplingRate:
                                    fuelGaugeNotChargingSamplingRateInternal,
                            })
                        )
                    }
                    range={{ min: 500, max: 10000 }}
                    disabled={disabled}
                />
            </div>
            {/* <div className={`slider-container ${disabled ? 'disabled' : ''}`}>
                <FormLabel className="flex-row">
                    <div>Charging Sampling Rate</div>

                    <div className="flex-row">
                        <NumberInlineInput
                            value={fuelGaugeChargingSamplingRateInternal}
                            range={{ min: 500, max: 10000 }}
                            onChange={value =>
                                setFuelGaugeChargingSamplingRateInternal(value)
                            }
                            onChangeComplete={() =>
                                dispatch(
                                    updateAdcTimings({
                                        chargingSamplingRate:
                                            fuelGaugeChargingSamplingRateInternal,
                                    })
                                )
                            }
                            disabled={disabled}
                        />
                        <span>ms</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[fuelGaugeChargingSamplingRateInternal]}
                    onChange={[
                        value =>
                            setFuelGaugeChargingSamplingRateInternal(value),
                    ]}
                    onChangeComplete={() =>
                        dispatch(
                            updateAdcTimings({
                                chargingSamplingRate:
                                    fuelGaugeChargingSamplingRateInternal,
                            })
                        )
                    }
                    range={{ min: 500, max: 10000 }}
                    disabled={disabled}
                />
            </div> */}
        </>
    );
};