/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BatteryProfiler as nPM1300BatteryProfiler } from '../npm1300/batteryProfiler';
import { parseColonBasedAnswer, parseLogData } from '../pmicHelpers';
import { LoggingEvent, ModuleParams } from '../types';

export class BatteryProfiler extends nPM1300BatteryProfiler {
    constructor(params: ModuleParams) {
        super(params);

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
}
