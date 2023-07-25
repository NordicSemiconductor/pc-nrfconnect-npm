/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import {
    Card,
    NumberInputSliderWithUnit,
    StateSelector,
} from 'pc-nrfconnect-shared';

import { NpmDevice } from '../../features/pmicControl/npm/types';

interface PowerCardProperties {
    index: number;
    npmDevice: NpmDevice;
    disabled: boolean;
}

export default ({ index, npmDevice, disabled }: PowerCardProperties) => {
    const [internalVTermr, setInternalVTermr] = useState(1);

    const currentCoolItems = [
        {
            key: 'ICOOL',
            renderItem: (
                <div>
                    I<span className="subscript">COOL</span>
                </div>
            ),
        },
        {
            key: 'ICHG',
            renderItem: (
                <div>
                    I<span className="subscript">CHG</span>
                </div>
            ),
        },
    ];

    // NumberInputSliderWithUnit do not use ldo.<prop> as value as we send only at on change complete
    // useEffect(() => {
    //     setInternalVTermr(ldo.voltage);
    // }, [ldo]);

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <span>
                        T<span className="subscript">TBAT</span> Monitoring –
                        JEITA Compliance
                    </span>
                </div>
            }
        >
            <StateSelector
                items={currentCoolItems}
                onSelect={() => {}}
                selectedItem={currentCoolItems[0]}
            />
            <NumberInputSliderWithUnit
                label={
                    <div>
                        <span>V</span>
                        <span className="subscript">TERMR</span>
                    </div>
                }
                unit="V"
                value={internalVTermr}
                range={{ min: 0, max: 30 }}
                onChange={value => setInternalVTermr(value)}
                onChangeComplete={() => {
                    // TODO
                }}
                disabled={disabled}
            />
        </Card>
    );
};
