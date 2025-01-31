/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    Group,
    NumberInput,
    SidePanel,
    StartStopButton,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    loadConfiguration,
    saveFileDialog,
    selectDirectoryDialog,
} from '../../actions/fileActions';
import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import { updateNpm1300AdcTimings as updateNpmAdcTimings } from '../../features/pmicControl/npm/pmicHelpers';
import {
    getEventRecordingPath,
    getFuelGaugeReportingRate,
    getNpmDevice,
    getPmicState,
    setEventRecordingPath,
    stopEventRecording,
} from '../../features/pmicControl/pmicControlSlice';
import { getShellParser } from '../../features/serial/serialSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import FuelGaugeSettings from '../FuelGauge/FuelGaugeSettings';
import PowerSource from '../PowerSource/PowerSource';
import { WelcomeSidePanel } from '../Welcome';
import ConnectionStatus from './ConnectionStatus';
import OpenSerialTerminal from './OpenSerialTerminal';

export default () => {
    const dispatch = useDispatch();
    const eventRecordingPath = useSelector(getEventRecordingPath);
    const uiDisabled = useIsUIDisabled();

    const npmDevice = useSelector(getNpmDevice);
    const shellParser = useSelector(getShellParser);
    const pmicConnection = useSelector(getPmicState);

    const fuelGaugeReportingRate = useSelector(getFuelGaugeReportingRate);
    const [fuelGaugeReportingRateInternal, setFuelGaugeReportingRateInternal] =
        useState(fuelGaugeReportingRate);
    useEffect(() => {
        setFuelGaugeReportingRateInternal(fuelGaugeReportingRate);
    }, [fuelGaugeReportingRate]);

    const card = 'sidePanel';

    if (!npmDevice) {
        return <WelcomeSidePanel />;
    }

    return (
        <SidePanel className="side-panel">
            <Group collapsible defaultCollapsed={false} heading="Actions">
                <DocumentationTooltip
                    card={card}
                    item="ExportConfiguration"
                    placement="right-start"
                >
                    <Button
                        variant="secondary"
                        className="w-100"
                        onClick={() => dispatch(saveFileDialog())}
                    >
                        Export Configuration
                    </Button>
                </DocumentationTooltip>

                <DocumentationTooltip
                    placement="right-start"
                    card={card}
                    item="LoadConfiguration"
                >
                    <Button
                        variant="secondary"
                        // disabled={pmicConnection !== 'pmic-connected'}
                        className="w-100"
                        onClick={() => dispatch(loadConfiguration())}
                    >
                        Load Configuration
                    </Button>
                </DocumentationTooltip>
                <OpenSerialTerminal />
                <DocumentationTooltip
                    placement="right-start"
                    card={card}
                    item="ResetDevice"
                >
                    <Button
                        variant="secondary"
                        disabled={pmicConnection === 'ek-disconnected'}
                        className="w-100"
                        onClick={() => {
                            shellParser?.unPause();
                            npmDevice?.kernelReset();
                        }}
                    >
                        Reset Device
                    </Button>
                </DocumentationTooltip>
                <DocumentationTooltip
                    placement="right-start"
                    card={card}
                    item="RecordEvents"
                >
                    <StartStopButton
                        large={false}
                        showIcon={false}
                        variant="secondary"
                        className="w-100"
                        startText="Record Events"
                        stopText="Stop Recording"
                        onClick={() => {
                            if (!eventRecordingPath) {
                                selectDirectoryDialog().then(filePath =>
                                    dispatch(setEventRecordingPath(filePath))
                                );
                            } else {
                                dispatch(stopEventRecording());
                            }
                        }}
                        disabled={pmicConnection === 'ek-disconnected'}
                        started={!!eventRecordingPath}
                    />
                </DocumentationTooltip>
            </Group>
            {npmDevice?.deviceType === 'npm1300' && (
                <Group
                    collapsible
                    defaultCollapsed={false}
                    heading="Fuel Gauge"
                >
                    <FuelGaugeSettings
                        disabled={
                            pmicConnection === 'ek-disconnected' || uiDisabled
                        }
                    />
                </Group>
            )}
            {npmDevice?.deviceType === 'npm2100' &&
                pmicConnection !== 'ek-disconnected' && (
                    <Group
                        collapsible
                        defaultCollapsed={false}
                        heading="Power Source"
                    >
                        <PowerSource />
                    </Group>
                )}
            <Group collapsible defaultCollapsed={false} heading="Settings">
                <NumberInput
                    showSlider
                    label="Reporting Rate"
                    unit="ms"
                    value={fuelGaugeReportingRateInternal}
                    range={{ min: 500, max: 10000 }}
                    onChange={value => setFuelGaugeReportingRateInternal(value)}
                    onChangeComplete={() =>
                        dispatch(
                            updateNpmAdcTimings({
                                reportInterval: fuelGaugeReportingRateInternal,
                            })
                        )
                    }
                    disabled={
                        pmicConnection === 'ek-disconnected' || uiDisabled
                    }
                />
            </Group>
            <ConnectionStatus />
        </SidePanel>
    );
};
