/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { Form, ProgressBar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { DialogButton, GenericDialog } from 'pc-nrfconnect-shared';

import {
    getFuelGauge,
    getLatestAdcSample,
    getNpmDevice,
    getPmicChargingState,
    isBatteryConnected,
    isUsbPowered,
    setShowProfilingWizard,
} from '../../features/pmicControl/pmicControlSlice';

type ProfileStage =
    | 'Configuration'
    | 'PreparingDevice'
    | 'Charging'
    | 'Profiling';

const CommonMessage = () => {
    const batteryConnected = useSelector(isBatteryConnected);
    const usbPowered = useSelector(isUsbPowered);
    const fuelGauge = useSelector(getFuelGauge);

    return (
        <>
            Preparing Device
            <ul>
                <li>{`Battery Connected ${
                    batteryConnected ? 'OK' : 'Pending'
                }`}</li>
            </ul>
            <ul>
                <li>{`USB PMIC Connected ${usbPowered ? 'OK' : 'Pending'}`}</li>
            </ul>
            <ul>
                <li>{`Fuel Gauge Disabled ${
                    !fuelGauge ? 'OK' : 'Pending'
                }`}</li>
            </ul>
        </>
    );
};

export default () => {
    const [profilingStep, setProfilingStep] =
        useState<ProfileStage>('Configuration');
    // const [profiles, setProfiles] = useState<Profile[]>([]);

    const npmDevice = useSelector(getNpmDevice);
    const batteryConnected = useSelector(isBatteryConnected);
    const usbPowered = useSelector(isUsbPowered);
    const fuelGauge = useSelector(getFuelGauge);
    const adcSample = useSelector(getLatestAdcSample);
    const pmicChargingState = useSelector(getPmicChargingState);

    const targetVoltage = 4.2;
    const chargingCurrent = 800;
    const capacity = 1500;

    const dispatch = useDispatch();

    useEffect(() => {
        if (
            profilingStep === 'PreparingDevice' &&
            batteryConnected &&
            usbPowered &&
            !fuelGauge
        ) {
            setProfilingStep('Charging');
        }
    }, [batteryConnected, fuelGauge, profilingStep, usbPowered]);

    useEffect(() => {
        if (profilingStep === 'Profiling') {
            npmDevice?.getBatteryProfiler()?.startProfiling();
        }
    }, [npmDevice, profilingStep]);

    useEffect(() => {
        const action = async () => {
            switch (profilingStep) {
                case 'Configuration':
                    break;
                case 'PreparingDevice':
                    npmDevice?.setFuelGaugeEnabled(false);
                    break;
                case 'Charging':
                    await npmDevice?.setChargerVTerm(1, targetVoltage);
                    await npmDevice?.setChargerIChg(1, chargingCurrent);
                    npmDevice?.setChargerEnabled(1, true);
                    break;
                case 'Profiling':
                    npmDevice
                        ?.getBatteryProfiler()
                        ?.setProfile(1000, targetVoltage, [
                            {
                                tLoad: 300000,
                                tRest: 300000,
                                iLoad: 0,
                                iRest: 0,
                                cycles: 1,
                            },
                            {
                                tLoad: 600000, // 10Min
                                tRest: 2400000, // 40Min
                                iLoad: Math.round(capacity / 5),
                                iRest: 0,
                                cycles: 1,
                                vCutoff: 3.9,
                            },
                            {
                                tLoad: 300000, // 5Min
                                tRest: 1800000, // 30Min
                                iLoad: Math.round(capacity / 5),
                                iRest: 0,
                                cycles: NaN,
                                vCutoff: 3.5,
                            },
                            {
                                tLoad: 300000,
                                tRest: 1800000,
                                iLoad: Math.round(capacity / 10),
                                iRest: 0,
                                cycles: NaN,
                            },
                        ]);
                    break;
            }
        };

        action();
    }, [
        batteryConnected,
        dispatch,
        fuelGauge,
        npmDevice,
        profilingStep,
        usbPowered,
    ]);

    useEffect(() => {
        if (pmicChargingState.batteryFull && profilingStep === 'Charging') {
            setProfilingStep('Profiling');
        }
    }, [pmicChargingState, profilingStep]);

    return (
        <GenericDialog
            title="Battery Profiling"
            isVisible
            showSpinner={profilingStep !== 'Configuration'}
            closeOnEsc={false}
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        disabled={profilingStep !== 'Configuration'}
                        onClick={() => setProfilingStep('PreparingDevice')}
                    >
                        Start
                    </DialogButton>
                    <DialogButton
                        onClick={() => {
                            if (profilingStep === 'Profiling') {
                                npmDevice
                                    ?.getBatteryProfiler()
                                    ?.stopProfiling()
                                    .then(() =>
                                        dispatch(setShowProfilingWizard(false))
                                    );
                            } else {
                                dispatch(setShowProfilingWizard(false));
                            }
                        }}
                    >
                        Cancel
                    </DialogButton>
                </>
            }
        >
            {profilingStep === 'Configuration' && <div>Configuration</div>}
            {profilingStep === 'PreparingDevice' && (
                <div>
                    <CommonMessage />
                </div>
            )}
            {profilingStep === 'Charging' && (
                <>
                    <div>
                        <CommonMessage />
                        <p>
                            <strong>Step:</strong> <span>Charging</span>
                        </p>
                    </div>
                    <Form.Group>
                        <br />
                        <ProgressBar
                            now={
                                adcSample?.vBat
                                    ? targetVoltage / adcSample.vBat
                                    : 0
                            }
                            style={{ height: '4px' }}
                        />
                    </Form.Group>
                </>
            )}
            {profilingStep === 'Profiling' && (
                <>
                    <div>
                        <CommonMessage />
                        <p>
                            <strong>Step:</strong> <span>Profiling</span>
                        </p>
                    </div>
                    <Form.Group>
                        <br />
                        <ProgressBar
                            now={
                                adcSample?.vBat
                                    ? targetVoltage / adcSample.vBat
                                    : 0
                            }
                            style={{ height: '4px' }}
                        />
                    </Form.Group>
                </>
            )}
        </GenericDialog>
    );
};
