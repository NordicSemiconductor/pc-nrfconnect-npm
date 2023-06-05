/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Alert } from 'pc-nrfconnect-shared';

export const RestingProfilingAlerts = () => (
    <>
        <Alert variant="warning" label="Warning: ">
            Modifying device configuration during profiling will abort the
            ongoing temperature profile.
        </Alert>
        <Alert variant="info" label="Info: ">
            Profiling takes a long time to complete (~48hrs per temperature).
            Please make sure that the computer does not go into sleep or
            hibernate during this process.
        </Alert>
    </>
);

const TemperatureAlert = ({
    showOnWarning = false,
    expectedTemperature,
    currentTemperature,
    message,
}: {
    showOnWarning: boolean;
    expectedTemperature: number;
    currentTemperature?: number;
    message: string;
}) => {
    const temperatureDelta = Math.abs(
        (currentTemperature ?? expectedTemperature) - expectedTemperature
    );
    if (!showOnWarning || (showOnWarning && temperatureDelta > 2.5)) {
        return (
            <Alert
                label={temperatureDelta > 2.5 ? 'Warning: ' : 'Info: '}
                variant={temperatureDelta > 2.5 ? 'warning' : 'info'}
            >
                {message}
            </Alert>
        );
    }
    return null;
};

export const ChargingTemperatureAlert = ({
    showOnWarning = false,
    expectedTemperature,
    currentTemperature,
}: {
    showOnWarning?: boolean;
    expectedTemperature: number;
    currentTemperature?: number;
}) => (
    <TemperatureAlert
        showOnWarning={showOnWarning}
        expectedTemperature={expectedTemperature}
        currentTemperature={currentTemperature}
        message={`Make sure battery is at room temperature before charging (20 °C - 25 °C). Current NTC temperature ${
            currentTemperature ?? NaN
        } °C`}
    />
);

export const ProfilingTemperatureAlert = ({
    showOnWarning = false,
    expectedTemperature,
    currentTemperature,
}: {
    expectedTemperature: number;
    showOnWarning?: boolean;
    currentTemperature?: number;
}) => (
    <TemperatureAlert
        showOnWarning={showOnWarning}
        expectedTemperature={expectedTemperature}
        currentTemperature={currentTemperature}
        message={`Make sure battery is in a temperature chamber with a temperature of ${expectedTemperature} °C. Current NTC temperature ${
            currentTemperature ?? NaN
        } °C`}
    />
);
