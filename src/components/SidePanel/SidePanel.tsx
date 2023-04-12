/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    CollapsibleGroup,
    Dropdown,
    DropdownItem,
    ProgressDialog,
    SidePanel,
    StartStopButton,
} from 'pc-nrfconnect-shared';
import { Terminal } from 'xterm-headless';

import {
    loadConfiguration,
    openDirectoryDialog,
    saveFileDialog,
    uploadProfile,
} from '../../actions/fileActions';
import { BatteryModel } from '../../features/pmicControl/npm/types';
import useNpmDevice from '../../features/pmicControl/npm/useNpmDevice';
import {
    getActiveBatterModel,
    getDefaultBatterModels,
    getDialog,
    getEventRecordingPath,
    getLatestAdcSample,
    getNpmDevice,
    getStoredBatterModel,
    setEventRecordingPath,
} from '../../features/pmicControl/pmicControlSlice';
import {
    getSerialPort,
    getShellParser,
    setIsPaused,
    setShellParser,
} from '../../features/serial/serialSlice';
import {
    hookModemToShellParser,
    xTerminalShellParserWrapper,
} from '../../hooks/commandParser';
import ConnectionStatus from './ConnectionStatus';

export default () => {
    const noop = () => {};

    const currentPmicDialog = useSelector(getDialog);
    const eventRecordingPath = useSelector(getEventRecordingPath);

    const serialPort = useSelector(getSerialPort);
    const shellParserO = useSelector(getShellParser);
    const dispatch = useDispatch();
    useNpmDevice(shellParserO);

    const npmDevice = useSelector(getNpmDevice);
    const pmicConnection = npmDevice?.getConnectionState();

    const activeBatteryModel = useSelector(getActiveBatterModel);
    const defaultBatterModels = useSelector(getDefaultBatterModels);
    const storedBatterModel = useSelector(getStoredBatterModel);
    const latestAdcSample = useSelector(getLatestAdcSample);

    const getClosest = (
        batteryModel: BatteryModel | undefined,
        temperature: number
    ) =>
        batteryModel?.characterizations.reduce((prev, curr) =>
            Math.abs(curr.temperature - temperature) <
            Math.abs(prev.temperature - temperature)
                ? curr
                : prev
        ) ?? undefined;

    const batteryModelItems = useMemo(() => {
        const items = [...defaultBatterModels];
        if (storedBatterModel) items.push(storedBatterModel);

        const keys = new Set(items.map(item => item.name));
        return Array.from(keys).map(key => ({
            label: `${key} (${
                getClosest(
                    items.find(batterModel => batterModel.name === key),
                    latestAdcSample?.tBat ?? 24
                )?.capacity ?? ''
            } mAh)`,
            value: key,
        }));
    }, [defaultBatterModels, latestAdcSample?.tBat, storedBatterModel]);

    const selectedActiveItemBatteryMode = useMemo(
        () =>
            batteryModelItems.find(
                item => item.value === activeBatteryModel?.name
            ) ?? {
                label: 'N/A',
                value: '',
            },
        [activeBatteryModel, batteryModelItems]
    );

    const selectedDefaultItemBatteryMode = useMemo(
        () =>
            batteryModelItems.find(
                item => item.value === storedBatterModel?.name
            ) ?? {
                label: 'N/A',
                value: '',
            },
        [storedBatterModel, batteryModelItems]
    );

    // init shell parser
    useEffect(() => {
        const init = async () => {
            dispatch(setShellParser(undefined));
            if (serialPort) {
                const shellParser = await hookModemToShellParser(
                    serialPort,
                    xTerminalShellParserWrapper(
                        new Terminal({ allowProposedApi: true, cols: 999 })
                    ),
                    {
                        shellPromptUart: 'shell:~$ ',
                        logRegex:
                            '^[[][0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): ',
                        errorRegex: 'Error: ',
                    }
                );

                const releaseOnUnknownCommand = shellParser.onUnknownCommand(
                    data => {
                        console.warn(`Unknown Command:\r\n${data}`);
                    }
                );

                dispatch(setShellParser(shellParser));
                return () => {
                    releaseOnUnknownCommand();
                    shellParser.unregister();
                };
            }
        };
        init().catch(console.error);
    }, [dispatch, serialPort]);

    useEffect(() => {
        if (shellParserO === undefined) {
            dispatch(setEventRecordingPath(undefined));
        }
    }, [dispatch, shellParserO]);

    useEffect(() => {
        shellParserO?.onPausedChange(state => {
            dispatch(setIsPaused(state));
        });
    }, [dispatch, shellParserO]);

    return (
        <SidePanel className="side-panel">
            <CollapsibleGroup defaultCollapsed={false} heading="Settings">
                <Button
                    variant="secondary"
                    className="w-100"
                    onClick={() => dispatch(saveFileDialog())}
                >
                    Export Configuration
                </Button>
                <Button
                    variant="secondary"
                    disabled={pmicConnection !== 'pmic-connected'}
                    className="w-100"
                    onClick={() => dispatch(loadConfiguration())}
                >
                    Load Configuration
                </Button>
                <Button
                    variant="secondary"
                    disabled={pmicConnection === 'ek-disconnected'}
                    className="w-100"
                    onClick={() => npmDevice?.kernelReset('cold')}
                >
                    Reset Device
                </Button>
                <StartStopButton
                    large={false}
                    variant="secondary"
                    className="w-100"
                    startText="Recording Events"
                    stopText="Stop Recording"
                    onClick={() => {
                        if (
                            eventRecordingPath === undefined ||
                            eventRecordingPath.length === 0
                        ) {
                            dispatch(openDirectoryDialog());
                        } else {
                            dispatch(setEventRecordingPath(''));
                        }
                    }}
                    disabled={shellParserO === undefined}
                    started={
                        eventRecordingPath !== undefined &&
                        eventRecordingPath.length > 0
                    }
                />
            </CollapsibleGroup>
            <CollapsibleGroup
                defaultCollapsed={false}
                heading="Fuel Gauge Profiles"
            >
                <Dropdown
                    label="Active profile"
                    items={batteryModelItems}
                    onSelect={(item: DropdownItem) => {
                        npmDevice?.setActiveBatteryModel(item.value);
                    }}
                    selectedItem={selectedActiveItemBatteryMode}
                    disabled={selectedActiveItemBatteryMode.value === ''}
                />
                <Dropdown
                    label="Default profile"
                    items={batteryModelItems}
                    onSelect={(item: DropdownItem) => {
                        if (item.value) {
                            npmDevice?.setActiveBatteryModel(item.value);
                            npmDevice?.storeBattery();
                        }
                    }}
                    selectedItem={selectedDefaultItemBatteryMode}
                    disabled={batteryModelItems.length === 0}
                />
                <Button
                    variant="secondary"
                    className="w-100"
                    onClick={() => dispatch(uploadProfile())}
                    disabled={pmicConnection === 'ek-disconnected'}
                >
                    Upload profile
                </Button>
            </CollapsibleGroup>
            <ConnectionStatus />

            <ProgressDialog
                title={currentPmicDialog?.title}
                headerIcon={currentPmicDialog?.type}
                isVisible={currentPmicDialog !== undefined}
                onConfirm={currentPmicDialog?.onConfirm ?? noop}
                confirmLabel={currentPmicDialog?.confirmLabel}
                confirmDisabled={currentPmicDialog?.confirmDisabled}
                onCancel={currentPmicDialog?.onCancel ?? noop}
                cancelLabel={currentPmicDialog?.cancelLabel}
                cancelDisabled={currentPmicDialog?.cancelDisabled}
                onOptional={currentPmicDialog?.onOptional}
                optionalLabel={currentPmicDialog?.optionalLabel}
                optionalDisabled={currentPmicDialog?.optionalDisabled}
                progress={currentPmicDialog?.progress}
            >
                {currentPmicDialog?.message}
            </ProgressDialog>
        </SidePanel>
    );
};
