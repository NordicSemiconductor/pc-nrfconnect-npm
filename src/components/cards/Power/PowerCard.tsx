/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { useSelector } from 'react-redux';
import { Card, NumberInlineInput, Slider, Toggle } from 'pc-nrfconnect-shared';

import { RootState } from '../../../appReducer';
import vTermValues from '../../../utils/vTermValues';

interface powerProps {
    cardLabel: string;
    vTermSelector: (state: RootState) => number;
    iCHGSelector: (state: RootState) => number;
    enableChargingSelector: (state: RootState) => boolean;
    onVTermChange: (value: number) => void;
    onEnableChargingToggle: (value: boolean) => void;
    onICHGChange: (value: number) => void;
}

const PowerCard: FC<powerProps> = ({
    cardLabel,
    vTermSelector,
    iCHGSelector,
    enableChargingSelector,
    onVTermChange,
    onEnableChargingToggle,
    onICHGChange,
}) => {
    const vTerm = useSelector(vTermSelector);
    const [internalVTerm, setInternaVTerm] = useState(vTerm);
    const iCHG = useSelector(iCHGSelector);
    const [internalICHG, setInternaICHG] = useState(iCHG);
    const enableCharging = useSelector(enableChargingSelector);

    return (
        <Card
            title={
                <div className="d-flex justify-content-between">
                    <span>{cardLabel}</span>
                    <Toggle
                        label="Enable"
                        isToggled={enableCharging}
                        onToggle={onEnableChargingToggle}
                    />
                </div>
            }
        >
            <div className="slider-container">
                <FormLabel className="flex-row">
                    <div>
                        <span>V</span>
                        <span className="subscript">TERM</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            value={internalVTerm}
                            range={vTermValues}
                            onChange={value => setInternaVTerm(value)}
                            onChangeComplete={() =>
                                onVTermChange(internalVTerm)
                            }
                        />
                        <span>V</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[vTermValues.indexOf(internalVTerm)]}
                    onChange={[index => setInternaVTerm(vTermValues[index])]}
                    onChangeComplete={() => onVTermChange(internalVTerm)}
                    range={{
                        min: 0,
                        max: vTermValues.length - 1,
                    }}
                />
            </div>
            <div className="slider-container">
                <FormLabel className="flex-row">
                    <div>
                        <span>I</span>
                        <span className="subscript">CHG</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            value={internalICHG}
                            range={{
                                min: 32,
                                max: 800,
                                decimals: 0,
                                step: 2,
                            }}
                            onChange={value => setInternaICHG(value)}
                            onChangeComplete={() => {
                                onEnableChargingToggle(false);
                                onICHGChange(internalICHG);
                            }}
                        />
                        <span>mA</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[internalICHG]}
                    onChange={[value => setInternaICHG(value)]}
                    onChangeComplete={() => {
                        onEnableChargingToggle(false);
                        onICHGChange(internalICHG);
                    }}
                    range={{
                        min: 32,
                        max: 800,
                        decimals: 0,
                        step: 2,
                    }}
                />
            </div>
        </Card>
    );
};

export default PowerCard;
