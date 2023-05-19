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

import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    Ldo,
    LdoMode,
    NpmDevice,
} from '../../../features/pmicControl/npm/types';

interface LdoCardProperties {
    index: number;
    npmDevice: NpmDevice;
    ldo: Ldo;
    cardLabel?: string;
    disabled: boolean;
}

export default ({
    index,
    npmDevice,
    ldo,
    cardLabel = `Load Switch/LDO ${index + 1}`,
    disabled,
}: LdoCardProperties) => {
    const card = `ldo ${index + 1}`;
    const range = npmDevice.getLdoVoltageRange(index);

    const onEnable = (value: boolean) => npmDevice.setLdoEnabled(index, value);

    const onModeChange = (mode: LdoMode) => npmDevice.setLdoMode(index, mode);

    const onVoltageChange = (value: number) =>
        npmDevice.setLdoVoltage(index, value);

    const [internalVLdo, setInternalVLdo] = useState(ldo?.voltage ?? 0);

    const modeItems = ['LDO', 'Load Switch'];

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
                    <DocumentationTooltip card={card} title="Load Switch/LDO">
                        <span>{cardLabel}</span>
                    </DocumentationTooltip>

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
                disabled={disabled}
                items={modeItems}
                onSelect={i => onModeChange(i === 0 ? 'LDO' : 'ldoSwitch')}
                selectedItem={
                    ldo.mode === 'ldoSwitch' ? modeItems[1] : modeItems[0]
                }
            />

            <div className={`slider-container ${disabled ? 'disabled' : ''}`}>
                <FormLabel className="flex-row">
                    <DocumentationTooltip
                        card={card}
                        title="VOUTLDO"
                        titleNode={
                            <>
                                <span>V</span>
                                <span className="subscript">OUT_LDO</span>
                            </>
                        }
                    >
                        <div>
                            <span>V</span>
                            <span className="subscript">OUT_LDO</span>
                        </div>
                    </DocumentationTooltip>

                    <div className="flex-row">
                        <NumberInlineInput
                            disabled={disabled}
                            value={internalVLdo}
                            range={range}
                            onChange={value => setInternalVLdo(value)}
                            onChangeComplete={() =>
                                onVoltageChange(internalVLdo)
                            }
                        />
                        <span>V</span>
                    </div>
                </FormLabel>
                <Slider
                    disabled={disabled}
                    values={[internalVLdo]}
                    onChange={[value => setInternalVLdo(value)]}
                    onChangeComplete={() => onVoltageChange(internalVLdo)}
                    range={range}
                />
            </div>
        </Card>
    ) : null;
};
