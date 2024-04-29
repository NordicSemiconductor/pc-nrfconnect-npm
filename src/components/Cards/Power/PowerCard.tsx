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
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    Charger,
    isFixedListRangeWithLabel,
    ITerm,
    ITermValues,
    NpmDevice,
    VTrickleFast,
    VTrickleFastValues,
} from '../../../features/pmicControl/npm/types';

interface PowerCardProperties {
    npmDevice: NpmDevice;
    charger: Charger;
    cardLabel?: string;
    disabled: boolean;
    defaultSummary?: boolean;
}

const vTrickleFastItems = [...VTrickleFastValues].map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

const iTermItems = [...ITermValues].map(item => ({
    label: item,
    value: item,
}));

export default ({
    npmDevice,
    charger,
    cardLabel = `Charger`,
    disabled,
    defaultSummary = false,
}: PowerCardProperties) => {
    const card = 'charger';
    const [summary, setSummary] = useState(defaultSummary);
    const currentRange = npmDevice.getChargerCurrentRange();
    const currentVoltageRange = npmDevice.getChargerVoltageRange();

    const [internalVTerm, setInternalVTerm] = useState(charger.vTerm);
    const [internalIChg, setInternalIChg] = useState(charger.iChg);
    const [internalBatLim, setInternalBatLim] = useState(charger.iBatLim);

    // NumberInputSliderWithUnit do not use charger.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalVTerm(charger.vTerm);
        setInternalIChg(charger.iChg);
        setInternalBatLim(charger.iBatLim);
    }, [charger]);

    const chargerIBatLimRange = npmDevice.getChargerIBatLimRange();

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
                            onToggle={v => npmDevice.setChargerEnabled(v)}
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
            <NumberInput
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
                onChangeComplete={v => npmDevice.setChargerVTerm(v)}
                showSlider
            />
            <NumberInput
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
                onChangeComplete={v => npmDevice.setChargerIChg(v)}
                showSlider
            />

            {!summary && (
                <>
                    {isFixedListRangeWithLabel(chargerIBatLimRange) &&
                    chargerIBatLimRange.toLabel !== undefined ? (
                        <Dropdown
                            items={[
                                ...(!chargerIBatLimRange.find(
                                    v => v === charger.iBatLim
                                )
                                    ? [
                                          {
                                              value: charger.iBatLim,
                                              label: chargerIBatLimRange.toLabel(
                                                  charger.iBatLim
                                              ),
                                          },
                                      ]
                                    : []),
                                ...chargerIBatLimRange.map(v => ({
                                    value: v.valueOf(),
                                    label: chargerIBatLimRange.toLabel(v),
                                })),
                            ]}
                            label={
                                <div>
                                    <span>IBAT</span>
                                    <span className="subscript">LIM</span>
                                </div>
                            }
                            disabled={disabled}
                            onSelect={v => npmDevice.setChargerBatLim(v.value)}
                            selectedItem={{
                                value: charger.iBatLim,
                                label: chargerIBatLimRange.toLabel(
                                    charger.iBatLim
                                ),
                            }}
                        />
                    ) : (
                        <NumberInput
                            label={
                                <div>
                                    <span>IBAT</span>
                                    <span className="subscript">LIM</span>
                                </div>
                            }
                            unit="mA"
                            disabled={disabled}
                            range={chargerIBatLimRange}
                            value={internalBatLim}
                            onChange={setInternalBatLim}
                            onChangeComplete={v =>
                                npmDevice.setChargerBatLim(v)
                            }
                            showSlider
                        />
                    )}

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
                            npmDevice.setChargerEnabledRecharging(value)
                        }
                        disabled={disabled}
                    />
                    <Toggle
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="EnableVBatLow"
                            >
                                <>
                                    <span>Charging Below V</span>
                                    <span className="subscript">BATLOW</span>
                                </>
                            </DocumentationTooltip>
                        }
                        isToggled={charger.enableVBatLow}
                        onToggle={value =>
                            npmDevice.setChargerEnabledVBatLow(value)
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
                            npmDevice.setChargerITerm(item.value as ITerm)
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
                </>
            )}
        </Card>
    );
};
