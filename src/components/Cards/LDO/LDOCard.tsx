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
    GPIOValues,
    Ldo,
    LdoOnOffControl,
    LdoOnOffControlValues,
    NpmDevice,
    SoftStart,
    SoftStartValues,
} from '../../../features/pmicControl/npm/types';

interface LdoCardProperties {
    index: number;
    npmDevice: NpmDevice;
    ldo: Ldo;
    cardLabel?: string;
    disabled: boolean;
    defaultSummary?: boolean;
}

const softStartItems = SoftStartValues.map(item => ({
    label: `${item} mA`,
    value: `${item}`,
}));

export default ({
    index,
    npmDevice,
    ldo,
    cardLabel = `Load Switch/LDO ${index + 1}`,
    defaultSummary = false,
    disabled,
}: LdoCardProperties) => {
    const [summary, setSummary] = useState(defaultSummary);

    const card = `ldo${index + 1}`;
    const range = npmDevice.getLdoVoltageRange(index);

    const [internalVLdo, setInternalVLdo] = useState(ldo.voltage);

    const modeItems = ['LDO', 'Load Switch'];

    const numberOfGPIOs = npmDevice.getNumberOfGPIOs() ?? 0;
    const gpioNames = GPIOValues.slice(0, numberOfGPIOs);

    const LdoOnOffControlItems = [...LdoOnOffControlValues, ...gpioNames].map(
        item => ({
            label: item,
            value: item,
        })
    );

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
                            onToggle={value =>
                                npmDevice.setLdoEnabled(index, value)
                            }
                            disabled={disabled}
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
                    npmDevice.setLdoMode(index, i === 0 ? 'LDO' : 'ldoSwitch')
                }
                selectedItem={
                    ldo.mode === 'ldoSwitch' ? modeItems[1] : modeItems[0]
                }
            />

            <NumberInput
                label={
                    <DocumentationTooltip card={card} item="VOUTLDO">
                        <div>
                            <span>V</span>
                            <span className="subscript">{`OUTLDO${
                                index + 1
                            }`}</span>
                        </div>
                    </DocumentationTooltip>
                }
                unit="V"
                disabled={disabled}
                range={range}
                value={internalVLdo}
                onChange={setInternalVLdo}
                onChangeComplete={value =>
                    npmDevice.setLdoVoltage(index, value)
                }
                showSlider
            />

            {!summary && (
                <>
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
                            npmDevice.setLdoSoftStart(
                                index,
                                Number.parseInt(item.value, 10) as SoftStart
                            )
                        }
                        selectedItem={
                            softStartItems[
                                Math.max(
                                    0,
                                    softStartItems.findIndex(
                                        item =>
                                            item.value ===
                                            ldo.softStart.toString()
                                    )
                                ) ?? 0
                            ]
                        }
                        disabled={disabled || ldo.mode === 'LDO'}
                    />
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
                        onToggle={value =>
                            npmDevice.setLdoActiveDischarge(index, value)
                        }
                        disabled={disabled}
                    />
                    <Dropdown
                        label="On/Off Control"
                        items={LdoOnOffControlItems}
                        onSelect={item => {
                            npmDevice.setLdoOnOffControl(
                                index,
                                item.value as LdoOnOffControl
                            );
                        }}
                        selectedItem={
                            LdoOnOffControlItems[
                                Math.max(
                                    0,
                                    LdoOnOffControlItems.findIndex(
                                        item => item.value === ldo.onOffControl
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
