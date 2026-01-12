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
    ChargerModule,
    isFixedListRangeWithLabel,
    ITerm,
    ITrickle,
    VTrickleFast,
} from '../../../features/pmicControl/npm/types';

interface PowerCardProperties {
    chargerModule: ChargerModule;
    charger: Charger;
    cardLabel?: string;
    disabled: boolean;
    defaultSummary?: boolean;
}

const card = 'charger';

const IBatLimUI = ({
    chargerModule,
    charger,
    disabled,
}: {
    chargerModule: ChargerModule;
    charger: Charger;
    disabled: boolean;
}) => {
    const [internalBatLim, setInternalBatLim] = useState(charger.iBatLim);

    useEffect(() => {
        setInternalBatLim(charger.iBatLim);
    }, [charger]);

    const chargerIBatLimRange = chargerModule.ranges.iBatLim;

    if (
        !chargerIBatLimRange ||
        !chargerModule.set.batLim ||
        charger.iBatLim === undefined ||
        internalBatLim === undefined
    )
        return null;

    const setBatLim = chargerModule.set.batLim.bind(chargerModule.set);

    if (
        isFixedListRangeWithLabel(chargerIBatLimRange) &&
        chargerIBatLimRange.toLabel
    ) {
        return (
            <Dropdown
                items={[
                    ...(!chargerIBatLimRange.find(v => v === charger.iBatLim)
                        ? [
                              {
                                  value: charger.iBatLim,
                                  label: chargerIBatLimRange.toLabel(
                                      charger.iBatLim,
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
                    <DocumentationTooltip card={card} item="IBATLIM">
                        <div>
                            <span>IBAT</span>
                            <span className="subscript">LIM</span>
                        </div>
                    </DocumentationTooltip>
                }
                disabled={disabled}
                onSelect={v => setBatLim(v.value)}
                selectedItem={{
                    value: charger.iBatLim,
                    label: chargerIBatLimRange.toLabel(charger.iBatLim),
                }}
            />
        );
    }

    return (
        <NumberInput
            label={
                <DocumentationTooltip card={card} item="IBATLIM">
                    <div>
                        <span>IBAT</span>
                        <span className="subscript">LIM</span>
                    </div>
                </DocumentationTooltip>
            }
            unit="mA"
            disabled={disabled}
            range={chargerIBatLimRange}
            value={internalBatLim}
            onChange={setInternalBatLim}
            onChangeComplete={v => setBatLim(v)}
            showSlider
        />
    );
};

const ITrickleUI = ({
    chargerModule,
    charger,
    disabled,
}: {
    chargerModule: ChargerModule;
    charger: Charger;
    disabled: boolean;
}) => {
    const [internalITrickle] = useState(charger.iTrickle);

    if (
        !chargerModule.set.iTrickle ||
        charger.iTrickle === undefined ||
        internalITrickle === undefined ||
        chargerModule.values.iTrickle === undefined
    ) {
        return null;
    }

    const iTrickleValues = chargerModule.values.iTrickle(charger.iChg);

    return (
        <Dropdown
            label={
                <DocumentationTooltip card={card} item="ITrickle">
                    <>
                        <span>I</span>
                        <span className="subscript">TRICKLE</span>
                    </>
                </DocumentationTooltip>
            }
            items={iTrickleValues}
            onSelect={item =>
                chargerModule.set.iTrickle?.(item.value as ITrickle)
            }
            selectedItem={
                iTrickleValues.find(item => item.value === charger.iTrickle) ??
                iTrickleValues[0]
            }
            disabled={disabled}
        />
    );
};

const VWeakUI = ({
    chargerModule,
    charger,
    disabled,
}: {
    chargerModule: ChargerModule;
    charger: Charger;
    disabled: boolean;
}) => {
    const [internalVWeak, setInternalVWeak] = useState(charger.vWeak);

    useEffect(() => {
        setInternalVWeak(charger.vWeak);
    }, [charger]);

    if (
        !chargerModule.set.vWeak ||
        !chargerModule.ranges.vWeak ||
        charger.vWeak === undefined ||
        internalVWeak === undefined
    ) {
        return null;
    }

    return (
        <NumberInput
            label={
                <DocumentationTooltip card={card} item="VWEAK">
                    <div>
                        <span>V</span>
                        <span className="subscript">WEAK</span>
                    </div>
                </DocumentationTooltip>
            }
            unit="V"
            disabled={disabled}
            range={chargerModule.ranges.vWeak}
            value={internalVWeak}
            onChange={setInternalVWeak}
            onChangeComplete={v => chargerModule.set.vWeak?.(v)}
            showSlider
        />
    );
};

const WeakBatteryChargingUI = ({
    chargerModule,
    charger,
    disabled,
}: {
    chargerModule: ChargerModule;
    charger: Charger;
    disabled: boolean;
}) => {
    const [internalWeakBatChg, setInternalWeakBatChg] = useState(
        charger.enableWeakBatteryCharging,
    );

    if (
        !chargerModule.set.enabledWeakBatteryCharging ||
        charger.enableWeakBatteryCharging === undefined ||
        internalWeakBatChg === undefined
    ) {
        return null;
    }

    return (
        <Toggle
            label={
                <DocumentationTooltip
                    card={card}
                    item="EnableWeakBatteryCharging"
                >
                    Enable Weak Battery Charging
                </DocumentationTooltip>
            }
            isToggled={internalWeakBatChg}
            onToggle={value => {
                setInternalWeakBatChg(value);
                chargerModule.set.enabledWeakBatteryCharging?.(value);
            }}
            disabled={disabled}
        />
    );
};

export default ({
    chargerModule,
    charger,
    cardLabel = `Charger`,
    disabled,
    defaultSummary = false,
}: PowerCardProperties) => {
    const [summary, setSummary] = useState(defaultSummary);

    const [internalVTerm, setInternalVTerm] = useState(charger.vTerm);
    const [internalIChg, setInternalIChg] = useState(charger.iChg);

    // NumberInputSliderWithUnit do not use charger.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalVTerm(charger.vTerm);
        setInternalIChg(charger.iChg);
    }, [charger]);

    const iTermValues = chargerModule.values.iTerm(charger.iChg);

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
                            onToggle={v => chargerModule.set.enabled(v)}
                            disabled={disabled}
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
                range={chargerModule.ranges.voltage}
                value={internalVTerm}
                onChange={setInternalVTerm}
                onChangeComplete={v => chargerModule.set.vTerm(v)}
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
                range={chargerModule.ranges.current}
                value={internalIChg}
                onChange={setInternalIChg}
                onChangeComplete={v => {
                    const valid = chargerModule.get.iChgAndITermValid?.(
                        v,
                        charger.iTerm,
                    );
                    const newVal = valid === false ? charger.iChg : v;

                    setInternalIChg(newVal);
                    if (newVal !== charger.iChg) {
                        chargerModule.set.iChg(newVal);
                    }
                }}
                showSlider
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
                items={iTermValues}
                onSelect={item => chargerModule.set.iTerm(item.value as ITerm)}
                selectedItem={
                    iTermValues.find(item => item.value === charger.iTerm) ??
                    iTermValues[0]
                }
                disabled={disabled}
            />

            {!summary && (
                <>
                    <IBatLimUI
                        charger={charger}
                        chargerModule={chargerModule}
                        disabled={disabled}
                    />
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
                            chargerModule.set.enabledRecharging(value)
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
                            chargerModule.set.enabledVBatLow(value)
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
                        items={chargerModule.values.vTrickleFast}
                        onSelect={item =>
                            chargerModule.set.vTrickleFast(
                                item.value as VTrickleFast,
                            )
                        }
                        selectedItem={
                            chargerModule.values.vTrickleFast.find(
                                item => item.value === charger.vTrickleFast,
                            ) ?? chargerModule.values.vTrickleFast[0]
                        }
                        disabled={disabled}
                    />
                    <ITrickleUI
                        charger={charger}
                        chargerModule={chargerModule}
                        disabled={disabled}
                    />
                    <VWeakUI
                        charger={charger}
                        chargerModule={chargerModule}
                        disabled={disabled}
                    />
                    <WeakBatteryChargingUI
                        charger={charger}
                        chargerModule={chargerModule}
                        disabled={disabled}
                    />
                </>
            )}
        </Card>
    );
};
