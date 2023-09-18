/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Buck, Charger, Ldo, PartialUpdate, PmicDialog } from '../../types';
import { setupMocksBase } from './helpers';

describe('PMIC 1300 - Apply Config ', () => {
    const {
        mockOnChargerUpdate,
        mockOnBuckUpdate,
        mockOnLdoUpdate,
        mockOnFuelGaugeUpdate,
        mockDialogHandler,
        pmic,
    } = setupMocksBase();

    const initCharger: Charger = {
        vTerm: -1,
        vTrickleFast: 2.9,
        iChg: -1,
        enabled: true,
        enableRecharging: true,
        iTerm: '20%',
        ntcThermistor: '10 kΩ',
        tChgStop: 10,
        tChgResume: 110,
        currentCool: 'iCHG',
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
    };

    const initLdo: Ldo = {
        voltage: -1,
        mode: 'LDO',
        enabled: true,
    };

    let charger: Charger | undefined;
    let bucks: Buck[] = [];
    let ldos: Ldo[] = [];

    beforeEach(() => {
        jest.clearAllMocks();

        charger = undefined;
        bucks = [];
        ldos = [];

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
    });

    const verifyApplyConfig = () => {
        expect(charger).toStrictEqual({
            vTerm: 3.5,
            vTrickleFast: 2.5,
            iChg: 32,
            enabled: false,
            iTerm: '10%',
            enableRecharging: false,
            ntcThermistor: '10 kΩ',
            tChgStop: 10,
            tChgResume: 110,
            currentCool: 'iCHG',
            vTermR: 4,
            tCold: 1,
            tCool: 12,
            tWarm: 47,
            tHot: 69,
        });

        expect(bucks).toStrictEqual([
            {
                vOutNormal: 1,
                vOutRetention: 1,
                mode: 'vSet',
                enabled: true,
                modeControl: 'GPIO0',
                onOffControl: 'GPIO1',
                retentionControl: 'GPIO2',
            },
            {
                vOutNormal: 2,
                vOutRetention: 2,
                mode: 'vSet',
                enabled: true,
                modeControl: 'GPIO1',
                onOffControl: 'GPIO2',
                retentionControl: 'GPIO3',
            },
        ]);

        expect(ldos).toStrictEqual([
            {
                voltage: 1,
                mode: 'ldoSwitch',
                enabled: false,
            },
            {
                voltage: 2,
                mode: 'ldoSwitch',
                enabled: false,
            },
        ]);

        expect(mockOnChargerUpdate).toBeCalledTimes(7);
        expect(mockOnBuckUpdate).toBeCalledTimes(16); // 7 states + 1 (mode change on vOut) * 2 Bucks
        expect(mockOnLdoUpdate).toBeCalledTimes(6);

        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
        expect(mockOnFuelGaugeUpdate).toBeCalledWith(true);
    };

    test('Apply Correct config', () => {
        pmic.applyConfig({
            charger: {
                vTerm: 3.5,
                vTrickleFast: 2.5,
                iChg: 32,
                enabled: false,
                iTerm: '10%',
                enableRecharging: false,
                ntcThermistor: '10 kΩ',
                tChgStop: 10,
                tChgResume: 110,
                currentCool: 'iCHG',
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
                },
                {
                    vOutNormal: 2,
                    vOutRetention: 2,
                    mode: 'vSet',
                    enabled: true,
                    modeControl: 'GPIO1',
                    onOffControl: 'GPIO2',
                    retentionControl: 'GPIO3',
                },
            ],
            ldos: [
                {
                    voltage: 1,
                    mode: 'ldoSwitch',
                    enabled: false,
                },
                {
                    voltage: 2,
                    mode: 'ldoSwitch',
                    enabled: false,
                },
            ],
            fuelGauge: true,
            firmwareVersion: '0.9.2+0',
            deviceType: 'npm1300',
            fuelGaugeChargingSamplingRate: 1000,
        });
        verifyApplyConfig();
    });

    test('Apply wrong firmware version -- Yes', () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            dialog.onConfirm();
        });

        pmic.applyConfig({
            charger: {
                vTerm: 3.5,
                vTrickleFast: 2.5,
                iChg: 32,
                enabled: false,
                iTerm: '10%',
                enableRecharging: false,
                ntcThermistor: '10 kΩ',
                tChgStop: 10,
                tChgResume: 110,
                currentCool: 'iCHG',
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
                },
                {
                    vOutNormal: 2,
                    vOutRetention: 2,
                    mode: 'vSet',
                    enabled: true,
                    modeControl: 'GPIO1',
                    onOffControl: 'GPIO2',
                    retentionControl: 'GPIO3',
                },
            ],
            ldos: [
                {
                    voltage: 1,
                    mode: 'ldoSwitch',
                    enabled: false,
                },
                {
                    voltage: 2,
                    mode: 'ldoSwitch',
                    enabled: false,
                },
            ],
            fuelGauge: true,
            firmwareVersion: '0.0.0+9',
            deviceType: 'npm1300',
            fuelGaugeChargingSamplingRate: 1000,
        });

        expect(mockDialogHandler).toBeCalledTimes(1);

        verifyApplyConfig();
    });

    test("Apply wrong firmware version -- Yes, Don't ask again", () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            if (dialog.onOptional) dialog.onOptional();
        });

        pmic.applyConfig({
            charger: {
                vTerm: 3.5,
                vTrickleFast: 2.5,
                iChg: 32,
                enabled: false,
                iTerm: '10%',
                enableRecharging: false,
                ntcThermistor: '10 kΩ',
                tChgStop: 10,
                tChgResume: 110,
                currentCool: 'iCHG',
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
                },
                {
                    vOutNormal: 2,
                    vOutRetention: 2,
                    mode: 'vSet',
                    enabled: true,
                    modeControl: 'GPIO1',
                    onOffControl: 'GPIO2',
                    retentionControl: 'GPIO3',
                },
            ],
            ldos: [
                {
                    voltage: 1,
                    mode: 'ldoSwitch',
                    enabled: false,
                },
                {
                    voltage: 2,
                    mode: 'ldoSwitch',
                    enabled: false,
                },
            ],
            fuelGauge: true,
            firmwareVersion: '0.0.0+9',
            deviceType: 'npm1300',
            fuelGaugeChargingSamplingRate: 1000,
        });

        expect(mockDialogHandler).toBeCalledTimes(1);

        verifyApplyConfig();
    });

    test('Apply wrong firmware version -- Cancel', () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            dialog.onCancel();
        });

        pmic.applyConfig({
            charger: {
                vTerm: 3.5,
                vTrickleFast: 2.5,
                iChg: 32,
                enabled: false,
                iTerm: '10%',
                enableRecharging: false,
                ntcThermistor: '10 kΩ',
                tChgStop: 10,
                tChgResume: 110,
                currentCool: 'iCHG',
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
                },
                {
                    vOutNormal: 2,
                    vOutRetention: 2,
                    mode: 'vSet',
                    enabled: true,
                    modeControl: 'GPIO1',
                    onOffControl: 'GPIO2',
                    retentionControl: 'GPIO3',
                },
            ],
            ldos: [
                {
                    voltage: 1,
                    mode: 'ldoSwitch',
                    enabled: false,
                },
                {
                    voltage: 2,
                    mode: 'ldoSwitch',
                    enabled: false,
                },
            ],
            fuelGauge: true,
            firmwareVersion: '0.0.0+9',
            deviceType: 'npm1300',
            fuelGaugeChargingSamplingRate: 1000,
        });

        expect(mockDialogHandler).toBeCalledTimes(1);

        expect(mockOnChargerUpdate).toBeCalledTimes(0);
        expect(mockOnBuckUpdate).toBeCalledTimes(0);
        expect(mockOnLdoUpdate).toBeCalledTimes(0);
        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
    });
});
export {};
