/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo } from 'react';
import { Form, ProgressBar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    Button,
    CollapsibleGroup,
    DialogButton,
    Dropdown,
    DropdownItem,
    GenericDialog,
    SidePanel,
    StartStopButton,
} from 'pc-nrfconnect-shared';
import { Terminal } from 'xterm-headless';

import {
    getProfileBuffer,
    loadConfiguration,
    saveFileDialog,
    selectDirectoryDialog,
} from '../../actions/fileActions';
import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    dialogHandler,
    DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
} from '../../features/pmicControl/npm/pmicHelpers';
import { BatteryModel } from '../../features/pmicControl/npm/types';
import useNpmDevice from '../../features/pmicControl/npm/useNpmDevice';
import {
    canProfile,
    getActiveBatterModel,
    getDialog,
    getEventRecordingPath,
    getHardcodedBatterModels,
    getLatestAdcSample,
    getNpmDevice,
    getStoredBatterModels,
    setEventRecordingPath,
} from '../../features/pmicControl/pmicControlSlice';
import { setProfilingStage } from '../../features/pmicControl/profilingSlice';
import {
    getSerialPort,
    getShellParser,
    setIsPaused,
    setSerialPort,
    setShellParser,
} from '../../features/serial/serialSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import {
    hookModemToShellParser,
    xTerminalShellParserWrapper,
} from '../../hooks/commandParser';
import ProfilingWizard from '../Profiling/Dialog/ProfilingWizard';
import ConnectionStatus from './ConnectionStatus';

