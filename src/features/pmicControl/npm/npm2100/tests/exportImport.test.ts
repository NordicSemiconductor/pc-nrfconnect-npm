/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    Charger,
    GPIO,
    GPIOExport,
    Ldo,
    LED,
    LowPowerConfig,
    npm2100LowPowerConfig,
    npm2100TimerConfig,
    npm2100TimeToActive,
    NpmExportLatest,
    PartialUpdate,
    PmicDialog,
    POF,
    ResetConfig,
    TimerConfig,
    USBPower,
} from '../../types';
import { GPIOMode2100, GPIOPull2100 } from '../gpio/types';
import { toLdoExport } from '../ldo';
import { npm2100FWVersion } from '../pmic2100Device';
import { npm2100TimerMode } from '../types';
import { setupMocksBase } from './helpers';

test.skip('PMIC 2100 - Apply Config ', () => {
    const {
        mockOnChargerUpdate,
        mockOnBuckUpdate,
        mockOnLdoUpdate,
        mockOnGpioUpdate,
        mockOnLEDUpdate,
        mockOnPOFUpdate,
        mockOnLowPowerUpdate,
        mockOnResetUpdate,
        mockOnTimerConfigUpdate,
        mockOnFuelGaugeUpdate,
        mockDialogHandler,
        mockOnUsbPower,
        pmic,
    } = setupMocksBase();

    const initCharger: Charger = {
        vTerm: -1,
        vTrickleFast: 2.9,
        iChg: -1,
        enabled: true,
        enableRecharging: true,
        enableVBatLow: false,
        iTerm: '20%',
        iBatLim: 1340,
        ntcThermistor: '10 kΩ',
        ntcBeta: 3380,
        tChgStop: 10,
        tChgResume: 110,
        vTermR: 4,
        tCold: 1,
        tCool: 12,
        tWarm: 47,
        tHot: 69,
    };

    const initLdo: Ldo = {
        voltage: -1,
        mode: 'LDO',
        enabled: true,
        softStartEnabled: true,
        softStart: 20,
        activeDischarge: false,
        onOffControl: 'GPIO0',
        onOffSoftwareControlEnabled: false,
    };

    const initLed: LED = {
        mode: 'Charger error',
    };

    const initPOF: POF = {
        enable: true,
        threshold: 2.8,
        polarity: 'Active high',
    };

    const initTimerConfig: TimerConfig = {
        enabled: false,
        mode: npm2100TimerMode['Wake up'],
        period: 0,
    };

    const initLowPower: npm2100LowPowerConfig = {
        timeToActive: npm2100TimeToActive['100ms'],
        powerButtonEnable: true,
    };

    const initReset: ResetConfig = {
        longPressReset: 'two_button',
    };

    const initUSBPower: Omit<USBPower, 'detectStatus'> = {
        currentLimiter: 100,
    };

    const sampleConfig: NpmExportLatest = {
        boosts: [
            {
                vOutSoftware: 1.8,
                vOutSelect: 'Vset',
                modeControl: 'AUTO',
                pinSelection: 'OFF',
                pinMode: 'HP',
                overCurrentProtection: false,
            },
        ],
        charger: undefined,
        bucks: [],
        ldos: [
            {
                voltage: 1,
                mode: 'Load_switch',
                enabled: false,
                softStartEnabled: false,
                softStart: 50,
                activeDischarge: true,
                onOffControl: 'GPIO1',
            },
            {
                voltage: 2,
                mode: 'Load_switch',
                enabled: false,
                softStartEnabled: false,
                softStart: 50,
                activeDischarge: false,
                onOffControl: 'GPIO2',
            },
        ],
        gpios: [
            {
                mode: GPIOMode2100.Input,
                pull: GPIOPull2100['Pull down'],
                drive: 6,
                openDrain: false,
                debounce: false,
            },
            {
                mode: GPIOMode2100.Output,
                pull: GPIOPull2100['Pull down'],
                drive: 6,
                openDrain: true,
                debounce: true,
            },
        ],
        leds: [
            {
                mode: 'Charger error',
            },
            {
                mode: 'Charging',
            },
            {
                mode: 'Not used',
            },
        ],
        pof: {
            enable: false,
            threshold: 2.4,
            polarity: 'Active low',
        },
        timerConfig: {
            enabled: false,
            mode: npm2100TimerMode['General Purpose'],
            period: 10,
        },
        lowPower: {
            timeToActive: npm2100TimeToActive['30ms'],
            powerButtonEnable: true,
        },
        reset: {
            longPressReset: 'one_button',
        },
        fuelGaugeSettings: {
            enabled: true,
        },
        firmwareVersion: npm2100FWVersion,
        deviceType: 'npm2100',
        usbPower: {
            currentLimiter: 500,
        },
        fileFormatVersion: 2,
    };

    const initGPIO: GPIOExport = {
        mode: GPIOMode2100.Output,
        pull: GPIOPull2100['Pull down'],
        drive: 6,
        openDrain: false,
        debounce: false,
    };

    let charger: Charger | undefined;
    let ldos: Ldo[] = [];
    let gpios: GPIO[] = [];
    let leds: LED[] = [];
    let pof: POF = { ...initPOF };
    let ship: npm2100LowPowerConfig = { ...initLowPower };
    let reset: ResetConfig = { ...initReset };
    let timerConfig = { ...initTimerConfig };
    let usbPower = { ...initUSBPower };

    beforeEach(() => {
        jest.clearAllMocks();

        charger = undefined;
        ldos = [];
        gpios = [];
        leds = [];
        pof = { ...initPOF };
        ship = { ...initLowPower };
        reset = { ...initReset };
        timerConfig = { ...initTimerConfig };

        mockOnChargerUpdate.mockImplementation(
            (partialUpdate: Partial<Charger>) => {
                charger = {
                    ...(charger ?? initCharger),
                    ...partialUpdate,
                };
            }
        );

        mockOnLdoUpdate.mockImplementation(
            (partialUpdate: PartialUpdate<Ldo>) => {
                ldos[partialUpdate.index] = {
                    ...(ldos[partialUpdate.index] ?? initLdo),
                    ...partialUpdate.data,
                };
            }
        );

        mockOnGpioUpdate.mockImplementation(
            (partialUpdate: PartialUpdate<GPIO>) => {
                delete partialUpdate.data.pullEnabled;
                delete partialUpdate.data.debounceEnabled;
                delete partialUpdate.data.driveEnabled;
                delete partialUpdate.data.openDrainEnabled;

                gpios[partialUpdate.index] = {
                    ...(gpios[partialUpdate.index] ?? initGPIO),
                    ...partialUpdate.data,
                };
            }
        );

        mockOnLEDUpdate.mockImplementation(
            (partialUpdate: PartialUpdate<LED>) => {
                leds[partialUpdate.index] = {
                    ...(leds[partialUpdate.index] ?? initLed),
                    ...partialUpdate.data,
                };
            }
        );

        mockOnPOFUpdate.mockImplementation((partialUpdate: Partial<POF>) => {
            pof = {
                ...pof,
                ...partialUpdate,
            };
        });

        mockOnLowPowerUpdate.mockImplementation(
            (partialUpdate: Partial<LowPowerConfig>) => {
                ship = {
                    ...ship,
                    ...partialUpdate,
                } as npm2100LowPowerConfig;
            }
        );

        mockOnResetUpdate.mockImplementation(
            (partialUpdate: Partial<ResetConfig>) => {
                reset = {
                    ...reset,
                    ...partialUpdate,
                };
            }
        );

        mockOnTimerConfigUpdate.mockImplementation(
            (partialUpdate: Partial<TimerConfig>) => {
                timerConfig = {
                    ...timerConfig,
                    ...partialUpdate,
                } as npm2100TimerConfig;
            }
        );

        mockOnUsbPower.mockImplementation(
            (partialUpdate: Partial<USBPower>) => {
                usbPower = {
                    ...usbPower,
                    ...partialUpdate,
                };
            }
        );
    });

    const verifyApplyConfig = () => {
        expect(charger).toStrictEqual(sampleConfig.charger);

        expect(ldos.map(toLdoExport)).toStrictEqual(sampleConfig.ldos);

        expect(gpios).toStrictEqual(sampleConfig.gpios);

        expect(mockOnChargerUpdate).toBeCalledTimes(17);
        expect(mockOnBuckUpdate).toBeCalledTimes(18); // 7 states + 1 (mode change on vOut) * 2 Bucks
        expect(mockOnLdoUpdate).toBeCalledTimes(14);
        expect(mockOnGpioUpdate).toBeCalledTimes(25);
        expect(mockOnLEDUpdate).toBeCalledTimes(3);
        expect(mockOnPOFUpdate).toBeCalledTimes(3);
        expect(mockOnLowPowerUpdate).toBeCalledTimes(2);
        expect(mockOnTimerConfigUpdate).toBeCalledTimes(3);

        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
        expect(mockOnFuelGaugeUpdate).toBeCalledWith(true);

        expect(mockOnUsbPower).toBeCalledTimes(1);
    };

    test('Apply Correct config', async () => {
        await pmic.applyConfig(sampleConfig);
        verifyApplyConfig();
    });

    test('Apply wrong firmware version -- Yes', async () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            dialog.onConfirm();
        });

        await pmic.applyConfig({ ...sampleConfig, firmwareVersion: '0.0.0+9' });

        expect(mockDialogHandler).toBeCalledTimes(1);

        verifyApplyConfig();
    });

    test("Apply wrong firmware version -- Yes, Don't ask again", async () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            if (dialog.onOptional) dialog.onOptional();
        });

        await pmic.applyConfig({ ...sampleConfig, firmwareVersion: '0.0.0+9' });

        expect(mockDialogHandler).toBeCalledTimes(1);

        verifyApplyConfig();
    });

    test('Apply wrong firmware version -- Cancel', async () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            dialog.onCancel?.();
        });

        await pmic.applyConfig({ ...sampleConfig, firmwareVersion: '0.0.0+9' });

        expect(mockDialogHandler).toBeCalledTimes(1);

        expect(mockOnChargerUpdate).toBeCalledTimes(0);
        expect(mockOnBuckUpdate).toBeCalledTimes(0);
        expect(mockOnLdoUpdate).toBeCalledTimes(0);
        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
    });
});
export {};
