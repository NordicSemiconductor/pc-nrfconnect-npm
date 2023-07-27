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
    const [internalTJeita1, setInternalTJeita1] = useState(charger.tCold);
    const [internalTJeita2, setInternalTJeita2] = useState(charger.tCool);
    const [internalTJeita3, setInternalTJeita3] = useState(charger.tWarm);
    const [internalTJeita4, setInternalTJeita4] = useState(charger.tHot);

    const [internalJeitaTemps, setInternalJeitaTemps] = useState([
        internalTJeita1,
        internalTJeita2,
        internalTJeita3,
        internalTJeita4,
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

    useEffect(() => {
        setInternalJeitaTemps(
            [
                internalTJeita1,
                internalTJeita2,
                internalTJeita3,
                internalTJeita4,
            ].sort((a, b) => a - b)
        );
    }, [internalTJeita1, internalTJeita2, internalTJeita3, internalTJeita4]);

    const updateNpmDeviceJeitaTemps = () => {
        const temp = [
            internalTJeita1,
            internalTJeita2,
            internalTJeita3,
            internalTJeita4,
        ].sort();

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
        setInternalTJeita1(charger.tCold);
        setInternalTJeita2(charger.tCool);
        setInternalTJeita3(charger.tWarm);
        setInternalTJeita4(charger.tHot);
    }, [charger]);

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
                        <Arrow type="HOT" temperature={internalJeitaTemps[3]} />
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
                            values={[
                                internalTJeita1,
                                internalTJeita2,
                                internalTJeita3,
                                internalTJeita4,
                            ]}
                            range={npmDevice.getChargerJeitaRange()}
                            onChange={[
                                setInternalTJeita1,
                                setInternalTJeita2,
                                setInternalTJeita3,
                                setInternalTJeita4,
                            ]}
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
}: {
    type: 'COLD' | 'COOL' | 'WARM' | 'HOT';
    temperature: number;
}) => (
    <>
        <span className="tw-absolute tw--top-5 tw--translate-x-1/2">
            T<span className="subscript">{type}</span>
        </span>
        <Line
            className="before:tw-absolute before:tw-bottom-0 before:tw-right-[2px] before:tw-h-3 before:tw--translate-x-1/2 before:tw--rotate-[30deg] before:tw-border-l before:tw-border-l-gray-300
        after:tw-absolute after:tw-bottom-0 after:tw-left-[3px] after:tw-h-3 after:tw-translate-x-1/2 after:tw-rotate-[30deg] after:tw-border-r after:tw-border-r-gray-300"
        />
        <span className="tw-absolute tw--bottom-5 tw--translate-x-1/2">
            {temperature}°C
        </span>
    </>
);
