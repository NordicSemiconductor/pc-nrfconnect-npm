/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import {
    Card,
    NumberInlineInput,
    Slider,
    StateSelector,
    Toggle,
} from 'pc-nrfconnect-shared';

import {
    Ldo,
    LdoMode,
    NpmDevice,
} from '../../../features/pmicControl/npm/types';
import { RangeType } from '../../../utils/helpers';

interface LdoCardProperties {
    index: number;
    npmDevice?: NpmDevice;
    ldo: Ldo;
    cardLabel?: string;
    disabled: boolean;
}

export default ({
    index,
    npmDevice,
    ldo,
    cardLabel = `LDO/Load Switch ${index + 1}`,
    disabled,
}: LdoCardProperties) => {
    const range = npmDevice?.getLdoVoltageRange(index);

    const onEnable = (value: boolean) => npmDevice?.setLdoEnabled(index, value);

    const onModeChange = (mode: LdoMode) => npmDevice?.setLdoMode(index, mode);

    const onVoltageChange = (value: number) =>
        npmDevice?.setLdoVoltage(index, value);

    const [internalVLdo, setInternalVLdo] = useState(ldo?.voltage ?? 0);

    const modeItems = ['Load Switch', 'LDO'];

    useEffect(() => {
        if (ldo) setInternalVLdo(ldo.voltage);
    }, [ldo]);

    return ldo ? (
        <Card
            title={
                <div
                    className={`d-flex justify-content-between ${
                        disabled ? 'disabled' : ''
                    }`}
                >
                    <span>{cardLabel}</span>
                    <Toggle
                        label="Enable"
                        isToggled={ldo.enabled}
                        onToggle={value => onEnable(value)}
                        disabled={disabled}
                    />
                </div>
            }
        >
            <StateSelector
                disabled
                items={modeItems}
                onSelect={i => onModeChange(i === 0 ? 'ldoSwitch' : 'LDO')}
                selectedItem={
                    ldo.mode === 'ldoSwitch' ? modeItems[0] : modeItems[1]
                }
            />
            <div className="slider-container">
                <FormLabel className="flex-row">
                    <div className="disabled">
                        <span>V</span>
                        <span className="subscript">LDO</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            disabled
                            value={internalVLdo}
                            range={range as RangeType}
                            onChange={value => setInternalVLdo(value)}
                            onChangeComplete={() =>
                                onVoltageChange(internalVLdo)
                            }
                        />
                        <span className="disabled">V</span>
                    </div>
                </FormLabel>
                <Slider
                    disabled
                    values={[internalVLdo]}
                    onChange={[value => setInternalVLdo(value)]}
                    onChangeComplete={() => onVoltageChange(internalVLdo)}
                    range={range as RangeType}
                />
            </div>
        </Card>
    ) : null;
};
