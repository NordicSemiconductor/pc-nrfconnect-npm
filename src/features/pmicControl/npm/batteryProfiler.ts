/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';

import { ShellParser } from '../../../hooks/commandParser';
import { noop, toRegex } from './pmicHelpers';
import { IBatteryProfiler, Profile } from './types';

export const BatteryProfiler: IBatteryProfiler = (
    shellParser: ShellParser,
    eventEmitter: EventEmitter
) => {
    shellParser?.registerCommandCallback(
        toRegex('cc_profile start'),
        () => {
            eventEmitter.emit('onProfilingStateChange', true);
        },
        noop
    );

    shellParser?.registerCommandCallback(
        toRegex('cc_profile stop'),
        () => {
            eventEmitter.emit('onProfilingStateChange', false);
        },
        noop
    );

    const setProfile = (
        reportInterval: number,
        vCutoff: number,
        profiles: Profile[]
    ) =>
        new Promise<void>((resolve, reject) => {
            shellParser?.enqueueRequest(
                `cc_profile profile set ${reportInterval} ${vCutoff} ${profiles.map(
                    profile =>
                        `${profile.tLoad},${profile.tRest},${profile.iLoad},${
                            profile.iRest
                        }${profile.vCutoff ? `,${profile.vCutoff}` : ''}`
                )}`,
                () => {
                    resolve();
                },
                () => {
                    reject();
                }
            );
        });

    const startProfiling = () =>
        new Promise<void>((resolve, reject) => {
            shellParser?.enqueueRequest(
                'cc_profile start',
                () => {
                    resolve();
                },
                () => {
                    reject();
                }
            );
        });

    const stopProfiling = () =>
        new Promise<void>((resolve, reject) => {
            shellParser?.enqueueRequest(
                'cc_profile stop',
                () => {
                    resolve();
                },
                () => {
                    reject();
                }
            );
        });

    const isProfiling = () =>
        new Promise<boolean>(resolve => {
            resolve(true);
        });

    return {
        setProfile,
        startProfiling,
        stopProfiling,
        isProfiling,
        onProfilingStateChange: (handler: (state: boolean) => void) => {
            eventEmitter.on('onProfilingStateChange', handler);
            return () => {
                eventEmitter.removeListener('onProfilingStateChange', handler);
            };
        },
    };
};
