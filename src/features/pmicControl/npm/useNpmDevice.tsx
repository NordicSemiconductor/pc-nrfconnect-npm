/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appendFile, existsSync } from 'fs';
import {
    Alert,
    clearWaitForDevice,
    logger,
    setWaitForDevice,
} from 'pc-nrfconnect-shared';

import { closeDevice, openDevice } from '../../../actions/deviceActions';
import { getShellParser } from '../../serial/serialSlice';
import {
    getEventRecording,
    getEventRecordingPath,
    getNpmDevice as getNpmDeviceSlice,
    getPmicState,
    isSupportedVersion,
    setActiveBatterModel,
    setBatteryConnected,
    setBucks,
    setChargers,
    setDefaultBatterModels,
    setFuelGauge,
    setLatestAdcSample,
    setLdos,
    setNpmDevice,
    setPmicChargingState,
    setPmicState,
    setStoredBatterModel,
    setSupportedVersion,
    setUsbPowered,
    updateBuck,
    updateCharger,
    updateLdo,
} from '../pmicControlSlice';
import { getNpmDevice } from './npmFactory';
import {
    dialogHandler,
    DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
    noop,
} from './pmicHelpers';
import { Buck, Charger, Ldo, PmicDialog } from './types';

export default () => {
    const [deviceUptimeToSystemDelta, setDeviceUptimeToSystemDelta] =
        useState(0);
    const shellParser = useSelector(getShellParser);
    const npmDevice = useSelector(getNpmDeviceSlice);
    const dispatch = useDispatch();
    const supportedVersion = useSelector(isSupportedVersion);
    const pmicState = useSelector(getPmicState);
    const recordEvents = useSelector(getEventRecording);
    const recordEventsPath = useSelector(getEventRecordingPath);

    const initDevice = useCallback(() => {
        if (!npmDevice) return;

        npmDevice.requestUpdate.usbPowered();

        for (let i = 0; i < npmDevice.getNumberOfChargers(); i += 1) {
            npmDevice.requestUpdate.chargerVTerm(i);
            npmDevice.requestUpdate.chargerIChg(i);
            npmDevice.requestUpdate.chargerEnabled(i);
            npmDevice.requestUpdate.chargerVTrickleFast(i);
            npmDevice.requestUpdate.chargerITerm(i);
            npmDevice.requestUpdate.chargerEnabledRecharging(i);
            npmDevice.requestUpdate.pmicChargingState(i);
        }

        for (let i = 0; i < npmDevice.getNumberOfBucks(); i += 1) {
            npmDevice.requestUpdate.buckVOut(i);
            npmDevice.requestUpdate.buckRetentionVOut(i);
            npmDevice.requestUpdate.buckMode(i);
            npmDevice.requestUpdate.buckEnabled(i);
            npmDevice.requestUpdate.buckModeControl(i);
            npmDevice.requestUpdate.buckOnOffControl(i);
            npmDevice.requestUpdate.buckRetentionVOut(i);
        }

        for (let i = 0; i < npmDevice.getNumberOfLdos(); i += 1) {
            npmDevice.requestUpdate.ldoVoltage(i);
            npmDevice.requestUpdate.ldoMode(i);
            npmDevice.requestUpdate.ldoEnabled(i);
        }

        npmDevice.requestUpdate.fuelGauge();
        npmDevice.requestUpdate.activeBatteryModel();
        npmDevice.requestUpdate.storedBatteryModel();
        npmDevice.getKernelUptime().then(milliseconds => {
            setDeviceUptimeToSystemDelta(Date.now() - milliseconds);
        });

        npmDevice.getDefaultBatteryModels().then(models => {
            dispatch(setDefaultBatterModels(models));
        });

        npmDevice.startAdcSample(2000);
        npmDevice.setBatteryStatusCheckEnabled(true);
    }, [dispatch, npmDevice]);

    const initComponents = useCallback(() => {
        if (!npmDevice) return;

        const emptyChargers: Charger[] = [];
        for (let i = 0; i < npmDevice.getNumberOfChargers(); i += 1) {
            emptyChargers.push({
                vTerm: npmDevice.getChargerVoltageRange(i)[0],
                vTrickleFast: 2.5,
                iChg: npmDevice.getChargerCurrentRange(i).min,
                enabled: false,
                iTerm: '10%',
                enableRecharging: false,
            });
        }
        dispatch(setChargers(emptyChargers));

        const emptyBuck: Buck[] = [];
        for (let i = 0; i < npmDevice.getNumberOfBucks(); i += 1) {
            emptyBuck.push({
                vOut: npmDevice.getBuckVoltageRange(i).min,
                retentionVOut: 1,
                mode: 'vSet',
                enabled: true,
                modeControl: 'Auto',
                onOffControl: 'Off',
                retentionControl: 'Off',
            });
        }
        dispatch(setBucks(emptyBuck));

        const emptyLdos: Ldo[] = [];
        for (let i = 0; i < npmDevice.getNumberOfLdos(); i += 1) {
            emptyLdos.push({
                voltage: npmDevice.getLdoVoltageRange(i).min,
                mode: 'ldoSwitch',
                enabled: false,
            });
        }
        dispatch(setLdos(emptyLdos));
    }, [dispatch, npmDevice]);

    useEffect(() => {
        dispatch(
            setNpmDevice(
                getNpmDevice(shellParser, pmicDialog =>
                    dispatch(dialogHandler(pmicDialog))
                )
            )
        );
    }, [dispatch, shellParser]);

    useEffect(() => {
        if (npmDevice) {
            npmDevice.isSupportedVersion().then(result => {
                dispatch(setSupportedVersion(result));
            });
        }
    }, [dispatch, npmDevice]);

    useEffect(() => {
        if (pmicState === 'pmic-connected' && supportedVersion) {
            initDevice();
        }
    }, [initDevice, pmicState, supportedVersion]);

    useEffect(() => {
        if (npmDevice) {
            const releaseOnPmicStateChange = npmDevice.onPmicStateChange(
                state => {
                    dispatch(setPmicState(state));
                }
            );

            const releaseOnAdcSample = npmDevice.onAdcSample(sample => {
                dispatch(setBatteryConnected(sample.vBat > 1));
                dispatch(setLatestAdcSample(sample));
            });

            const releaseOnChargerUpdate = npmDevice.onChargerUpdate(
                payload => {
                    dispatch(updateCharger(payload));
                }
            );

            const releaseOnFuelGaugeUpdate = npmDevice.onFuelGaugeUpdate(
                payload => {
                    dispatch(setFuelGauge(payload));
                }
            );

            const releaseOnChargingStatusUpdate =
                npmDevice.onChargingStatusUpdate(payload => {
                    dispatch(setPmicChargingState(payload));
                });

            const releaseOnBuckUpdate = npmDevice.onBuckUpdate(payload => {
                dispatch(updateBuck(payload));
            });

            const releaseOnLdoUpdate = npmDevice.onLdoUpdate(payload => {
                dispatch(updateLdo(payload));
            });

            const releaseOnActiveBatteryModelUpdate =
                npmDevice.onActiveBatteryModelUpdate(payload => {
                    dispatch(setActiveBatterModel(payload));
                });

            const releaseOnStoredBatteryModelUpdate =
                npmDevice.onStoredBatteryModelUpdate(payload => {
                    dispatch(setStoredBatterModel(payload));
                });

            const releaseOnUsbPowered = npmDevice.onUsbPowered(payload => {
                dispatch(setUsbPowered(payload));
            });

            const releaseOnProfileDownloadUpdate =
                npmDevice.onProfileDownloadUpdate(payload => {
                    const progressDialog: PmicDialog = {
                        uuid: DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
                        message: `Load battery profile will reset the current fuel gauge. Click 'Load' to continue.`,
                        confirmDisabled: true,
                        confirmLabel: 'Load',
                        cancelLabel: 'Close',
                        cancelDisabled: false,
                        title: 'Load',
                        onConfirm: () => {},
                        onCancel: () => {},
                    };

                    switch (payload.state) {
                        case 'downloading':
                            if (
                                payload.completeChunks &&
                                payload.completeChunks === payload.totalChunks
                            ) {
                                npmDevice.applyDownloadFuelGaugeProfile();
                            }
                            dispatch(
                                dialogHandler({
                                    ...progressDialog,
                                    cancelLabel: 'Abort',
                                    cancelClosesDialog: false,
                                    onCancel: () => {
                                        npmDevice.abortDownloadFuelGaugeProfile();
                                    },
                                    message: (
                                        <>
                                            <div>Load battery profile.</div>
                                            <br />
                                            <strong>Status: </strong>
                                            {payload.totalChunks ===
                                                undefined ||
                                            payload.completeChunks === undefined
                                                ? 'Downloading....'
                                                : `Downloading chunk ${payload.completeChunks} of ${payload.totalChunks}`}
                                        </>
                                    ),
                                    progress: Math.ceil(
                                        ((payload.completeChunks ?? 1) /
                                            (payload.totalChunks ?? 1)) *
                                            100
                                    ),
                                })
                            );
                            break;
                        case 'aborting':
                            dispatch(
                                dialogHandler({
                                    ...progressDialog,
                                    message: (
                                        <>
                                            <div>Load battery profile.</div>
                                            <br />
                                            <strong>Status: </strong>
                                            Aborting download
                                        </>
                                    ),
                                })
                            );
                            break;
                        case 'aborted':
                            dispatch(
                                dialogHandler({
                                    ...progressDialog,
                                    message: (
                                        <>
                                            <div>Load battery profile.</div>
                                            <br />
                                            <Alert
                                                label="Warning "
                                                variant="warning"
                                            >
                                                {payload.alertMessage}
                                            </Alert>
                                        </>
                                    ),
                                })
                            );
                            break;
                        case 'applied':
                            dispatch(
                                dialogHandler({
                                    ...progressDialog,
                                    message: (
                                        <>
                                            <div>Load battery profile.</div>
                                            <br />
                                            <Alert
                                                label="Success "
                                                variant="success"
                                            >
                                                {payload.alertMessage}
                                            </Alert>
                                        </>
                                    ),
                                })
                            );
                            break;
                        case 'failed':
                            dispatch(
                                dialogHandler({
                                    ...progressDialog,
                                    message: (
                                        <>
                                            <div>Load battery profile.</div>
                                            <br />
                                            <Alert
                                                label="Error "
                                                variant="danger"
                                            >
                                                {payload.alertMessage}
                                            </Alert>
                                        </>
                                    ),
                                })
                            );
                            break;
                    }
                });

            const releaseOnBeforeReboot = npmDevice.onBeforeReboot(() => {
                dispatch(
                    setWaitForDevice({
                        when: 'applicationMode',
                        once: true,
                        timeout: 3000,
                        onSuccess: device => {
                            dispatch(closeDevice());
                            dispatch(openDevice(device));
                        },
                    })
                );
            });

            const releaseOnReboot = npmDevice.onReboot(success => {
                if (!success) {
                    dispatch(clearWaitForDevice());
                } else {
                    dispatch(
                        setWaitForDevice({
                            when: 'applicationMode',
                            once: true,
                            timeout: 3000,
                            onSuccess: device => {
                                dispatch(closeDevice());
                                dispatch(openDevice(device));
                            },
                        })
                    );
                }
            });

            dispatch(setPmicState(npmDevice.getConnectionState()));

            initComponents();

            return () => {
                releaseOnPmicStateChange();
                releaseOnAdcSample();
                releaseOnChargingStatusUpdate();
                releaseOnChargerUpdate();
                releaseOnBuckUpdate();
                releaseOnLdoUpdate();
                releaseOnFuelGaugeUpdate();
                releaseOnActiveBatteryModelUpdate();
                releaseOnStoredBatteryModelUpdate();
                releaseOnBeforeReboot();
                releaseOnReboot();
                releaseOnUsbPowered();
                releaseOnProfileDownloadUpdate();
            };
        }
    }, [dispatch, initComponents, npmDevice]);

    useEffect(() => {
        if (!npmDevice) return;
        const releaseOnLoggingEvent = npmDevice.onLoggingEvent(e => {
            if (e.loggingEvent.module !== 'shell_commands') {
                switch (e.loggingEvent.logLevel) {
                    case 'wrn':
                        logger.warn(
                            `${e.loggingEvent.module}: ${e.loggingEvent.message}`
                        );
                        break;
                    case 'err':
                        logger.error(
                            `${e.loggingEvent.module}: ${e.loggingEvent.message}`
                        );
                        break;
                }
            }
            if (recordEvents) {
                if (e.dataPair) {
                    let data = '';
                    // sample message abc=10,xyz=44
                    const path = `${recordEventsPath}/${e.loggingEvent.module}.csv`;
                    const addHeaders = !existsSync(path);
                    const valuePairs = e.loggingEvent.message.split(',');
                    if (addHeaders) {
                        data += `timestamp,${(data += valuePairs
                            .map(p => p.split('=')[0])
                            .join(','))}\r\n`;
                    }
                    data += `${
                        e.loggingEvent.timestamp - deviceUptimeToSystemDelta
                    },${valuePairs
                        .map(p => p.split('=')[1] ?? 'NaN')
                        .join(',')}\r\n`;
                    appendFile(path, data, () => {});
                }
                let data = '';
                const path = `${recordEventsPath}/all_events.csv`;
                const addHeaders = !existsSync(path);
                if (addHeaders) data += `timestamp,logLevel,module,message\r\n`;
                data += `${e.loggingEvent.timestamp},${e.loggingEvent.logLevel},${e.loggingEvent.module},"${e.loggingEvent.message}"\r\n`;
                appendFile(path, data, () => {});
            }
        });
        return () => releaseOnLoggingEvent();
    }, [deviceUptimeToSystemDelta, npmDevice, recordEvents, recordEventsPath]);
};
