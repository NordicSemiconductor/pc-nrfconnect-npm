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
    NpmModel,
    SoftStartValues,
} from '../../../features/pmicControl/npm/types';

interface LdoCardProperties {
    ldo: Ldo;
    ldoModule: LdoModule;
    cardLabel?: string;
    disabled: boolean;
    defaultSummary?: boolean;
    deviceType: NpmModel;
}

const softStartItems = SoftStartValues.map(item => ({
    label: `${item} mA`,
    value: `${item}`,
}));

export default ({
    ldo,
    ldoModule,
    cardLabel = `Load Switch/LDO ${ldoModule.index + 1}`,
    defaultSummary = false,
    disabled,
    deviceType,
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
                        deviceType={deviceType}
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
                        deviceType={deviceType}
                        ldoModule={ldoModule}
                        disabled={disabled}
                        ldo={ldo}
                    />

                    {deviceType === 'npm2100' && (
                        <>
                            <Toggle
                                label={
                                    <DocumentationTooltip
                                        card={card}
                                        item="OcpEnabled"
                                    >
                                        Over Current Protection enabled
                                    </DocumentationTooltip>
                                }
                                isToggled={ldo.ocpEnabled === true}
                                onToggle={value =>
                                    ldoModule.set.ocpEnabled?.(value)
                                }
                                disabled={disabled}
                            />
                            <Toggle
                                label={
                                    <DocumentationTooltip
                                        card={card}
                                        item="LdoRampEnabled"
                                    >
                                        LDO Ramp enabled
                                    </DocumentationTooltip>
                                }
                                isToggled={ldo.rampEnabled === true}
                                onToggle={value =>
                                    ldoModule.set.rampEnabled?.(value)
                                }
                                disabled={disabled}
                            />
                            <Toggle
                                label={
                                    <DocumentationTooltip
                                        card={card}
                                        item="HaltEnabled"
                                    >
                                        LDO Halt Enabled
                                    </DocumentationTooltip>
                                }
                                isToggled={ldo.haltEnabled === true}
                                onToggle={value =>
                                    ldoModule.set.haltEnabled?.(value)
                                }
                                disabled={disabled}
                            />
                        </>
                    )}
                </>
            )}
        </Card>
    ) : null;
};

export interface LdoSoftstartAttr {
    deviceType: NpmModel;
    ldoModule: LdoModule;
    disabled: boolean;
    ldo: Ldo;
    card: string;
}
const LdoSoftstart = ({
    deviceType,
    disabled,
    ldoModule,
    ldo,
    card,
}: LdoSoftstartAttr) => {
    console.log('Rendering LdoSoftstart for %s', deviceType);
    switch (deviceType) {
        case 'npm1300': {
            return (
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
                            Number.parseInt(
                                item.value,
                                10
                            ) as Npm1300LoadSwitchSoftStart
                        )
                    }
                    // TODO: Get default from npm device implementation
                    selectedItem={
                        softStartItems[
                            Math.max(
                                0,
                                softStartItems.findIndex(
                                    item =>
                                        item.value === ldo.softStart?.toString()
                                )
                            ) ?? 0
                        ]
                    }
                    disabled={disabled || ldo.mode === 'LDO'}
                />
            );
        }
        case 'npm2100': {
            if (ldo.mode === 'LDO') {
                const softStartItems2100 = genDropdownItems([
                    ...nPM2100LDOSoftStartValues,
                ]);

                const selectedItemIndex = findSelectedIndex(
                    softStartItems2100,
                    ldo.ldoSoftStart
                );

                const selectedItem = softStartItems2100[selectedItemIndex];

                return (
                    <Dropdown
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="SoftStartCurrent"
                            >
                                LDO Soft Start Current
                            </DocumentationTooltip>
                        }
                        items={softStartItems2100}
                        onSelect={item =>
                            ldoModule.set.ldoSoftstart?.(
                                item.value as nPM2100LDOSoftStart
                            )
                        }
                        // TODO: Get default from npm device implementation
                        selectedItem={selectedItem}
                        disabled={disabled}
                    />
                );
            }

            const softStartItems2100 = genDropdownItems([
                ...nPM2100LoadSwitchSoftStartValues,
            ]);

            const selectedItemIndex = findSelectedIndex(
                softStartItems2100,
                ldo.loadSwitchSoftStart
            );

            const selectedItem = softStartItems2100[selectedItemIndex];

            return (
                <Dropdown
                    label={
                        <DocumentationTooltip
                            card={card}
                            item="SoftStartCurrent"
                        >
                            Load Switch Soft Start Current
                        </DocumentationTooltip>
                    }
                    items={softStartItems2100}
                    onSelect={item =>
                        ldoModule.set.loadSwitchSoftstart?.(
                            item.value as nPM2100LoadSwitchSoftStart
                        )
                    }
                    // TODO: Get default from npm device implementation
                    selectedItem={selectedItem}
                    disabled={disabled}
                />
            );
        }
        default:
            return <div>Nothing to see, here..</div>;
    }
};

