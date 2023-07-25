/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    Card,
    NumberInputSliderWithUnit,
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
    const card = `ldo${index + 1}`;
    const range = npmDevice.getLdoVoltageRange(index);

    const onEnable = (value: boolean) => npmDevice.setLdoEnabled(index, value);

    const onModeChange = (mode: LdoMode) => npmDevice.setLdoMode(index, mode);

    const onVoltageChange = (value: number) =>
        npmDevice.setLdoVoltage(index, value);

    const [internalVLdo, setInternalVLdo] = useState(ldo.voltage);

    const modeItems = ['LDO', 'Load Switch'];

    // NumberInputSliderWithUnit do not use ldo.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalVLdo(ldo.voltage);
    }, [ldo]);

    return ldo ? (
        <Card
            title={
                <div
                    className={`d-flex justify-content-between ${
                        disabled ? 'disabled' : ''
                    }`}
                >
                    <DocumentationTooltip card={card} item="LoadSwitchLDO">
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

            <NumberInputSliderWithUnit
                label={
                    <DocumentationTooltip card={card} item="VOUTLDO">
                        <div>
                            <span>V</span>
                            <span className="subscript">{`OUTLDO${
                                index + 1
                            }`}</span>
                        </div>
                    </DocumentationTooltip>
                }
                unit="V"
                disabled={disabled}
                range={range}
                value={internalVLdo}
                onChange={setInternalVLdo}
                onChangeComplete={onVoltageChange}
            />
        </Card>
    ) : null;
};
