/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import { appendFile, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
    Alert,
    clearWaitForDevice,
    describeError,
    logger,
    setWaitForDevice,
} from 'pc-nrfconnect-shared';

import { closeDevice, openDevice } from '../../../actions/deviceActions';
import { RootState } from '../../../appReducer';
import { PROFILE_FOLDER_PREFIX } from '../../../components/Profiling/helpers';
import { TDispatch } from '../../../thunk';
import { getShellParser } from '../../serial/serialSlice';
import {
    getBucks,
    getEventRecording,
    getEventRecordingPath,
    getNpmDevice as getNpmDeviceSlice,
    getPmicState,
    isSupportedVersion,
    setActiveBatterModel,
    setBatteryConnected,
    setBucks,
    setChargers,
    setFuelGauge,
    setFuelGaugeChargingSamplingRate,
    setFuelGaugeNotChargingSamplingRate,
    setFuelGaugeReportingRate,
    setHardcodedBatterModels,
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
import {
    getProfile,
    getProfileIndex,
    getProfilingStage,
    setCcProfiling,
} from '../profilingSlice';
import { getNpmDevice } from './npmFactory';
import {
    dialogHandler,
    DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
    noop,
} from './pmicHelpers';
import { Buck, Charger, Ldo, PmicDialog } from './types';

export default () => {
    const shellParser = useSelector(getShellParser);
    const npmDevice = useSelector(getNpmDeviceSlice);
    const dispatch = useDispatch();
    const supportedVersion = useSelector(isSupportedVersion);
    const pmicState = useSelector(getPmicState);
    const recordEvents = useSelector(getEventRecording);
    const recordEventsPath = useSelector(getEventRecordingPath);
    const profile = useSelector(getProfile);
    const profileIndex = useSelector(getProfileIndex);
    const profilingStage = useSelector(getProfilingStage);
    const bucks = useSelector(getBucks);
    const preventSleepId = useRef<number | null>();

    useEffect(() => {
        getNpmDevice(shellParser, pmicDialog =>
            dispatch(dialogHandler(pmicDialog))
        ).then(dev => dispatch(setNpmDevice(dev)));
    }, [dispatch, shellParser]);

    useEffect(() => {
        if (npmDevice) {
            npmDevice.isSupportedVersion().then(result => {
                dispatch(setSupportedVersion(result.supported));
            });
        }
    }, [dispatch, npmDevice]);

    useEffect(() => {
        if (npmDevice && pmicState === 'pmic-connected' && supportedVersion) {
            npmDevice.requestUpdate.usbPowered();

            for (let i = 0; i < npmDevice.getNumberOfChargers(); i += 1) {
                npmDevice.requestUpdate.chargerVTerm(i);
                npmDevice.requestUpdate.chargerIChg(i);
                npmDevice.requestUpdate.chargerEnabled(i);
                npmDevice.requestUpdate.chargerVTrickleFast(i);
                npmDevice.requestUpdate.chargerITerm(i);
                npmDevice.requestUpdate.chargerEnabledRecharging(i);
                npmDevice.requestUpdate.pmicChargingState(i);
                npmDevice.requestUpdate.chargerNTCThermistor(i);
            }

            for (let i = 0; i < npmDevice.getNumberOfBucks(); i += 1) {
                npmDevice.requestUpdate.buckVOutNormal(i);
                npmDevice.requestUpdate.buckVOutRetention(i);
                npmDevice.requestUpdate.buckMode(i);
                npmDevice.requestUpdate.buckEnabled(i);
                npmDevice.requestUpdate.buckModeControl(i);
                npmDevice.requestUpdate.buckOnOffControl(i);
            }

            for (let i = 0; i < npmDevice.getNumberOfLdos(); i += 1) {
                npmDevice.requestUpdate.ldoVoltage(i);
                npmDevice.requestUpdate.ldoMode(i);
                npmDevice.requestUpdate.ldoEnabled(i);
            }

            npmDevice.requestUpdate.fuelGauge();
            npmDevice.requestUpdate.activeBatteryModel();
            npmDevice.requestUpdate.storedBatteryModel();

            npmDevice.getHardcodedBatteryModels().then(models => {
                dispatch(setHardcodedBatterModels(models));
            });

            npmDevice.getBatteryProfiler()?.isProfiling();
            npmDevice.setBatteryStatusCheckEnabled(true);
        }
    }, [dispatch, npmDevice, pmicState, supportedVersion]);

    useEffect(() => {
        if (npmDevice) {
            const initComponents = () => {
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
                        ntcThermistor: '10 kΩ',
                    });
                }
                dispatch(setChargers(emptyChargers));

                const emptyBuck: Buck[] = [];
                for (let i = 0; i < npmDevice.getNumberOfBucks(); i += 1) {
                    emptyBuck.push({
                        vOutNormal: npmDevice.getBuckVoltageRange(i).min,
                        vOutRetention: 1,
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
            };

            const releaseAll: (() => void)[] = [];

            releaseAll.push(
                npmDevice.onPmicStateChange(state => {
                    dispatch(setPmicState(state));
                })
            );

            releaseAll.push(
                npmDevice.onAdcSample(sample => {
                    dispatch(setBatteryConnected(sample.vBat > 1));
                    dispatch(setLatestAdcSample(sample));
                })
            );

            releaseAll.push(
                npmDevice.onAdcSettingsChange(settings => {
                    dispatch(setFuelGaugeReportingRate(settings.reportRate));
                    dispatch((_: TDispatch, getState: () => RootState) => {
                        if (getState().app.pmicControl.chargers[0].enabled) {
                            dispatch(
                                setFuelGaugeChargingSamplingRate(
                                    settings.samplingRate
                                )
                            );
                        } else {
                            dispatch(
                                setFuelGaugeNotChargingSamplingRate(
                                    settings.samplingRate
                                )
                            );
                        }
                    });
                })
            );

            releaseAll.push(
                npmDevice.onChargerUpdate(payload => {
                    dispatch((_: TDispatch, getState: () => RootState) => {
                        dispatch(updateCharger(payload));
                        if (
                            payload.data.enabled != null &&
                            getState().app.profiling.ccProfilingState !==
                                'Running'
                        ) {
                            npmDevice.startAdcSample(
                                getState().app.pmicControl
                                    .fuelGaugeReportingRate,
                                payload.data.enabled
                                    ? getState().app.pmicControl
                                          .fuelGaugeChargingSamplingRate
                                    : getState().app.pmicControl
                                          .fuelGaugeNotChargingSamplingRate
                            );
                        }
                    });
                })
            );

            releaseAll.push(
                npmDevice.onFuelGaugeUpdate(payload => {
                    dispatch(setFuelGauge(payload));
                })
            );

            releaseAll.push(
                npmDevice.onChargingStatusUpdate(payload => {
                    dispatch(setPmicChargingState(payload));
                })
            );

            releaseAll.push(
                npmDevice.onBuckUpdate(payload => {
                    dispatch(updateBuck(payload));
                })
            );

            releaseAll.push(
                npmDevice.onLdoUpdate(payload => {
                    dispatch(updateLdo(payload));
                })
            );

            releaseAll.push(
                npmDevice.onActiveBatteryModelUpdate(payload => {
                    dispatch(setActiveBatterModel(payload));
                })
            );

            releaseAll.push(
                npmDevice.onStoredBatteryModelUpdate(payload => {
                    dispatch(setStoredBatterModel(payload));
                })
            );

            releaseAll.push(
                npmDevice.onUsbPowered(payload => {
                    dispatch(setUsbPowered(payload));
                })
            );

            releaseAll.push(
                npmDevice.onProfileDownloadUpdate(payload => {
                    const progressDialog: PmicDialog = {
                        uuid: DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
                        message: `Writing battery profile will reset the current fuel gauge. Click 'Write' to continue.`,
                        confirmDisabled: true,
                        confirmLabel: 'Write',
                        cancelLabel: 'Close',
                        cancelDisabled: false,
                        title: 'Write',
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
                                            <div>Writing battery profile.</div>
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
                                            <div>Writing battery profile.</div>
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
                                            <div>Writing battery profile.</div>
                                            <br />
                                            <Alert
                                                label="Caution: "
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
                                            <div>Writing battery profile.</div>
                                            <br />
                                            <Alert
                                                label="Success: "
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
                                            <div>Writing battery profile.</div>
                                            <br />
                                            <Alert
                                                label="Error: "
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
                })
            );

            releaseAll.push(
                npmDevice.onBeforeReboot(() => {
                    dispatch((dis: TDispatch, getState: () => RootState) => {
                        const previousWaitForDevice =
                            getState().deviceAutoSelect.waitForDevice;
                        dis(
                            setWaitForDevice({
                                when: 'sameTraits',
                                once: true,
                                timeout: 10000,
                                onSuccess: async device => {
                                    await dispatch(closeDevice());
                                    dispatch(openDevice(device));
                                    if (previousWaitForDevice) {
                                        dis(
                                            setWaitForDevice(
                                                previousWaitForDevice
                                            )
                                        );
                                    }
                                },
                            })
                        );
                    });
                })
            );

            releaseAll.push(
                npmDevice.onReboot(success => {
                    if (!success) {
                        dispatch(clearWaitForDevice());
                    } else {
                        dispatch(
                            (dis: TDispatch, getState: () => RootState) => {
                                const previousWaitForDevice =
                                    getState().deviceAutoSelect.waitForDevice;

                                dis(
                                    setWaitForDevice({
                                        when: 'sameTraits',
                                        once: true,
                                        timeout: 10000,
                                        onSuccess: async device => {
                                            await dispatch(closeDevice());
                                            dispatch(openDevice(device));
                                            if (previousWaitForDevice) {
                                                dis(
                                                    setWaitForDevice(
                                                        previousWaitForDevice
                                                    )
                                                );
                                            }
                                        },
                                    })
                                );
                            }
                        );
                    }
                })
            );

            releaseAll.push(
                npmDevice
                    .getBatteryProfiler()
                    ?.onProfilingStateChange(profiling => {
                        dispatch(setCcProfiling(profiling));
                    }) ?? noop
            );

            dispatch(setPmicState(npmDevice.getConnectionState()));

            initComponents();

            return () => {
                releaseAll.forEach(release => release());
            };
        }
    }, [dispatch, npmDevice]);

    useEffect(() => {
        if (
            !npmDevice ||
            npmDevice.getConnectionState() === 'ek-disconnected'
        ) {
            return;
        }

        ipcRenderer
            .invoke('prevent-sleep:start')
            .then(result => {
                preventSleepId.current = result;
            })
            .catch(logger.error);
        return () => {
            if (preventSleepId.current != null) {
                ipcRenderer.send('prevent-sleep:end', preventSleepId.current);
                preventSleepId.current = null;
            }
        };
    }, [npmDevice, preventSleepId]);

    useEffect(() => {
        if (!npmDevice) return;

        const loggingPathsBase: string[] = [];

        if (recordEvents && recordEventsPath) {
            loggingPathsBase.push(recordEventsPath);
        }

        if (
            profilingStage === 'Charging' ||
            profilingStage === 'Resting' ||
            profilingStage === 'Profiling' ||
            profilingStage === 'Checklist'
        ) {
            const baseDirectory = join(
                profile.baseDirectory,
                profile.name,
                `${PROFILE_FOLDER_PREFIX}${profileIndex + 1}`
            );

            const debugFolder = join(baseDirectory, 'debug');

            if (!existsSync(debugFolder)) {
                mkdirSync(debugFolder, { recursive: true });
            }

            loggingPathsBase.push(debugFolder);
        }

        return npmDevice.onLoggingEvent(e => {
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

            loggingPathsBase.forEach(baseDir => {
                if (e.dataPair) {
                    let data = '';
                    // sample message abc=10,xyz=44
                    const path = join(baseDir, `${e.loggingEvent.module}.csv`);
                    const addHeaders = !existsSync(path);
                    const valuePairs = e.loggingEvent.message.split(',');
                    if (addHeaders) {
                        data += `timestamp,${(data += valuePairs
                            .map(p => p.split('=')[0])
                            .join(','))}\r\n`;
                    }
                    data += `${e.loggingEvent.timestamp},${valuePairs
                        .map(p => p.split('=')[1] ?? 'NaN')
                        .join(',')}\r\n`;
                    appendFile(path, data, err => {
                        if (err) {
                            logger.error(describeError(err));
                        }
                    });
                }
                let data = '';
                const path = `${baseDir}/all_events.csv`;
                const addHeaders = !existsSync(path);
                if (addHeaders) data += `timestamp,logLevel,module,message\r\n`;
                data += `${e.loggingEvent.timestamp},${
                    e.loggingEvent.logLevel
                },${e.loggingEvent.module},"${e.loggingEvent.message.replaceAll(
                    /(\r\n|\r|\n)/g,
                    ' '
                )}"\r\n`; // TODO look for escaping new lines in csvs
                appendFile(path, data, err => {
                    if (err) {
                        logger.error(describeError(err));
                    }
                });
            });
        });
    }, [
        npmDevice,
        profile,
        profileIndex,
        profilingStage,
        recordEvents,
        recordEventsPath,
    ]);

    useEffect(() => {
        if (npmDevice) {
            const t = setInterval(() => {
                for (let i = 0; i < npmDevice.getNumberOfBucks(); i += 1) {
                    if (bucks[i].onOffControl !== 'Off') {
                        npmDevice.requestUpdate.buckEnabled(i);
                    }
                }
            }, 1000);

            return () => clearInterval(t);
        }
    }, [bucks, npmDevice]);
};
