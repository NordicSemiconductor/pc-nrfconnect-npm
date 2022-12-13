/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { useSelector } from 'react-redux';
import {
    Card,
    NumberInlineInput,
    Slider,
    StateSelector,
    Toggle,
} from 'pc-nrfconnect-shared';

import { RootState } from '../../../appReducer';

interface buckProps {
    cardLabel: string;
    vOut: number;
    buckSelector: (state: RootState) => boolean;
    vSetSelector: (state: RootState) => boolean;
    onVOutChange: (value: number) => void;
    onVOutChangeComplete: () => void;
    onVSetToggle: (value: boolean) => void;
    onBuckToggle: (value: boolean) => void;
}

const BuckCard: FC<buckProps> = ({
    cardLabel,
    vOut,
    buckSelector,
    vSetSelector,
    onVOutChange,
    onVOutChangeComplete,
    onVSetToggle,
    onBuckToggle,
}) => {
    const initBuck = useSelector(buckSelector);
    const initVSet = useSelector(vSetSelector);

    const vSetItems = ['Software', 'Vset'];

    return (
        <Card
            title={
                <div className="d-flex justify-content-between">
                    <span>{cardLabel}</span>
                    <Toggle
                        label="Enable"
                        isToggled={initBuck}
                        onToggle={value => onBuckToggle(value)}
                    />
                </div>
            }
        >
            <StateSelector
                items={vSetItems}
                onSelect={index => onVSetToggle(index === 1)}
                selectedItem={initVSet ? vSetItems[1] : vSetItems[0]}
            />
            <div className="slider-container">
                <FormLabel className="flex-row">
                    <div>
                        <span>V</span>
                        <span className="subscript">OUT</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            value={vOut}
                            range={{
                                min: 1,
                                max: 3.3,
                                decimals: 1,
                            }}
                            onChange={value => onVOutChange(value)}
                            onChangeComplete={() => {
                                onVOutChangeComplete();
                                onVSetToggle(false);
                            }}
                        />
                        <span>V</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[vOut]}
                    onChange={[value => onVOutChange(value)]}
                    onChangeComplete={() => {
                        onVOutChangeComplete();
                        onVSetToggle(false);
                    }}
                    range={{
                        min: 1.0,
                        max: 3.3,
                        decimals: 1,
                    }}
                />
            </div>
        </Card>
    );
};

export default BuckCard;
