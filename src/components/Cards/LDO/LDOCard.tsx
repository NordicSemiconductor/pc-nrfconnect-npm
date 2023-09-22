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
    NumberInputSliderWithUnit,
    StateSelector,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    Ldo,
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
    label: `${item}mA`,
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

            <NumberInputSliderWithUnit
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
            />

            {!summary && (
                <>
                    <Toggle
                        label="Soft Start Enable"
                        isToggled={ldo.softStartEnabled}
                        onToggle={value =>
                            npmDevice.setLdoSoftStartEnabled(index, value)
                        }
                        disabled={disabled}
                    />
                    <Dropdown
                        label="Soft Start"
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
                        disabled={disabled}
                    />
                </>
            )}
        </Card>
    ) : null;
};