export default () => {
    const noop = () => {};

    const currentPmicDialog = useSelector(getDialog);
    const eventRecordingPath = useSelector(getEventRecordingPath);

    const serialPort = useSelector(getSerialPort);
    const shellParserO = useSelector(getShellParser);
    const dispatch = useDispatch();
    useNpmDevice();

    const npmDevice = useSelector(getNpmDevice);
    const pmicConnection = npmDevice?.getConnectionState();

    const activeBatteryModel = useSelector(getActiveBatterModel);
    const hardcodedBatterModels = useSelector(getHardcodedBatterModels);
    const storedBatterModels = useSelector(getStoredBatterModels);
    const latestAdcSample = useSelector(getLatestAdcSample);
    const profilingSupported = useSelector(canProfile);
    const uiDisabled = useIsUIDisabled();

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

    const batteryModelItems: DropdownItem[] = useMemo(() => {
        const items = [...hardcodedBatterModels];
        if (activeBatteryModel) {
            if (
                hardcodedBatterModels.filter(
                    v => v && v.name !== activeBatteryModel.name
                ).length > 0
            )
                items.push(activeBatteryModel);
        }

        storedBatterModels?.forEach(storedBatterModel => {
            if (storedBatterModel) items.push(storedBatterModel);
        });

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
    }, [
        activeBatteryModel,
        hardcodedBatterModels,
        latestAdcSample?.tBat,
        storedBatterModels,
    ]);

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

    // init shell parser
    useEffect(() => {
        const init = async () => {
            if (serialPort) {
                const shellParser = await hookModemToShellParser(
                    serialPort,
                    xTerminalShellParserWrapper(
                        new Terminal({ allowProposedApi: true, cols: 999 })
                    ),
                    {
                        shellPromptUart: 'shell:~$ ',
                        logRegex:
                            /[[][0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): .*(\r\n|\r|\n)$/,
                        errorRegex: /Error: /,
                        timeout: 5000,
                        columnWidth: 80,
                    }
                );

                const releaseOnUnknownCommand = shellParser.onUnknownCommand(
                    data => {
                        console.warn(`Unknown Command:\r\n${data}`);
                    }
                );

                const onClosedRelease = serialPort.onClosed(() => {
                    dispatch(setSerialPort(undefined));
                });

                dispatch(setShellParser(shellParser));
                return () => {
                    releaseOnUnknownCommand();
                    onClosedRelease();
                    shellParser.unregister();
                };
            }

            dispatch(setShellParser(undefined));
        };
        init().catch(console.error);
    }, [dispatch, serialPort]);

    useEffect(() => {
        if (shellParserO === undefined) {
            dispatch(setEventRecordingPath(undefined));
        }
    }, [dispatch, shellParserO]);

    useEffect(
        () =>
            shellParserO?.onPausedChange(state => {
                dispatch(setIsPaused(state));
            }) ?? noop,
        [dispatch, shellParserO]
    );

    return (
        <SidePanel className="side-panel">
            <CollapsibleGroup defaultCollapsed={false} heading="Settings">
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
                        disabled={shellParserO === undefined}
                        started={
                            eventRecordingPath !== undefined &&
                            eventRecordingPath.length > 0
                        }
                    />
                </DocumentationTooltip>
            </CollapsibleGroup>
            <CollapsibleGroup defaultCollapsed={false} heading="Fuel Gauge">
                <Dropdown
                    label={
                        <DocumentationTooltip
                            card="SidePanel"
                            item="ActiveBatteryModel"
                        >
                            Active Battery Model
                        </DocumentationTooltip>
                    }
                    items={batteryModelItems}
                    onSelect={(item: DropdownItem) => {
                        npmDevice?.setActiveBatteryModel(item.value);
                    }}
                    selectedItem={selectedActiveItemBatteryMode}
                    disabled={
                        selectedActiveItemBatteryMode.value === '' || uiDisabled
                    }
                />
                <DocumentationTooltip card="SidePanel" item="LoadBatteryModel">
                    <Button
                        variant="secondary"
                        className="w-100"
                        onClick={() => {
                            getProfileBuffer()
                                .then(buffer => {
                                    dispatch(
                                        dialogHandler({
                                            uuid: DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
                                            message: `Load battery profile will reset the current fuel gauge. Click 'Load' to continue.`,
                                            confirmLabel: 'Load',
                                            confirmClosesDialog: false,
                                            cancelLabel: 'Cancel',
                                            title: 'Load',
                                            onConfirm: () => {
                                                npmDevice?.downloadFuelGaugeProfile(
                                                    buffer
                                                );
                                            },
                                            onCancel: () => {},
                                        })
                                    );
                                })
                                .catch(res => {
                                    dispatch(
                                        dialogHandler({
                                            uuid: DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
                                            message: (
                                                <>
                                                    <div>
                                                        Load battery profile.
                                                    </div>
                                                    <br />
                                                    <Alert
                                                        label="Error "
                                                        variant="danger"
                                                    >
                                                        {res}
                                                    </Alert>
                                                </>
                                            ),
                                            type: 'alert',
                                            confirmLabel: 'Load',
                                            confirmDisabled: true,
                                            cancelLabel: 'Cancel',
                                            title: 'Load',
                                            onConfirm: () => {},
                                            onCancel: () => {},
                                        })
                                    );
                                });
                        }}
                        disabled={
                            pmicConnection === 'ek-disconnected' || uiDisabled
                        }
                    >
                        Load Battery Model
                    </Button>
                </DocumentationTooltip>
                {profilingSupported && (
                    <DocumentationTooltip
                        card="SidePanel"
                        item="ProfileBattery"
                    >
                        <Button
                            variant="secondary"
                            className="w-100"
                            onClick={() => {
                                npmDevice
                                    ?.getBatteryProfiler()
                                    ?.canProfile()
                                    .then(result => {
                                        if (result) {
                                            dispatch(
                                                setProfilingStage(
                                                    'Configuration'
                                                )
                                            );
                                        } else {
                                            dispatch(
                                                setProfilingStage(
                                                    'MissingSyncBoard'
                                                )
                                            );
                                        }
                                    });
                            }}
                            disabled={
                                !profilingSupported ||
                                pmicConnection === 'ek-disconnected' ||
                                uiDisabled
                            }
                        >
                            Profile Battery
                        </Button>
                    </DocumentationTooltip>
                )}
            </CollapsibleGroup>
            <ConnectionStatus />

            {currentPmicDialog && (
                <GenericDialog
                    title={currentPmicDialog?.title ?? ''}
                    headerIcon={currentPmicDialog?.type}
                    isVisible
                    showSpinner={currentPmicDialog?.progress !== undefined}
                    closeOnEsc
                    onHide={currentPmicDialog?.onCancel}
                    footer={
                        <>
                            <DialogButton
                                variant="primary"
                                disabled={currentPmicDialog?.confirmDisabled}
                                onClick={currentPmicDialog?.onConfirm ?? noop}
                            >
                                {currentPmicDialog?.confirmLabel}
                            </DialogButton>
                            <DialogButton
                                disabled={currentPmicDialog?.cancelDisabled}
                                onClick={currentPmicDialog?.onCancel ?? noop}
                            >
                                {currentPmicDialog?.cancelLabel}
                            </DialogButton>
                            {currentPmicDialog?.optionalLabel && (
                                <DialogButton
                                    disabled={
                                        currentPmicDialog?.optionalDisabled
                                    }
                                    onClick={
                                        currentPmicDialog?.onOptional ?? noop
                                    }
                                >
                                    {currentPmicDialog?.optionalLabel}
                                </DialogButton>
                            )}
                        </>
                    }
                >
                    {currentPmicDialog?.message}
                    {currentPmicDialog?.progress !== undefined && (
                        <Form.Group>
                            <br />
                            <ProgressBar
                                now={currentPmicDialog?.progress}
                                style={{ height: '4px' }}
                            />
                        </Form.Group>
                    )}
                </GenericDialog>
            )}
            <ProfilingWizard />
        </SidePanel>
    );
};
