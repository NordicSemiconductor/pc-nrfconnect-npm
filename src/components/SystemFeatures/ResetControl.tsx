/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Card, Dropdown } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    LongPressReset,
    LongPressResetValues,
    ResetConfig,
    ResetModule,
} from '../../features/pmicControl/npm/types';

const LongPressResetItems = LongPressResetValues.map(item => ({
    label: `${item}`.replaceAll('_', ' '),
    value: `${item}`,
}));

const card = 'resetControl';

export default ({
    resetModule,
    reset,
    disabled,
}: {
    resetModule: ResetModule;
    reset: ResetConfig;
    disabled: boolean;
}) => (
    <Card
        title={<div className="tw-flex tw-justify-between">Reset control</div>}
    >
        <Dropdown
            label={
                <DocumentationTooltip card={card} item="LongPressReset">
                    Long Press Reset
                </DocumentationTooltip>
            }
            items={LongPressResetItems}
            onSelect={item =>
                resetModule.set.longPressReset(item.value as LongPressReset)
            }
            selectedItem={
                LongPressResetItems[
                    Math.max(
                        0,
                        LongPressResetItems.findIndex(
                            item => item.value === reset.longPressReset
                        )
                    ) ?? 0
                ]
            }
            disabled={disabled}
        />
    </Card>
);
