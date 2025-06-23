/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    Card,
    NumberInput,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    OnBoardLoad,
    OnBoardLoadModule,
} from '../../../features/pmicControl/npm/types';

export default ({
    onBoardLoad,
    onBoardLoadModule,
    cardLabel = 'On-Board Load',
    disabled,
}: {
    onBoardLoad: OnBoardLoad;
    onBoardLoadModule: OnBoardLoadModule;
    cardLabel?: string;
    disabled: boolean;
}) => {
    const range = onBoardLoadModule.ranges.iLoad;
    const card = `OnBoardLoad`;

    const [internalILoad, setInternalILoad] = useState(onBoardLoad.iLoad);

    // NumberInputSliderWithUnit do not use boost.<prop> as value as we send only at on change complete
    useEffect(() => {
        setInternalILoad(onBoardLoad.iLoad);
    }, [onBoardLoad]);

    return onBoardLoad ? (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card={card} item="iLoad">
                        <span>{cardLabel}</span>
                    </DocumentationTooltip>
                    <div className="d-flex">
                        <Toggle
                            label="Enabled"
                            isToggled={onBoardLoad.iLoad > 0}
                            disabled
                        />
                    </div>
                </div>
            }
        >
            <NumberInput
                label={
                    <DocumentationTooltip card={card} item="iLoad">
                        <div>
                            <span>I</span>
                            <span className="subscript">LOAD</span>
                        </div>
                    </DocumentationTooltip>
                }
                unit="mA"
                disabled={disabled}
                range={range}
                value={internalILoad}
                onChange={setInternalILoad}
                onChangeComplete={value => onBoardLoadModule.set.iLoad(value)}
                showSlider
            />
        </Card>
    ) : null;
};
