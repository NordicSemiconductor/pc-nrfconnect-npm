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

    const onModeToggle = (mode: BuckMode) => buckModule.set.mode(mode);

    const onBuckToggle = (value: boolean) => buckModule.set.enabled(value);

    const voltageRange = buckModule.ranges.voltage;

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

    // NumberInputSliderWithUnit do not use ldo.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalVOut(buck.vOutNormal);
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
                    <ControlsWithAlternateVOut
                        buck={buck}
                        buckModule={buckModule}
                        disabled={disabled}
                    />
                    <ControlsWithVOutRetention
                        buck={buck}
                        buckModule={buckModule}
                        disabled={disabled}
                        numberOfGPIOs={numberOfGPIOs}
                    />
                </>
            )}
        </Card>
    );
};

const ControlsWithAlternateVOut = ({
    buck,
    buckModule,
    disabled,
}: {
    buck: Buck;
    buckModule: BuckModule;
    disabled: boolean;
}) => {
    const card = `buck${buckModule.index + 1}`;

    const [internalAlternateVOut, setInternalAlternateVOut] = useState(
        buck.alternateVOut,
    );

    useEffect(() => {
        setInternalAlternateVOut(buck.alternateVOut);
    }, [buck]);

    if (
        buck.activeDischargeResistance === undefined ||
        buck.alternateVOut === undefined ||
        buck.alternateVOutControl === undefined ||
        buck.automaticPassthrough === undefined ||
        buck.peakCurrentLimit === undefined ||
        buck.quickVOutDischarge === undefined ||
        buck.shortCircuitProtection === undefined ||
        buck.softStartPeakCurrentLimit === undefined ||
        buck.vOutComparatorBiasCurrent === undefined ||
        buck.vOutRippleControl === undefined ||
        buckModule.ranges.alternateVOut === undefined ||
        buckModule.set.activeDischargeResistance === undefined ||
        buckModule.set.alternateVOut === undefined ||
        buckModule.set.alternateVOutControl === undefined ||
        buckModule.set.automaticPassthrough === undefined ||
        buckModule.set.peakCurrentLimit === undefined ||
        buckModule.set.quickVOutDischarge === undefined ||
        buckModule.set.shortCircuitProtection === undefined ||
        buckModule.set.softStartPeakCurrentLimit === undefined ||
        buckModule.set.vOutComparatorBiasCurrent === undefined ||
        buckModule.set.vOutRippleControl === undefined ||
        buckModule.values.activeDischargeResistance === undefined ||
        buckModule.values.alternateVOutControl === undefined ||
        buckModule.values.modeControl === undefined ||
        buckModule.values.onOffControl === undefined ||
        buckModule.values.peakCurrentLimit === undefined ||
        buckModule.values.softStartPeakCurrentLimit === undefined ||
        buckModule.values.vOutComparatorBiasCurrent === undefined ||
        buckModule.values.vOutRippleControl === undefined ||
        internalAlternateVOut === undefined
    ) {
        return null;
    }

    const vSetWithSubscript = (
        <>
            V<span className="subscript">SET</span>
        </>
    );

    const buckOnOffControlItems = buckModule.values
        .onOffControl(buck.mode)
        .map(item =>
            item.value === 'VSET'
                ? { label: vSetWithSubscript, value: item.value } // replace label to one with subscript
                : item,
        );

    const vOutComparatorBiasItems = buckModule.values.vOutComparatorBiasCurrent(
        buck.modeControl,
    );

    return (
        <>
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
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="ModeControl">
                        <span>Mode Control</span>
                    </DocumentationTooltip>
                }
                items={buckModule.values.modeControl}
                onSelect={item =>
                    buckModule.set.modeControl(item.value as BuckModeControl)
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
                    <DocumentationTooltip card={card} item="OnOffControl">
                        <span>On/Off Control</span>
                    </DocumentationTooltip>
                }
                items={buckOnOffControlItems}
                onSelect={item =>
                    buckModule.set.onOffControl(item.value as BuckOnOffControl)
                }
                selectedItem={
                    buckOnOffControlItems.find(
                        item => item.value === buck.onOffControl,
                    ) ?? buckOnOffControlItems[0]
                }
                disabled={disabled}
            />
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="PeakCurrentLimit">
                        <span>BUCK Peak Current Limit</span>
                    </DocumentationTooltip>
                }
                items={buckModule.values.peakCurrentLimit}
                onSelect={item => buckModule.set.peakCurrentLimit?.(item.value)}
                selectedItem={
                    buckModule.values.peakCurrentLimit.find(
                        item => item.value === buck.peakCurrentLimit,
                    ) ?? buckModule.values.peakCurrentLimit[0]
                }
                disabled={disabled}
            />
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
                    buckModule.set.softStartPeakCurrentLimit?.(item.value)
                }
                selectedItem={
                    buckModule.values.softStartPeakCurrentLimit.find(
                        item => item.value === buck.softStartPeakCurrentLimit,
                    ) ?? buckModule.values.softStartPeakCurrentLimit[0]
                }
                disabled={disabled}
            />
            <Dropdown
                label={
                    <DocumentationTooltip
                        card={card}
                        item="AlternateVOutControl"
                    >
                        <span>
                            V<span className="subscript">OUT2</span> Control
                        </span>
                    </DocumentationTooltip>
                }
                items={buckModule.values.alternateVOutControl}
                onSelect={item =>
                    buckModule.set.alternateVOutControl?.(item.value)
                }
                selectedItem={
                    buckModule.values.alternateVOutControl.find(
                        item => item.value === buck.alternateVOutControl,
                    ) ?? buckModule.values.alternateVOutControl[0]
                }
                disabled={disabled}
            />
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
                    buckModule.set.activeDischargeResistance?.(item.value);
                }}
                selectedItem={
                    buckModule.values.activeDischargeResistance.find(
                        item => item.value === buck.activeDischargeResistance,
                    ) ?? buckModule.values.activeDischargeResistance[0]
                }
                disabled={disabled}
            />
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="VOutRippleControl">
                        <span>
                            V<span className="subscript">OUT</span> Ripple
                            Control
                        </span>
                    </DocumentationTooltip>
                }
                items={buckModule.values.vOutRippleControl}
                onSelect={item =>
                    buckModule.set.vOutRippleControl?.(item.value)
                }
                selectedItem={
                    buckModule.values.vOutRippleControl.find(
                        item => item.value === buck.vOutRippleControl,
                    ) ?? buckModule.values.vOutRippleControl[0]
                }
                disabled={disabled}
            />
            <Dropdown
                label={
                    <DocumentationTooltip
                        card={card}
                        item="VOutComparatorBiasCurrent"
                    >
                        <span>
                            V<span className="subscript">OUT</span> Comparator
                            Bias Current
                        </span>
                    </DocumentationTooltip>
                }
                items={vOutComparatorBiasItems}
                onSelect={item =>
                    buckModule.set.vOutComparatorBiasCurrent?.(
                        buck.modeControl,
                        item.value,
                    )
                }
                selectedItem={
                    vOutComparatorBiasItems.find(
                        item => item.value === buck.vOutComparatorBiasCurrent,
                    ) ?? vOutComparatorBiasItems[0]
                }
                disabled={disabled}
            />
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
                onToggle={value => buckModule.set.automaticPassthrough?.(value)}
                disabled={disabled}
            />
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
            <Toggle
                label={
                    <DocumentationTooltip card={card} item="VOutRippleControl">
                        <span>
                            Enable Quick V<span className="subscript">OUT</span>{' '}
                            Discharge
                        </span>
                    </DocumentationTooltip>
                }
                isToggled={buck.quickVOutDischarge}
                onToggle={value => buckModule.set.quickVOutDischarge?.(value)}
                disabled={disabled}
            />
        </>
    );
};

