/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    CollapsibleGroup,
    SidePanel,
    StartStopButton,
} from 'pc-nrfconnect-shared';

import {
    loadConfiguration,
    saveFileDialog,
    selectDirectoryDialog,
} from '../../actions/fileActions';
import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    getEventRecordingPath,
    getNpmDevice,
    setEventRecordingPath,
} from '../../features/pmicControl/pmicControlSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import FuelGaugeSettings from '../FuelGauge/FuelGaugeSettings';
import ConnectionStatus from './ConnectionStatus';

export default () => {
    const dispatch = useDispatch();
    const eventRecordingPath = useSelector(getEventRecordingPath);
    const uiDisabled = useIsUIDisabled();

    const npmDevice = useSelector(getNpmDevice);
    const pmicConnection = npmDevice?.getConnectionState();

    return (
        <SidePanel className="side-panel">
            <CollapsibleGroup defaultCollapsed={false} heading="Actions">
                <DocumentationTooltip
                    card="SidePanel"
                    item="ExportConfiguration"
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

                <DocumentationTooltip card="SidePanel" item="LoadConfiguration">
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
                <DocumentationTooltip card="SidePanel" item="ResetDevice">
                    <Button
                        variant="secondary"
                        disabled={pmicConnection === 'ek-disconnected'}
                        className="w-100"
                        onClick={() => npmDevice?.kernelReset()}
                    >
                        Reset Device
                    </Button>
                </DocumentationTooltip>
                <DocumentationTooltip card="SidePanel" item="RecordEvents">
                    <StartStopButton
                        large={false}
                        variant="secondary"
                        className="w-100"
                        startText="Record Events"
                        stopText="Stop Recording"
                        onClick={() => {
                            if (
                                eventRecordingPath === undefined ||
                                eventRecordingPath.length === 0
                            ) {
                                selectDirectoryDialog().then(filePath =>
                                    dispatch(setEventRecordingPath(filePath))
                                );
                            } else {
                                dispatch(setEventRecordingPath(''));
                            }
                        }}
                        disabled={npmDevice === undefined}
                        started={
                            eventRecordingPath !== undefined &&
                            eventRecordingPath.length > 0
                        }
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
            <ConnectionStatus />
        </SidePanel>
    );
};
