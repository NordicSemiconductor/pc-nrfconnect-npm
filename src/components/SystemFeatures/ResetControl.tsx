/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    Button,
    Card,
    Dropdown,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import { ResetReasons } from '../../features/pmicControl/npm/npm2100/reset';
import {
    npm2100LongPressResetDebounce,
    npm2100LongPressResetDebounceValues,
    npm2100ResetPinSelection,
} from '../../features/pmicControl/npm/npm2100/types';
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

const LongPressResetDebounceItems = npm2100LongPressResetDebounceValues.map(
    item => ({
        label: `${item}`,
        value: `${item}`,
    })
);

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
        {'longPressReset' in reset && resetModule.set.longPressReset && (
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="LongPressReset">
                        Long Press Reset
                    </DocumentationTooltip>
                }
                items={LongPressResetItems}
                onSelect={item =>
                    resetModule.set.longPressReset?.(
                        item.value as LongPressReset
                    )
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
        )}

        {'resetPinSelection' in reset && resetModule.set.selectResetPin && (
            <Dropdown
                label={
                    <DocumentationTooltip
                        card={card}
                        item="LongPressResetSelectPin"
                    >
                        Reset Pin Selection
                    </DocumentationTooltip>
                }
                items={resetModule.values.pinSelection}
                onSelect={item =>
                    resetModule.set.selectResetPin?.(
                        item.value as npm2100ResetPinSelection
                    )
                }
                selectedItem={
                    resetModule.values.pinSelection.find(
                        item => item.value === reset.resetPinSelection
                    ) ?? resetModule.values.pinSelection[0]
                }
                disabled={disabled}
            />
        )}

        {'longPressResetEnable' in reset &&
            resetModule.set.longPressResetEnable && (
                <Toggle
                    label={
                        <DocumentationTooltip
                            card={card}
                            item="LongPressResetEnable"
                        >
                            Enable
                        </DocumentationTooltip>
                    }
                    isToggled={reset.longPressResetEnable === true}
                    onToggle={value =>
                        resetModule.set.longPressResetEnable?.(value)
                    }
                    disabled={disabled}
                />
            )}

        {'longPressResetDebounce' in reset &&
            resetModule.set.longPressResetDebounce && (
                <Dropdown
                    label={
                        <DocumentationTooltip
                            card={card}
                            item="LongPressResetDebounce"
                        >
                            Long Press Reset Debounce
                        </DocumentationTooltip>
                    }
                    items={LongPressResetDebounceItems}
                    onSelect={item =>
                        resetModule.set.longPressResetDebounce?.(
                            item.value as npm2100LongPressResetDebounce
                        )
                    }
                    selectedItem={
                        LongPressResetDebounceItems[
                            Math.max(
                                0,
                                LongPressResetDebounceItems.findIndex(
                                    item =>
                                        item.value ===
                                        reset.longPressResetDebounce
                                )
                            ) ?? 0
                        ]
                    }
                    disabled={disabled}
                />
            )}

        {resetModule.set.powerCycle && (
            <DocumentationTooltip card={card} item="PowerCycle">
                <Button
                    variant="secondary"
                    className="tw-w-full"
                    onClick={() => {
                        resetModule.set.powerCycle?.();
                    }}
                    disabled={disabled}
                >
                    Power Cycle
                </Button>
            </DocumentationTooltip>
        )}

        {'resetReason' in reset && reset.resetReason?.reason && (
            <div className="tw-flex tw-flex-row tw-justify-between tw-border-0 tw-border-b tw-border-solid">
                <span>Reset Cause</span>
                <span>
                    {ResetReasons.get(reset.resetReason?.reason || 'Unknown') ||
                        reset.resetReason?.reason}
                </span>
            </div>
        )}
    </Card>
);