const ControlsWithVOutRetention = ({
    buck,
    buckModule,
    disabled,
    numberOfGPIOs,
}: {
    buck: Buck;
    buckModule: BuckModule;
    disabled: boolean;
    numberOfGPIOs?: number;
}) => {
    const card = `buck${buckModule.index + 1}`;

    const onRetVOutChange = (value: number) => {
        buckModule.set.vOutRetention?.(value);
    };

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

    const [internalRetVOut, setInternalRetVOut] = useState(buck.vOutRetention);

    // NumberInputSliderWithUnit do not use ldo.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalRetVOut(buck.vOutRetention);
    }, [buck]);

    if (
        buck.activeDischarge === undefined ||
        buck.vOutRetention === undefined ||
        buckModule.set.activeDischarge === undefined ||
        internalRetVOut === undefined ||
        retVOutRange === undefined
    ) {
        return null;
    }

    return (
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
                onToggle={value => buckModule.set.activeDischarge?.(value)}
                disabled={disabled}
            />
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="ModeControl">
                        <span>Mode Control</span>
                    </DocumentationTooltip>
                }
                items={modeControlItems}
                onSelect={item =>
                    buckModule.set.modeControl(item.value as BuckModeControl)
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
                    <DocumentationTooltip card={card} item="OnOffControl">
                        <span>On/Off Control</span>
                    </DocumentationTooltip>
                }
                items={buckOnOffControlItems}
                onSelect={item =>
                    buckModule.set.onOffControl(item.value as BuckOnOffControl)
                }
                selectedItem={
                    buckOnOffControlItems[
                        Math.max(
                            0,
                            buckOnOffControlItems.findIndex(
                                item => item.value === buck.onOffControl,
                            ),
                        ) ?? 0
                    ]
                }
                disabled={disabled}
            />
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="RetentionControl">
                        <span>Retention control</span>
                    </DocumentationTooltip>
                }
                items={buckRetentionControlItems}
                onSelect={item =>
                    buckModule.set.retentionControl?.(
                        item.value as BuckRetentionControl,
                    )
                }
                selectedItem={
                    buckRetentionControlItems[
                        Math.max(
                            0,
                            buckRetentionControlItems.findIndex(
                                item => item.value === buck.retentionControl,
                            ),
                        ) ?? 0
                    ]
                }
                disabled={disabled}
            />
        </>
    );
};
