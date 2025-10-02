/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    Card,
    Dropdown,
    NumberInput,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    POF,
    PofModule,
    POFPolarity,
    POFPolarityValues,
} from '../../features/pmicControl/npm/types';

interface GPIOProperties {
    pofModule: PofModule;
    pof: POF;
    disabled: boolean;
}

const pofPolarityValuesItems = POFPolarityValues.map(item => ({
    label: `${item}`,
    value: `${item}`,
}));

export default ({ pofModule, pof, disabled }: GPIOProperties) => {
    const [internalPOFThreshold, setInternalPOFThreshold] = useState(
        pof.threshold,
    );

    // NumberInputSliderWithUnit do not use pof.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalPOFThreshold(pof.threshold);
    }, [pof]);

    const card = 'powerFailure';

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card={card} item="PowerFailure">
                        Power Failure
                    </DocumentationTooltip>

                    <div className="d-flex">
                        <Toggle
                            label="POF Enabled"
                            onToggle={v => pofModule.set.enabled(v)}
                            disabled={disabled}
                            isToggled={pof.enable}
                        />
                    </div>
                </div>
            }
        >
            <NumberInput
                showSlider
                label={
                    <DocumentationTooltip card={card} item="VSYSPOF">
                        <>
                            VSYS
                            <span className="subscript">POF</span>
                        </>
                    </DocumentationTooltip>
                }
                unit="V"
                disabled={disabled}
                range={pofModule.ranges.threshold}
                value={internalPOFThreshold}
                onChange={setInternalPOFThreshold}
                onChangeComplete={v => pofModule.set.threshold(v)}
            />
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="POFPolarity">
                        POF Polarity
                    </DocumentationTooltip>
                }
                items={pofPolarityValuesItems}
                onSelect={item =>
                    pofModule.set.polarity(item.value as POFPolarity)
                }
                selectedItem={
                    pofPolarityValuesItems[
                        Math.max(
                            0,
                            pofPolarityValuesItems.findIndex(
                                item => item.value === pof.polarity,
                            ),
                        ) ?? 0
                    ]
                }
                disabled={disabled}
            />
        </Card>
    );
};
