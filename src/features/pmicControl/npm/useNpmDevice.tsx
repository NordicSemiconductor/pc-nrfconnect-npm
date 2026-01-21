/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    type AppDispatch,
    clearWaitForDevice,
    describeError,
    logger,
    selectedVirtualDevice,
    setCurrentPane,
    setPaneDisabled,
    setPaneHidden,
    setWaitForDevice,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { ipcRenderer } from 'electron';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { closeDevice, openDevice } from '../../../actions/deviceActions';
import { type RootState } from '../../../appReducer';
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
    setBatteryAddonBoardId,
    setBatteryConnected,
    setBoosts,
    setBucks,
    setCharger,
    setErrorLogs,
    setGPIOs,
    setHardcodedBatterModels,
    setLatestAdcSample,
    setLdos,
    setLEDs,
    setLowPowerConfig,
    setNpmDevice,
    setOnBoardLoad,
    setPmicChargingState,
    setPmicState,
    setPOFs,
    setPowerId,
    setResetConfig,
    setStoredBatterModel,
    setSupportedVersion,
    setTimerConfig,
    setUsbPower,
    updateBoost,
    updateBuck,
    updateCharger,
    updateFuelGauge,
    updateGPIOs,
    updateLdo,
    updateLEDs,
    updateLowPowerConfig,
    updateOnBoardLoad,
    updatePOFs,
    updateResetConfig,
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
    SupportsErrorLogs,
} from './pmicHelpers';
import { type PmicDialog } from './types';

