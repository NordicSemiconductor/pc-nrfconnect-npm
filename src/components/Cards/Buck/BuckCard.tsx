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
    Buck,
    BuckMode,
    NpmDevice,
} from '../../../features/pmicControl/npm/types';
import { RangeType } from '../../../utils/helpers';

interface BuckCardProperties {
    index: number;
    npmDevice?: NpmDevice;
    buck?: Buck;
    cardLabel?: string;
    disabled: boolean;
}

export default ({
    npmDevice,
    index,
    buck,
    cardLabel = `BUCK ${index + 1}`,
    disabled,
}: BuckCardProperties) => {
    const onVOutChange = (value: number) =>
        npmDevice?.setBuckVOut(index, value);

    const onModeToggle = (mode: BuckMode) =>
        npmDevice?.setBuckMode(index, mode);

    const onBuckToggle = (value: boolean) =>
        npmDevice?.setBuckEnabled(index, value);

    const range = npmDevice?.getBuckVoltageRange(index);

    const vSetItems = ['Software', 'Vset'];

    const [internalVOut, setInternalVOut] = useState(buck?.vOut ?? 0);

    useEffect(() => {
        if (buck) setInternalVOut(buck.vOut);
    }, [buck]);

    return npmDevice && buck ? (
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
                        isToggled={buck.enabled}
                        onToggle={value => onBuckToggle(value)}
                        disabled={disabled}
                    />
                </div>
            }
        >
            <StateSelector
                items={vSetItems}
                onSelect={i => onModeToggle(i === 0 ? 'software' : 'vSet')}
                selectedItem={
                    buck.mode === 'software' ? vSetItems[0] : vSetItems[1]
                }
                disabled={disabled}
            />
            <div className={`slider-container ${disabled ? 'disabled' : ''}`}>
                <FormLabel className="flex-row">
                    <div>
                        <span>V</span>
                        <span className="subscript">OUT</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            value={internalVOut}
                            range={range as RangeType}
                            onChange={value => setInternalVOut(value)}
                            onChangeComplete={() => onVOutChange(internalVOut)}
                            disabled={disabled}
                        />
                        <span>V</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[internalVOut]}
                    onChange={[value => setInternalVOut(value)]}
                    onChangeComplete={() => onVOutChange(internalVOut)}
                    range={range as RangeType}
                    disabled={disabled}
                />
            </div>
        </Card>
    ) : null;
};
