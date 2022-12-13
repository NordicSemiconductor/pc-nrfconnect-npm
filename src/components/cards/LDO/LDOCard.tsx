/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useState } from 'react';
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

interface ldoProps {
    cardLabel: string;
    vLdoSelector: (state: RootState) => number;
    ldoSelector: (state: RootState) => boolean;
    ldoSwitchSelector: (state: RootState) => boolean;
    onLdoToggle: (value: boolean) => void;
    onVLdoChange: (value: number) => void;
    onLdoSwitchToggle: (value: boolean) => void;
}

const LDOCard: FC<ldoProps> = ({
    cardLabel,
    vLdoSelector,
    ldoSelector,
    ldoSwitchSelector,
    onLdoToggle,
    onVLdoChange,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onLdoSwitchToggle,
}) => {
    const enableLdo = useSelector(ldoSelector);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const enableSwitchLdo = useSelector(ldoSwitchSelector);
    const vLdo = useSelector(vLdoSelector);
    const [internalVLdo, setInternaVLdo] = useState(vLdo);

    return (
        <Card
            title={
                <div className="d-flex justify-content-between">
                    <span>{cardLabel}</span>
                    <Toggle
                        label="Enable"
                        isToggled={enableLdo}
                        onToggle={value => onLdoToggle(value)}
                    />
                </div>
            }
        >
            <StateSelector
                items={['Load Switch', 'LDO']}
                onSelect={() => {}}
                selectedItem="Load Switch"
            />
            <div className="slider-container">
                <FormLabel className="flex-row">
                    <div>
                        <span>V</span>
                        <span className="subscript">LDO</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            value={internalVLdo}
                            range={{
                                min: 1,
                                max: 3.3,
                                decimals: 1,
                                step: 0.1,
                            }}
                            onChange={value => setInternaVLdo(value)}
                            onChangeComplete={() => onVLdoChange(internalVLdo)}
                        />
                        <span>V</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[internalVLdo]}
                    onChange={[value => setInternaVLdo(value)]}
                    onChangeComplete={() => onVLdoChange(internalVLdo)}
                    range={{
                        min: 1.0,
                        max: 3.3,
                        decimals: 1,
                        step: 0.1,
                    }}
                />
            </div>
        </Card>
    );
};

export default LDOCard;
