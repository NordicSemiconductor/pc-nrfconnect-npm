/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';
import { Form, ProgressBar } from 'react-bootstrap';
import FormLabel from 'react-bootstrap/FormLabel';
import { useDispatch, useSelector } from 'react-redux';
import { appendFile, existsSync } from 'fs';
import {
    Alert,
    Button,
    DialogButton,
    GenericDialog,
    Group,
    NumberInlineInput,
    Slider,
    useStopwatch,
} from 'pc-nrfconnect-shared';

import { openDirectoryDialog } from '../../actions/fileActions';
import { ProfilingEvent } from '../../features/pmicControl/npm/types';
import {
    getChargers,
    getEventRecordingPath,
    getFuelGauge,
    getLatestAdcSample,
    getLdos,
    getNpmDevice,
    getPmicChargingState,
    isBatteryConnected,
    isUsbPowered,
    setShowProfilingWizard,
} from '../../features/pmicControl/pmicControlSlice';

type ProfileStage =
    | 'Configuration'
    | 'Charging'
    | 'Charged'
    | 'Resting'
    | 'Profiling'
    | 'Complete'
    | 'Error';

const ChargingWarnings = () => {
    const batteryConnected = useSelector(isBatteryConnected);
    const usbPowered = useSelector(isUsbPowered);
    const chargers = useSelector(getChargers);

    return (
        <>
            {!batteryConnected ? (
                <Alert label="Warning " variant="warning">
                    Connect Battery to the EK
                </Alert>
            ) : null}
            {!usbPowered ? (
                <Alert label="Warning " variant="warning">
                    Not charging: Connect a USB PMIC cable
                </Alert>
            ) : null}
            {!chargers[0]?.enabled ? (
                <Alert label="Warning " variant="warning">
                    Not charging: charging has been disabled. Cancel and restart
                    profiling
                </Alert>
            ) : null}
        </>
    );
};

const ProfilingMessage = () => {
    const npmDevice = useSelector(getNpmDevice);
    const batteryConnected = useSelector(isBatteryConnected);
    const usbPowered = useSelector(isUsbPowered);
    const fuelGauge = useSelector(getFuelGauge);
    const ldos = useSelector(getLdos);

    return (
        <>
            {!batteryConnected ? (
                <Alert label="Warning " variant="warning">
                    Connect Battery to the EK
                </Alert>
            ) : null}
            {usbPowered ? (
                <Alert label="Charging complete " variant="info">
                    Disconnect USB PMIC
                </Alert>
            ) : null}
            {fuelGauge ? (
                <Alert label="Warning " variant="warning">
                    Fuel gauge is on this might effect profiling{' '}
                    <Button
                        variant="link"
                        onClick={() => npmDevice?.setFuelGaugeEnabled(false)}
                    >
                        Turn off
                    </Button>
                </Alert>
            ) : null}
            {ldos.filter(ldo => ldo.enabled).length > 0 ? (
                <Alert label="Warning " variant="warning">
                    One or more LDOs are on this will effect profiling{' '}
                    <Button
                        variant="link"
                        onClick={() =>
                            ldos.forEach((_, index) =>
                                npmDevice?.setLdoEnabled(index, false)
                            )
                        }
                    >
                        Turn all off
                    </Button>
                </Alert>
            ) : null}
        </>
    );
};

const TimeComponent = ({
    time,
    progress,
}: {
    time: number;
    progress: number;
}) => {
    const eta = useRef(-1);
    const { days, hours, minutes, seconds } = splitMS(time);

    const {
        days: etaDays,
        hours: etaHours,
        minutes: etaMinutes,
    } = splitMS(eta.current);

    if (progress >= 0 && progress <= 100) {
        const alpha = 0.2;
        const newEta = (100 / progress) * time - time;
        eta.current = alpha * newEta + (1.0 - alpha) * eta.current;
    } else {
        eta.current = -1;
    }

    return (
        <>
            <span>
                {`Elapsed time ${days > 0 ? `${days} days ` : ''}${
                    days > 0 || hours > 0 ? `${hours} hrs ` : ''
                }${
                    days > 0 || hours > 0 || minutes > 0
                        ? `${minutes} min `
                        : ''
                }${
                    hours > 0 || minutes > 0 || seconds > 0
                        ? `${seconds} sec `
                        : ''
                }`}
                {progress >= 0 &&
                progress <= 100 &&
                (etaDays > 0 || etaHours > 0 || etaMinutes > 0)
                    ? `- ETA ${etaDays > 0 ? `${etaDays} days ` : ''}${
                          etaDays > 0 || etaHours > 0 ? `${etaHours} hrs ` : ''
                      }${
                          etaDays > 0 || etaHours > 0 || etaMinutes > 0
                              ? `${etaMinutes} min `
                              : ''
                      }`
                    : ''}
                {progress >= 0 && progress <= 100 ? '- ETA few seconds' : ''}
                {progress > 100 ? '- ETA few seconds' : ''}
                {progress < 0 ? '- ETA Calculating' : ''}
            </span>
            <br />
            <ProgressBar now={progress} style={{ height: '4px' }} />
        </>
    );
};

