/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';

import { ShellParser } from '../../../hooks/commandParser';
import { noop, parseLogData, parseToBoolean, toRegex } from './pmicHelpers';
import {
    CCProfile,
    CCProfilingState,
    IBatteryProfiler,
    LoggingEvent,
    ProfilingEvent,
    ProfilingEventData,
} from './types';

export const BatteryProfiler: IBatteryProfiler = (
    shellParser: ShellParser,
    eventEmitter: EventEmitter
) => {
    let profiling: CCProfilingState = 'Off';
    const processModuleCcProfiling = ({ timestamp, message }: LoggingEvent) => {
        if (message.includes('Success: Profiling sequence completed')) {
            profiling = 'Ready';
            eventEmitter.emit('onProfilingStateChange', profiling);
        } else if (message.includes('vcutoff reached')) {
            profiling = 'vCutOff';
            eventEmitter.emit('onProfilingStateChange', profiling);
        } else if (
            message.includes('Profiling stopped due to a thermal event')
        ) {
            profiling = 'ThermalError';
            eventEmitter.emit('onProfilingStateChange', profiling);
        } else {
            const messageParts = message.split(',');
            const data: ProfilingEventData = {
                iLoad: 0,
                vLoad: 0,
                tBat: 0,
                cycle: 0,
                seq: 0,
                rep: 0,
                t0: 0,
                t1: 0,
            };
            messageParts.forEach(part => {
                const pair = part.split('=');
                switch (pair[0]) {
                    case 'iload':
                        data.iLoad = Number.parseFloat(pair[1]);
                        break;
                    case 'vload':
                        data.vLoad = Number.parseFloat(pair[1]);
                        break;
                    case 'tbat':
                        data.tBat = Number.parseFloat(pair[1]);
                        break;
                    case 'cycle':
                        data.cycle = Number.parseInt(pair[1], 10);
                        break;
                    case 'seq':
                        data.seq = Number.parseInt(pair[1], 10);
                        break;
                    case 'rep':
                        data.rep = Number.parseInt(pair[1], 10);
                        break;
                    case 't0':
                        data.t0 = Number.parseFloat(pair[1]);
                        break;
                    case 't1':
                        data.t1 = Number.parseFloat(pair[1]);
                        break;
                }
            });

            const event: ProfilingEvent = { timestamp, data };
            eventEmitter.emit('onProfilingEvent', event);
        }
    };

    shellParser?.registerCommandCallback(
        toRegex('cc_profile start'),
        () => {
            if (profiling !== 'Running') {
                profiling = 'Running';
                eventEmitter.emit('onProfilingStateChange', profiling);
            }
        },
        noop
    );

    shellParser?.registerCommandCallback(
        toRegex('cc_profile active'),
        res => {
            const newState = parseToBoolean(res) ? 'Running' : 'Off';
            if (newState !== profiling) {
                profiling = newState;
                eventEmitter.emit('onProfilingStateChange', newState);
            }
        },
        noop
    );

    shellParser?.registerCommandCallback(
        toRegex('cc_profile stop'),
        () => {
            if (profiling !== 'Off') {
                profiling = 'Off';
                eventEmitter.emit('onProfilingStateChange', profiling);
            }
        },
        res => {
            if (res.includes('No profiling ongoing')) {
                if (profiling !== 'Off') {
                    profiling = 'Off';
                    eventEmitter.emit('onProfilingStateChange', profiling);
                }
            }
        }
    );

    shellParser?.onShellLoggingEvent(logEvent => {
        parseLogData(logEvent, loggingEvent => {
            if (loggingEvent.module === 'module_cc_profiling') {
                processModuleCcProfiling(loggingEvent);
            }
        });
    });

    const setProfile = (
        reportIntervalCc: number,
        reportIntervalNtc: number,
        vCutoff: number,
        profiles: CCProfile[]
    ) =>
        new Promise<void>((resolve, reject) => {
            const profilesString = profiles.map(
                profile =>
                    `"${profile.tLoad},${profile.tRest},${profile.iLoad},${
                        profile.iRest
                    },${profile.cycles ? `${profile.cycles}` : 'NaN'}${
                        profile.vCutoff ? `,${profile.vCutoff}` : ''
                    }"`
            );

            shellParser?.enqueueRequest(
                `cc_profile profile set ${reportIntervalCc} ${reportIntervalNtc} ${vCutoff} ${profilesString.join(
                    ' '
                )}`,
                {
                    onSuccess: () => {
                        resolve();
                    },
                    onError: reject,
                    onTimeout: error => {
                        reject(error);
                        console.warn(error);
                    },
                }
            );
        });

    const startProfiling = () =>
        new Promise<void>((resolve, reject) => {
            shellParser?.enqueueRequest('cc_profile start', {
                onSuccess: () => {
                    resolve();
                },
                onError: reject,
                onTimeout: error => {
                    reject(error);
                    console.warn(error);
                },
            });
        });

    const stopProfiling = () =>
        new Promise<void>((resolve, reject) => {
            shellParser?.enqueueRequest('cc_profile stop', {
                onSuccess: () => {
                    resolve();
                },
                onError: reject,
                onTimeout: error => {
                    reject(error);
                    console.warn(error);
                },
            });
        });

    const isProfiling = () =>
        new Promise<boolean>((resolve, reject) => {
            shellParser?.enqueueRequest('cc_profile active', {
                onSuccess: res => {
                    resolve(parseToBoolean(res));
                },
                onError: reject,
                onTimeout: error => {
                    reject(error);
                    console.warn(error);
                },
            });
        });

    const canProfile = () =>
        new Promise<boolean>((resolve, reject) => {
            shellParser?.enqueueRequest('cc_sink available', {
                onSuccess: res => {
                    resolve(parseToBoolean(res));
                },
                onError: reject,
                onTimeout: error => {
                    reject(error);
                    console.warn(error);
                },
            });
        });

    return {
        setProfile,
        startProfiling,
        stopProfiling,
        isProfiling,
        canProfile,
        getProfilingState: () => profiling,
        onProfilingStateChange: (
            handler: (state: CCProfilingState) => void
        ) => {
            eventEmitter.on('onProfilingStateChange', handler);
            return () => {
                eventEmitter.removeListener('onProfilingStateChange', handler);
            };
        },
        onProfilingEvent: (handler: (state: ProfilingEvent) => void) => {
            eventEmitter.on('onProfilingEvent', handler);
            return () => {
                eventEmitter.removeListener('onProfilingEvent', handler);
            };
        },
        pofError: () => {
            if (profiling !== 'Off' && profiling !== 'POF') {
                profiling = 'POF';
                eventEmitter.emit('onProfilingStateChange', profiling);
            }
        },
    };
};
