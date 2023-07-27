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
    NumberInlineInput,
    NumberInputSliderWithUnit,
    Slider,
    StateSelector,
} from 'pc-nrfconnect-shared';

import {
    ChargeCurrentCool,
    Charger,
    NpmDevice,
} from '../../features/pmicControl/npm/types';
import { getLatestAdcSample } from '../../features/pmicControl/pmicControlSlice';
import { RangeType } from '../../utils/helpers';

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

    const [internalJeitaTemps, setInternalJeitaTemps] = useState([
        charger.tCold,
        charger.tCool,
        charger.tWarm,
        charger.tHot,
    ]);

    const currentCoolItems = [
        {
            key: 'iCHG',
            renderItem: (
                <div>
                    I<span className="subscript">COOL</span>
                </div>
            ),
        },
        {
            key: 'iCool',
            renderItem: (
                <div>
                    I<span className="subscript">CHG</span>
                </div>
            ),
        },
    ] as { key: ChargeCurrentCool; renderItem: React.ReactNode }[];

    const updateNpmDeviceJeitaTemps = () => {
        const temp = internalJeitaTemps.sort((a, b) => a - b);

        if (temp[0] !== charger.tCold) npmDevice.setChargerTCold(temp[0]);
        if (temp[1] !== charger.tCool) npmDevice.setChargerTCool(temp[1]);
        if (temp[2] !== charger.tWarm) npmDevice.setChargerTWarm(temp[2]);
        if (temp[3] !== charger.tHot) npmDevice.setChargerTHot(temp[3]);
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
    }, [charger]);

    const updateInternal = (index: number, value: number) => {
        if (index === 0 && value >= internalJeitaTemps[1]) {
            return;
        }
        if (index === 3 && internalJeitaTemps[2] >= value) {
            return;
        }
        if (
            index !== 0 &&
            index !== 3 &&
            (value >= internalJeitaTemps[index + 1] ||
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
                    <span>
                        T<span className="subscript">BAT</span> Monitoring –
                        JEITA Compliance
                    </span>
                </div>
            }
        >
            <StateSelector
                items={currentCoolItems}
                onSelect={i =>
                    npmDevice.setChargerCurrentCool(currentCoolItems[i].key)
                }
                selectedItem={
                    currentCoolItems[charger.currentCool === 'iCHG' ? 0 : 1]
                }
                disabled={disabled}
            />
            <NumberInputSliderWithUnit
                label={
                    <div>
                        <span>V</span>
                        <span className="subscript">TERMR</span>
                    </div>
                }
                unit="V"
                value={internalVTermr}
                range={npmDevice.getChargerVTermRRange()}
                onChange={value => setInternalVTermr(value)}
                onChangeComplete={npmDevice.setChargerVTermR}
                disabled={disabled}
            />

            <div className="tw-preflight">
                <div className="tw-relative tw-my-6 tw-flex tw-flex-row tw-justify-between tw-gap-2 tw-text-xs">
                    <div className="tw-flex tw-flex-col tw-font-medium">
                        <span>Temp Region</span>
                        <span>Charge Current</span>
                        <span>Termination Voltage</span>
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
                        <span>0 mAh</span>
                        <span>0 V</span>
                    </div>
                    <div>
                        <Arrow
                            type="COLD"
                            temperature={internalJeitaTemps[0]}
                            range={{
                                min: npmDevice.getChargerJeitaRange().min,
                                max: internalJeitaTemps[1] - 1,
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
                                min: internalJeitaTemps[0] + 1,
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
                                max: internalJeitaTemps[3] - 1,
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
                                min: internalJeitaTemps[2] + 1,
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
                        <span>0 mAh</span>
                        <span>0 V</span>
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
