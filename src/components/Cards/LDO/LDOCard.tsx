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
    DropdownItem,
    NumberInput,
    StateSelector,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    nPM2100GPIOControlMode,
    nPM2100GPIOControlModeValues,
    nPM2100GPIOControlPinSelect,
    nPM2100GPIOControlPinSelectValues,
    nPM2100LdoModeControl,
    nPM2100LdoModeControlValues,
    nPM2100LDOSoftStart,
    nPM2100LDOSoftStartValues,
    nPM2100LoadSwitchSoftStart,
    nPM2100LoadSwitchSoftStartValues,
} from '../../../features/pmicControl/npm/npm2100/types';
import {
    Ldo,
    LdoModule,
    LdoOnOffControl,
    LdoOnOffControlValues,
    Npm1300LoadSwitchSoftStart,
    SoftStartValues,
} from '../../../features/pmicControl/npm/types';

interface LdoCardProperties {
    ldo: Ldo;
    ldoModule: LdoModule;
    cardLabel?: string;
    disabled: boolean;
    defaultSummary?: boolean;
}

const genDropdownItems = <V,>(values: V[]) =>
    values.map(value => ({
        value,
        label: value,
    }));

const findSelectedIndex = <T,>(items: DropdownItem<T>[], value: T) =>
    items[
        Math.max(
            0,
            items.findIndex(item => item.value === value)
        ) ?? 0
    ];

export default ({
    ldo,
    ldoModule,
    cardLabel = `Load Switch/LDO ${ldoModule.index + 1}`,
    defaultSummary = false,
    disabled,
}: LdoCardProperties) => {
    const [summary, setSummary] = useState(defaultSummary);

    const card = `ldo${ldoModule.index + 1}`;
    const range = ldoModule.ranges.voltage;

    const [internalVLdo, setInternalVLdo] = useState(ldo.voltage);

    const modeItems = ['LDO', 'Load Switch'];

    // NumberInputSliderWithUnit do not use ldo.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalVLdo(ldo.voltage);
    }, [ldo]);

    return ldo ? (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card={card} item="LoadSwitchLDO">
                        <span>{cardLabel}</span>
                    </DocumentationTooltip>

                    <div className="d-flex">
                        <Toggle
                            label="Enable"
                            isToggled={ldo.enabled}
                            onToggle={value => ldoModule.set.enabled(value)}
                            disabled={
                                disabled || !ldo.onOffSoftwareControlEnabled
                            }
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
                disabled={disabled}
                items={modeItems}
                onSelect={i =>
                    ldoModule.set.mode(i === 0 ? 'LDO' : 'Load_switch')
                }
                selectedItem={
                    ldo.mode === 'Load_switch' ? modeItems[1] : modeItems[0]
                }
            />

            <NumberInput
                label={
                    <DocumentationTooltip card={card} item="VOUTLDO">
                        <div>
                            <span>V</span>
                            <span className="subscript">{`OUTLDO${
                                ldoModule.index + 1
                            }`}</span>
                        </div>
                    </DocumentationTooltip>
                }
                unit="V"
                disabled={disabled}
                range={range}
                value={internalVLdo}
                onChange={setInternalVLdo}
                onChangeComplete={value => ldoModule.set.voltage(value)}
                showSlider
            />

            {!summary && (
                <>
                    <LdoSoftstart
                        ldoModule={ldoModule}
                        disabled={disabled}
                        ldo={ldo}
                        card={card}
                    />
                    {ldoModule.set.activeDischarge && (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="ActiveDischarge"
                                >
                                    Active Discharge
                                </DocumentationTooltip>
                            }
                            isToggled={ldo.activeDischarge}
                            onToggle={value => {
                                ldoModule.set.activeDischarge?.(value);
                            }}
                            disabled={disabled}
                        />
                    )}

                    <OnOffControl
                        ldoModule={ldoModule}
                        disabled={disabled}
                        ldo={ldo}
                        card={card}
                    />

                    {ldoModule.set.ocpEnabled ?? (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="OcpEnabled"
                                >
                                    Overcurrent Protection
                                </DocumentationTooltip>
                            }
                            isToggled={ldo.ocpEnabled === true}
                            onToggle={value =>
                                ldoModule.set.ocpEnabled?.(value)
                            }
                            disabled={disabled}
                        />
                    )}
                    {ldoModule.set.rampEnabled && (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="LdoRampEnabled"
                                >
                                    LDO Ramp
                                </DocumentationTooltip>
                            }
                            isToggled={ldo.rampEnabled === true}
                            onToggle={value =>
                                ldoModule.set.rampEnabled?.(value)
                            }
                            disabled={disabled}
                        />
                    )}
                    {ldoModule.set.haltEnabled && (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="HaltEnabled"
                                >
                                    LDO Halt
                                </DocumentationTooltip>
                            }
                            isToggled={ldo.haltEnabled === true}
                            onToggle={value =>
                                ldoModule.set.haltEnabled?.(value)
                            }
                            disabled={disabled}
                        />
                    )}
                </>
            )}
        </Card>
    ) : null;
};

