/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    CollapsibleGroup,
    NumberInputSliderWithUnit,
    SidePanel,
    StartStopButton,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    loadConfiguration,
    saveFileDialog,
    selectDirectoryDialog,
} from '../../actions/fileActions';
import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import { updateAdcTimings } from '../../features/pmicControl/npm/pmicHelpers';
import {
    getEventRecordingPath,
    getFuelGaugeReportingRate,
    getNpmDevice,
    getPmicState,
    setEventRecordingPath,
    stopEventRecording,
} from '../../features/pmicControl/pmicControlSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import FuelGaugeSettings from '../FuelGauge/FuelGaugeSettings';
import ConnectionStatus from './ConnectionStatus';
import OpenSerialTerminal from './OpenSerialTerminal';

export default () => {
    const dispatch = useDispatch();
    const eventRecordingPath = useSelector(getEventRecordingPath);
    const uiDisabled = useIsUIDisabled();

    const npmDevice = useSelector(getNpmDevice);
    const pmicConnection = useSelector(getPmicState);

    const fuelGaugeReportingRate = useSelector(getFuelGaugeReportingRate);
    const [fuelGaugeReportingRateInternal, setFuelGaugeReportingRateInternal] =
        useState(fuelGaugeReportingRate);
    useEffect(() => {
        setFuelGaugeReportingRateInternal(fuelGaugeReportingRate);
    }, [fuelGaugeReportingRate]);

    const card = 'sidePanel';

    return (
        <SidePanel className="side-panel">
            <CollapsibleGroup defaultCollapsed={false} heading="Actions">
                <DocumentationTooltip
                    card={card}
                    item="ExportConfiguration"
                    placement="right-start"
                >
                    <Button
                        disabled
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
                        disabled
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
                        onClick={() => npmDevice?.kernelReset()}
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
            </CollapsibleGroup>
            <CollapsibleGroup defaultCollapsed={false} heading="Fuel Gauge">
                <FuelGaugeSettings
                    disabled={
                        pmicConnection === 'ek-disconnected' || uiDisabled
                    }
                />
            </CollapsibleGroup>
            <CollapsibleGroup defaultCollapsed={false} heading="Settings">
                <NumberInputSliderWithUnit
                    label="Reporting Rate"
                    unit="ms"
                    value={fuelGaugeReportingRateInternal}
                    range={{ min: 500, max: 10000 }}
                    onChange={value => setFuelGaugeReportingRateInternal(value)}
                    onChangeComplete={() =>
                        dispatch(
                            updateAdcTimings({
                                reportInterval: fuelGaugeReportingRateInternal,
                            })
                        )
                    }
                    disabled={
                        pmicConnection === 'ek-disconnected' || uiDisabled
                    }
                />
            </CollapsibleGroup>
            <ConnectionStatus />
        </SidePanel>
    );
};
