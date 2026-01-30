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
    Ldo,
    LdoGPIOControlMode,
    LdoGPIOControlPinSelect,
    LdoModeControl,
    LdoModule,
    LdoOnOffControl,
} from '../../../features/pmicControl/npm/types';

interface LdoCardProperties {
    ldo: Ldo;
    ldoModule: LdoModule;
    disabled: boolean;
    defaultSummary?: boolean;
}

const findSelectedIndex = <T,>(items: DropdownItem<T>[], value: T) =>
    items[
        Math.max(
            0,
            items.findIndex(item => item.value === value),
        ) ?? 0
    ];

export default ({
    ldo,
    ldoModule,
    defaultSummary = false,
    disabled,
}: LdoCardProperties) => {
    const [summary, setSummary] = useState(defaultSummary);

    const card = `ldo${ldoModule.index + 1}`;
    const range = ldoModule.ranges.voltage;

    const [internalVLdo, setInternalVLdo] = useState(ldo.voltage);

    const modeItems = ['LDO', 'Load Switch'];

    const vOutSelItems = [
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

    // NumberInputSliderWithUnit do not use ldo.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalVLdo(ldo.voltage);
    }, [ldo]);

    return ldo ? (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card={card} item="LoadSwitchLDO">
                        <span>{ldo.cardLabel}</span>
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
                disabled={disabled}
                items={modeItems}
                onSelect={i =>
                    ldoModule.set.mode(i === 0 ? 'LDO' : 'Load_switch')
                }
                selectedItem={
                    ldo.mode === 'Load_switch' ? modeItems[1] : modeItems[0]
                }
            />

            {ldoModule.set.vOutSel && (
                <StateSelector
                    disabled={disabled}
                    items={vOutSelItems}
                    onSelect={i =>
                        ldoModule.set.vOutSel?.(i === 0 ? 'Software' : 'Vset')
                    }
                    selectedItem={
                        ldo.vOutSel === 'Software'
                            ? vOutSelItems[0]
                            : vOutSelItems[1]
                    }
                />
            )}

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

                    {ldoModule.values.modeControl && (
                        <Dropdown
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="ModeControl"
                                >
                                    Mode Control
                                </DocumentationTooltip>
                            }
                            items={ldoModule.values.modeControl}
                            onSelect={item =>
                                ldoModule.set.modeControl?.(
                                    item.value as LdoModeControl,
                                )
                            }
                            selectedItem={
                                ldoModule.values.modeControl.find(
                                    item => item.value === ldo.modeControl,
                                ) ?? ldoModule.values.modeControl[0]
                            }
                            disabled={disabled}
                        />
                    )}
                    {ldoModule.values.pinMode && (
                        <Dropdown
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="PinMode"
                                >
                                    Pin Mode
                                </DocumentationTooltip>
                            }
                            items={ldoModule.values.pinMode}
                            onSelect={item =>
                                ldoModule.set.pinMode?.(
                                    item.value as LdoGPIOControlMode,
                                )
                            }
                            selectedItem={
                                ldoModule.values.pinMode.find(
                                    item => item.value === ldo.pinMode,
                                ) ?? ldoModule.values.pinMode[0]
                            }
                            disabled={disabled}
                        />
                    )}
                    {ldoModule.values.pinSel && (
                        <Dropdown
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="PinSelect"
                                >
                                    Pin Select
                                </DocumentationTooltip>
                            }
                            items={ldoModule.values.pinSel}
                            onSelect={item =>
                                ldoModule.set.pinSel?.(
                                    item.value as LdoGPIOControlPinSelect,
                                )
                            }
                            selectedItem={
                                ldoModule.values.pinSel.find(
                                    item => item.value === ldo.pinSel,
                                ) ?? ldoModule.values.pinSel[0]
                            }
                            disabled={disabled}
                        />
                    )}

                    {ldoModule.values.onOffControl && (
                        <Dropdown
                            label="On/Off Control"
                            items={ldoModule.values.onOffControl}
                            onSelect={item => {
                                ldoModule.set.onOffControl?.(
                                    item.value as LdoOnOffControl,
                                );
                            }}
                            selectedItem={findSelectedIndex(
                                ldoModule.values.onOffControl,
                                ldo.onOffControl,
                            )}
                            disabled={disabled}
                        />
                    )}

                    {ldoModule.set.ocpEnabled && (
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
                    {ldo.weakPullDown !== undefined && (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="WeakPullDown"
                                >
                                    Weak Pull-Down
                                </DocumentationTooltip>
                            }
                            isToggled={ldo.weakPullDown}
                            onToggle={value => {
                                ldoModule.set.weakPullDown?.(value);
                            }}
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

const LdoSoftstart = ({ disabled, ldoModule, ldo, card }: LdoSoftstartAttr) => (
    <>
        {ldoModule.values.ldoSoftstart && ldo.mode === 'LDO' && (
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="SoftStartCurrent">
                        LDO Soft Start Current
                    </DocumentationTooltip>
                }
                items={ldoModule.values.ldoSoftstart}
                onSelect={item => ldoModule.set.ldoSoftstart?.(item.value)}
                selectedItem={
                    ldoModule.values.ldoSoftstart?.find(
                        item => item.value === ldo.ldoSoftStart,
                    ) ?? ldoModule.values.ldoSoftstart[0]
                }
                disabled={disabled}
            />
        )}
        {ldoModule.set.softStart && ldoModule.values.softstart && (
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="SoftStartCurrent">
                        <>
                            {ldoModule.set.ldoSoftstart ? 'Load Switch' : ''}{' '}
                            Soft Start Current
                        </>
                    </DocumentationTooltip>
                }
                items={ldoModule.values.softstart}
                onSelect={item => ldoModule.set.softStart?.(item.value)}
                selectedItem={
                    ldoModule.values.softstart.find(
                        item => item.value === ldo.softStart,
                    ) ?? ldoModule.values.softstart[0]
                }
                disabled={
                    disabled ||
                    (ldo.mode === 'LDO' && !ldoModule.set.ldoSoftstart)
                }
            />
        )}
        {ldoModule.values.softStartCurrentLimit && (
            <Dropdown
                label={
                    <DocumentationTooltip
                        card={card}
                        item="SoftStartCurrentLimit"
                    >
                        Soft Start Current Limit
                    </DocumentationTooltip>
                }
                items={ldoModule.values.softStartCurrentLimit}
                onSelect={item =>
                    ldoModule.set.softStartCurrentLimit?.(item.value)
                }
                selectedItem={
                    ldoModule.values.softStartCurrentLimit.find(
                        item => item.value === ldo.softStartCurrentLimit,
                    ) ?? ldoModule.values.softStartCurrentLimit[0]
                }
                disabled={disabled}
            />
        )}
        {ldoModule.values.softStartTime && (
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="SoftStartTime">
                        Soft Start Time
                    </DocumentationTooltip>
                }
                items={ldoModule.values.softStartTime}
                onSelect={item => ldoModule.set.softStartTime?.(item.value)}
                selectedItem={
                    ldoModule.values.softStartTime.find(
                        item => item.value === ldo.softStartTime,
                    ) ?? ldoModule.values.softStartTime[0]
                }
                disabled={disabled}
            />
        )}
    </>
);
