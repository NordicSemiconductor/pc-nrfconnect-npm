/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Card,
    classNames,
    Dropdown,
    DropdownItem,
    NumberInlineInput,
    NumberInputSliderWithUnit,
    Slider,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    ChargeCurrentCool,
    Charger,
    NpmDevice,
    NTCThermistor,
    NTCValues,
} from '../../features/pmicControl/npm/types';
import { getLatestAdcSample } from '../../features/pmicControl/pmicControlSlice';
import { RangeType } from '../../utils/helpers';

const ntcThermistorItems = [...NTCValues].map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

const card = 'JEITA';

export default ({
    npmDevice,
    charger,
    disabled,
}: {
    npmDevice: NpmDevice;
    charger: Charger;
    disabled: boolean;
}) => {
    const latestAdcSample = useSelector(getLatestAdcSample);

    const [internalVTermr, setInternalVTermr] = useState(charger.vTermR);
    const [internalNTCBeta, setInternalNTCBeta] = useState(charger.ntcBeta);
    const [autoNTCBeta, setAutoNTCBeta] = useState(true);

    const [internalJeitaTemps, setInternalJeitaTemps] = useState([
        charger.tCold,
        charger.tCool,
        charger.tWarm,
        charger.tHot,
    ]);

    const currentCoolItems: DropdownItem[] = [
        {
            value: 'iCool',
            label: (
                <div>
                    I<span className="subscript">COOL</span>
                </div>
            ),
        },
        {
            value: 'iCHG',
            label: (
                <div>
                    I<span className="subscript">CHG</span>
                </div>
            ),
        },
    ];

    const updateNpmDeviceJeitaTemps = () => {
        if (internalJeitaTemps[0] !== charger.tCold)
            npmDevice.setChargerTCold(internalJeitaTemps[0]);
        if (internalJeitaTemps[1] !== charger.tCool)
            npmDevice.setChargerTCool(internalJeitaTemps[1]);
        if (internalJeitaTemps[2] !== charger.tWarm)
            npmDevice.setChargerTWarm(internalJeitaTemps[2]);
        if (internalJeitaTemps[3] !== charger.tHot)
            npmDevice.setChargerTHot(internalJeitaTemps[3]);
    };

    //  NumberInputSliderWithUnit do not use charger.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalVTermr(charger.vTermR);
        setInternalJeitaTemps([
            charger.tCold,
            charger.tCool,
            charger.tWarm,
            charger.tHot,
        ]);
        setInternalNTCBeta(charger.ntcBeta);
    }, [charger]);

    const updateInternal = (index: number, value: number) => {
        if (index === 0 && value > internalJeitaTemps[1]) {
            return;
        }
        if (index === 3 && internalJeitaTemps[2] > value) {
            return;
        }

        if (
            index === 1 &&
            (value >= internalJeitaTemps[index + 1] ||
                internalJeitaTemps[index - 1] > value)
        ) {
            return;
        }

        if (
            index === 2 &&
            (value > internalJeitaTemps[index + 1] ||
                internalJeitaTemps[index - 1] >= value)
        ) {
            return;
        }

        const temp = [...internalJeitaTemps];
        temp[index] = value;
        setInternalJeitaTemps(temp);
    };

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card={card} item="JEITACompliance">
                        <span>
                            T<span className="subscript">BAT</span> Monitoring –
                            JEITA Compliance
                        </span>
                    </DocumentationTooltip>
                </div>
            }
        >
            <div className="tw-preflight tw-mb-4">
                <div className="tw-relative tw-my-6 tw-flex tw-flex-row tw-justify-between tw-gap-2 tw-text-xs">
                    <div className="tw-flex tw-flex-col tw-p-1 tw-font-medium">
                        <span className="tw-border-b tw-border-b-gray-200 tw-font-medium">
                            Temperature
                        </span>
                        <span>Current</span>
                        <span>Voltage</span>
                    </div>
                    <div>
                        <Line />
                    </div>
                    <div
                        className={`tw-flex tw-flex-grow tw-flex-col tw-rounded tw-p-1 tw-text-center ${classNames(
                            latestAdcSample &&
                                latestAdcSample?.tBat < internalJeitaTemps[0] &&
                                'tw-bg-indigo-100'
                        )}`}
                    >
                        <span className="tw-border-b tw-border-b-gray-200 tw-font-medium">
                            Cold
                        </span>
                        <span>Off</span>
                        <span>N/A</span>
                    </div>
                    <div>
                        <Arrow
                            type="COLD"
                            temperature={internalJeitaTemps[0]}
                            range={{
                                min: npmDevice.getChargerJeitaRange().min,
                                max: internalJeitaTemps[1],
                            }}
                            onChange={v => updateInternal(0, v)}
                            onChangeComplete={updateNpmDeviceJeitaTemps}
                        />
                    </div>
                    <div
                        className={`tw-flex tw-flex-grow tw-flex-col tw-rounded tw-p-1 tw-text-center ${classNames(
                            latestAdcSample &&
                                latestAdcSample?.tBat >=
                                    internalJeitaTemps[0] &&
                                latestAdcSample?.tBat < internalJeitaTemps[1] &&
                                'tw-bg-lightBlue-100'
                        )}`}
                    >
                        <span className="tw-border-b tw-border-b-gray-200 tw-font-medium">
                            Cool
                        </span>
                        <span>
                            I<span className="subscript">COOL</span> or I
                            <span className="subscript">CHG</span>
                        </span>
                        <span>
                            V<span className="subscript">TERM</span>
                        </span>
                    </div>
                    <div>
                        <Arrow
                            type="COOL"
                            temperature={internalJeitaTemps[1]}
                            range={{
                                min: internalJeitaTemps[0],
                                max: internalJeitaTemps[2] - 1,
                            }}
                            onChange={v => updateInternal(1, v)}
                            onChangeComplete={updateNpmDeviceJeitaTemps}
                        />
                    </div>
                    <div
                        className={`tw-flex tw-flex-grow tw-flex-col tw-rounded tw-p-1 tw-text-center ${classNames(
                            latestAdcSample &&
                                latestAdcSample?.tBat >=
                                    internalJeitaTemps[1] &&
                                latestAdcSample?.tBat < internalJeitaTemps[2] &&
                                'tw-bg-green-100'
                        )}`}
                    >
                        <span className="tw-border-b tw-border-b-gray-200 tw-font-medium">
                            Nominal
                        </span>
                        <span>
                            I<span className="subscript">CHG</span>
                        </span>
                        <span>
                            V<span className="subscript">TERM</span>
                        </span>
                    </div>
                    <div>
                        <Arrow
                            type="WARM"
                            temperature={internalJeitaTemps[2]}
                            range={{
                                min: internalJeitaTemps[1] + 1,
                                max: internalJeitaTemps[3],
                            }}
                            onChange={v => updateInternal(2, v)}
                            onChangeComplete={updateNpmDeviceJeitaTemps}
                        />
                    </div>
                    <div
                        className={`tw-flex tw-flex-grow tw-flex-col tw-rounded tw-p-1 tw-text-center ${classNames(
                            latestAdcSample &&
                                latestAdcSample?.tBat >=
                                    internalJeitaTemps[2] &&
                                latestAdcSample?.tBat < internalJeitaTemps[3] &&
                                'tw-bg-orange-100'
                        )}`}
                    >
                        <span className="tw-border-b tw-border-b-gray-200 tw-font-medium">
                            Warm
                        </span>
                        <span>
                            I<span className="subscript">CHG</span>
                        </span>
                        <span>
                            V<span className="subscript">TERMR</span>
                        </span>
                    </div>
                    <div>
                        <Arrow
                            type="HOT"
                            temperature={internalJeitaTemps[3]}
                            range={{
                                min: internalJeitaTemps[2],
                                max: npmDevice.getChargerJeitaRange().max,
                            }}
                            onChange={v => updateInternal(3, v)}
                            onChangeComplete={updateNpmDeviceJeitaTemps}
                        />
                    </div>
                    <div
                        className={`tw-flex tw-flex-grow tw-flex-col tw-rounded tw-p-1 tw-text-center ${classNames(
                            latestAdcSample &&
                                latestAdcSample?.tBat >=
                                    internalJeitaTemps[3] &&
                                'tw-bg-red-100'
                        )}`}
                    >
                        <span className="tw-border-b tw-border-b-gray-200 tw-font-medium">
                            Hot
                        </span>
                        <span>Off</span>
                        <span>N/A</span>
                    </div>
                </div>

                <div className="tw-flex tw-flex-row tw-justify-between tw-gap-2 tw-text-xs">
                    <span>{npmDevice.getChargerJeitaRange().min}°C</span>
                    <div className="tw-w-full">
                        <Slider
                            values={internalJeitaTemps}
                            range={npmDevice.getChargerJeitaRange()}
                            onChange={[0, 1, 2, 3].map(
                                i => v => updateInternal(i, v)
                            )}
                            onChangeComplete={updateNpmDeviceJeitaTemps}
                        />
                    </div>
                    <span>{npmDevice.getChargerJeitaRange().max}°C</span>
                </div>
            </div>
            <NumberInputSliderWithUnit
                label={
                    <DocumentationTooltip card={card} item="Vtermr">
                        <div>
                            <span>V</span>
                            <span className="subscript">TERMR</span>
                        </div>
                    </DocumentationTooltip>
                }
                unit="V"
                value={internalVTermr}
                range={npmDevice.getChargerVTermRRange()}
                onChange={value => setInternalVTermr(value)}
                onChangeComplete={npmDevice.setChargerVTermR}
                disabled={disabled}
            />
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="CoolCurrent">
                        <span>Cool current</span>
                    </DocumentationTooltip>
                }
                items={currentCoolItems}
                onSelect={item =>
                    npmDevice.setChargerCurrentCool(
                        item.value as ChargeCurrentCool
                    )
                }
                selectedItem={
                    currentCoolItems[charger.currentCool === 'iCHG' ? 1 : 0]
                }
                disabled={disabled}
            />
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="NTCThermistor">
                        <span>NTC thermistor</span>
                    </DocumentationTooltip>
                }
                items={ntcThermistorItems}
                onSelect={item =>
                    npmDevice.setChargerNTCThermistor(
                        item.value as NTCThermistor,
                        autoNTCBeta
                    )
                }
                selectedItem={
                    ntcThermistorItems[
                        Math.max(
                            0,
                            ntcThermistorItems.findIndex(
                                item => item.value === charger.ntcThermistor
                            )
                        ) ?? 0
                    ]
                }
                disabled={disabled}
            />
            <Toggle
                isToggled={autoNTCBeta}
                onToggle={v => {
                    setAutoNTCBeta(v);
                    if (!v) return;
                    npmDevice.setChargerNTCThermistor(
                        charger.ntcThermistor,
                        true
                    );
                }}
                label="Auto NTC Beta"
            />
            {!autoNTCBeta && (
                <div className="tw-flex tw-justify-between">
                    NTC Beta
                    <div className="tw-flex tw-flex-row">
                        <NumberInlineInput
                            range={{
                                min: 0,
                                max: 4294967295,
                                decimals: undefined,
                                step: undefined,
                            }}
                            value={internalNTCBeta}
                            onChange={setInternalNTCBeta}
                            onChangeComplete={npmDevice.setChargerNTCBeta}
                        />
                    </div>
                </div>
            )}
        </Card>
    );
};

