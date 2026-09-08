/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    Card,
    classNames,
    Dropdown,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    type SysReg,
    type SysRegModule,
} from '../../features/pmicControl/npm/types';

interface SysRegProperties {
    config: SysReg;
    disabled: boolean;
    module: SysRegModule;
}

export default ({ config, disabled, module }: SysRegProperties) => {
    const card = 'SysReg';

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between tw-gap-1">
                    System Regulator
                </div>
            }
        >
            <Dropdown
                label={
                    <DocumentationTooltip
                        card={card}
                        item="VBusInputCurrentLimit"
                    >
                        VBUS Input Current Limit
                    </DocumentationTooltip>
                }
                items={module.values.vBusILim}
                onSelect={item => module.set.vBusILim(item.value)}
                selectedItem={
                    module.values.vBusILim.find(
                        item => item.value === config.vBusILim,
                    ) ?? module.values.vBusILim[0]
                }
                disabled={disabled}
            />
            <Dropdown
                label={
                    <DocumentationTooltip card={card} item="VBusDpm">
                        <>
                            VBUS
                            <span className="subscript">DPM</span>
                        </>
                    </DocumentationTooltip>
                }
                items={module.values.vBusDpm}
                onSelect={item => module.set.vBusDpm(item.value)}
                selectedItem={
                    module.values.vBusDpm.find(
                        item => item.value === config.vBusDpm,
                    ) ?? module.values.vBusDpm[0]
                }
                disabled={disabled}
            />
            <div className="tw-flex tw-flex-row tw-gap-4">
                <DocumentationTooltip card={card} item="VBusPresent">
                    <div className="tw-text-xs">VBUS Present</div>
                </DocumentationTooltip>
                <div
                    className={`tw-h-4 tw-w-4 tw-rounded-full tw-border tw-border-solid tw-border-gray-200 ${classNames(
                        config.vBusPresent ? 'tw-bg-green' : 'tw-bg-red',
                    )}`}
                />
            </div>
            <div className="tw-flex tw-flex-row tw-gap-4">
                <DocumentationTooltip card={card} item="VBusGood">
                    <div className="tw-text-xs">VBUS Good</div>
                </DocumentationTooltip>
                <div
                    className={`tw-h-4 tw-w-4 tw-rounded-full tw-border tw-border-solid tw-border-gray-200 ${classNames(
                        config.vBusGood ? 'tw-bg-green' : 'tw-bg-red',
                    )}`}
                />
            </div>
        </Card>
    );
};
