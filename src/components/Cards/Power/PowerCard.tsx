/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import {
    Card,
    Dropdown,
    NumberInlineInput,
    Slider,
    Toggle,
} from 'pc-nrfconnect-shared';
import {
    Range,
    Values,
} from 'pc-nrfconnect-shared/typings/generated/src/Slider/range';

import {
    Charger,
    ITerm,
    ITermValues,
    NpmDevice,
    VTrickleFast,
    VTrickleFastValues,
} from '../../../features/pmicControl/npm/types';

interface PowerCardProperties {
    index: number;
    npmDevice?: NpmDevice;
    charger?: Charger;
    cardLabel?: string;
    disabled: boolean;
    summary?: boolean;
}

export default ({
    index,
    npmDevice,
    charger,
    cardLabel = `Charging ${index + 1}`,
    disabled,
    summary = false,
}: PowerCardProperties) => {
    const currentRange = npmDevice?.getChargerCurrentRange(index);
    const currentVoltage = npmDevice?.getChargerVoltageRange(index) as Values;

    const onVTermChange = (value: number) =>
        npmDevice?.setChargerVTerm(index, value);

    const onEnableChargingToggle = (value: boolean) =>
        npmDevice?.setChargerEnabled(index, value);

    const onIChgChange = (value: number) =>
        npmDevice?.setChargerIChg(index, value);

    const [internalVTerm, setInternalVTerm] = useState(charger?.vTerm ?? 0);
    const [internalIChg, setInternalIChg] = useState(charger?.iChg ?? 0);

    useEffect(() => {
        if (charger) {
            setInternalVTerm(charger.vTerm);
            setInternalIChg(charger.iChg);
        }
    }, [charger]);

    const vTrickleFastItems = [...VTrickleFastValues].map(item => ({
        label: `${item}`,
        value: `${item}`,
    }));

    const iTermItems = [...ITermValues].map(item => ({
        label: item,
        value: item,
    }));

    return charger ? (
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
                        isToggled={charger.enabled}
                        onToggle={onEnableChargingToggle}
                        disabled={disabled}
                    />
                </div>
            }
        >
            <div className={`slider-container ${disabled ? 'disabled' : ''}`}>
                <FormLabel className="flex-row">
                    <div>
                        <span>V</span>
                        <span className="subscript">TERM</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            value={internalVTerm}
                            range={currentVoltage}
                            onChange={value => setInternalVTerm(value)}
                            onChangeComplete={() =>
                                onVTermChange(internalVTerm)
                            }
                            disabled={disabled}
                        />
                        <span>V</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[currentVoltage.indexOf(internalVTerm)]}
                    onChange={[i => setInternalVTerm(currentVoltage[i])]}
                    onChangeComplete={() => onVTermChange(internalVTerm)}
                    range={{
                        min: 0,
                        max: currentVoltage.length - 1,
                    }}
                    disabled={disabled}
                />
            </div>
            <div className={`slider-container ${disabled ? 'disabled' : ''}`}>
                <FormLabel className="flex-row">
                    <div>
                        <span>I</span>
                        <span className="subscript">CHG</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            value={internalIChg}
                            range={currentRange as Range}
                            onChange={value => setInternalIChg(value)}
                            onChangeComplete={() => onIChgChange(internalIChg)}
                            disabled={disabled}
                        />
                        <span>mA</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[internalIChg]}
                    onChange={[value => setInternalIChg(value)]}
                    onChangeComplete={() => onIChgChange(internalIChg)}
                    range={currentRange as Range}
                    disabled={disabled}
                />
            </div>
            {!summary && (
                <>
                    <Dropdown
                        label="iTerm"
                        items={iTermItems}
                        onSelect={item =>
                            npmDevice?.setChargerITerm(
                                index,
                                item.value as ITerm
                            )
                        }
                        selectedItem={
                            iTermItems[
                                Math.min(
                                    0,
                                    iTermItems.findIndex(
                                        item => item.value === charger.iTerm
                                    )
                                ) ?? 0
                            ]
                        }
                        disabled={disabled}
                    />
                    <Dropdown
                        label="V Trickle Fast"
                        items={vTrickleFastItems}
                        onSelect={item =>
                            npmDevice?.setChargerVTrickleFast(
                                index,
                                Number.parseFloat(item.value) as VTrickleFast
                            )
                        }
                        selectedItem={
                            vTrickleFastItems[
                                Math.min(
                                    0,
                                    vTrickleFastItems.findIndex(
                                        item =>
                                            Number.parseFloat(item.value) ===
                                            charger.vTrickleFast
                                    )
                                ) ?? 0
                            ]
                        }
                        disabled={disabled}
                    />
                    <Toggle
                        label="Enable Recharging"
                        isToggled={charger.enableRecharging}
                        onToggle={() => {}}
                        disabled={disabled}
                    />
                </>
            )}
        </Card>
    ) : null;
};