const splitMS = (ms: number) => {
    const time = ms;
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    ms -= days * 24 * 60 * 60 * 1000;

    const hours = Math.floor(ms / (60 * 60 * 1000));
    ms -= hours * 60 * 60 * 1000;

    const minutes = Math.floor(ms / (60 * 1000));
    ms -= minutes * 60 * 1000;

    const seconds = Math.floor(ms / 1000);
    const millisecond = ms - seconds * 60 * 1000;

    return {
        time,
        days,
        hours,
        minutes,
        seconds,
        millisecond,
    };
};

const restDuration = 900; // seconds
const reportingRate = 1000;

export default () => {
    const capacityConsumed = useRef(0);
    const timeOffset = useRef(-1);
    const profilingFilePath = useRef('');
    const [capacityConsumedState, setCapacityConsumedState] = useState(0);
    const [profilingStep, setProfilingStep] =
        useState<ProfileStage>('Configuration');
    const [initialBatteryVoltage, setInitialBatteryVoltage] = useState(0);
    const [latestProfilingEvent, setLatestProfilingEvent] =
        useState<ProfilingEvent | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [completeMessage, setCompleteMessage] = useState('');
    const [batteryVoltageRunningArg, setBatteryVoltageRunningArg] = useState(0);

    const [vLowerCutOff, setLowerVCutOff] = useState(3.1);
    const [vUpperCutOff, setUpperVCutOff] = useState(4);

    const [batteryCapacity, setBatteryCapacity] = useState(800);
    const { reset, start, time } = useStopwatch({
        autoStart: false,
        resolution: 1000,
    });

    const npmDevice = useSelector(getNpmDevice);
    const usbPowered = useSelector(isUsbPowered);
    const adcSample = useSelector(getLatestAdcSample);
    const pmicChargingState = useSelector(getPmicChargingState);
    const eventRecordingPath = useSelector(getEventRecordingPath);

    const dispatch = useDispatch();

    useEffect(() => {
        const alpha = 0.2;
        setBatteryVoltageRunningArg(
            alpha * (adcSample?.vBat ?? 0) +
                (1.0 - alpha) * batteryVoltageRunningArg
        );
    }, [adcSample, batteryVoltageRunningArg]);

    useEffect(() => {
        const profiler = npmDevice?.getBatteryProfiler();

        if (profiler) {
            return profiler.onProfilingEvent(setLatestProfilingEvent);
        }
    }, [npmDevice]);

    useEffect(() => {
        if (latestProfilingEvent && profilingStep === 'Profiling') {
            if (timeOffset.current === -1) {
                timeOffset.current = Date.now();
                profilingFilePath.current = `${eventRecordingPath}/battery_raw_${batteryCapacity}mAh_${Math.round(
                    latestProfilingEvent?.tBat ?? 0
                )}.csv`;
            }

            const addHeaders = !existsSync(profilingFilePath.current);
            let data = `${(Date.now() - timeOffset.current) / 1000},${
                latestProfilingEvent.iLoad
            },${latestProfilingEvent.vLoad},${latestProfilingEvent.tBat}\r\n`;
            if (addHeaders) {
                data = `Seconds,Current(A),Voltage(V),Temperature(C)\r\n${data}`;
            }

            appendFile(profilingFilePath.current, data, () => {});
        }
    }, [
        batteryCapacity,
        eventRecordingPath,
        latestProfilingEvent,
        profilingStep,
    ]);

    useEffect(() => {
        const profiler = npmDevice?.getBatteryProfiler();

        if (profiler) {
            return profiler.onProfilingStateChange(state => {
                switch (state) {
                    case 'Ready':
                        setProfilingStep('Complete');
                        setCompleteMessage(
                            'Profiling is ready. Profiling cycles all complete'
                        );
                        break;
                    case 'ThermalError':
                        setProfilingStep('Complete');
                        setCompleteMessage(
                            'Profiling was stopped due to thermal error'
                        );
                        break;
                    case 'vCutOff':
                        setProfilingStep('Complete');
                        setCompleteMessage(
                            'Profiling is ready. vCutOff was reached.'
                        );
                        break;
                    case 'POF':
                        setProfilingStep('Complete');
                        setCompleteMessage(
                            'Profiling POF event occurred before reaching vCutOff'
                        );
                        break;
                }
            });
        }
    }, [npmDevice]);

    useEffect(() => {
        const mAhConsumed =
            (Math.abs(latestProfilingEvent?.iLoad ?? 0) *
                1000 *
                reportingRate) /
            3600000;
        capacityConsumed.current += mAhConsumed;
        setCapacityConsumedState(capacityConsumed.current);
    }, [latestProfilingEvent]);

    useEffect(() => {
        if (latestProfilingEvent?.seq === 1 && profilingStep === 'Resting') {
            reset();
            setProfilingStep('Profiling');
        }
    }, [latestProfilingEvent?.seq, profilingStep, reset]);

    useEffect(() => {
        if (profilingStep === 'Charging' && pmicChargingState.batteryFull) {
            setProfilingStep('Charged');
        }
    }, [pmicChargingState.batteryFull, profilingStep]);

    return (
        <GenericDialog
            title="Battery Profiling"
            isVisible
            showSpinner={
                profilingStep === 'Charging' ||
                profilingStep === 'Resting' ||
                profilingStep === 'Profiling'
            }
            closeOnEsc={false}
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        disabled={
                            (profilingStep === 'Configuration' &&
                                !eventRecordingPath) ||
                            profilingStep === 'Charging' ||
                            (profilingStep === 'Charged' && usbPowered) ||
                            profilingStep === 'Resting' ||
                            profilingStep === 'Profiling'
                        }
                        onClick={async () => {
                            switch (profilingStep) {
                                case 'Configuration':
                                    setInitialBatteryVoltage(
                                        adcSample?.vBat ?? 0
                                    );
                                    await npmDevice?.setFuelGaugeEnabled(false);
                                    await npmDevice
                                        ?.setChargerVTerm(1, vUpperCutOff)
                                        .catch(res => {
                                            setErrorMessage(res);
                                            dispatch(setProfilingStep('Error'));
                                        });
                                    await npmDevice
                                        ?.setChargerIChg(
                                            1,
                                            Math.min(
                                                800,
                                                Math.floor(
                                                    batteryCapacity / 2
                                                ) * 2 // even numbers only are allowed
                                            )
                                        )
                                        .catch(res => {
                                            setErrorMessage(res);
                                            dispatch(setProfilingStep('Error'));
                                        });
                                    await npmDevice
                                        ?.setChargerEnabled(1, true)
                                        .catch(res => {
                                            setErrorMessage(res);
                                            dispatch(setProfilingStep('Error'));
                                        });
                                    setProfilingStep('Charging');
                                    start();
                                    break;
                                case 'Charged':
                                    npmDevice
                                        ?.setChargerEnabled(1, false)
                                        .then(async () => {
                                            await npmDevice
                                                ?.getBatteryProfiler()
                                                ?.setProfile(
                                                    reportingRate, // iBat
                                                    reportingRate * 8, // tBat
                                                    vLowerCutOff,
                                                    [
                                                        {
                                                            tLoad: 500,
                                                            tRest: 500,
                                                            iLoad: 0,
                                                            iRest: 0,
                                                            cycles: restDuration,
                                                        },
                                                        {
                                                            tLoad: 500,
                                                            tRest: 500,
                                                            iLoad: 0,
                                                            iRest: 0,
                                                            cycles: 300000, // 5Min
                                                        },
                                                        {
                                                            tLoad: 600000, // 10Min
                                                            tRest: 2400000, // 40Min
                                                            iLoad:
                                                                batteryCapacity /
                                                                5 /
                                                                1000, // mAh
                                                            iRest: 0,
                                                            vCutoff: 3.9,
                                                        },
                                                        {
                                                            tLoad: 300000, // 5Min
                                                            tRest: 1800000, // 30Min
                                                            iLoad:
                                                                batteryCapacity /
                                                                5 /
                                                                1000, // mAh
                                                            iRest: 0,
                                                            vCutoff: 3.5,
                                                        },
                                                        {
                                                            tLoad: 300000, // 5Min
                                                            tRest: 1800000, // 30Min
                                                            iLoad:
                                                                batteryCapacity /
                                                                10 /
                                                                1000, // mAh
                                                            iRest: 0,
                                                        },
                                                    ]
                                                );
                                            npmDevice
                                                ?.getBatteryProfiler()
                                                ?.startProfiling();
                                        })
                                        .catch(res => {
                                            setErrorMessage(res);
                                            setProfilingStep('Error');
                                        });
                                    reset();
                                    setProfilingStep('Resting');
                                    break;
                                case 'Complete':
                                    npmDevice
                                        ?.getBatteryProfiler()
                                        ?.stopProfiling();
                                    dispatch(setShowProfilingWizard(false));
                                    break;
                            }
                        }}
                    >
                        {profilingStep === 'Complete' ? 'Close' : 'Continue'}
                    </DialogButton>
                    <DialogButton
                        onClick={() => {
                            if (
                                profilingStep === 'Resting' ||
                                profilingStep === 'Profiling'
                            ) {
                                npmDevice
                                    ?.getBatteryProfiler()
                                    ?.stopProfiling()
                                    .then(() =>
                                        dispatch(setShowProfilingWizard(false))
                                    )
                                    .catch(res => {
                                        setErrorMessage(res);
                                        dispatch(setProfilingStep('Error'));
                                    });
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
            {profilingStep === 'Configuration' && (
                <Group>
                    <p>Configuration</p>
                    <div>
                        <div className="slider-container">
                            <FormLabel className="flex-row">
                                <div>
                                    <span>Upper V</span>{' '}
                                    <span className="subscript">CUTOFF</span>
                                </div>
                                <div className="flex-row">
                                    <NumberInlineInput
                                        value={vUpperCutOff}
                                        range={{
                                            min: 4,
                                            max: 4.4,
                                            step: 0.05,
                                            decimals: 2,
                                        }}
                                        onChange={setUpperVCutOff}
                                    />
                                    <span>V</span>
                                </div>
                            </FormLabel>
                            <Slider
                                values={[vUpperCutOff]}
                                onChange={[setUpperVCutOff]}
                                range={{
                                    min: 4,
                                    max: 4.4,
                                    step: 0.05,
                                    decimals: 2,
                                }}
                            />
                        </div>
                        <div className="slider-container">
                            <FormLabel className="flex-row">
                                <div>
                                    <span>Lower V</span>{' '}
                                    <span className="subscript">CUTOFF</span>
                                </div>
                                <div className="flex-row">
                                    <NumberInlineInput
                                        value={vLowerCutOff}
                                        range={{
                                            min: 2.7,
                                            max: 3.1,
                                            step: 0.05,
                                            decimals: 2,
                                        }}
                                        onChange={setLowerVCutOff}
                                    />
                                    <span>V</span>
                                </div>
                            </FormLabel>
                            <Slider
                                values={[vLowerCutOff]}
                                onChange={[setLowerVCutOff]}
                                range={{
                                    min: 2.7,
                                    max: 3.1,
                                    step: 0.05,
                                    decimals: 2,
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="slider-container">
                            <FormLabel className="flex-row">
                                <div>
                                    <span>Capacity</span>
                                </div>
                                <div className="flex-row">
                                    <NumberInlineInput
                                        value={batteryCapacity}
                                        range={{ min: 32, max: 3000 }}
                                        onChange={setBatteryCapacity}
                                    />
                                    <span>mAH</span>
                                </div>
                            </FormLabel>
                            <Slider
                                values={[batteryCapacity]}
                                onChange={[setBatteryCapacity]}
                                range={{ min: 32, max: 3000 }}
                            />
                        </div>
                    </div>
                    <div>
                        <Button
                            variant="secondary"
                            onClick={() => dispatch(openDirectoryDialog())}
                        >
                            Select output folder
                        </Button>
                        <span> {eventRecordingPath}</span>
                    </div>
                </Group>
            )}
            {profilingStep === 'Charging' && (
                <>
                    <div>
                        <p>
                            <span>Charging</span>
                        </p>
                        <ChargingWarnings />
                    </div>
                    <Form.Group>
                        <TimeComponent
                            time={time}
                            progress={
                                ((batteryVoltageRunningArg -
                                    initialBatteryVoltage) /
                                    (vUpperCutOff - initialBatteryVoltage)) *
                                100
                            }
                        />
                    </Form.Group>
                </>
            )}
            {profilingStep === 'Charged' && (
                <div>
                    <p>
                        <span>Battery fully charged</span>
                    </p>
                    <ProfilingMessage />
                </div>
            )}
            {profilingStep === 'Resting' && (
                <>
                    <div>
                        <p>
                            <span>Resting Battery</span>
                        </p>
                        <ProfilingMessage />
                    </div>
                    <Form.Group>
                        <TimeComponent
                            time={time}
                            progress={
                                ((latestProfilingEvent?.cycle ?? 0) /
                                    restDuration) *
                                100
                            }
                        />
                    </Form.Group>
                </>
            )}
            {profilingStep === 'Profiling' && (
                <>
                    <div>
                        <ProfilingMessage />
                        <p>
                            <span>{`Profiling: used ${capacityConsumedState.toFixed(
                                2
                            )}mAh of ${batteryCapacity}mAh`}</span>
                        </p>
                    </div>
                    <Form.Group>
                        <TimeComponent
                            time={time}
                            progress={
                                (capacityConsumedState / batteryCapacity) * 100
                            }
                        />
                    </Form.Group>
                </>
            )}
            {profilingStep === 'Complete' && (
                <Alert label="Success " variant="success">
                    {completeMessage}
                </Alert>
            )}
            {profilingStep === 'Error' && (
                <Alert label="Error " variant="danger">
                    {`An error has occurred. Error message: ${errorMessage}`}
                </Alert>
            )}
        </GenericDialog>
    );
};