interface OnOffControlAttrs {
    deviceType: NpmModel;
    ldoModule: LdoModule;
    disabled: boolean;
    ldo: Ldo;
}
const OnOffControl = ({
    deviceType,
    ldoModule,
    disabled,
    ldo,
}: OnOffControlAttrs) => {
    switch (deviceType) {
        case 'npm1300': {
            const ldoOnOffControlItems = genDropdownItems([
                ...LdoOnOffControlValues,
            ]);

            const ldoOnOffControlSelectedValueIndex = findSelectedIndex(
                ldoOnOffControlItems,
                ldo.onOffControl
            );

            const selectedItem =
                ldoOnOffControlItems[ldoOnOffControlSelectedValueIndex];

            return (
                <Dropdown
                    label="On/Off Control"
                    items={ldoOnOffControlItems}
                    onSelect={item => {
                        ldoModule.set.onOffControl?.(
                            item.value as LdoOnOffControl
                        );
                    }}
                    selectedItem={selectedItem}
                    disabled={disabled}
                />
            );
        }

        case 'npm2100': {
            const ldoModeControllItems = genDropdownItems([
                ...nPM2100LdoModeControlValues,
            ]);

            const selectedModeControlItem =
                ldoModeControllItems[
                    findSelectedIndex(ldoModeControllItems, ldo.modeControl)
                ];

            const ldoModePinModeItems = genDropdownItems([
                ...nPM2100GPIOControlModeValues,
            ]);

            const selectedPinModeItem =
                ldoModePinModeItems[
                    findSelectedIndex(ldoModePinModeItems, ldo.pinMode)
                ];

            const ldoModePinSelectItems = genDropdownItems([
                ...nPM2100GPIOControlPinSelectValues,
            ]);

            const selectedLdoModePinSelect =
                ldoModePinSelectItems[
                    findSelectedIndex(ldoModePinSelectItems, ldo.pinSel)
                ];

            return (
                <>
                    <Dropdown
                        label="Mode Control"
                        items={ldoModeControllItems}
                        onSelect={item =>
                            ldoModule.set.modeControl?.(
                                item.value as nPM2100LdoModeControl
                            )
                        }
                        selectedItem={selectedModeControlItem}
                        disabled={disabled}
                    />
                    <Dropdown
                        label="Pin Mode"
                        items={ldoModePinModeItems}
                        onSelect={item =>
                            ldoModule.set.pinMode?.(
                                item.value as nPM2100GPIOControlMode
                            )
                        }
                        selectedItem={selectedPinModeItem}
                        disabled={disabled}
                    />
                    <Dropdown
                        label="Pin Select"
                        items={ldoModePinSelectItems}
                        onSelect={item =>
                            ldoModule.set.pinSel?.(
                                item.value as nPM2100GPIOControlPinSelect
                            )
                        }
                        selectedItem={selectedLdoModePinSelect}
                        disabled={disabled}
                    />
                </>
            );
        }
    }
};

function genDropdownItems<V>(values: V[]) {
    const softStartItems2100 = values.map(value => ({
        value,
        label: value,
    }));
    return softStartItems2100;
}

function findSelectedIndex<T>(items: DropdownItem<T>[], value: T) {
    const selectedItemIndex =
        Math.max(
            0,
            items.findIndex(item => item.value === value)
        ) ?? 0;
    return selectedItemIndex;
}
