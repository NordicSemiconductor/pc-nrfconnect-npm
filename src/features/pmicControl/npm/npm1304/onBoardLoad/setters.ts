/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import { type OnBoardLoad } from '../../types';
import { OnBoardLoadGet } from './getters';

export class OnBoardLoadSet {
    private get: OnBoardLoadGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private offlineMode: boolean,
    ) {
        this.get = new OnBoardLoadGet(sendCommand);
    }

    async all(onBoardLoad: OnBoardLoad) {
        await Promise.allSettled([this.iLoad(onBoardLoad.iLoad)]);
    }

    iLoad(load: number) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<OnBoardLoad>(
                'onOnBoardLoadUpdate',
                {
                    iLoad: load,
                },
            );

            if (this.offlineMode) {
                resolve();
            } else {
                this.sendCommand(
                    `cc_sink level set ${load}`,
                    () => resolve(),
                    () => {
                        this.get.iLoad();
                        reject();
                    },
                );
            }
        });
    }
}
