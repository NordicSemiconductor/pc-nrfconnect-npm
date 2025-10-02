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
    Buck,
    BuckMode,
    BuckModeControl,
    BuckModeControlValues,
    BuckModule,
    BuckOnOffControl,
    BuckOnOffControlValues,
    BuckRetentionControl,
    BuckRetentionControlValues,
    GPIOValues,
} from '../../../features/pmicControl/npm/types';

interface BuckCardProperties {
    buck: Buck;
    buckModule: BuckModule;
    cardLabel?: string;
    defaultSummary?: boolean;
    disabled: boolean;
    numberOfGPIOs?: number;
}

export default ({
    buck,
    buckModule,
    cardLabel = `BUCK ${buckModule.index + 1}`,
    disabled,
    defaultSummary = false,
    numberOfGPIOs = 0,
}: BuckCardProperties) => {
    const card = `buck${buckModule.index + 1}`;
    const [summary, setSummary] = useState(defaultSummary);

    const onVOutChange = (value: number) => buckModule.set.vOutNormal(value);

    const onRetVOutChange = (value: number) => {
        buckModule.set.vOutRetention(value);
    };

    const onModeToggle = (mode: BuckMode) => buckModule.set.mode(mode);

    const onBuckToggle = (value: boolean) => buckModule.set.enabled(value);

    const voltageRange = buckModule.ranges.voltage;
    const retVOutRange = buckModule.ranges.retVOut;

    const gpioNames = GPIOValues.slice(0, numberOfGPIOs);

    const modeControlItems = [...BuckModeControlValues, ...gpioNames].map(
        item => ({
            label: item,
            value: item,
        }),
    );

    const buckOnOffControlItems = [...BuckOnOffControlValues, ...gpioNames].map(
        (item, i) => {
            const label =
                buck.mode === 'software' ? (
                    'Software'
                ) : (
                    <>
                        V
                        <span className="subscript">{`SET${
                            buckModule.index + 1
                        }`}</span>
                    </>
                );
            return {
                label: i === 0 ? label : item,
                value: item,
            };
        },
    );

    const buckRetentionControlItems = [
        ...BuckRetentionControlValues,
        ...gpioNames,
    ].map(item => ({
        label: item,
        value: item,
    }));

    const vSetItems = [
        { key: 'Software', renderItem: <span>Software</span> },
        {
            key: 'Vset',
            renderItem: (
                <>
                    V
                    <span className="subscript">{`SET${
                        buckModule.index + 1
                    }`}</span>
                </>
            ),
        },
    ];

    const [internalVOut, setInternalVOut] = useState(buck.vOutNormal);
    const [internalRetVOut, setInternalRetVOut] = useState(1);

    // NumberInputSliderWithUnit do not use ldo.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalVOut(buck.vOutNormal);
        setInternalRetVOut(buck.vOutRetention);
    }, [buck]);

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card={card} item="Buck">
                        <span>{cardLabel}</span>
                    </DocumentationTooltip>

                    <div className="d-flex">
                        <Toggle
                            label="Enable"
                            isToggled={buck.enabled}
                            onToggle={value => onBuckToggle(value)}
                            disabled={
                                disabled || !buck.onOffSoftwareControlEnabled
                            }
                        />
                        <span
                            className={classNames(
                                'show-more-toggle mdi',
                                summary && 'mdi-chevron-down',
                                !summary && 'mdi-chevron-up',
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
                items={vSetItems}
                onSelect={i => onModeToggle(i === 0 ? 'software' : 'vSet')}
                selectedItem={
                    buck.mode === 'software' ? vSetItems[0] : vSetItems[1]
                }
                disabled={disabled}
            />

            <NumberInput
                label={
                    <DocumentationTooltip card={card} item="VOUT">
                        <div>
                            <span>V</span>
                            <span className="subscript">{`OUT${
                                buckModule.index + 1
                            }`}</span>
                        </div>
                    </DocumentationTooltip>
                }
                unit="V"
                disabled={disabled}
                range={voltageRange}
                value={internalVOut}
                onChange={setInternalVOut}
                onChangeComplete={onVOutChange}
                showSlider
            />
            {!summary && (
                <>
                    <NumberInput
                        label={
                            <DocumentationTooltip card={card} item="RETVOUT">
                                <div>
                                    <span>V</span>
                                    <span className="subscript">{`RET${
                                        buckModule.index + 1
                                    }`}</span>
                                </div>
                            </DocumentationTooltip>
                        }
                        unit="V"
                        disabled={disabled}
                        range={retVOutRange}
                        value={internalRetVOut}
                        onChange={setInternalRetVOut}
                        onChangeComplete={onRetVOutChange}
                        showSlider
                    />
                    <Toggle
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="ActiveOutputCapacitorDischarge"
                            >
                                Active Output Capacitor Discharge
                            </DocumentationTooltip>
                        }
                        isToggled={buck.activeDischarge}
                        onToggle={value =>
                            buckModule.set.activeDischarge(value)
                        }
                        disabled={disabled}
                    />
                    <Dropdown
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="ModeControl"
                            >
                                <span>Mode Control</span>
                            </DocumentationTooltip>
                        }
                        items={modeControlItems}
                        onSelect={item =>
                            buckModule.set.modeControl(
                                item.value as BuckModeControl,
                            )
                        }
                        selectedItem={
                            modeControlItems[
                                Math.max(
                                    0,
                                    modeControlItems.findIndex(
                                        item => item.value === buck.modeControl,
                                    ),
                                ) ?? 0
                            ]
                        }
                        disabled={disabled}
                    />
                    <Dropdown
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="OnOffControl"
                            >
                                <span>On/Off Control</span>
                            </DocumentationTooltip>
                        }
                        items={buckOnOffControlItems}
                        onSelect={item =>
                            buckModule.set.onOffControl(
                                item.value as BuckOnOffControl,
                            )
                        }
                        selectedItem={
                            buckOnOffControlItems[
                                Math.max(
                                    0,
                                    buckOnOffControlItems.findIndex(
                                        item =>
                                            item.value === buck.onOffControl,
                                    ),
                                ) ?? 0
                            ]
                        }
                        disabled={disabled}
                    />
                    <Dropdown
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="RetentionControl"
                            >
                                <span>Retention control</span>
                            </DocumentationTooltip>
                        }
                        items={buckRetentionControlItems}
                        onSelect={item =>
                            buckModule.set.retentionControl(
                                item.value as BuckRetentionControl,
                            )
                        }
                        selectedItem={
                            buckRetentionControlItems[
                                Math.max(
                                    0,
                                    buckRetentionControlItems.findIndex(
                                        item =>
                                            item.value ===
                                            buck.retentionControl,
                                    ),
                                ) ?? 0
                            ]
                        }
                        disabled={disabled}
                    />
                </>
            )}
        </Card>
    );
};
