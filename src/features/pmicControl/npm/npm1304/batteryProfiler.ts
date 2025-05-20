/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BatteryProfiler as nPM1300BatteryProfiler } from '../npm1300/batteryProfiler';
import { parseColonBasedAnswer, parseLogData } from '../pmicHelpers';
import { CCProfile, LoggingEvent, ModuleParams } from '../types';

export class BatteryProfiler extends nPM1300BatteryProfiler {
    constructor(params: ModuleParams) {
        super(params);
        this.restDurtion = 1800; // 30 min

        if (this.shellParser) {
            this.releaseAll.push(
                this.shellParser.onShellLoggingEvent(logEvent => {
                    parseLogData(logEvent, loggingEvent => {
                        if (loggingEvent.module === 'module_cc_sink') {
                            this.processModuleCCSink(loggingEvent);
                        }
                    });
                })
            );
        }
    }

    private processModuleCCSink({ message }: LoggingEvent) {
        if (message.includes('Active load switch position')) {
            this.eventEmitter.emit('onProfilingStateChange', this.profiling);
            const value = parseColonBasedAnswer(message);
            switch (value) {
                case 'OFF':
                case 'LS':
                    this.profiling = 'NOT VSYS';
                    this.eventEmitter.emit(
                        'onProfilingStateChange',
                        this.profiling
                    );
                    break;
            }
        }
    }

    canProfile() {
        return new Promise<true | 'MissingSyncBoard' | 'ActiveLoadNotVSYS'>(
            (resolve, reject) => {
                this.shellParser?.enqueueRequest(
                    'cc_sink load_switch_pos get',
                    {
                        onSuccess: res => {
                            const value = parseColonBasedAnswer(res);
                            resolve(
                                value === 'VSYS' ? true : 'ActiveLoadNotVSYS'
                            );
                        },
                        onError: reject,
                        onTimeout: error => {
                            reject(error);
                            console.warn(error);
                        },
                    }
                );
            }
        );
    }

    restingProfile(): CCProfile[] {
        return [
            {
                tLoad: 500,
                tRest: 500,
                iLoad: 0,
                iRest: 0,
                cycles: this.restDurtion,
            },
        ];
    }

    // eslint-disable-next-line class-methods-use-this
    loadProfile(
        capacity: number,
        vUpperCutOff: number,
        vLowerCutOff: number
    ): CCProfile[] {
        return [
            {
                tLoad: 500,
                tRest: 500,
                iLoad: 0,
                iRest: 0,
                cycles: 300, // 5Min
            },
            {
                tLoad: 600000, // 10Min
                tRest: 3600000, // 60Min
                iLoad: capacity / 6 / 1000, // A
                iRest: 0,
                vCutoff: vUpperCutOff - 0.3,
            },
            {
                tLoad: 300000, // 5Min
                tRest: 2700000, // 45Min
                iLoad: capacity / 6 / 1000, // A
                iRest: 0,
                vCutoff: vLowerCutOff + 0.5,
            },
            {
                tLoad: 300000, // 5Min
                tRest: 2700000, // 45Min
                iLoad: capacity / 12 / 1000, // A
                iRest: 0,
            },
        ];
    }
}
