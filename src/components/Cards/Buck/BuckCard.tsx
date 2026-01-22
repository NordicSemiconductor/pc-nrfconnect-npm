/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode, useEffect, useState } from 'react';
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
    BuckModeControl,
    BuckModule,
    BuckOnOffControl,
    BuckRetentionControl,
} from '../../../features/pmicControl/npm/types';

interface BuckCardProperties {
    buck: Buck;
    buckModule: BuckModule;
    defaultSummary?: boolean;
    disabled: boolean;
}

export default ({
    buck,
    buckModule,
    disabled,
    defaultSummary = false,
}: BuckCardProperties) => {
    const card = `buck${buckModule.index + 1}`;
    const [summary, setSummary] = useState(defaultSummary);

    const vSetWithSubscriptOrUnchanged = (
        label: string,
    ): string | ReactNode => {
        const regExpMatch = label.match(/vset(?<index>[0-9]?)/i);
        if (!regExpMatch) {
            return label;
        }

        const index = regExpMatch.groups
            ? Number.parseInt(regExpMatch.groups.index, 10)
            : Number.NaN;

        return (
            <>
                V
                <span className="subscript">
                    SET{!Number.isNaN(index) ? index : ''}
                </span>
            </>
        );
    };

    const vSetItems = [
        { key: 'Software', renderItem: <span>Software</span> },
        {
            key: 'Vset',
            renderItem: vSetWithSubscriptOrUnchanged(buck.vSetLabel),
        },
    ];

    const buckOnOffControlItems = buckModule.values
        .onOffControl(buck.mode)
        .map(item => ({
            label: vSetWithSubscriptOrUnchanged(item.label),
            value: item.value,
        }));

    const [internalVOut, setInternalVOut] = useState(buck.vOutNormal);
    const [internalRetVOut, setInternalRetVOut] = useState(buck.vOutRetention);
    const [internalAlternateVOut, setInternalAlternateVOut] = useState(
        buck.alternateVOut,
    );

    // NumberInputSliderWithUnit do not use ldo.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalVOut(buck.vOutNormal);
        setInternalRetVOut(buck.vOutRetention);
        setInternalAlternateVOut(buck.alternateVOut);
    }, [buck]);

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card={card} item="Buck">
                        <span>{buck.cardLabel}</span>
                    </DocumentationTooltip>

                    <div className="d-flex">
                        <Toggle
                            label="Enable"
                            isToggled={buck.enabled}
                            onToggle={value => buckModule.set.enabled(value)}
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
                onSelect={i =>
                    buckModule.set.mode(i === 0 ? 'software' : 'vSet')
                }
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
                range={buckModule.ranges.voltage}
                value={internalVOut}
                onChange={setInternalVOut}
                onChangeComplete={value => buckModule.set.vOutNormal(value)}
                showSlider
            />

            {buckModule.ranges.alternateVOut &&
                internalAlternateVOut !== undefined && (
                    <NumberInput
                        label={
                            <DocumentationTooltip card={card} item="ALTVOUT">
                                <div>
                                    <span>V</span>
                                    <span className="subscript">OUT2</span>
                                </div>
                            </DocumentationTooltip>
                        }
                        unit="V"
                        disabled={disabled}
                        range={buckModule.ranges.alternateVOut}
                        value={internalAlternateVOut}
                        onChange={setInternalAlternateVOut}
                        onChangeComplete={value =>
                            buckModule.set.alternateVOut?.(value)
                        }
                        showSlider
                    />
                )}

            {!summary && (
                <>
                    {buckModule.ranges.retVOut !== undefined &&
                        internalRetVOut !== undefined && (
                            <NumberInput
                                label={
                                    <DocumentationTooltip
                                        card={card}
                                        item="RETVOUT"
                                    >
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
                                range={buckModule.ranges.retVOut}
                                value={internalRetVOut}
                                onChange={setInternalRetVOut}
                                onChangeComplete={value =>
                                    buckModule.set.vOutRetention?.(value)
                                }
                                showSlider
                            />
                        )}
                    {buck.activeDischarge !== undefined && (
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
                                buckModule.set.activeDischarge?.(value)
                            }
                            disabled={disabled}
                        />
                    )}
                    <Dropdown
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="ModeControl"
                            >
                                <span>Mode Control</span>
                            </DocumentationTooltip>
                        }
                        items={buckModule.values.modeControl}
                        onSelect={item =>
                            buckModule.set.modeControl(
                                item.value as BuckModeControl,
                            )
                        }
                        selectedItem={
                            buckModule.values.modeControl.find(
                                item => item.value === buck.modeControl,
                            ) ?? buckModule.values.modeControl[0]
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
                            buckOnOffControlItems.find(
                                item => item.value === buck.onOffControl,
                            ) ?? buckOnOffControlItems[0]
                        }
                        disabled={disabled}
                    />
                    {buckModule.values.retentionControl && (
                        <Dropdown
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="RetentionControl"
                                >
                                    <span>Retention control</span>
                                </DocumentationTooltip>
                            }
                            items={buckModule.values.retentionControl}
                            onSelect={item =>
                                buckModule.set.retentionControl?.(
                                    item.value as BuckRetentionControl,
                                )
                            }
                            selectedItem={
                                buckModule.values.retentionControl.find(
                                    item =>
                                        item.value === buck.retentionControl,
                                ) ?? buckModule.values.retentionControl[0]
                            }
                            disabled={disabled}
                        />
                    )}
                    {buckModule.values.peakCurrentLimit && (
                        <Dropdown
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="PeakCurrentLimit"
                                >
                                    <span>BUCK Peak Current Limit</span>
                                </DocumentationTooltip>
                            }
                            items={buckModule.values.peakCurrentLimit}
                            onSelect={item =>
                                buckModule.set.peakCurrentLimit?.(item.value)
                            }
                            selectedItem={
                                buckModule.values.peakCurrentLimit.find(
                                    item =>
                                        item.value === buck.peakCurrentLimit,
                                ) ?? buckModule.values.peakCurrentLimit[0]
                            }
                            disabled={disabled}
                        />
                    )}
                    {buckModule.values.softStartPeakCurrentLimit && (
                        <Dropdown
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="SoftStartPeakCurrentLimit"
                                >
                                    <span>Soft Start Peak Current Limit</span>
                                </DocumentationTooltip>
                            }
                            items={buckModule.values.softStartPeakCurrentLimit}
                            onSelect={item =>
                                buckModule.set.softStartPeakCurrentLimit?.(
                                    item.value,
                                )
                            }
                            selectedItem={
                                buckModule.values.softStartPeakCurrentLimit.find(
                                    item =>
                                        item.value ===
                                        buck.softStartPeakCurrentLimit,
                                ) ??
                                buckModule.values.softStartPeakCurrentLimit[0]
                            }
                            disabled={disabled}
                        />
                    )}
                    {buckModule.values.alternateVOutControl && (
                        <Dropdown
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="AlternateVOutControl"
                                >
                                    <span>
                                        V<span className="subscript">OUT2</span>{' '}
                                        Control
                                    </span>
                                </DocumentationTooltip>
                            }
                            items={buckModule.values.alternateVOutControl}
                            onSelect={item =>
                                buckModule.set.alternateVOutControl?.(
                                    item.value,
                                )
                            }
                            selectedItem={
                                buckModule.values.alternateVOutControl.find(
                                    item =>
                                        item.value ===
                                        buck.alternateVOutControl,
                                ) ?? buckModule.values.alternateVOutControl[0]
                            }
                            disabled={disabled}
                        />
                    )}
                    {buckModule.values.activeDischargeResistance && (
                        <Dropdown
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="ActiveOutputCapacitorDischarge"
                                >
                                    Active Output Capacitor Discharge
                                </DocumentationTooltip>
                            }
                            items={buckModule.values.activeDischargeResistance}
                            onSelect={item => {
                                buckModule.set.activeDischargeResistance?.(
                                    item.value,
                                );
                            }}
                            selectedItem={
                                buckModule.values.activeDischargeResistance.find(
                                    item =>
                                        item.value ===
                                        buck.activeDischargeResistance,
                                ) ??
                                buckModule.values.activeDischargeResistance[0]
                            }
                            disabled={disabled}
                        />
                    )}
                    {buckModule.values.vOutRippleControl && (
                        <Dropdown
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="VOutRippleControl"
                                >
                                    <span>
                                        V<span className="subscript">OUT</span>{' '}
                                        Ripple Control
                                    </span>
                                </DocumentationTooltip>
                            }
                            items={buckModule.values.vOutRippleControl}
                            onSelect={item =>
                                buckModule.set.vOutRippleControl?.(item.value)
                            }
                            selectedItem={
                                buckModule.values.vOutRippleControl.find(
                                    item =>
                                        item.value === buck.vOutRippleControl,
                                ) ?? buckModule.values.vOutRippleControl[0]
                            }
                            disabled={disabled}
                        />
                    )}
                    {buckModule.values.vOutComparatorBiasCurrent && (
                        <>
                            {buck.vOutComparatorBiasCurrentLPMode !==
                                undefined && (
                                <Dropdown
                                    label={
                                        <DocumentationTooltip
                                            card={card}
                                            item="VOutComparatorBiasCurrentLPMode"
                                        >
                                            <span>
                                                V
                                                <span className="subscript">
                                                    OUT
                                                </span>{' '}
                                                Comparator Bias Current (LP
                                                Mode)
                                            </span>
                                        </DocumentationTooltip>
                                    }
                                    items={buckModule.values.vOutComparatorBiasCurrent?.(
                                        'LP',
                                    )}
                                    onSelect={item =>
                                        buckModule.set.vOutComparatorBiasCurrent?.(
                                            'LP',
                                            item.value,
                                        )
                                    }
                                    selectedItem={
                                        buckModule.values
                                            .vOutComparatorBiasCurrent?.('LP')
                                            .find(
                                                item =>
                                                    item.value ===
                                                    buck.vOutComparatorBiasCurrentLPMode,
                                            ) ??
                                        buckModule.values.vOutComparatorBiasCurrent?.(
                                            'LP',
                                        )[0]
                                    }
                                    disabled={disabled}
                                />
                            )}
                            {buck.vOutComparatorBiasCurrentULPMode !==
                                undefined && (
                                <Dropdown
                                    label={
                                        <DocumentationTooltip
                                            card={card}
                                            item="VOutComparatorBiasCurrentULPMode"
                                        >
                                            <span>
                                                V
                                                <span className="subscript">
                                                    OUT
                                                </span>{' '}
                                                Comparator Bias Current (ULP
                                                Mode)
                                            </span>
                                        </DocumentationTooltip>
                                    }
                                    items={buckModule.values.vOutComparatorBiasCurrent?.(
                                        'ULP',
                                    )}
                                    onSelect={item =>
                                        buckModule.set.vOutComparatorBiasCurrent?.(
                                            'ULP',
                                            item.value,
                                        )
                                    }
                                    selectedItem={
                                        buckModule.values
                                            .vOutComparatorBiasCurrent?.('ULP')
                                            .find(
                                                item =>
                                                    item.value ===
                                                    buck.vOutComparatorBiasCurrentULPMode,
                                            ) ??
                                        buckModule.values.vOutComparatorBiasCurrent?.(
                                            'ULP',
                                        )[0]
                                    }
                                    disabled={disabled}
                                />
                            )}
                        </>
                    )}
                    {buck.automaticPassthrough !== undefined && (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="AutomaticPassThrough"
                                >
                                    Enable Automatic pass-through
                                </DocumentationTooltip>
                            }
                            isToggled={buck.automaticPassthrough}
                            onToggle={value =>
                                buckModule.set.automaticPassthrough?.(value)
                            }
                            disabled={disabled}
                        />
                    )}
                    {buck.shortCircuitProtection !== undefined && (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="ShortCircuitProtection"
                                >
                                    Enable Short Circuit Protection
                                </DocumentationTooltip>
                            }
                            isToggled={buck.shortCircuitProtection}
                            onToggle={value =>
                                buckModule.set.shortCircuitProtection?.(value)
                            }
                            disabled={disabled}
                        />
                    )}
                    {buck.quickVOutDischarge !== undefined && (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="QuickVOutDischarge"
                                >
                                    <span>
                                        Enable Quick V
                                        <span className="subscript">OUT</span>{' '}
                                        Discharge
                                    </span>
                                </DocumentationTooltip>
                            }
                            isToggled={buck.quickVOutDischarge}
                            onToggle={value =>
                                buckModule.set.quickVOutDischarge?.(value)
                            }
                            disabled={disabled}
                        />
                    )}
                </>
            )}
        </Card>
    );
};
