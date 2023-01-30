/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appendFile, existsSync } from 'fs';
import { getPersistentStore, logger } from 'pc-nrfconnect-shared';

import { ShellParser } from '../../../hooks/commandParser';
import {
    dequeueWarningDialog,
    getEventRecording,
    getEventRecordingPath,
    getNpmDevice as getNpmDeviceSlice,
    getPmicState,
    isSupportedVersion,
    requestWarningDialog,
    setBatteryConnected,
    setBucks,
    setChargers,
    setFuelGauge,
    setLdos,
    setNpmDevice,
    setPmicChargingState,
    setPmicState,
    setStateOfCharge,
    setSupportedVersion,
    updateBuck,
    updateCharger,
    updateLdo,
} from '../pmicControlSlice';
import { getNpmDevice } from './pmicHelpers';
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
    }, [npmDevice]);

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
            let chargerStateUpdateInterval: NodeJS.Timer | undefined;
            npmDevice.isSupportedVersion().then(result => {
                dispatch(setSupportedVersion(result));
                if (result) {
                    chargerStateUpdateInterval = setInterval(() => {
                        if (npmDevice.getConnectionState() === 'connected')
                            npmDevice.requestUpdate.pmicChargingState();
                    }, 5000);
                }
            });

            return () => {
                clearInterval(chargerStateUpdateInterval);
            };
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
                dispatch(setBatteryConnected(sample.vBat > 0));
                dispatch(setStateOfCharge(sample.soc));
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
                const path = `${recordEventsPath}/${e.loggingEvent.module}.csv`;
                const addHeaders = !existsSync(path);
                let data = '';
                if (e.dataPair) {
                    // sample message abc=10,xyz=44
                    const valuePairs = e.loggingEvent.message.split(',');
                    if (addHeaders) {
                        data += `timestamp,${(data += valuePairs
                            .map(p => p.split('=')[0])
                            .join(','))}\r\n`;
                    }
                    data += `${e.loggingEvent.timestamp},${valuePairs
                        .map(p => p.split('=')[1])
                        .join(',')}\r\n`;
                } else {
                    if (addHeaders) data += `timestamp,logLevel,message\r\n`;
                    data += `${e.loggingEvent.timestamp},${e.loggingEvent.logLevel},${e.loggingEvent.message}\r\n`;
                }

                appendFile(path, data, logger.error);
            }
        });
        return () => releaseOnLoggingEvent();
    }, [npmDevice, recordEvents, recordEventsPath]);
};
