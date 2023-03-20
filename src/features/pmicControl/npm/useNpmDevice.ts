/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appendFile, existsSync } from 'fs';
import {
    getPersistentStore,
    logger,
    setWaitForDevice,
} from 'pc-nrfconnect-shared';

import { closeDevice, openDevice } from '../../../actions/deviceActions';
import { ShellParser } from '../../../hooks/commandParser';
import {
    dequeueWarningDialog,
    getEventRecording,
    getEventRecordingPath,
    getNpmDevice as getNpmDeviceSlice,
    getPmicState,
    isSupportedVersion,
    requestWarningDialog,
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
    updateBuck,
    updateCharger,
    updateLdo,
} from '../pmicControlSlice';
import { getNpmDevice } from './npmFactory';
import { Buck, Charger, Ldo, PmicWarningDialog } from './types';

export default (shellParser: ShellParser | undefined) => {
    const npmDevice = useSelector(getNpmDeviceSlice);
    const dispatch = useDispatch();
    const supportedVersion = useSelector(isSupportedVersion);
    const pmicState = useSelector(getPmicState);
    const recordEvents = useSelector(getEventRecording);
    const recordEventsPath = useSelector(getEventRecordingPath);

    const initDevice = useCallback(() => {
        if (!npmDevice) return;

        npmDevice.startAdcSample(2000);
        npmDevice.startBatteryStatusCheck();

        for (let i = 0; i < npmDevice.getNumberOfChargers(); i += 1) {
            npmDevice.requestUpdate.chargerVTerm(i);
            npmDevice.requestUpdate.chargerIChg(i);
            npmDevice.requestUpdate.chargerEnabled(i);
        }

        for (let i = 0; i < npmDevice.getNumberOfBucks(); i += 1) {
            npmDevice.requestUpdate.buckVOut(i);
            npmDevice.requestUpdate.buckMode(i);
            npmDevice.requestUpdate.buckEnabled(i);
        }

        for (let i = 0; i < npmDevice.getNumberOfLdos(); i += 1) {
            npmDevice.requestUpdate.ldoVoltage(i);
            npmDevice.requestUpdate.ldoMode(i);
            npmDevice.requestUpdate.ldoEnabled(i);
        }

        npmDevice.requestUpdate.pmicChargingState();
        npmDevice.requestUpdate.fuelGauge();
        npmDevice.requestUpdate.activeBatteryModel();
        npmDevice.requestUpdate.storedBatteryModel();

        npmDevice.getDefaultBatteryModels().then(models => {
            dispatch(setDefaultBatterModels(models));
        });
    }, [dispatch, npmDevice]);

    const warningDialogHandler = useCallback(
        (pmicWarningDialog: PmicWarningDialog) => {
            if (
                getPersistentStore().get(
                    `pmicDialogs:${pmicWarningDialog.storeID}`
                )?.doNotShowAgain === true
            ) {
                pmicWarningDialog.onConfirm();
                return;
            }

            const onConfirm = pmicWarningDialog.onConfirm;
            pmicWarningDialog.onConfirm = () => {
                onConfirm();
                dispatch(dequeueWarningDialog());
            };

            const onCancel = pmicWarningDialog.onCancel;
            pmicWarningDialog.onCancel = () => {
                onCancel();
                dispatch(dequeueWarningDialog());
            };

            if (
                pmicWarningDialog.optionalDoNotAskAgain &&
                pmicWarningDialog.onOptional
            ) {
                const onOptional = pmicWarningDialog.onOptional;
                pmicWarningDialog.onOptional = () => {
                    onOptional();
                    dispatch(dequeueWarningDialog());
                    getPersistentStore().set(
                        `pmicDialogs:${pmicWarningDialog.storeID}`,
                        { doNotShowAgain: true }
                    );
                };
            }

            dispatch(requestWarningDialog(pmicWarningDialog));
        },
        [dispatch]
    );

    const initComponents = useCallback(() => {
        if (!npmDevice) return;

        const emptyChargers: Charger[] = [];
        for (let i = 0; i < npmDevice.getNumberOfChargers(); i += 1) {
            emptyChargers.push({
                vTerm: npmDevice.getChargerVoltageRange(i)[0],
                iChg: npmDevice.getChargerCurrentRange(i).min,
                enabled: false,
            });
        }
        dispatch(setChargers(emptyChargers));

        const emptyBuck: Buck[] = [];
        for (let i = 0; i < npmDevice.getNumberOfBucks(); i += 1) {
            emptyBuck.push({
                vOut: npmDevice.getBuckVoltageRange(i).min,
                mode: 'vSet',
                enabled: true,
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
        dispatch(setNpmDevice(getNpmDevice(shellParser, warningDialogHandler)));
    }, [dispatch, shellParser, warningDialogHandler]);

    useEffect(() => {
        if (npmDevice) {
            npmDevice.isSupportedVersion().then(result => {
                dispatch(setSupportedVersion(result));
            });
        }
    }, [dispatch, npmDevice]);

    useEffect(() => {
        if (pmicState === 'connected' && supportedVersion) {
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
                    dispatch(setWaitForDevice(undefined));
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
            };
        }
    }, [dispatch, initComponents, npmDevice]);

    useEffect(() => {
        if (!npmDevice) return;
        const releaseOnLoggingEvent = npmDevice.onLoggingEvent(e => {
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
                    data += `${e.loggingEvent.timestamp},${valuePairs
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
    }, [npmDevice, recordEvents, recordEventsPath]);
};
