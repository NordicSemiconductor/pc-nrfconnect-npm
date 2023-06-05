/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import {
    Card,
    classNames,
    Dropdown,
    NumberInlineInput,
    Slider,
    StateSelector,
    Toggle,
} from 'pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    Buck,
    BuckMode,
    BuckModeControl,
    BuckModeControlValues,
    BuckOnOffControl,
    BuckOnOffControlValues,
    BuckRetentionControl,
    BuckRetentionControlValues,
    GPIOValues,
    NpmDevice,
} from '../../../features/pmicControl/npm/types';

interface BuckCardProperties {
    index: number;
    npmDevice: NpmDevice;
    buck?: Buck;
    cardLabel?: string;
    defaultSummary?: boolean;
    disabled: boolean;
}

export default ({
    npmDevice,
    index,
    buck,
    cardLabel = `BUCK ${index + 1}`,
    disabled,
    defaultSummary = false,
}: BuckCardProperties) => {
    const card = `buck${index + 1}`;
    const [summary, setSummary] = useState(defaultSummary);

    const onVOutChange = (value: number) =>
        npmDevice.setBuckVOutNormal(index, value);

    const onRetVOutChange = (value: number) => {
        npmDevice.setBuckVOutRetention(index, value);
    };

    const onModeToggle = (mode: BuckMode) => npmDevice.setBuckMode(index, mode);

    const onBuckToggle = (value: boolean) =>
        npmDevice.setBuckEnabled(index, value);

    const voltageRange = npmDevice.getBuckVoltageRange(index);
    const retVOutRange = npmDevice.getBuckRetVOutRange(index);
    const numberOfGPIOs = npmDevice.getNumberOfGPIOs() ?? 0;

    const gpioNames = GPIOValues.slice(0, numberOfGPIOs);

    const modeControlItems = [...BuckModeControlValues, ...gpioNames].map(
        item => ({
            label: item,
            value: item,
        })
    );

    const buckOnOffControlItems = [...BuckOnOffControlValues, ...gpioNames].map(
        (item, i) => {
            const label =
                buck?.mode === 'software' ? (
                    'Software'
                ) : (
                    <>
                        V<span className="subscript">{`SET${index + 1}`}</span>
                    </>
                );
            return {
                label: i === 0 ? label : item,
                value: item,
            };
        }
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
                    V<span className="subscript">{`SET${index + 1}`}</span>
                </>
            ),
        },
    ];

    const [internalVOut, setInternalVOut] = useState(buck?.vOutNormal ?? 0);
    const [internalRetVOut, setInternalRetVOut] = useState(1);

    useEffect(() => {
        if (buck) setInternalVOut(buck.vOutNormal);
    }, [buck]);

    return npmDevice && buck ? (
        <Card
            title={
                <div
                    className={`d-flex justify-content-between ${
                        disabled ? 'disabled' : ''
                    }`}
                >
                    <DocumentationTooltip card={card} item="Buck">
                        <span>{cardLabel}</span>
                    </DocumentationTooltip>

                    <div className="d-flex">
                        <Toggle
                            label="Enable"
                            isToggled={buck.enabled}
                            onToggle={value => onBuckToggle(value)}
                            disabled={disabled || buck.onOffControl !== 'Off'}
                        />
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
                items={vSetItems}
                onSelect={i => onModeToggle(i === 0 ? 'software' : 'vSet')}
                selectedItem={
                    buck.mode === 'software' ? vSetItems[0] : vSetItems[1]
                }
                disabled={disabled}
            />

            <div className={`slider-container ${disabled ? 'disabled' : ''}`}>
                <FormLabel className="flex-row">
                    <DocumentationTooltip card={card} item="VOUT">
                        <div>
                            <span>V</span>
                            <span className="subscript">{`OUT${
                                index + 1
                            }`}</span>
                        </div>
                    </DocumentationTooltip>

                    <div className="flex-row">
                        <NumberInlineInput
                            value={internalVOut}
                            range={voltageRange}
                            onChange={value => setInternalVOut(value)}
                            onChangeComplete={() => onVOutChange(internalVOut)}
                            disabled={disabled}
                        />
                        <span>V</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[internalVOut]}
                    onChange={[value => setInternalVOut(value)]}
                    onChangeComplete={() => onVOutChange(internalVOut)}
                    range={voltageRange}
                    disabled={disabled}
                />
            </div>
            {!summary && (
                <>
                    <div
                        className={`slider-container ${
                            disabled ? 'disabled' : ''
                        }`}
                    >
                        <FormLabel className="flex-row">
                            <DocumentationTooltip card={card} item="RETVOUT">
                                <div>
                                    <span>RET</span>
                                    <span className="subscript">{`VOUT${
                                        index + 1
                                    }`}</span>
                                </div>
                            </DocumentationTooltip>

                            <div className="flex-row">
                                <NumberInlineInput
                                    value={internalRetVOut}
                                    range={retVOutRange}
                                    onChange={value =>
                                        setInternalRetVOut(value)
                                    }
                                    onChangeComplete={() =>
                                        onRetVOutChange(internalRetVOut)
                                    }
                                    disabled={disabled}
                                />
                                <span>V</span>
                            </div>
                        </FormLabel>
                        <Slider
                            values={[internalRetVOut]}
                            onChange={[value => setInternalRetVOut(value)]}
                            onChangeComplete={() =>
                                onRetVOutChange(internalRetVOut)
                            }
                            range={retVOutRange}
                            disabled={disabled}
                        />
                    </div>
                    <Dropdown
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="ModeControl"
                            >
                                <span>ModeControl</span>
                            </DocumentationTooltip>
                        }
                        items={modeControlItems}
                        onSelect={item =>
                            npmDevice.setBuckModeControl(
                                index,
                                item.value as BuckModeControl
                            )
                        }
                        selectedItem={
                            modeControlItems[
                                Math.max(
                                    0,
                                    modeControlItems.findIndex(
                                        item => item.value === buck.modeControl
                                    )
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
                        onSelect={item => {
                            npmDevice.setBuckOnOffControl(
                                index,
                                item.value as BuckOnOffControl
                            );
                        }}
                        selectedItem={
                            buckOnOffControlItems[
                                Math.max(
                                    0,
                                    buckOnOffControlItems.findIndex(
                                        item => item.value === buck.onOffControl
                                    )
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
                            npmDevice.setBuckRetentionControl(
                                index,
                                item.value as BuckRetentionControl
                            )
                        }
                        selectedItem={
                            buckRetentionControlItems[
                                Math.max(
                                    0,
                                    buckRetentionControlItems.findIndex(
                                        item =>
                                            item.value === buck.retentionControl
                                    )
                                ) ?? 0
                            ]
                        }
                        disabled={disabled}
                    />
                </>
            )}
        </Card>
    ) : null;
};
