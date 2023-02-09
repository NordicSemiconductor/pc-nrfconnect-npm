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
    ConfirmationDialog,
    Dropdown,
    DropdownItem,
    SidePanel,
    StartStopButton,
} from 'pc-nrfconnect-shared';
import { Terminal } from 'xterm-headless';

import {
    openDirectoryDialog,
    openFileDialog,
    saveFileDialog,
} from '../../actions/fileActions';
import useNpmDevice from '../../features/pmicControl/npm/useNpmDevice';
import {
    getActiveBatterModel,
    getDefaultBatterModels,
    getEventRecordingPath,
    getNpmDevice,
    getStoredBatterModels,
    getWarningDialog,
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
import SerialSettings from './SerialSettings';

export default () => {
    const noop = () => {};

    const currentPmicWarningDialog = useSelector(getWarningDialog);
    const eventRecordingPath = useSelector(getEventRecordingPath);
    const showConfirmDialog = currentPmicWarningDialog !== undefined;
    const message = currentPmicWarningDialog?.message;
    const optionalLabel = currentPmicWarningDialog?.optionalLabel;
    const confirmLabel = currentPmicWarningDialog?.confirmLabel;
    const cancelLabel = currentPmicWarningDialog?.cancelLabel;
    const title = currentPmicWarningDialog?.title;
    const onConfirm = currentPmicWarningDialog?.onConfirm ?? noop;
    const onCancel = currentPmicWarningDialog?.onCancel ?? noop;
    const onOptional = currentPmicWarningDialog?.onOptional;

    const serialPort = useSelector(getSerialPort);
    const shellParserO = useSelector(getShellParser);
    const dispatch = useDispatch();
    useNpmDevice(shellParserO);

    const npmDevice = useSelector(getNpmDevice);
    const pmicConnection = npmDevice?.getConnectionState();

    const activeBatteryModel = useSelector(getActiveBatterModel);
    const defaultBatterModels = useSelector(getDefaultBatterModels);
    const storedBatterModels = useSelector(getStoredBatterModels);

    const batteryModelItems = useMemo(() => {
        const items = [...defaultBatterModels, ...storedBatterModels];
        const keys = new Set(items.map(item => item.name));
        return Array.from(keys).map(key => ({
            label: key,
            value: key,
        }));
    }, [defaultBatterModels, storedBatterModels]);

    const selectedItemBatteryMode = useMemo(
        () =>
            batteryModelItems.find(
                item => item.value === activeBatteryModel?.name
            ) ?? {
                label: 'N/A',
                value: '',
            },
        [activeBatteryModel, batteryModelItems]
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
            <SerialSettings />
            <CollapsibleGroup defaultCollapsed={false} heading="Settings">
                <Button
                    className="w-100 secondary-btn"
                    onClick={() => dispatch(saveFileDialog())}
                >
                    Export Configuration
                </Button>
                <Button
                    disabled={pmicConnection !== 'connected'}
                    className="w-100 secondary-btn"
                    onClick={() => dispatch(openFileDialog())}
                >
                    Load Configuration
                </Button>
                <Button
                    disabled={pmicConnection === 'offline'}
                    className="w-100 secondary-btn"
                    onClick={() => npmDevice?.kernelReset('cold')}
                >
                    Reset Device
                </Button>
                <StartStopButton
                    className="w-100 secondary-btn"
                    startText="Start Recording Events"
                    stopText="Stop Recording Events"
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
                    selectedItem={selectedItemBatteryMode}
                    disabled={selectedItemBatteryMode.value === ''}
                />
                <Button
                    className="w-100 secondary-btn"
                    onClick={() => {
                        npmDevice?.storeBattery();
                    }}
                    disabled={npmDevice?.getConnectionState() !== 'connected'}
                >
                    Set as default
                </Button>
                <Button
                    className="w-100 secondary-btn"
                    onClick={() => {}}
                    disabled
                >
                    Upload profile
                </Button>
            </CollapsibleGroup>

            <ConfirmationDialog
                title={title}
                isVisible={showConfirmDialog}
                onConfirm={onConfirm}
                confirmLabel={confirmLabel}
                onCancel={onCancel}
                cancelLabel={cancelLabel}
                onOptional={onOptional}
                optionalLabel={optionalLabel}
            >
                {message}
            </ConfirmationDialog>
        </SidePanel>
    );
};
