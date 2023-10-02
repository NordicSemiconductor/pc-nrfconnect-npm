/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    Card,
    Dropdown,
    NumberInputSliderWithUnit,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    NpmDevice,
    POF,
    POFPolarity,
    POFPolarityValues,
} from '../../features/pmicControl/npm/types';

interface GPIOProperties {
    npmDevice: NpmDevice;
    pof: POF;
    disabled: boolean;
}

const pofPolarityValuesItems = POFPolarityValues.map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

export default ({ npmDevice, pof, disabled }: GPIOProperties) => {
    const [internalPOFThreshold, setInternalPOFThreshold] = useState(
        pof.threshold
    );

    // NumberInputSliderWithUnit do not use pof.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalPOFThreshold(pof.threshold);
    }, [pof]);

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <span>Power Failure</span>
                </div>
            }
        >
            <Toggle
                label="POF Enabled"
                onToggle={npmDevice.setPOFEnabled}
                disabled={disabled}
                isToggled={pof.enable}
            />
            <NumberInputSliderWithUnit
                label={
                    <div>
                        <span>VSYS</span>
                        <span className="subscript">POF</span>
                    </div>
                }
                unit="V"
                disabled={disabled}
                range={npmDevice.getPOFThresholdRange()}
                value={internalPOFThreshold}
                onChange={setInternalPOFThreshold}
                onChangeComplete={npmDevice.setPOFThreshold}
            />
            <Dropdown
                label="POF Polarity"
                items={pofPolarityValuesItems}
                onSelect={item =>
                    npmDevice.setPOFPolarity(item.value as POFPolarity)
                }
                selectedItem={
                    pofPolarityValuesItems[
                        Math.max(
                            0,
                            pofPolarityValuesItems.findIndex(
                                item => item.value === pof.polarity
                            )
                        ) ?? 0
                    ]
                }
                disabled={disabled}
            />
        </Card>
    );
};
