/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    Card,
    Dropdown,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    Charger,
    ChargerModule,
} from '../../../features/pmicControl/npm/types';

export default ({
    chargerModule,
    charger,
    disabled,
}: {
    chargerModule: ChargerModule;
    charger: Charger;
    disabled: boolean;
}) => (
    <Card
        title={
            <div className="tw-flex tw-justify-between">
                <DocumentationTooltip
                    card="battery"
                    item="BatteryLifeAndSafety"
                >
                    <span>Battery Life and Safety</span>
                </DocumentationTooltip>
            </div>
        }
    >
        <>
            <ChargeCurrentThrottling
                chargerModule={chargerModule}
                charger={charger}
                disabled={disabled}
            />
            {charger.enableBatteryDischargeCurrentLimit !== undefined && (
                <Toggle
                    label={
                        <DocumentationTooltip
                            card="battery"
                            item="BatteryDischargeCurrentLimit"
                        >
                            <span>Enable Battery Discharge Current Limit</span>
                        </DocumentationTooltip>
                    }
                    isToggled={charger.enableBatteryDischargeCurrentLimit}
                    disabled={disabled}
                    onToggle={enabled =>
                        chargerModule.set.enableBatteryDischargeCurrentLimit?.(
                            enabled,
                        )
                    }
                />
            )}
            <VBatLow
                chargerModule={chargerModule}
                charger={charger}
                disabled={disabled}
            />
            <TimeOut
                chargerModule={chargerModule}
                charger={charger}
                disabled={disabled}
            />
        </>
    </Card>
);

const ChargeCurrentThrottling = ({
    chargerModule,
    charger,
    disabled,
}: {
    chargerModule: ChargerModule;
    charger: Charger;
    disabled: boolean;
}) => {
    if (
        charger.enableChargeCurrentThrottling === undefined ||
        chargerModule.values.vThrottle === undefined ||
        chargerModule.values.iThrottle === undefined
    ) {
        return null;
    }

    // convert string values to react nodes
    const vThrottleValues = chargerModule.values.vThrottle.map(item => ({
        label: (
            <>
                <span>V</span>
                <span className="subscript">TERM</span> - {item.label}
            </>
        ),
        value: item.value,
    }));

    return (
        <>
            <Toggle
                label={
                    <DocumentationTooltip
                        card="battery"
                        item="ChargeCurrentThrottling"
                    >
                        <span>Enable Charge Current Throttling</span>
                    </DocumentationTooltip>
                }
                isToggled={charger.enableChargeCurrentThrottling}
                disabled={disabled}
                onToggle={enabled =>
                    chargerModule.set.enableChargeCurrentThrottling?.(enabled)
                }
            />
            <Dropdown
                label={
                    <DocumentationTooltip card="battery" item="VThrottle">
                        <>
                            <span>V</span>
                            <span className="subscript">THROTTLE</span>
                        </>
                    </DocumentationTooltip>
                }
                items={vThrottleValues}
                onSelect={item => chargerModule.set.vThrottle?.(item.value)}
                selectedItem={
                    vThrottleValues.find(
                        item => item.value === charger.vThrottle,
                    ) ?? vThrottleValues[0]
                }
                disabled={disabled}
            />
            <Dropdown
                label={
                    <DocumentationTooltip card="battery" item="IThrottle">
                        <>
                            <span>I</span>
                            <span className="subscript">THROTTLE</span>
                        </>
                    </DocumentationTooltip>
                }
                items={chargerModule.values.iThrottle}
                onSelect={item => chargerModule.set.iThrottle?.(item.value)}
                selectedItem={
                    chargerModule.values.iThrottle.find(
                        item => item.value === charger.iThrottle,
                    ) ?? chargerModule.values.iThrottle[0]
                }
                disabled={disabled}
            />
        </>
    );
};

const VBatLow = ({
    chargerModule,
    charger,
    disabled,
}: {
    chargerModule: ChargerModule;
    charger: Charger;
    disabled: boolean;
}) => {
    const enableToggle = (
        <Toggle
            label={
                <DocumentationTooltip
                    card="battery"
                    item="ChargeCurrentThrottling"
                >
                    <>
                        <span>Enable Charging Below V</span>
                        <span className="subscript">BATLOW</span>
                    </>
                </DocumentationTooltip>
            }
            isToggled={charger.enableVBatLow}
            disabled={disabled}
            onToggle={enabled => chargerModule.set.enabledVBatLow?.(enabled)}
        />
    );

    if (
        charger.vBatLow === undefined ||
        chargerModule.values.vBatLow === undefined
    ) {
        return enableToggle; // No control available for VBatLow, show only the enable toggle
    }

    return (
        <>
            {enableToggle}
            <Dropdown
                label={
                    <DocumentationTooltip card="battery" item="VBatLow">
                        <>
                            <span>V</span>
                            <span className="subscript">BATLOW</span>
                        </>
                    </DocumentationTooltip>
                }
                items={chargerModule.values.vBatLow}
                onSelect={item => chargerModule.set.vBatLow?.(item.value)}
                selectedItem={
                    chargerModule.values.vBatLow.find(
                        item => item.value === charger.vBatLow,
                    ) ?? chargerModule.values.vBatLow[0]
                }
                disabled={disabled}
            />
        </>
    );
};

const TimeOut = ({
    chargerModule,
    charger,
    disabled,
}: {
    chargerModule: ChargerModule;
    charger: Charger;
    disabled: boolean;
}) => {
    if (
        charger.tOutCharge === undefined ||
        charger.tOutTrickle === undefined ||
        chargerModule.values.tOutCharge === undefined ||
        chargerModule.values.tOutTrickle === undefined
    ) {
        return null;
    }

    return (
        <>
            <Dropdown
                label={
                    <DocumentationTooltip card="battery" item="TOutTrickle">
                        <>
                            <span>T</span>
                            <span className="subscript">OUTTRICKLE</span>
                        </>
                    </DocumentationTooltip>
                }
                items={chargerModule.values.tOutTrickle}
                onSelect={item => chargerModule.set.tOutTrickle?.(item.value)}
                selectedItem={
                    chargerModule.values.tOutTrickle.find(
                        item => item.value === charger.tOutTrickle,
                    ) ?? chargerModule.values.tOutTrickle[0]
                }
                disabled={disabled}
            />
            <Dropdown
                label={
                    <DocumentationTooltip card="battery" item="TOutCharge">
                        <>
                            <span>T</span>
                            <span className="subscript">OUTCHARGE</span>
                        </>
                    </DocumentationTooltip>
                }
                items={chargerModule.values.tOutCharge}
                onSelect={item => chargerModule.set.tOutCharge?.(item.value)}
                selectedItem={
                    chargerModule.values.tOutCharge.find(
                        item => item.value === charger.tOutCharge,
                    ) ?? chargerModule.values.tOutCharge[0]
                }
                disabled={disabled}
            />
        </>
    );
};
