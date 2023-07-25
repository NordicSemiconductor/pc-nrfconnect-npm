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
    Toggle,
} from 'pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    Charger,
    ITerm,
    ITermValues,
    NpmDevice,
    NTCThermistor,
    NTCValues,
    VTrickleFast,
    VTrickleFastValues,
} from '../../../features/pmicControl/npm/types';

interface PowerCardProperties {
    index: number;
    npmDevice: NpmDevice;
    charger: Charger;
    cardLabel?: string;
    disabled: boolean;
    defaultSummary?: boolean;
}

export default ({
    index,
    npmDevice,
    charger,
    cardLabel = `Charging ${index + 1}`,
    disabled,
    defaultSummary = false,
}: PowerCardProperties) => {
    const card = 'charger';
    const [summary, setSummary] = useState(defaultSummary);
    const currentRange = npmDevice.getChargerCurrentRange(index);
    const currentVoltageRange = npmDevice.getChargerVoltageRange(index);

    const [internalVTerm, setInternalVTerm] = useState(charger.vTerm);
    const [internalIChg, setInternalIChg] = useState(charger.iChg);

    // NumberInputSliderWithUnit do not use charger.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalVTerm(charger.vTerm);
        setInternalIChg(charger.iChg);
    }, [charger]);

    const vTrickleFastItems = [...VTrickleFastValues].map(item => ({
        label: `${item}`,
        value: `${item}`,
    }));

    const iTermItems = [...ITermValues].map(item => ({
        label: item,
        value: item,
    }));

    const ntcThermistorItems = [...NTCValues].map(item => ({
        label: `${item}`,
        value: `${item}`,
    }));

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card={card} item="Charger">
                        <span>{cardLabel}</span>
                    </DocumentationTooltip>

                    <div className="d-flex">
                        <Toggle
                            label="Enable"
                            isToggled={charger.enabled}
                            onToggle={v =>
                                npmDevice.setChargerEnabled(index, v)
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
            <NumberInputSliderWithUnit
                label={
                    <DocumentationTooltip card={card} item="VTERM">
                        <div>
                            <span>V</span>
                            <span className="subscript">TERM</span>
                        </div>
                    </DocumentationTooltip>
                }
                unit="V"
                disabled={disabled}
                range={currentVoltageRange}
                value={internalVTerm}
                onChange={setInternalVTerm}
                onChangeComplete={v => npmDevice.setChargerVTerm(index, v)}
            />
            <NumberInputSliderWithUnit
                label={
                    <DocumentationTooltip card={card} item="ICHG">
                        <div>
                            <span>I</span>
                            <span className="subscript">CHG</span>
                        </div>
                    </DocumentationTooltip>
                }
                unit="mA"
                disabled={disabled}
                range={currentRange}
                value={internalIChg}
                onChange={setInternalIChg}
                onChangeComplete={v => npmDevice.setChargerIChg(index, v)}
            />

            {!summary && (
                <>
                    <Toggle
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="EnableRecharging"
                            >
                                Enable Recharging
                            </DocumentationTooltip>
                        }
                        isToggled={charger.enableRecharging}
                        onToggle={value =>
                            npmDevice.setChargerEnabledRecharging(index, value)
                        }
                        disabled={disabled}
                    />
                    <Dropdown
                        label={
                            <DocumentationTooltip card="charger" item="ITERM">
                                <>
                                    <span>I</span>
                                    <span className="subscript">TERM</span>
                                </>
                            </DocumentationTooltip>
                        }
                        items={iTermItems}
                        onSelect={item =>
                            npmDevice.setChargerITerm(
                                index,
                                item.value as ITerm
                            )
                        }
                        selectedItem={
                            iTermItems[
                                Math.max(
                                    0,
                                    iTermItems.findIndex(
                                        item => item.value === charger.iTerm
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
                                item="VTrickleFast"
                            >
                                <>
                                    <span>V</span>
                                    <span className="subscript">
                                        TRICKLE_FAST
                                    </span>
                                </>
                            </DocumentationTooltip>
                        }
                        items={vTrickleFastItems}
                        onSelect={item =>
                            npmDevice.setChargerVTrickleFast(
                                index,
                                Number.parseFloat(item.value) as VTrickleFast
                            )
                        }
                        selectedItem={
                            vTrickleFastItems[
                                Math.max(
                                    0,
                                    vTrickleFastItems.findIndex(
                                        item =>
                                            Number.parseFloat(item.value) ===
                                            charger.vTrickleFast
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
                                item="NTCThermistor"
                            >
                                <span>NTC thermistor</span>
                            </DocumentationTooltip>
                        }
                        items={ntcThermistorItems}
                        onSelect={item =>
                            npmDevice.setChargerNTCThermistor(
                                index,
                                item.value as NTCThermistor
                            )
                        }
                        selectedItem={
                            ntcThermistorItems[
                                Math.max(
                                    0,
                                    ntcThermistorItems.findIndex(
                                        item =>
                                            item.value === charger.ntcThermistor
                                    )
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