const Line = ({ className }: { className?: string }) => (
    <div
        className={`tw-relative tw-h-full tw-border-r tw-border-r-gray-300 ${classNames(
            className
        )}`}
    />
);

const Arrow = ({
    type,
    temperature,
    range,
    onChange,
    onChangeComplete,
}: {
    type: 'COLD' | 'COOL' | 'WARM' | 'HOT';
    temperature: number;
    range: RangeType;
    onChange: (value: number) => void;
    onChangeComplete: () => void;
}) => (
    <>
        <span className="tw-absolute tw--top-5 tw--translate-x-1/2">
            T<span className="subscript">{type}</span>
        </span>
        <Line
            className="before:tw-absolute before:tw-bottom-0 before:tw-right-[2px] before:tw-h-3 before:tw--translate-x-1/2 before:tw--rotate-[30deg] before:tw-border-l before:tw-border-l-gray-300
        after:tw-absolute after:tw-bottom-0 after:tw-left-[3px] after:tw-h-3 after:tw-translate-x-1/2 after:tw-rotate-[30deg] after:tw-border-r after:tw-border-r-gray-300"
        />
        <div className="tw-absolute tw--bottom-5 tw--translate-x-1/2">
            <div className="tw-flex tw-flex-row">
                <NumberInlineInput
                    value={temperature}
                    range={range}
                    onChange={onChange}
                    onChangeComplete={onChangeComplete}
                />
                <span>°C</span>
            </div>
        </div>
    </>
);
