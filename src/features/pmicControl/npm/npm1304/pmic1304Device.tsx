/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { RootState } from '../../../../appReducer';
import BaseNpmDevice from '../basePmicDevice';
import nPM1300Device from '../npm1300/pmic1300Device';
import { parseLogData, parseToFloat } from '../pmicHelpers';
import { LoggingEvent, OnBoardLoad, PmicDialog } from '../types';
import { BatteryProfiler } from './batteryProfiler';
import ChargerModule from './charger';
import OnBoardLoadModule from './onBoardLoad';

export const npm1304FWVersion = '0.2.1+0';

export default class Npm1304 extends nPM1300Device {
    constructor(
        shellParser: ShellParser | undefined,
        dialogHandler: ((dialog: PmicDialog) => void) | null
    ) {
        super(
            shellParser,
            dialogHandler,
            {
                ChargerModule,
                BatteryProfiler,
                OnBoardLoadModule,
            },
            'npm1304',
            npm1304FWVersion
        );

        if (shellParser) {
            this.releaseAll.push(
                shellParser.onShellLoggingEvent(logEvent => {
                    parseLogData(logEvent, loggingEvent => {
                        switch (loggingEvent.module) {
                            case 'module_cc_sink':
                                this.processModuleCCSink(loggingEvent);
                                break;
                        }
                    });
                })
            );
        }
    }

    private processModuleCCSink({ message }: LoggingEvent) {
        if (message.startsWith('cc_level:')) {
            const value = parseToFloat(message);
            this.eventEmitter.emit('onOnBoardLoadUpdate', {
                iLoad: value,
            } satisfies OnBoardLoad);
        }
    }

    generateExport(
        getState: () => RootState & {
            app: { pmicControl: { npmDevice: BaseNpmDevice } };
        }
    ) {
        const currentState = getState().app.pmicControl;

        return {
            ...super.generateExport(getState),
            onBoardLoad: currentState.onBoardLoad,
        };
    }
}
