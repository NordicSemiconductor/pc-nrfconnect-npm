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

import { selectDirectoryDialog } from '../../actions/fileActions';
import { noop } from '../../features/pmicControl/npm/pmicHelpers';
import { ProfilingEvent } from '../../features/pmicControl/npm/types';
import {
    getChargers,
    getEventRecordingPath,
    getFuelGauge,
    getLatestAdcSample,
    getLdos,
    getNpmDevice,
    getPmicChargingState,
    getProfilingState,
    isBatteryConnected,
    isUsbPowered,
    setEventRecordingPath,
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
    const npmDevice = useSelector(getNpmDevice);
    const batteryConnected = useSelector(isBatteryConnected);
    const usbPowered = useSelector(isUsbPowered);
    const chargers = useSelector(getChargers);

    return (
        <>
            {!batteryConnected ? (
                <Alert label="Warning " variant="warning">
                    Did not detect battery. Ensure battery is connected.
                </Alert>
            ) : null}
            {!usbPowered ? (
                <Alert label="Warning " variant="warning">
                    Connect a USB PMIC cable
                </Alert>
            ) : null}
            {!chargers[0]?.enabled ? (
                <Alert label="" variant="warning">
                    <div className="d-flex align-items-center flex-wrap alert-warning-with-button">
                        <span>
                            <strong>Warning</strong> Charging has been turned
                            off.
                        </span>
                        <Button
                            variant="custom"
                            onClick={() => {
                                chargers.forEach((_, index) =>
                                    npmDevice?.setChargerEnabled(index, true)
                                );
                            }}
                        >
                            Turn on
                        </Button>
                    </div>
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
    const profilingState = useSelector(getProfilingState);

    return (
        <>
            {!batteryConnected ? (
                <Alert label="Warning " variant="warning">
                    Did not detect battery. Ensure battery is connected.
                </Alert>
            ) : null}
            {profilingState === 'Off' && usbPowered ? (
                <Alert label="Charging complete " variant="info">
                    Disconnect USB PMIC
                </Alert>
            ) : null}
            {profilingState !== 'Off' && usbPowered ? (
                <Alert label="Charging " variant="info">
                    Disconnect USB PMIC
                </Alert>
            ) : null}
            {fuelGauge ? (
                <Alert label="" variant="warning">
                    <div className="d-flex align-items-center flex-wrap alert-warning-with-button">
                        <span>
                            <strong>Warning</strong> Fuel gauge is on this might
                            effect profiling.
                        </span>
                        <Button
                            variant="custom"
                            onClick={() =>
                                npmDevice?.setFuelGaugeEnabled(false)
                            }
                        >
                            Turn off
                        </Button>
                    </div>
                </Alert>
            ) : null}
            {ldos.filter(ldo => ldo.enabled).length > 0 ? (
                <Alert label="" variant="warning">
                    <div className="d-flex align-items-center flex-wrap alert-warning-with-button">
                        <span>
                            <strong>Warning</strong> One or more LDOs are on
                            this will effect profiling.
                        </span>
                        <Button
                            variant="custom"
                            onClick={() =>
                                ldos.forEach((_, index) =>
                                    npmDevice?.setLdoEnabled(index, false)
                                )
                            }
                        >
                            Turn all off
                        </Button>
                    </div>
                </Alert>
            ) : null}
        </>
    );
};

const timeString = (
    days: number,
    hours: number,
    minutes: number,
    seconds?: number
) =>
    `${days > 0 ? `${days} days ` : ''}${
        days > 0 || hours > 0 ? `${hours} hrs ` : ''
    }${days > 0 || hours > 0 || minutes > 0 ? `${minutes} min ` : ''}${
        seconds !== undefined && (hours > 0 || minutes > 0 || seconds > 0)
            ? `${seconds} sec `
            : ''
    }`;

const TimeComponent = ({
    time,
    progress,
    ready = false,
}: {
    time: number;
    progress: number;
    ready?: boolean;
}) => {
    const eta = useRef(0);
    const { days, hours, minutes, seconds } = splitMS(time);
    if (ready) progress === 100;

    if (progress > 0 && progress <= 100) {
        const alpha = 0.2;
        const newEta = (100 / progress) * time - time;
        eta.current = alpha * newEta + (1.0 - alpha) * eta.current;
    } else {
        eta.current = 0;
    }

    const {
        days: etaDays,
        hours: etaHours,
        minutes: etaMinutes,
        seconds: etaSeconds,
    } = splitMS(eta.current);

    if (etaDays > 5) {
        progress = 0;
    }

    if (etaDays <= 0 && etaHours <= 0 && etaMinutes <= 0) {
        progress = 100;
    }

    return (
        <>
            {!ready && (
                <>
                    <span>
                        {progress > 0 && progress < 100
                            ? `Remaining time: ${timeString(
                                  etaDays,
                                  etaHours,
                                  Math.round(etaMinutes + etaSeconds / 60)
                              )}` // don't show seconds
                            : ''}
                        {progress >= 100 ? 'Remaining time: almost done' : ''}
                        {progress <= 0 ? 'Remaining time: calculating' : ''}
                    </span>
                    <br />
                </>
            )}
            <span>
                {`Elapsed time: ${timeString(days, hours, minutes, seconds)}`}
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
    const timeOffset = useRef(-1);
    const profilingFilePath = useRef('');
    const [capacityConsumedState, setCapacityConsumedState] = useState(0);
    const [profilingStep, setProfilingStep] =
        useState<ProfileStage>('Configuration');
    const [initialBatteryVoltage, setInitialBatteryVoltage] = useState(0);
    const [latestProfilingEvent, setLatestProfilingEvent] =
        useState<ProfilingEvent | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [completeMessage, setCompleteMessage] = useState<{
        message: string;
        level: 'warning' | 'success';
    } | null>();
    const [batteryVoltageRunningArg, setBatteryVoltageRunningArg] = useState(0);

    const [vLowerCutOff, setLowerVCutOff] = useState(3.1);
    const [vUpperCutOff, setUpperVCutOff] = useState(4);

    const [batteryCapacity, setBatteryCapacity] = useState(800);
    const { reset, start, pause, time } = useStopwatch({
        autoStart: false,
        resolution: 1000,
    });

    const npmDevice = useSelector(getNpmDevice);
    const usbPowered = useSelector(isUsbPowered);
    const chargers = useSelector(getChargers);
    const adcSample = useSelector(getLatestAdcSample);
    const pmicChargingState = useSelector(getPmicChargingState);
    const eventRecordingPath = useSelector(getEventRecordingPath);
    const batteryConnected = useSelector(isBatteryConnected);

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
            return profiler.onProfilingEvent(event => {
                setLatestProfilingEvent(event);
                setCapacityConsumedState(c => {
                    const mAhConsumed =
                        (Math.abs(event?.data.iLoad ?? 0) *
                            1000 *
                            reportingRate) /
                        3600000;
                    return c + mAhConsumed;
                });
            });
        }
    }, [npmDevice]);

    useEffect(() => {
        if (latestProfilingEvent && profilingStep === 'Profiling') {
            if (timeOffset.current === -1) {
                timeOffset.current = latestProfilingEvent.timestamp;
                profilingFilePath.current = `${eventRecordingPath}/battery_raw_${batteryCapacity}mAh_${Math.round(
                    latestProfilingEvent?.data.tBat ?? 0
                )}c.csv`; // Temperature might change hance the file name
            }

            const addHeaders = !existsSync(profilingFilePath.current);
            let data = `${
                (latestProfilingEvent.timestamp - timeOffset.current) / 1000
            },${latestProfilingEvent.data.iLoad},${
                latestProfilingEvent.data.vLoad
            },${latestProfilingEvent.data.tBat}\r\n`;
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
                        pause();
                        setProfilingStep('Complete');
                        setCompleteMessage({
                            message:
                                'Profiling is ready. Profiling cycles all complete.',
                            level: 'success',
                        });
                        break;
                    case 'ThermalError':
                        pause();
                        setProfilingStep('Error');
                        setErrorMessage(
                            'Profiling was stopped due to thermal error.'
                        );
                        break;
                    case 'vCutOff':
                        pause();
                        setProfilingStep('Complete');
                        setCompleteMessage({
                            message: 'Profiling is ready. vCutOff was reached.',
                            level: 'success',
                        });
                        break;
                    case 'POF':
                        pause();
                        setProfilingStep('Complete');
                        setCompleteMessage({
                            message:
                                'Profiling POF event occurred before reaching vCutOff.',
                            level: 'warning',
                        });
                        break;
                }
            });
        }
    }, [npmDevice, pause]);

    useEffect(() => {
        if (
            latestProfilingEvent?.data.seq === 1 &&
            profilingStep === 'Resting'
        ) {
            reset();
            setProfilingStep('Profiling');
        }
    }, [latestProfilingEvent?.data.seq, profilingStep, reset]);

    useEffect(() => {
        if (profilingStep === 'Charging' && pmicChargingState.batteryFull) {
            setProfilingStep('Charged');
        }
    }, [pmicChargingState, profilingStep]);

    useEffect(() => {
        if (profilingStep === 'Charged' && !usbPowered) {
            setProfilingStep('Resting');
            npmDevice
                ?.setChargerEnabled(0, false)
                .then(() => {
                    npmDevice
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
                                    cycles: 300, // 5Min
                                },
                                {
                                    tLoad: 600000, // 10Min
                                    tRest: 2400000, // 40Min
                                    iLoad: batteryCapacity / 5 / 1000, // mAh
                                    iRest: 0,
                                    vCutoff: 3.9,
                                },
                                {
                                    tLoad: 300000, // 5Min
                                    tRest: 1800000, // 30Min
                                    iLoad: batteryCapacity / 5 / 1000, // mAh
                                    iRest: 0,
                                    vCutoff: 3.5,
                                },
                                {
                                    tLoad: 300000, // 5Min
                                    tRest: 1800000, // 30Min
                                    iLoad: batteryCapacity / 10 / 1000, // mAh
                                    iRest: 0,
                                },
                            ]
                        )
                        .then(() => {
                            npmDevice
                                ?.getBatteryProfiler()
                                ?.startProfiling()
                                .then(() => {
                                    reset();
                                });
                        })
                        .catch(res => {
                            setErrorMessage(res);
                            setProfilingStep('Error');
                        });
                })
                .catch(res => {
                    setErrorMessage(res);
                    setProfilingStep('Error');
                });
        }
    }, [
        batteryCapacity,
        npmDevice,
        profilingStep,
        reset,
        usbPowered,
        vLowerCutOff,
    ]);

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
                    {profilingStep === 'Configuration' && (
                        <DialogButton
                            variant="primary"
                            onClick={() => {
                                selectDirectoryDialog().then(async filePath => {
                                    dispatch(setEventRecordingPath(filePath));
                                    setInitialBatteryVoltage(
                                        adcSample?.vBat ?? 0
                                    );
                                    await npmDevice?.setFuelGaugeEnabled(false);
                                    await npmDevice
                                        ?.setChargerVTerm(0, vUpperCutOff)
                                        .catch(res => {
                                            setErrorMessage(res);
                                            dispatch(setProfilingStep('Error'));
                                        });
                                    await npmDevice
                                        ?.setChargerIChg(
                                            0,
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
                                        ?.setChargerEnabled(0, true)
                                        .catch(res => {
                                            setErrorMessage(res);
                                            dispatch(setProfilingStep('Error'));
                                        });
                                    setProfilingStep('Charging');
                                    start();
                                });
                            }}
                        >
                            Continue
                        </DialogButton>
                    )}
                    {(profilingStep === 'Charged' ||
                        profilingStep === 'Charging' ||
                        profilingStep === 'Resting' ||
                        profilingStep === 'Profiling') && (
                        <DialogButton variant="primary" disabled onClick={noop}>
                            Continue
                        </DialogButton>
                    )}
                    {profilingStep === 'Complete' && (
                        <DialogButton
                            variant="primary"
                            onClick={() => {
                                npmDevice
                                    ?.getBatteryProfiler()
                                    ?.stopProfiling();
                                dispatch(setShowProfilingWizard(false));
                            }}
                        >
                            Finish
                        </DialogButton>
                    )}
                    {profilingStep === 'Error' && (
                        <DialogButton
                            variant="primary"
                            onClick={async () => {
                                await npmDevice
                                    ?.getBatteryProfiler()
                                    ?.stopProfiling();
                                dispatch(setShowProfilingWizard(false));
                            }}
                        >
                            Close
                        </DialogButton>
                    )}

                    {profilingStep !== 'Complete' &&
                        profilingStep !== 'Error' && (
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
                                                dispatch(
                                                    setShowProfilingWizard(
                                                        false
                                                    )
                                                )
                                            )
                                            .catch(res => {
                                                setErrorMessage(res);
                                                dispatch(
                                                    setProfilingStep('Error')
                                                );
                                            });
                                    } else {
                                        dispatch(setShowProfilingWizard(false));
                                    }
                                }}
                            >
                                Cancel
                            </DialogButton>
                        )}
                </>
            }
        >
            {profilingStep === 'Configuration' && (
                <Group>
                    <p>Configuration</p>
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
                </Group>
            )}
            {profilingStep === 'Charging' && (
                <>
                    <div>
                        <ChargingWarnings />
                        <p>
                            <span>
                                {usbPowered &&
                                batteryConnected &&
                                chargers[0].enabled
                                    ? 'Charging'
                                    : 'Not charging'}
                            </span>
                        </p>
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
            {profilingStep === 'Charged' && <ProfilingMessage />}
            {profilingStep === 'Resting' && (
                <>
                    <div>
                        <ProfilingMessage />
                        <p>
                            <span>Resting Battery</span>
                        </p>
                    </div>
                    <Form.Group>
                        <TimeComponent
                            time={time}
                            progress={
                                ((latestProfilingEvent?.data.cycle ?? 0) /
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
                <>
                    <div>
                        <Alert
                            label={
                                completeMessage?.level === 'success'
                                    ? 'Success '
                                    : 'Warning '
                            }
                            variant={completeMessage?.level ?? 'success'}
                        >
                            {completeMessage?.message ?? ''}
                        </Alert>
                        <p>
                            <span>{`Capacity consumed: ${capacityConsumedState.toFixed(
                                2
                            )}mAh`}</span>
                        </p>
                    </div>
                    <Form.Group>
                        <TimeComponent
                            ready
                            time={time}
                            progress={
                                (capacityConsumedState / batteryCapacity) * 100
                            }
                        />
                    </Form.Group>
                </>
            )}
            {profilingStep === 'Error' && (
                <Alert label="Error " variant="danger">
                    {`An error has occurred. Error message: ${errorMessage}`}
                </Alert>
            )}
        </GenericDialog>
    );
};
