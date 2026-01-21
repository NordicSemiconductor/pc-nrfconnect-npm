/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Alert } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { type NTCThermistor } from '../../../features/pmicControl/npm/types';

export const RestingProfilingAlerts = () => (
    <>
        <Alert variant="warning" label="Caution: ">
            Modifying the device configuration during profiling will abort the
            ongoing process.
        </Alert>
        <Alert variant="info" label="Note: ">
            Profiling takes approximately 48 hours, depending on your battery
            size. High capacity batteries can require more time. Make sure that
            your computer does not turn off or go into sleep mode or hibernation
            during this process.
        </Alert>
    </>
);

const TemperatureAlert = ({
    ntcThermistor,
    showOnWarning = false,
    expectedTemperature,
    currentTemperature,
    message,
}: {
    ntcThermistor: NTCThermistor;
    showOnWarning: boolean;
    expectedTemperature: number;
    currentTemperature?: number;
    message: string;
}) => {
    const temperatureDelta =
        ntcThermistor === 'Ignore NTC'
            ? 0
            : Math.abs(
                  (currentTemperature ?? expectedTemperature) -
                      expectedTemperature,
              );
    if (
        !showOnWarning ||
        (showOnWarning && temperatureDelta > 2.5) ||
        ntcThermistor === 'Ignore NTC'
    ) {
        return (
            <Alert
                label={temperatureDelta > 2.5 ? 'Caution: ' : 'Note: '}
                variant={temperatureDelta > 2.5 ? 'warning' : 'info'}
            >
                {message}
            </Alert>
        );
    }
    return null;
};

export const ChargingTemperatureAlert = ({
    ntcThermistor,
    showOnWarning = false,
    expectedTemperature,
    currentTemperature,
}: {
    ntcThermistor: NTCThermistor;
    showOnWarning?: boolean;
    expectedTemperature: number;
    currentTemperature?: number;
}) => (
    <TemperatureAlert
        ntcThermistor={ntcThermistor}
        showOnWarning={showOnWarning}
        expectedTemperature={expectedTemperature}
        currentTemperature={currentTemperature}
        message={`Before charging, make sure the battery is at the room temperature (20°C to 25°C).${
            ntcThermistor === 'Ignore NTC'
                ? ''
                : ` The current NTC temperature is ${
                      currentTemperature ?? NaN
                  }°C`
        }`}
    />
);

export const ProfilingTemperatureAlert = ({
    ntcThermistor,
    showOnWarning = false,
    expectedTemperature,
    currentTemperature,
}: {
    ntcThermistor: NTCThermistor;
    expectedTemperature: number;
    showOnWarning?: boolean;
    currentTemperature?: number;
}) => (
    <TemperatureAlert
        ntcThermistor={ntcThermistor}
        showOnWarning={showOnWarning}
        expectedTemperature={expectedTemperature}
        currentTemperature={currentTemperature}
        message={`Make sure battery is in a temperature chamber with a temperature of ${expectedTemperature}°C.${
            ntcThermistor === 'Ignore NTC'
                ? ''
                : ` The current NTC temperature is ${
                      currentTemperature ?? NaN
                  }°C`
        }`}
    />
);
