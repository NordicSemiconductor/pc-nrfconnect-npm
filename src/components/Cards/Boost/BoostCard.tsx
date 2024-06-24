/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    Card,
    classNames,
    Dropdown,
    NumberInput,
    StateSelector,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    Boost,
    BoostModeControl,
    BoostPinMode,
    BoostPinSelection,
    NpmDevice,
} from '../../../features/pmicControl/npm/types';

export default ({
    npmDevice,
    boost,
    cardLabel = `BOOST`,
    defaultSummary = false,
    disabled,
    index,
}: {
    npmDevice: NpmDevice;
    boost: Boost;
    cardLabel?: string;
    defaultSummary?: boolean;
    disabled: boolean;
    index: number;
}) => {
    const [summary, setSummary] = useState(defaultSummary);

    const boosts = npmDevice.getBoosts?.();

    if (!boosts) return null;

    const range = boosts.ranges.voltageRange(index);

    const [internalVBoost, setInternalVBoost] = useState(boost.vOut);

    const modeItems = [
        { key: 'Software', renderItem: <span>Software</span> },
        {
            key: 'Vset',
            renderItem: (
                <>
                    V<span className="subscript">SET</span>
                </>
            ),
        },
    ];

    const modeControlItems = [
        { label: 'Auto', value: 'AUTO' },
        { label: 'Auto no HP', value: 'NOHP' },
        { label: 'Low Power', value: 'LP' },
        { label: 'High Power', value: 'HP' },
        { label: 'Pass-through', value: 'PASS' },
    ];

    const pinModeItems = [
        { label: 'Low Power', value: 'LP' },
        { label: 'High Power', value: 'HP' },
        { label: 'Pass-through', value: 'PASS' },
        { label: 'Auto no HP', value: 'NOHP' },
    ];

    const pinSelectionItems = [
        { label: 'Off', value: 'OFF' },
        { label: 'GPIO0LO', value: 'GPIO0LO' },
        { label: 'GPIO0HI', value: 'GPIO0HI' },
        { label: 'GPIO1LO', value: 'GPIO1LO' },
        { label: 'GPIO1HI', value: 'GPIO1HI' },
    ];

    // NumberInputSliderWithUnit do not use boost.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalVBoost(boost.vOut);
    }, [boost]);

    return boost ? (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <span>{cardLabel}</span>

                    <div className="d-flex">
                        <span
                            className={classNames(
                                'show-more-toggle mdi',
                                summary && 'mdi-chevron-down',
                                !summary && 'mdi-chevron-up'
                            )}
                            role="button"
                            tabIndex={0}
                            onKeyUp={() => {}}
                            onClick={() => {
                                setSummary(!summary);
                            }}
                        />
                    </div>
                </div>
            }
        >
            <StateSelector
                disabled={disabled}
                items={modeItems}
                onSelect={i =>
                    boosts.set.mode(index, i === 0 ? 'SOFTWARE' : 'VSET')
                }
                selectedItem={
                    boost.mode === 'SOFTWARE' ? modeItems[0] : modeItems[1]
                }
            />

            <NumberInput
                label={
                    <div>
                        <span>V</span>
                        <span className="subscript">OUT</span>
                    </div>
                }
                unit="V"
                disabled={disabled}
                range={range}
                value={internalVBoost}
                onChange={setInternalVBoost}
                onChangeComplete={value => boosts.set.vOut(index, value)}
                showSlider
            />

            {!summary && (
                <>
                    <Dropdown
                        label={<div>Mode Control</div>}
                        items={modeControlItems}
                        onSelect={item =>
                            boosts.set.modeControl(
                                index,
                                item.value as BoostModeControl
                            )
                        }
                        selectedItem={
                            modeControlItems.find(
                                item => item.value === boost.modeControl
                            ) ?? modeControlItems[0]
                        }
                        disabled={disabled}
                    />
                    <Dropdown
                        label="GPIO Control - Pin Selection"
                        items={pinSelectionItems}
                        onSelect={item => {
                            boosts.set.pinSelection(
                                index,
                                item.value as BoostPinSelection
                            );
                        }}
                        selectedItem={
                            pinSelectionItems.find(
                                item => item.value === boost.pinSelection
                            ) ?? pinSelectionItems[0]
                        }
                        disabled={disabled}
                    />
                    <Dropdown
                        label="GPIO Control - Mode Selection"
                        items={pinModeItems}
                        onSelect={item => {
                            boosts.set.pinMode(
                                index,
                                item.value as BoostPinMode
                            );
                        }}
                        selectedItem={
                            pinModeItems.find(
                                item => item.value === boost.pinMode
                            ) ?? pinModeItems[0]
                        }
                        disabled={disabled || !boost.pinModeEnabled}
                    />
                    <Toggle
                        label={<div>Over-Current Protection</div>}
                        isToggled={boost.overCurrentProtection}
                        onToggle={value => boosts.set.overCurrent(index, value)}
                        disabled={disabled}
                    />
                </>
            )}
        </Card>
    ) : null;
};
