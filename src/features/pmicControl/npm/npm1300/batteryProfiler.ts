/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';
import EventEmitter from 'events';

import { noop, parseLogData, parseToBoolean, toRegex } from '../pmicHelpers';
import {
    CCProfile,
    CCProfilingState,
    IBatteryProfiler,
    LoggingEvent,
    ProfilingEvent,
    ProfilingEventData,
} from '../types';

export class BatteryProfiler implements IBatteryProfiler {
    #profiling: CCProfilingState = 'Off';
    #releaseAll: (() => void)[] = [];

    constructor(
        private shellParser: ShellParser,
        private eventEmitter: EventEmitter
    ) {
        if (shellParser) {
            this.#releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('cc_profile start'),
                    () => {
                        if (this.#profiling !== 'Running') {
                            this.#profiling = 'Running';
                            eventEmitter.emit(
                                'onProfilingStateChange',
                                this.#profiling
                            );
                        }
                    },
                    noop
                )
            );

            this.#releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('cc_profile active'),
                    res => {
                        const newState = parseToBoolean(res)
                            ? 'Running'
                            : 'Off';
                        if (newState !== this.#profiling) {
                            this.#profiling = newState;
                            eventEmitter.emit(
                                'onProfilingStateChange',
                                newState
                            );
                        }
                    },
                    noop
                )
            );

            this.#releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('cc_profile stop'),
                    () => {
                        if (this.#profiling !== 'Off') {
                            this.#profiling = 'Off';
                            eventEmitter.emit(
                                'onProfilingStateChange',
                                this.#profiling
                            );
                        }
                    },
                    res => {
                        if (res.includes('No profiling ongoing')) {
                            if (this.#profiling !== 'Off') {
                                this.#profiling = 'Off';
                                eventEmitter.emit(
                                    'onProfilingStateChange',
                                    this.#profiling
                                );
                            }
                        }
                    }
                )
            );

            this.#releaseAll.push(
                shellParser.onShellLoggingEvent(logEvent => {
                    parseLogData(logEvent, loggingEvent => {
                        if (loggingEvent.module === 'module_cc_profiling') {
                            this.processModuleCcProfiling(loggingEvent);
                        }
                    });
                })
            );
        }
    }

    private processModuleCcProfiling({ timestamp, message }: LoggingEvent) {
        if (message.includes('Success: Profiling sequence completed')) {
            this.#profiling = 'Ready';
            this.eventEmitter.emit('onProfilingStateChange', this.#profiling);
        } else if (message.includes('vcutoff reached')) {
            this.#profiling = 'vCutOff';
            this.eventEmitter.emit('onProfilingStateChange', this.#profiling);
        } else if (
            message.includes('Profiling stopped due to a thermal event')
        ) {
            this.#profiling = 'ThermalError';
            this.eventEmitter.emit('onProfilingStateChange', this.#profiling);
        } else {
            const messageParts = message.split(',');
            const data: ProfilingEventData = {
                iLoad: 0,
                vLoad: 0,
                tBat: 0,
                cycle: 0,
                seq: 0,
                rep: 0,
                tload: 0,
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
                    case 'tload':
                        data.tload = Number.parseFloat(pair[1]);
                        break;
                }
            });

            const event: ProfilingEvent = { timestamp, data };
            this.eventEmitter.emit('onProfilingEvent', event);
        }
    }

    setProfile(
        reportIntervalCc: number,
        reportIntervalNtc: number,
        vCutoff: number,
        profiles: CCProfile[]
    ) {
        return new Promise<void>((resolve, reject) => {
            const profilesString = profiles.map(
                profile =>
                    `"${profile.tLoad},${profile.tRest},${profile.iLoad},${
                        profile.iRest
                    },${profile.cycles ? `${profile.cycles}` : 'NaN'}${
                        profile.vCutoff ? `,${profile.vCutoff}` : ''
                    }"`
            );

            this.shellParser?.enqueueRequest(
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
    }

    startProfiling() {
        return new Promise<void>((resolve, reject) => {
            this.shellParser?.enqueueRequest('cc_profile start', {
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
    }

    stopProfiling() {
        return new Promise<void>((resolve, reject) => {
            this.shellParser?.enqueueRequest('cc_profile stop', {
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
    }

    isProfiling() {
        return new Promise<boolean>((resolve, reject) => {
            this.shellParser?.enqueueRequest('cc_profile active', {
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
    }

    canProfile() {
        return new Promise<boolean>((resolve, reject) => {
            this.shellParser?.enqueueRequest('cc_sink available', {
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
    }

    onProfilingStateChange(handler: (state: CCProfilingState) => void) {
        this.eventEmitter.on('onProfilingStateChange', handler);
        return () => {
            this.eventEmitter.removeListener('onProfilingStateChange', handler);
        };
    }

    getProfilingState() {
        return this.#profiling;
    }

    onProfilingEvent(handler: (state: ProfilingEvent) => void) {
        this.eventEmitter.on('onProfilingEvent', handler);
        return () => {
            this.eventEmitter.removeListener('onProfilingEvent', handler);
        };
    }

    pofError() {
        if (this.#profiling !== 'Off' && this.#profiling !== 'POF') {
            this.#profiling = 'POF';
            this.eventEmitter.emit('onProfilingStateChange', this.#profiling);
        }
    }

    release() {
        this.#releaseAll.forEach(release => release());
    }
}
