/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appendFile, existsSync } from 'fs';
import {
    clearWaitForDevice,
    getPersistentStore,
    logger,
    setWaitForDevice,
} from 'pc-nrfconnect-shared';

import { closeDevice, openDevice } from '../../../actions/deviceActions';
import { ShellParser } from '../../../hooks/commandParser';
import {
    dequeueDialog,
    getEventRecording,
    getEventRecordingPath,
    getNpmDevice as getNpmDeviceSlice,
    getPmicState,
    isSupportedVersion,
    requestDialog,
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
import { Buck, Charger, Ldo, PmicDialog } from './types';

export default (shellParser: ShellParser | undefined) => {
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

        npmDevice.getDefaultBatteryModels().then(models => {
            dispatch(setDefaultBatterModels(models));
        });

        npmDevice.startAdcSample(2000);
        npmDevice.setBatteryStatusCheckEnabled(true);
    }, [dispatch, npmDevice]);

    const dialogHandler = useCallback(
        (pmicDialog: PmicDialog) => {
            if (
                getPersistentStore().get(`pmicDialogs:${pmicDialog.storeID}`)
                    ?.doNotShowAgain === true
            ) {
                pmicDialog.onConfirm();
                return;
            }

            const onConfirm = pmicDialog.onConfirm;
            pmicDialog.onConfirm = () => {
                onConfirm();
                dispatch(dequeueDialog());
            };

            const onCancel = pmicDialog.onCancel;
            pmicDialog.onCancel = () => {
                onCancel();
                dispatch(dequeueDialog());
            };

            if (pmicDialog.optionalDoNotAskAgain && pmicDialog.onOptional) {
                const onOptional = pmicDialog.onOptional;
                pmicDialog.onOptional = () => {
                    onOptional();
                    dispatch(dequeueDialog());
                    getPersistentStore().set(
                        `pmicDialogs:${pmicDialog.storeID}`,
                        { doNotShowAgain: true }
                    );
                };
            }

            dispatch(requestDialog(pmicDialog));
        },
        [dispatch]
    );

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
        dispatch(setNpmDevice(getNpmDevice(shellParser, dialogHandler)));
    }, [dispatch, shellParser, dialogHandler]);

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
