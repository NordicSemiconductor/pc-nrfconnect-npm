/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo, useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import {
    Card,
    Dropdown,
    DropdownItem,
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
    summary?: boolean;
    disabled: boolean;
}

export default ({
    npmDevice,
    index,
    buck,
    cardLabel = `BUCK ${index + 1}`,
    disabled,
    summary = false,
}: BuckCardProperties) => {
    const onVOutChange = (value: number) =>
        npmDevice?.setBuckVOut(index, value);

    const onRetVOutChange = (value: number) => {
        // TODO
    };

    const onModeToggle = (mode: BuckMode) =>
        npmDevice?.setBuckMode(index, mode);

    const onBuckToggle = (value: boolean) =>
        npmDevice?.setBuckEnabled(index, value);

    const voltageRange = npmDevice?.getBuckVoltageRange(index);
    const retVOutRange = npmDevice?.getBuckRetVOutRange(index);
    const numberOfGPIOs = npmDevice?.getNumberOfGPIOs() ?? 0;

    const gpioNames: string[] = [];

    for (let i = 0; i < numberOfGPIOs; i += 1) {
        gpioNames.push(`GPIO${i}`);
    }

    const modeControlItems = ['Auto', 'PWM', 'PFM', ...gpioNames].map(item => ({
        label: item,
        value: item,
    }));

    const buckOnOffControlItems = ['Off', ...gpioNames].map(item => ({
        label: item,
        value: item,
    }));

    const buckRetentionControlItems = ['Off', ...gpioNames].map(item => ({
        label: item,
        value: item,
    }));

    const vSetItems = ['Software', 'Vset'];

    const [internalVOut, setInternalVOut] = useState(buck?.vOut ?? 0);
    const [internalRetVOut, setInternalRetVOut] = useState(1); // TODO

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
                            range={voltageRange as RangeType}
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
                    range={voltageRange as RangeType}
                    disabled={disabled}
                />
            </div>
            {!summary && (
                <>
                    <Dropdown
                        label="Buck Mode Control"
                        items={modeControlItems}
                        onSelect={() => {
                            // TODO;
                        }}
                        selectedItem={modeControlItems[0]}
                        disabled={disabled}
                    />
                    <Dropdown
                        label="On/Off Control"
                        items={buckOnOffControlItems}
                        onSelect={() => {
                            // TODO;
                        }}
                        selectedItem={buckOnOffControlItems[0]}
                        disabled={disabled}
                    />
                    <Dropdown
                        label="Retention control"
                        items={buckRetentionControlItems}
                        onSelect={() => {
                            // TODO;
                        }}
                        selectedItem={buckRetentionControlItems[0]}
                        disabled={disabled}
                    />
                    <div
                        className={`slider-container ${
                            disabled ? 'disabled' : ''
                        }`}
                    >
                        <FormLabel className="flex-row">
                            <div>
                                <span>RET</span>
                                <span className="subscript">VOUT1</span>
                            </div>
                            <div className="flex-row">
                                <NumberInlineInput
                                    value={internalRetVOut}
                                    range={retVOutRange as RangeType}
                                    onChange={value =>
                                        setInternalRetVOut(value)
                                    }
                                    onChangeComplete={() =>
                                        onRetVOutChange(internalRetVOut)
                                    }
                                    disabled={disabled}
                                />
                                <span>V</span>
                            </div>
                        </FormLabel>
                        <Slider
                            values={[internalRetVOut]}
                            onChange={[value => setInternalRetVOut(value)]}
                            onChangeComplete={() =>
                                onRetVOutChange(internalRetVOut)
                            }
                            range={retVOutRange as RangeType}
                            disabled={disabled}
                        />
                    </div>
                </>
            )}
        </Card>
    ) : null;
};
