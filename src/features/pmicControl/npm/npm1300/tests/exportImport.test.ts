/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    Buck,
    Charger,
    GPIO,
    Ldo,
    LED,
    NpmExport,
    PartialUpdate,
    PmicDialog,
    POF,
    ShipModeConfig,
    TimerConfig,
    USBPower,
} from '../../types';
import { npm1300FWVersion } from '../pmic1300Device';
import { setupMocksBase } from './helpers';

describe('PMIC 1300 - Apply Config ', () => {
    const {
        mockOnChargerUpdate,
        mockOnBuckUpdate,
        mockOnLdoUpdate,
        mockOnGpioUpdate,
        mockOnLEDUpdate,
        mockOnPOFUpdate,
        mockOnShipUpdate,
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

    const initBuck: Buck = {
        vOutNormal: -1,
        vOutRetention: -1,
        mode: 'software',
        enabled: false,
        modeControl: 'GPIO0',
        onOffControl: 'GPIO0',
        retentionControl: 'GPIO0',
        activeDischarge: false,
    };

    const initLdo: Ldo = {
        voltage: -1,
        mode: 'LDO',
        enabled: true,
        softStartEnabled: true,
        softStart: 25,
        activeDischarge: false,
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
        mode: 'Boot monitor',
        prescaler: 'Slow',
        period: 0,
    };

    const initShip: ShipModeConfig = {
        timeToActive: 96,
        invPolarity: false,
        longPressReset: true,
        twoButtonReset: true,
    };

    const initUSBPower: Omit<USBPower, 'detectStatus'> = {
        currentLimiter: 100,
    };

    const sampleConfig: NpmExport = {
        charger: {
            vTerm: 3.5,
            vTrickleFast: 2.5,
            iChg: 32,
            enabled: false,
            iTerm: '10%',
            iBatLim: 1340,
            enableRecharging: false,
            ntcThermistor: '10 kΩ',
            ntcBeta: 3380,
            tChgStop: 10,
            tChgResume: 110,
            vTermR: 4,
            tCold: 1,
            tCool: 12,
            tWarm: 47,
            tHot: 69,
        },
        bucks: [
            {
                vOutNormal: 1,
                vOutRetention: 1,
                mode: 'vSet',
                enabled: true,
                modeControl: 'GPIO0',
                onOffControl: 'GPIO1',
                retentionControl: 'GPIO2',
                activeDischarge: false,
            },
            {
                vOutNormal: 2,
                vOutRetention: 2,
                mode: 'vSet',
                enabled: true,
                modeControl: 'GPIO1',
                onOffControl: 'GPIO2',
                retentionControl: 'GPIO3',
                activeDischarge: false,
            },
        ],
        ldos: [
            {
                voltage: 1,
                mode: 'ldoSwitch',
                enabled: false,
                softStartEnabled: true,
                softStart: 25,
                activeDischarge: false,
            },
            {
                voltage: 2,
                mode: 'ldoSwitch',
                enabled: false,
                softStartEnabled: true,
                softStart: 25,
                activeDischarge: false,
            },
        ],
        gpios: [
            {
                mode: 'Input',
                pull: 'Pull down',
                drive: 6,
                openDrain: false,
                debounce: false,
            },
            {
                mode: 'Input falling edge event',
                pull: 'Pull down',
                drive: 6,
                openDrain: true,
                debounce: true,
            },
            {
                mode: 'Input logic 0',
                pull: 'Pull up',
                drive: 1,
                openDrain: false,
                debounce: true,
            },
            {
                mode: 'Output logic 0',
                pull: 'Pull disable',
                drive: 1,
                openDrain: true,
                debounce: false,
            },
            {
                mode: 'Output power loss warning',
                pull: 'Pull disable',
                drive: 1,
                openDrain: false,
                debounce: false,
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
        pof: initPOF,
        timerConfig: initTimerConfig,
        ship: initShip,
        fuelGauge: true,
        firmwareVersion: npm1300FWVersion,
        deviceType: 'npm1300',
        fuelGaugeChargingSamplingRate: 1000,
        usbPower: {
            currentLimiter: 500,
        },
    };

    const initGPIO: GPIO = {
        mode: 'Input falling edge event',
        pull: 'Pull down',
        drive: 6,
        openDrain: false,
        debounce: false,
    };

    let charger: Charger | undefined;
    let bucks: Buck[] = [];
    let ldos: Ldo[] = [];
    let gpios: GPIO[] = [];
    let leds: LED[] = [];
    let pof: POF = { ...initPOF };
    let ship: ShipModeConfig = { ...initShip };
    let timerConfig = { ...initTimerConfig };
    let usbPower = { ...initUSBPower };

    beforeEach(() => {
        jest.clearAllMocks();

        charger = undefined;
        bucks = [];
        ldos = [];
        gpios = [];
        leds = [];
        pof = { ...initPOF };
        ship = { ...initShip };
        timerConfig = { ...initTimerConfig };

        mockOnChargerUpdate.mockImplementation(
            (partialUpdate: Partial<Charger>) => {
                charger = {
                    ...(charger ?? initCharger),
                    ...partialUpdate,
                };
            }
        );

        mockOnBuckUpdate.mockImplementation(
            (partialUpdate: PartialUpdate<Buck>) => {
                bucks[partialUpdate.index] = {
                    ...(bucks[partialUpdate.index] ?? initBuck),
                    ...partialUpdate.data,
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

        mockOnShipUpdate.mockImplementation(
            (partialUpdate: Partial<ShipModeConfig>) => {
                ship = {
                    ...ship,
                    ...partialUpdate,
                };
            }
        );

        mockOnTimerConfigUpdate.mockImplementation(
            (partialUpdate: Partial<TimerConfig>) => {
                timerConfig = {
                    ...timerConfig,
                    ...partialUpdate,
                };
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

        expect(bucks).toStrictEqual(sampleConfig.bucks);

        expect(ldos).toStrictEqual(sampleConfig.ldos);

        expect(gpios).toStrictEqual(sampleConfig.gpios);

        expect(mockOnChargerUpdate).toBeCalledTimes(16);
        expect(mockOnBuckUpdate).toBeCalledTimes(18); // 7 states + 1 (mode change on vOut) * 2 Bucks
        expect(mockOnLdoUpdate).toBeCalledTimes(12);
        expect(mockOnGpioUpdate).toBeCalledTimes(25);
        expect(mockOnLEDUpdate).toBeCalledTimes(3);
        expect(mockOnPOFUpdate).toBeCalledTimes(3);
        expect(mockOnShipUpdate).toBeCalledTimes(4);
        expect(mockOnTimerConfigUpdate).toBeCalledTimes(3);

        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
        expect(mockOnFuelGaugeUpdate).toBeCalledWith(true);

        expect(mockOnUsbPower).toBeCalledTimes(1);
    };

    test('Apply Correct config', () => {
        pmic.applyConfig(sampleConfig);
        verifyApplyConfig();
    });

    test('Apply wrong firmware version -- Yes', () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            dialog.onConfirm();
        });

        pmic.applyConfig({ ...sampleConfig, firmwareVersion: '0.0.0+9' });

        expect(mockDialogHandler).toBeCalledTimes(1);

        verifyApplyConfig();
    });

    test("Apply wrong firmware version -- Yes, Don't ask again", () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            if (dialog.onOptional) dialog.onOptional();
        });

        pmic.applyConfig({ ...sampleConfig, firmwareVersion: '0.0.0+9' });

        expect(mockDialogHandler).toBeCalledTimes(1);

        verifyApplyConfig();
    });

    test('Apply wrong firmware version -- Cancel', () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            dialog.onCancel();
        });

        pmic.applyConfig({ ...sampleConfig, firmwareVersion: '0.0.0+9' });

        expect(mockDialogHandler).toBeCalledTimes(1);

        expect(mockOnChargerUpdate).toBeCalledTimes(0);
        expect(mockOnBuckUpdate).toBeCalledTimes(0);
        expect(mockOnLdoUpdate).toBeCalledTimes(0);
        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
    });
});
export {};
