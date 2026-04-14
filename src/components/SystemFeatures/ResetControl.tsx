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
    type LongPressResetDebounce,
    type LongPressResetPinSel,
    type ResetConfig,
    type ResetModule,
} from '../../features/pmicControl/npm/types';

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
        {resetModule.set.longPressResetPinSel && (
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="LongPressReset">
                        Long Press Reset
                    </DocumentationTooltip>
                }
                items={resetModule.values.longPressResetPinSel}
                onSelect={item =>
                    resetModule.set.longPressResetPinSel?.(
                        item.value as LongPressResetPinSel,
                    )
                }
                selectedItem={
                    resetModule.values.longPressResetPinSel.find(
                        item => item.value === reset.longPressResetPinSel,
                    ) ?? resetModule.values.longPressResetPinSel[0]
                }
                disabled={disabled}
            />
        )}

        {resetModule.set.longPressResetEnable && (
            <Toggle
                label={
                    <DocumentationTooltip
                        card={card}
                        item="LongPressResetEnable"
                    >
                        Long Press Reset
                    </DocumentationTooltip>
                }
                isToggled={reset.longPressResetEnable === true}
                onToggle={value =>
                    resetModule.set.longPressResetEnable?.(value)
                }
                disabled={disabled}
            />
        )}

        {resetModule.values.longPressResetDebounce &&
            resetModule.set.longPressResetDebounce && (
                <Dropdown
                    label={
                        <DocumentationTooltip
                            card={card}
                            item="LongPressResetDebounce"
                        >
                            <div>
                                <span>t</span>
                                <span className="subscript">RESETBUT</span>
                            </div>
                        </DocumentationTooltip>
                    }
                    items={resetModule.values.longPressResetDebounce}
                    onSelect={item =>
                        resetModule.set.longPressResetDebounce?.(
                            item.value as LongPressResetDebounce,
                        )
                    }
                    selectedItem={
                        resetModule.values.longPressResetDebounce.find(
                            item => item.value === reset.longPressResetDebounce,
                        ) ?? resetModule.values.longPressResetDebounce[0]
                    }
                    disabled={disabled || reset.longPressResetPinSel === 'OFF'}
                />
            )}

        {resetModule.actions.powerCycle && (
            <DocumentationTooltip card={card} item="PowerCycle">
                <Button
                    variant="secondary"
                    className="tw-w-full"
                    onClick={() => {
                        resetModule.actions.powerCycle?.();
                    }}
                    disabled={disabled}
                >
                    Power Cycle
                </Button>
            </DocumentationTooltip>
        )}

        {'resetReason' in reset && reset.resetReason?.reason && (
            <div className="tw-flex tw-flex-row tw-justify-between tw-border-0 tw-border-b tw-border-solid">
                <DocumentationTooltip card={card} item="ResetCause">
                    <span>Reset Cause</span>
                </DocumentationTooltip>
                <span>
                    {ResetReasons.get(reset.resetReason?.reason || 'Unknown') ||
                        reset.resetReason?.reason}
                </span>
            </div>
        )}
    </Card>
);
