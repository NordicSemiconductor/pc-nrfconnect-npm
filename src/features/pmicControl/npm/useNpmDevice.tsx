/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    AppThunk,
    clearWaitForDevice,
    describeError,
    logger,
    setWaitForDevice,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { ipcRenderer } from 'electron';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { closeDevice, openDevice } from '../../../actions/deviceActions';
import { RootState } from '../../../appReducer';
import { PROFILE_FOLDER_PREFIX } from '../../../components/Profiling/helpers';
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
    setBoosts,
    setBucks,
    setCharger,
    setErrorLogs,
    setFuelGauge,
    setFuelGaugeChargingSamplingRate,
    setFuelGaugeNotChargingSamplingRate,
    setFuelGaugeReportingRate,
    setGPIOs,
    setHardcodedBatterModels,
    setLatestAdcSample,
    setLdos,
    setLEDs,
    setNpmDevice,
    setPmicChargingState,
    setPmicState,
    setStoredBatterModel,
    setSupportedVersion,
    updateBoost,
    updateBuck,
    updateCharger,
    updateGPIOs,
    updateLdo,
    updateLEDs,
    updatePOFs,
    updateShipModeConfig,
    updateTimerConfig,
    updateUsbPower,
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
import { PmicDialog } from './types';

export default () => {
    const [isPMICPowered, setPMICPowered] = useState(false);
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
            npmDevice.isPMICPowered().then(setPMICPowered);
        }
    }, [dispatch, npmDevice]);

    useEffect(() => {
        if (
            isPMICPowered &&
            npmDevice &&
            pmicState === 'pmic-connected' &&
            supportedVersion
        ) {
            npmDevice.requestUpdate.all();

            npmDevice.getHardcodedBatteryModels().then(models => {
                dispatch(setHardcodedBatterModels(models));
            });

            npmDevice.getBatteryProfiler()?.isProfiling();
            npmDevice.setBatteryStatusCheckEnabled(true);
        }
    }, [dispatch, isPMICPowered, npmDevice, pmicState, supportedVersion]);

    useEffect(() => {
        if (npmDevice) {
            const initComponents = () => {
                if (!npmDevice) return;

                if (npmDevice.hasCharger()) {
                    dispatch(setCharger(npmDevice.chargerDefault()));
                }

                dispatch(setBoosts(npmDevice.getBoosts?.().defaults ?? []));
                dispatch(setBucks(npmDevice.buckDefaults()));
                dispatch(setLdos(npmDevice.ldoDefaults()));
                dispatch(setGPIOs(npmDevice.gpioDefaults()));
                dispatch(setLEDs(npmDevice.ledDefaults()));
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
                    dispatch<AppThunk<RootState>>((_, getState) => {
                        if (getState().app.pmicControl.charger?.enabled) {
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
                    dispatch<AppThunk<RootState>>((_, getState) => {
                        dispatch(updateCharger(payload));
                        if (
                            payload.enabled != null &&
                            getState().app.profiling.ccProfilingState !==
                                'Running'
                        ) {
                            npmDevice.startAdcSample(
                                getState().app.pmicControl
                                    .fuelGaugeReportingRate,
                                payload.enabled
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
                npmDevice.onBoostUpdate(payload => {
                    dispatch(updateBoost(payload));
                })
            );

            releaseAll.push(
                npmDevice.onLdoUpdate(payload => {
                    dispatch(updateLdo(payload));
                })
            );

            releaseAll.push(
                npmDevice.onGPIOUpdate(payload => {
                    dispatch(updateGPIOs(payload));
                })
            );

            releaseAll.push(
                npmDevice.onLEDUpdate(payload => {
                    dispatch(updateLEDs(payload));
                })
            );

            releaseAll.push(
                npmDevice.onPOFUpdate(payload => {
                    dispatch(updatePOFs(payload));
                })
            );

            releaseAll.push(
                npmDevice.onTimerConfigUpdate(payload => {
                    dispatch(updateTimerConfig(payload));
                })
            );

            releaseAll.push(
                npmDevice.onShipUpdate(payload => {
                    dispatch(updateShipModeConfig(payload));
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
                npmDevice.onUsbPower(payload => {
                    dispatch(updateUsbPower(payload));
                })
            );

            releaseAll.push(
                npmDevice.onErrorLogs(payload => {
                    dispatch(setErrorLogs(payload));
                })
            );

            releaseAll.push(
                npmDevice.onProfileDownloadUpdate(payload => {
                    const initialProgressDialog: PmicDialog = {
                        uuid: DOWNLOAD_BATTERY_PROFILE_DIALOG_ID,
                        message: `Write battery model.`,
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
                                npmDevice.applyDownloadFuelGaugeProfile(
                                    payload.slot
                                );
                            }
                            dispatch(
                                dialogHandler({
                                    ...initialProgressDialog,
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
                                    ...initialProgressDialog,
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
                                    ...initialProgressDialog,
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
                                    ...initialProgressDialog,
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
                                    ...initialProgressDialog,
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
                    dispatch<AppThunk>((dis, getState) => {
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
                        setPMICPowered(false);
                        dispatch<AppThunk>((dis, getState) => {
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
                    try {
                        appendFileSync(path, data);
                    } catch (err) {
                        logger.error(describeError(err));
                    }
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

                try {
                    appendFileSync(path, data);
                } catch (err) {
                    logger.error(describeError(err));
                }
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
