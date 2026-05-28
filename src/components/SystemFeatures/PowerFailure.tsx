/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    Card,
    classNames,
    Dropdown,
    NumberInput,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    type POF,
    type PofModule,
    type POFPolarity,
} from '../../features/pmicControl/npm/types';

interface PofProperties {
    pofModule: PofModule;
    pof: POF;
    disabled: boolean;
}

export default ({ pofModule, pof, disabled }: PofProperties) => {
    const [internalResetThreshold, setInternalResetThreshold] = useState(
        pof.resetThreshold,
    );
    const [internalWarnThreshold, setInternalWarnThreshold] = useState(
        pof.warnThreshold,
    );

    // NumberInputSliderWithUnit do not use pof.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalResetThreshold(pof.resetThreshold);
        setInternalWarnThreshold(pof.warnThreshold);
    }, [pof]);

    const card = 'powerFailure';

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card={card} item="PowerFailure">
                        Power Failure
                    </DocumentationTooltip>

                    {pof.enabled !== undefined && (
                        <div className="d-flex">
                            <Toggle
                                label="POF Enabled"
                                onToggle={v => pofModule.set.enabled?.(v)}
                                disabled={disabled}
                                isToggled={pof.enabled}
                            />
                        </div>
                    )}
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
                range={pofModule.ranges.resetThreshold}
                value={internalResetThreshold}
                onChange={setInternalResetThreshold}
                onChangeComplete={v => pofModule.set.resetThreshold(v)}
            />
            {internalWarnThreshold !== undefined &&
                pofModule.ranges.warnThreshold && (
                    <NumberInput
                        showSlider
                        label={
                            <DocumentationTooltip card={card} item="VSYSWARN">
                                <>
                                    VSYS
                                    <span className="subscript">WARN</span>
                                </>
                            </DocumentationTooltip>
                        }
                        unit="V"
                        disabled={disabled}
                        range={pofModule.ranges.warnThreshold}
                        value={internalWarnThreshold}
                        onChange={setInternalWarnThreshold}
                        onChangeComplete={v => pofModule.set.warnThreshold?.(v)}
                    />
                )}
            {pofModule.values.polarity && pof.polarity !== undefined && (
                <Dropdown
                    label={
                        <DocumentationTooltip card={card} item="POFPolarity">
                            POF Polarity
                        </DocumentationTooltip>
                    }
                    items={pofModule.values.polarity}
                    onSelect={item =>
                        pofModule.set.polarity?.(item.value as POFPolarity)
                    }
                    selectedItem={
                        pofModule.values.polarity.find(
                            item => item.value === pof.polarity,
                        ) ?? { label: 'N/A', value: 'N/A' }
                    }
                    disabled={disabled}
                />
            )}
            {pof.warnActive !== undefined && (
                <div className="tw-flex tw-flex-row tw-gap-4">
                    <DocumentationTooltip card={card} item="POFWarnActive">
                        <div className="tw-text-xs">
                            VSYS<span className="subscript">WARN</span>
                        </div>
                    </DocumentationTooltip>
                    <div
                        className={`tw-h-4 tw-w-4 tw-rounded-full tw-border tw-border-solid tw-border-gray-200 ${classNames(
                            pof.warnActive ? 'tw-bg-red' : 'tw-bg-green',
                        )}`}
                    />
                </div>
            )}
        </Card>
    );
};