export default () => {
    const [isPMICPowered, setPMICPowered] = useState(false);
    const virtualDeviceSelected = useSelector(selectedVirtualDevice);
    const shellParser = useSelector(getShellParser);
    const npmDevice = useSelector(getNpmDeviceSlice);
    const dispatch = useDispatch<AppDispatch>();
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
        if (shellParser) {
            getNpmDevice(shellParser, pmicDialog =>
                dispatch(dialogHandler(pmicDialog)),
            ).then(dev => {
                dispatch(setNpmDevice(dev));

                dev.isSupportedVersion().then(result => {
                    dispatch(setSupportedVersion(result.supported));
                });
                dev.isPMICPowered().then(setPMICPowered);
            });
        } else if (!virtualDeviceSelected) {
            dispatch(setNpmDevice(undefined));
        }
    }, [dispatch, shellParser, virtualDeviceSelected]);

    useEffect(() => {
        if (
            isPMICPowered &&
            npmDevice &&
            pmicState === 'pmic-connected' &&
            supportedVersion
        ) {
            npmDevice.initialize?.();
            npmDevice.requestUpdate();

            npmDevice.getHardcodedBatteryModels().then(models => {
                dispatch(setHardcodedBatterModels(models));
            });

            npmDevice.batteryProfiler?.isProfiling();
            npmDevice.fuelGaugeModule?.set.batteryStatusCheckEnabled?.(true);
        }
    }, [dispatch, isPMICPowered, npmDevice, pmicState, supportedVersion]);

    useEffect(() => {
        if (npmDevice) {
            const releaseAll: (() => void)[] = [];

            releaseAll.push(
                npmDevice.onPmicStateChange(state => {
                    dispatch(setPmicState(state));
                }),
            );

            releaseAll.push(
                npmDevice.onAdcSample(sample => {
                    dispatch(
                        setBatteryConnected(
                            sample.vBat >
                                npmDevice.batteryConnectedVoltageThreshold,
                        ),
                    );
                    dispatch(setLatestAdcSample(sample));
                }),
            );

            releaseAll.push(
                npmDevice.onAdcSettingsChange(settings => {
                    dispatch(
                        updateFuelGauge({
                            reportingRate: settings.reportRate,
                        }),
                    );
                    dispatch((_, getState) => {
                        if (getState().app.pmicControl.charger?.enabled) {
                            dispatch(
                                updateFuelGauge({
                                    chargingSamplingRate: settings.samplingRate,
                                }),
                            );
                        } else {
                            dispatch(
                                updateFuelGauge({
                                    notChargingSamplingRate:
                                        settings.samplingRate,
                                }),
                            );
                        }
                    });
                }),
            );

            if (!npmDevice.chargerModule) {
                dispatch((_, getState: () => RootState) => {
                    const samplingRate =
                        getState().app.pmicControl.fuelGaugeSettings
                            .chargingSamplingRate ??
                        getState().app.pmicControl.fuelGaugeSettings
                            .notChargingSamplingRate;
                    const reportingRate =
                        getState().app.pmicControl.fuelGaugeSettings
                            .reportingRate;

                    npmDevice.startAdcSample(reportingRate, samplingRate);
                });
            } else {
                releaseAll.push(
                    npmDevice.onChargerUpdate(payload => {
                        dispatch((_, getState: () => RootState) => {
                            dispatch(updateCharger(payload));
                            if (
                                payload.enabled != null &&
                                getState().app.profiling.ccProfilingState !==
                                    'Running'
                            ) {
                                const notChargingSamplingRate =
                                    getState().app.pmicControl.fuelGaugeSettings
                                        .notChargingSamplingRate;
                                const chargingSamplingRate =
                                    getState().app.pmicControl.fuelGaugeSettings
                                        .chargingSamplingRate;
                                npmDevice.startAdcSample(
                                    getState().app.pmicControl.fuelGaugeSettings
                                        .reportingRate,
                                    payload.enabled
                                        ? (chargingSamplingRate ??
                                              notChargingSamplingRate)
                                        : notChargingSamplingRate,
                                );
                            }
                        });
                    }),
                );
            }

            releaseAll.push(
                npmDevice.onFuelGaugeUpdate(payload => {
                    dispatch(updateFuelGauge(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onChargingStatusUpdate(payload => {
                    dispatch(setPmicChargingState(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onBuckUpdate(payload => {
                    dispatch(updateBuck(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onOnBoardLoadUpdate(payload => {
                    dispatch(updateOnBoardLoad(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onBoostUpdate(payload => {
                    dispatch(updateBoost(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onLdoUpdate(payload => {
                    dispatch(updateLdo(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onGPIOUpdate(payload => {
                    dispatch(updateGPIOs(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onLEDUpdate(payload => {
                    dispatch(updateLEDs(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onPOFUpdate(payload => {
                    dispatch(updatePOFs(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onTimerConfigUpdate(payload => {
                    dispatch(updateTimerConfig(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onLowPowerUpdate(payload => {
                    dispatch(updateLowPowerConfig(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onResetUpdate(payload => {
                    dispatch(updateResetConfig(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onActiveBatteryModelUpdate(payload => {
                    dispatch(setActiveBatterModel(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onStoredBatteryModelUpdate(payload => {
                    dispatch(setStoredBatterModel(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onPowerIdUpdate(payload => {
                    dispatch(setPowerId(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onBatteryAddonBoardIdUpdate(payload => {
                    dispatch(setBatteryAddonBoardId(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onTimerExpiryInterrupt(payload => {
                    console.log(`Got onTimerExpiryINterrupt with ${payload}`);
                    dispatch(updateTimerConfig({ enabled: false }));
                }),
            );

            releaseAll.push(
                npmDevice.onUsbPower(payload => {
                    dispatch(updateUsbPower(payload));
                }),
            );

            releaseAll.push(
                npmDevice.onErrorLogs(payload => {
                    dispatch(setErrorLogs(payload));
                }),
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
                                npmDevice.fuelGaugeModule?.actions.applyDownloadFuelGaugeProfile(
                                    payload.slot,
                                );
                            }
                            dispatch(
                                dialogHandler({
                                    ...initialProgressDialog,
                                    cancelLabel: 'Abort',
                                    cancelClosesDialog: false,
                                    onCancel: () => {
                                        npmDevice.fuelGaugeModule?.actions.abortDownloadFuelGaugeProfile();
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
                                            100,
                                    ),
                                }),
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
                                }),
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
                                }),
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
                                }),
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
                                }),
                            );
                            break;
                    }
                }),
            );

            releaseAll.push(
                npmDevice.onBeforeReboot(() => {
                    dispatch((dis, getState) => {
                        const previousWaitForDevice =
                            getState().deviceAutoSelect.waitForDevice;
                        dis(
                            setWaitForDevice({
                                when: device =>
                                    device.serialPorts?.length === 2 &&
                                    device.traits.mcuBoot === true &&
                                    device.traits.serialPorts === true,
                                once: true,
                                timeout: 10000,
                                onSuccess: async device => {
                                    await dispatch(closeDevice());
                                    dispatch(openDevice(device));
                                    if (previousWaitForDevice) {
                                        dis(
                                            setWaitForDevice(
                                                previousWaitForDevice,
                                            ),
                                        );
                                    }
                                },
                            }),
                        );
                    });
                }),
            );

            releaseAll.push(
                npmDevice.onReboot(success => {
                    if (!success) {
                        dispatch(clearWaitForDevice());
                    } else {
                        setPMICPowered(false);
                        dispatch((dis, getState) => {
                            const previousWaitForDevice =
                                getState().deviceAutoSelect.waitForDevice;

                            dis(
                                setWaitForDevice({
                                    when: device =>
                                        device.serialPorts?.length === 2 &&
                                        device.traits.mcuBoot === true &&
                                        device.traits.serialPorts === true,
                                    once: true,
                                    timeout: 10000,
                                    onSuccess: async device => {
                                        await dispatch(closeDevice());
                                        dispatch(openDevice(device));
                                        if (previousWaitForDevice) {
                                            dis(
                                                setWaitForDevice(
                                                    previousWaitForDevice,
                                                ),
                                            );
                                        }
                                    },
                                }),
                            );
                        });
                    }
                }),
            );

            releaseAll.push(
                npmDevice.batteryProfiler?.onProfilingStateChange(profiling => {
                    dispatch(setCcProfiling(profiling));
                }) ?? noop,
            );

            dispatch(setPmicState(npmDevice.pmicState));
            dispatch(setCharger(npmDevice.chargerModule?.defaults));
            dispatch(setOnBoardLoad(npmDevice.onBoardLoadModule?.defaults));

            dispatch(
                setBoosts(npmDevice.boostModule.map(boost => boost.defaults)),
            );
            dispatch(setBucks(npmDevice.buckModule.map(buck => buck.defaults)));
            dispatch(
                setLdos(npmDevice.ldoModule.map(module => module.defaults)),
            );
            dispatch(
                setGPIOs(npmDevice.gpioModule.map(module => module.defaults)),
            );
            dispatch(setLEDs(npmDevice.ledDefaults()));
            dispatch(setPOFs(npmDevice.pofModule?.defaults));
            dispatch(setLowPowerConfig(npmDevice.lowPowerModule?.defaults));
            dispatch(setUsbPower(npmDevice.usbCurrentLimiterModule?.defaults));
            dispatch(setTimerConfig(npmDevice.timerConfigModule?.defaults));
            dispatch(setResetConfig(npmDevice.resetModule?.defaults));

            return () => {
                releaseAll.forEach(release => release());
            };
        }
    }, [dispatch, npmDevice]);

    useEffect(() => {
        if (!npmDevice || npmDevice.pmicState === 'ek-disconnected') {
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
                `${PROFILE_FOLDER_PREFIX}${profileIndex + 1}`,
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
                            `${e.loggingEvent.module}: ${e.loggingEvent.message}`,
                        );
                        break;
                    case 'err':
                        logger.error(
                            `${e.loggingEvent.module}: ${e.loggingEvent.message}`,
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
                    ' ',
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
        // Need to be debounced... for reasons
        setTimeout(() => {
            dispatch(
                setPaneDisabled({
                    name: 'Graph',
                    disabled: pmicState === 'ek-disconnected',
                }),
            );

            dispatch(
                setPaneHidden({
                    name: 'Dashboard',
                    hidden:
                        !npmDevice?.chargerModule &&
                        !npmDevice?.boostModule?.length &&
                        !npmDevice?.buckModule?.length &&
                        !npmDevice?.ldoModule?.length &&
                        !npmDevice?.hasMaxEnergyExtraction?.(),
                }),
            );
            dispatch(
                setPaneHidden({
                    name: 'Graph',
                    hidden: !npmDevice,
                }),
            );
            dispatch(
                setPaneHidden({
                    name: 'Charger',
                    hidden: !npmDevice?.chargerModule,
                }),
            );
            dispatch(
                setPaneHidden({
                    name: 'Regulators',
                    hidden:
                        !npmDevice?.boostModule?.length &&
                        !npmDevice?.buckModule?.length &&
                        !npmDevice?.ldoModule?.length, // TODO change to use ldoModule
                }),
            );
            dispatch(
                setPaneHidden({
                    name: 'GPIOs',
                    hidden: !npmDevice?.gpioModule?.length,
                }),
            );
            dispatch(
                setPaneHidden({
                    name: 'System Features',
                    hidden:
                        !npmDevice?.lowPowerModule &&
                        !npmDevice?.resetModule &&
                        !npmDevice?.timerConfigModule &&
                        !npmDevice?.pofModule &&
                        !npmDevice?.usbCurrentLimiterModule &&
                        (!npmDevice ||
                            (npmDevice && !SupportsErrorLogs(npmDevice))),
                }),
            );
            dispatch(
                setPaneHidden({
                    name: 'MEE',
                    hidden: !npmDevice?.hasMaxEnergyExtraction?.(),
                }),
            );
            dispatch(
                setPaneHidden({
                    name: 'Profiles',
                    hidden: !npmDevice?.canUploadBatteryProfiles,
                }),
            );

            dispatch(
                setPaneHidden({
                    name: 'Welcome',
                    hidden: !!npmDevice,
                }),
            );
            if (!npmDevice) {
                dispatch(setCurrentPane('Welcome'));
            }
        });
    }, [dispatch, npmDevice, pmicState]);

    useEffect(() => {
        if (npmDevice) {
            const t = setInterval(() => {
                for (let i = 0; i < npmDevice.buckModule.length; i += 1) {
                    if (bucks[i].onOffControl !== 'Off') {
                        npmDevice.buckModule[i].get.enabled();
                    }
                }
            }, 1000);

            return () => clearInterval(t);
        }
    }, [bucks, npmDevice]);
};
