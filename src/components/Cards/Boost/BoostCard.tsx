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

import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    Boost,
    BoostModeControl,
    BoostModule,
    BoostPinMode,
    BoostPinSelection,
} from '../../../features/pmicControl/npm/types';

export default ({
    boost,
    boostModule,
    cardLabel = 'Boost',
    defaultSummary = false,
    disabled,
}: {
    boost: Boost;
    boostModule: BoostModule;
    cardLabel?: string;
    defaultSummary?: boolean;
    disabled: boolean;
}) => {
    const [summary, setSummary] = useState(defaultSummary);

    const range = boostModule.ranges.voltage;
    const card = `Boost${boostModule.index}`;

    const [internalVBoost, setInternalVBoost] = useState(
        boost.vOutSelect === 'Vset' ? boost.vOutVSet : boost.vOutSoftware
    );

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
        if (boost.vOutSelect === 'Vset') {
            setInternalVBoost(boost.vOutVSet);
        } else {
            setInternalVBoost(boost.vOutSoftware);
        }
    }, [boost]);

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card={card} item="Boost">
                        <span>{cardLabel}</span>
                    </DocumentationTooltip>

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
                    boostModule.set.vOutSel(i === 0 ? 'Software' : 'Vset')
                }
                selectedItem={
                    boost.vOutSelect === 'Software'
                        ? modeItems[0]
                        : modeItems[1]
                }
            />

            <NumberInput
                label={
                    <DocumentationTooltip card={card} item="VOUT">
                        <div>
                            <span>V</span>
                            <span className="subscript">OUT</span>
                        </div>
                    </DocumentationTooltip>
                }
                unit="V"
                disabled={disabled}
                range={range}
                value={internalVBoost}
                onChange={setInternalVBoost}
                onChangeComplete={value => boostModule.set.vOut(value)}
                showSlider
            />

            {!summary && (
                <>
                    <Dropdown
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="ModeControl"
                            >
                                Mode Control
                            </DocumentationTooltip>
                        }
                        items={modeControlItems}
                        onSelect={item =>
                            boostModule.set.modeControl(
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
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="PinSelection"
                            >
                                GPIO Control - Pin Selection
                            </DocumentationTooltip>
                        }
                        items={pinSelectionItems}
                        onSelect={item =>
                            boostModule.set.pinSelection(
                                item.value as BoostPinSelection
                            )
                        }
                        selectedItem={
                            pinSelectionItems.find(
                                item => item.value === boost.pinSelection
                            ) ?? pinSelectionItems[0]
                        }
                        disabled={disabled}
                    />
                    <Dropdown
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="ModeSelection"
                            >
                                GPIO Control - Mode Selection
                            </DocumentationTooltip>
                        }
                        items={pinModeItems}
                        onSelect={item =>
                            boostModule.set.pinMode(item.value as BoostPinMode)
                        }
                        selectedItem={
                            pinModeItems.find(
                                item => item.value === boost.pinMode
                            ) ?? pinModeItems[0]
                        }
                        disabled={disabled || !boost.pinModeEnabled}
                    />
                    <Toggle
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="OvercurrentProtection"
                            >
                                Overcurrent Protection
                            </DocumentationTooltip>
                        }
                        isToggled={boost.overCurrentProtection}
                        onToggle={value => boostModule.set.overCurrent(value)}
                        disabled={disabled}
                    />
                </>
            )}
        </Card>
    );
};
