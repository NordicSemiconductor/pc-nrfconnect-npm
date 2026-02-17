/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import {
    Card,
    classNames,
    Dropdown,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    LoadSwitch,
    LoadSwitchModule,
    LoadSwitchOnOffControl,
} from '../../../features/pmicControl/npm/types';

interface LoadSwitchCardProperties {
    loadSwitch: LoadSwitch;
    loadSwitchModule: LoadSwitchModule;
    disabled: boolean;
    defaultSummary?: boolean;
}

export default ({
    loadSwitch,
    loadSwitchModule,
    defaultSummary = false,
    disabled,
}: LoadSwitchCardProperties) => {
    const [summary, setSummary] = useState(defaultSummary);

    const card = `loadSwitch${loadSwitchModule.index + 1}`;

    return loadSwitch ? (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card={card} item="LoadSwitch">
                        <span>{loadSwitch.cardLabel}</span>
                    </DocumentationTooltip>

                    <div className="d-flex">
                        <Toggle
                            label="Enable"
                            isToggled={loadSwitch.enable}
                            onToggle={value =>
                                loadSwitchModule.set.enable(value)
                            }
                            disabled={disabled}
                        />
                        <span
                            className={classNames(
                                'show-more-toggle mdi',
                                summary && 'mdi-chevron-down',
                                !summary && 'mdi-chevron-up',
                            )}
                            role="button"
                            tabIndex={0}
                            onKeyUp={() => {}}
                            onClick={() => {
                                setSummary(!summary);
                            }}
                        />
                    </div>
                </div>
            }
        >
            {!summary && (
                <>
                    <Dropdown
                        label="On/Off Control"
                        items={loadSwitchModule.values.onOffControl}
                        onSelect={item => {
                            loadSwitchModule.set.onOffControl?.(
                                item.value as LoadSwitchOnOffControl,
                            );
                        }}
                        selectedItem={
                            loadSwitchModule.values.onOffControl.find(
                                item => item.value === loadSwitch.onOffControl,
                            ) ?? loadSwitchModule.values.onOffControl[0]
                        }
                        disabled={disabled}
                    />

                    <Dropdown
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="SoftStartCurrentLimit"
                            >
                                Soft Start Current Limit
                            </DocumentationTooltip>
                        }
                        items={loadSwitchModule.values.softStartCurrentLimit}
                        onSelect={item =>
                            loadSwitchModule.set.softStartCurrentLimit?.(
                                item.value,
                            )
                        }
                        selectedItem={
                            loadSwitchModule.values.softStartCurrentLimit.find(
                                item =>
                                    item.value ===
                                    loadSwitch.softStartCurrentLimit,
                            ) ??
                            loadSwitchModule.values.softStartCurrentLimit[0]
                        }
                        disabled={disabled}
                    />

                    <Dropdown
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="SoftStartTime"
                            >
                                Soft Start Time
                            </DocumentationTooltip>
                        }
                        items={loadSwitchModule.values.softStartTime}
                        onSelect={item =>
                            loadSwitchModule.set.softStartTime?.(item.value)
                        }
                        selectedItem={
                            loadSwitchModule.values.softStartTime.find(
                                item => item.value === loadSwitch.softStartTime,
                            ) ?? loadSwitchModule.values.softStartTime[0]
                        }
                        disabled={disabled}
                    />

                    <Toggle
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="overCurrentProtection"
                            >
                                Enable Overcurrent Protection
                            </DocumentationTooltip>
                        }
                        isToggled={loadSwitch.overCurrentProtection === true}
                        onToggle={value =>
                            loadSwitchModule.set.overCurrentProtection?.(value)
                        }
                        disabled={disabled}
                    />

                    <Toggle
                        label={
                            <DocumentationTooltip
                                card={card}
                                item="ActiveDischarge"
                            >
                                Enable Active Discharge
                            </DocumentationTooltip>
                        }
                        isToggled={loadSwitch.activeDischarge}
                        onToggle={value => {
                            loadSwitchModule.set.activeDischarge?.(value);
                        }}
                        disabled={disabled}
                    />
                </>
            )}
        </Card>
    ) : null;
};
