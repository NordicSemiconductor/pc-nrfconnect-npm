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
import { Ldo, LdoModule } from '../../../features/pmicControl/npm/types';

interface LdoCardProperties {
    ldo: Ldo;
    ldoModule: LdoModule;
    disabled: boolean;
    defaultSummary?: boolean;
}

export default ({
    ldo,
    ldoModule,
    defaultSummary = false,
    disabled,
}: LdoCardProperties) => {
    const [summary, setSummary] = useState(defaultSummary);

    const card = `ldo${ldoModule.index + 1}`;

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
            {ldo.mode !== undefined && (
                <StateSelector
                    disabled={disabled}
                    items={modeItems}
                    onSelect={i =>
                        ldoModule.set.mode?.(i === 0 ? 'LDO' : 'Load_switch')
                    }
                    selectedItem={
                        ldo.mode === 'Load_switch' ? modeItems[1] : modeItems[0]
                    }
                />
            )}

            {ldo.vOutSel !== undefined && (
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

            {internalVLdo && ldoModule.ranges.voltage && (
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
                    range={ldoModule.ranges.voltage}
                    value={internalVLdo}
                    onChange={setInternalVLdo}
                    onChangeComplete={value => ldoModule.set.voltage?.(value)}
                    showSlider
                />
            )}

            {!summary && (
                <>
                    {ldoModule.values.onOffControl && (
                        <Dropdown
                            label="On/Off Control"
                            items={ldoModule.values.onOffControl}
                            onSelect={item => {
                                ldoModule.set.onOffControl?.(item.value);
                            }}
                            selectedItem={
                                ldoModule.values.onOffControl.find(
                                    item => item.value === ldo.onOffControl,
                                ) ?? ldoModule.values.onOffControl[0]
                            }
                            disabled={disabled}
                        />
                    )}
                    {ldo.softStart !== undefined && (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="SoftStartEnable"
                                >
                                    Enable Soft Start
                                </DocumentationTooltip>
                            }
                            isToggled={ldo.softStart === true}
                            onToggle={value => ldoModule.set.softStart?.(value)}
                            disabled={disabled}
                        />
                    )}
                    {ldoModule.values.softStartCurrent &&
                        ldo.softStartCurrent !== undefined && (
                            <Dropdown
                                label={
                                    <DocumentationTooltip
                                        card={card}
                                        item="SoftStartCurrent"
                                    >
                                        Soft Start Current Limit
                                    </DocumentationTooltip>
                                }
                                items={ldoModule.values.softStartCurrent()}
                                onSelect={item =>
                                    ldoModule.set.softStartCurrent?.(item.value)
                                }
                                selectedItem={
                                    ldoModule.values
                                        .softStartCurrent()
                                        .find(
                                            item =>
                                                item.value ===
                                                ldo.softStartCurrent,
                                        ) ??
                                    ldoModule.values.softStartCurrent()[0]
                                }
                                disabled={disabled}
                            />
                        )}
                    {ldoModule.values.softStartCurrent &&
                        ldo.softStartCurrentLDOMode !== undefined && (
                            <Dropdown
                                label={
                                    <DocumentationTooltip
                                        card={card}
                                        item="SoftStartCurrent"
                                    >
                                        Soft Start Current Limit (LDO Mode)
                                    </DocumentationTooltip>
                                }
                                items={ldoModule.values.softStartCurrent('LDO')}
                                onSelect={item =>
                                    ldoModule.set.softStartCurrent?.(
                                        item.value,
                                        'LDO',
                                    )
                                }
                                selectedItem={
                                    ldoModule.values
                                        .softStartCurrent('LDO')
                                        .find(
                                            item =>
                                                item.value ===
                                                ldo.softStartCurrentLDOMode,
                                        ) ??
                                    ldoModule.values.softStartCurrent('LDO')[0]
                                }
                                disabled={disabled}
                            />
                        )}
                    {ldoModule.values.softStartCurrent &&
                        ldo.softStartCurrentLoadSwitchMode !== undefined && (
                            <Dropdown
                                label={
                                    <DocumentationTooltip
                                        card={card}
                                        item="SoftStartCurrent"
                                    >
                                        Soft Start Current Limit (Load Switch
                                        Mode)
                                    </DocumentationTooltip>
                                }
                                items={ldoModule.values.softStartCurrent(
                                    'Load_switch',
                                )}
                                onSelect={item =>
                                    ldoModule.set.softStartCurrent?.(
                                        item.value,
                                        'Load_switch',
                                    )
                                }
                                selectedItem={
                                    ldoModule.values
                                        .softStartCurrent('Load_switch')
                                        .find(
                                            item =>
                                                item.value ===
                                                ldo.softStartCurrentLoadSwitchMode,
                                        ) ??
                                    ldoModule.values.softStartCurrent(
                                        'Load_switch',
                                    )[0]
                                }
                                disabled={disabled}
                            />
                        )}
                    {ldoModule.values.softStartTime && (
                        <Dropdown
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="SoftStartTime"
                                >
                                    Soft Start Time
                                </DocumentationTooltip>
                            }
                            items={ldoModule.values.softStartTime}
                            onSelect={item =>
                                ldoModule.set.softStartTime?.(item.value)
                            }
                            selectedItem={
                                ldoModule.values.softStartTime.find(
                                    item => item.value === ldo.softStartTime,
                                ) ?? ldoModule.values.softStartTime[0]
                            }
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
                                ldoModule.set.modeControl?.(item.value)
                            }
                            selectedItem={
                                ldoModule.values.modeControl.find(
                                    item => item.value === ldo.modeControl,
                                ) ?? ldoModule.values.modeControl[0]
                            }
                            disabled={disabled}
                        />
                    )}
                    {ldoModule.set.activeDischarge && (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="ActiveDischarge"
                                >
                                    Enable Active Discharge
                                </DocumentationTooltip>
                            }
                            isToggled={ldo.activeDischarge}
                            onToggle={value => {
                                ldoModule.set.activeDischarge?.(value);
                            }}
                            disabled={disabled}
                        />
                    )}
                    {ldoModule.set.overcurrentProtection && (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="OcpEnabled"
                                >
                                    Enable Overcurrent Protection
                                </DocumentationTooltip>
                            }
                            isToggled={ldo.overcurrentProtection === true}
                            onToggle={value =>
                                ldoModule.set.overcurrentProtection?.(value)
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
                                    Enable Weak Pull-Down
                                </DocumentationTooltip>
                            }
                            isToggled={ldo.weakPullDown}
                            onToggle={value => {
                                ldoModule.set.weakPullDown?.(value);
                            }}
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
                                ldoModule.set.pinMode?.(item.value)
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
                                ldoModule.set.pinSel?.(item.value)
                            }
                            selectedItem={
                                ldoModule.values.pinSel.find(
                                    item => item.value === ldo.pinSel,
                                ) ?? ldoModule.values.pinSel[0]
                            }
                            disabled={disabled}
                        />
                    )}
                    {ldoModule.set.ramp && (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="LdoRampEnabled"
                                >
                                    Ramp (LDO Mode)
                                </DocumentationTooltip>
                            }
                            isToggled={ldo.ramp === true}
                            onToggle={value => ldoModule.set.ramp?.(value)}
                            disabled={disabled}
                        />
                    )}
                    {ldoModule.set.halt && (
                        <Toggle
                            label={
                                <DocumentationTooltip
                                    card={card}
                                    item="HaltEnabled"
                                >
                                    Halt (LDO Mode)
                                </DocumentationTooltip>
                            }
                            isToggled={ldo.halt === true}
                            onToggle={value => ldoModule.set.halt?.(value)}
                            disabled={disabled}
                        />
                    )}
                </>
            )}
        </Card>
    ) : null;
};