export interface LdoSoftstartAttr {
    ldoModule: LdoModule;
    disabled: boolean;
    ldo: Ldo;
    card: string;
}
const LdoSoftstart = ({ disabled, ldoModule, ldo, card }: LdoSoftstartAttr) => {
    const softStartItems = SoftStartValues.map(item => ({
        label: `${item} mA`,
        value: `${item}`,
    }));

    const ldoSoftStartItems = genDropdownItems([...nPM2100LDOSoftStartValues]);

    const loadSwitchSoftStartItems = genDropdownItems([
        ...nPM2100LoadSwitchSoftStartValues,
    ]);

    return (
        <>
            {ldoModule.set.softStart ?? (
                <Dropdown
                    label={
                        <DocumentationTooltip
                            card={card}
                            item="SoftStartCurrent"
                        >
                            Soft Start Current
                        </DocumentationTooltip>
                    }
                    items={softStartItems}
                    onSelect={item =>
                        ldoModule.set.softStart?.(
                            item.value
                                ? (Number.parseInt(
                                      item.value,
                                      10
                                  ) as Npm1300LoadSwitchSoftStart)
                                : undefined
                        )
                    }
                    selectedItem={findSelectedIndex(
                        softStartItems,
                        ldo.softStart?.toString()
                    )}
                    disabled={disabled || ldo.mode === 'LDO'}
                />
            )}

            {(ldoModule.set.ldoSoftstart && ldo.mode === 'LDO') ?? (
                <Dropdown
                    label={
                        <DocumentationTooltip
                            card={card}
                            item="SoftStartCurrent"
                        >
                            LDO Soft Start Current
                        </DocumentationTooltip>
                    }
                    items={ldoSoftStartItems}
                    onSelect={item =>
                        ldoModule.set.ldoSoftstart?.(
                            item.value as nPM2100LDOSoftStart
                        )
                    }
                    // TODO: Get default from npm device implementation
                    selectedItem={findSelectedIndex(
                        ldoSoftStartItems,
                        ldo.ldoSoftStart
                    )}
                    disabled={disabled}
                />
            )}

            {ldoModule.set.loadSwitchSoftstart &&
                ldo.mode === 'Load_switch' && (
                    <Dropdown
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="SoftStartCurrent"
                            >
                                Load Switch Soft Start Current
                            </DocumentationTooltip>
                        }
                        items={loadSwitchSoftStartItems}
                        onSelect={item =>
                            ldoModule.set.loadSwitchSoftstart?.(
                                item.value as nPM2100LoadSwitchSoftStart
                            )
                        }
                        selectedItem={findSelectedIndex(
                            loadSwitchSoftStartItems,
                            ldo.loadSwitchSoftStart
                        )}
                        disabled={disabled}
                    />
                )}
        </>
    );
};

interface OnOffControlAttrs {
    ldoModule: LdoModule;
    disabled: boolean;
    ldo: Ldo;
    card: string;
}
const OnOffControl = ({
    ldoModule,
    disabled,
    ldo,
    card,
}: OnOffControlAttrs) => {
    const ldoOnOffControlItems = genDropdownItems([...LdoOnOffControlValues]);

    const ldoModeControllItems = genDropdownItems([
        ...nPM2100LdoModeControlValues,
    ]);

    const ldoModePinModeItems = genDropdownItems([
        ...nPM2100GPIOControlModeValues,
    ]);

    const ldoModePinSelectItems = genDropdownItems([
        ...nPM2100GPIOControlPinSelectValues,
    ]);

    return (
        <>
            {ldoModule.set.onOffControl ?? (
                <Dropdown
                    label="On/Off Control"
                    items={ldoOnOffControlItems}
                    onSelect={item => {
                        ldoModule.set.onOffControl?.(
                            item.value as LdoOnOffControl
                        );
                    }}
                    selectedItem={findSelectedIndex(
                        ldoOnOffControlItems,
                        ldo.onOffControl
                    )}
                    disabled={disabled}
                />
            )}

            {ldoModule.set.modeControl && (
                <Dropdown
                    label={
                        <DocumentationTooltip card={card} item="ModeControl">
                            Mode Control
                        </DocumentationTooltip>
                    }
                    items={ldoModeControllItems}
                    onSelect={item =>
                        ldoModule.set.modeControl?.(
                            item.value as nPM2100LdoModeControl
                        )
                    }
                    selectedItem={findSelectedIndex(
                        ldoModeControllItems,
                        ldo.modeControl
                    )}
                    disabled={disabled}
                />
            )}
            {ldoModule.set.pinMode && (
                <Dropdown
                    label={
                        <DocumentationTooltip card={card} item="PinMode">
                            Pin Mode
                        </DocumentationTooltip>
                    }
                    items={ldoModePinModeItems}
                    onSelect={item =>
                        ldoModule.set.pinMode?.(
                            item.value as nPM2100GPIOControlMode
                        )
                    }
                    selectedItem={findSelectedIndex(
                        ldoModePinModeItems,
                        ldo.pinMode
                    )}
                    disabled={disabled}
                />
            )}
            {ldoModule.set.pinSel && (
                <Dropdown
                    label={
                        <DocumentationTooltip card={card} item="PinSelect">
                            Pin Select
                        </DocumentationTooltip>
                    }
                    items={ldoModePinSelectItems}
                    onSelect={item =>
                        ldoModule.set.pinSel?.(
                            item.value as nPM2100GPIOControlPinSelect
                        )
                    }
                    selectedItem={findSelectedIndex(
                        ldoModePinSelectItems,
                        ldo.pinSel
                    )}
                    disabled={disabled}
                />
            )}
        </>
    );
};
