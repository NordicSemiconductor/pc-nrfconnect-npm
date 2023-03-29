/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '../../../hooks/commandParser';
import { getNPM1300 } from './pmic1300Device';
import { PmicWarningDialog } from './types';

const PMIC_1300_BUCKS = [0, 1];
const PMIC_1300_LDOS = [0, 1];
const PMIC_1300_CHARGERS = [0];
const PMIC_1300_GPIOS = [0, 1, 2, 3, 4];

const setupMocksBase = (shellParser: ShellParser | undefined = undefined) => {
    const mockWarningDialogHandler = jest.fn(
        (pmicWarningDialog: PmicWarningDialog) => {}
    );

    const pmic = getNPM1300(shellParser, mockWarningDialogHandler);

    const mockOnActiveBatteryModelUpdate = jest.fn(() => () => {});
    const mockOnAdcSample = jest.fn(() => () => {});
    const mockOnBeforeReboot = jest.fn(() => () => {});
    const mockOnBuckUpdate = jest.fn(() => () => {});
    const mockOnChargerUpdate = jest.fn(() => () => {});
    const mockOnChargingStatusUpdate = jest.fn(() => () => {});
    const mockOnFuelGaugeUpdate = jest.fn(() => () => {});
    const mockOnLdoUpdate = jest.fn(() => () => {});
    const mockOnLoggingEvent = jest.fn(() => () => {});
    const mockOnPmicStateChange = jest.fn(() => () => {});
    const mockOnReboot = jest.fn(() => () => {});
    const mockOnStoredBatteryModelUpdate = jest.fn(() => () => {});
    const mockOnUsbPowered = jest.fn(() => () => {});

    pmic.onActiveBatteryModelUpdate(mockOnActiveBatteryModelUpdate);
    pmic.onAdcSample(mockOnAdcSample);
    pmic.onBeforeReboot(mockOnBeforeReboot);
    pmic.onBuckUpdate(mockOnBuckUpdate);
    pmic.onChargerUpdate(mockOnChargerUpdate);
    pmic.onChargingStatusUpdate(mockOnChargingStatusUpdate);
    pmic.onFuelGaugeUpdate(mockOnFuelGaugeUpdate);
    pmic.onLdoUpdate(mockOnLdoUpdate);
    pmic.onLoggingEvent(mockOnLoggingEvent);
    pmic.onPmicStateChange(mockOnPmicStateChange);
    pmic.onReboot(mockOnReboot);
    pmic.onStoredBatteryModelUpdate(mockOnStoredBatteryModelUpdate);
    pmic.onUsbPowered(mockOnUsbPowered);

    return {
        mockWarningDialogHandler,
        mockOnActiveBatteryModelUpdate,
        mockOnAdcSample,
        mockOnBeforeReboot,
        mockOnBuckUpdate,
        mockOnChargerUpdate,
        mockOnChargingStatusUpdate,
        mockOnFuelGaugeUpdate,
        mockOnLdoUpdate,
        mockOnLoggingEvent,
        mockOnPmicStateChange,
        mockOnReboot,
        mockOnStoredBatteryModelUpdate,
        mockOnUsbPowered,
        pmic,
    };
};

const setupMocksWithShellParser = () => {
    const mockOnPausedChange = jest.fn(
        (handler: (state: boolean) => void) => () => {}
    );
    const mockOnShellLoggingEvent = jest.fn(
        (handler: (state: string) => void) => () => {}
    );
    const mockOnUnknownCommand = jest.fn(
        (handler: (state: string) => void) => () => {}
    );
    const mockEnqueueRequest = jest.fn(
        (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (message: string, command: string) => void,
            unique?: boolean
        ) => Promise.resolve()
    );
    const mockRegisterCommandCallback = jest.fn(
        (
                command: string,
                onSuccess: (data: string, command: string) => void,
                onError: (error: string, command: string) => void
            ) =>
            () => {}
    );
    const mockUnregister = jest.fn(() => {});
    const mockIsPause = jest.fn(() => false);
    const mockUnPause = jest.fn(() => {});

    const mockShellParser = jest.fn<ShellParser, []>(() => ({
        onPausedChange: mockOnPausedChange,
        onShellLoggingEvent: mockOnShellLoggingEvent,
        onUnknownCommand: mockOnUnknownCommand,
        enqueueRequest: mockEnqueueRequest,
        registerCommandCallback: mockRegisterCommandCallback,
        unregister: mockUnregister,
        isPaused: mockIsPause,
        unPause: mockUnPause,
    }));

    return {
        mockOnPausedChange,
        mockOnShellLoggingEvent,
        mockOnUnknownCommand,
        mockEnqueueRequest,
        mockRegisterCommandCallback,
        mockUnregister,
        mockIsPause,
        mockUnPause,
        mockShellParser,
        ...setupMocksBase(mockShellParser()),
    };
};

describe('PMIC 1300', () => {
    describe('State not ek_disconnected', () => {
        const {
            mockWarningDialogHandler,
            mockOnActiveBatteryModelUpdate,
            mockOnBuckUpdate,
            mockOnChargerUpdate,
            mockOnFuelGaugeUpdate,
            mockOnLdoUpdate,
            mockEnqueueRequest,
            pmic,
        } = setupMocksWithShellParser();
        describe('Test pmic 1300 Request commands', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            test('Request update pmicChargingState', () => {
                PMIC_1300_CHARGERS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.pmicChargingState(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        'npmx charger status get',
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                });
            });

            test('Request update chargerVTerm', () => {
                PMIC_1300_CHARGERS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.chargerVTerm(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        'npmx charger termination_voltage normal get',
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                });
            });

            test('Request update chargerIChg', () => {
                PMIC_1300_CHARGERS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.chargerIChg(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        'npmx charger charger_current get',
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                });
            });

            test('Request update chargerEnabled', () => {
                PMIC_1300_CHARGERS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.chargerEnabled(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        'npmx charger module charger get',
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                });
            });

            test.skip('Request update chargerVTrickleFast', () => {
                PMIC_1300_CHARGERS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.chargerVTrickleFast(index);

                    // TODO
                });
            });

            test.skip('Request update chargerITerm', () => {
                PMIC_1300_CHARGERS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.chargerITerm(index);

                    // TODO
                });
            });

            test.skip('Request update chargerEnabledRecharging', () => {
                PMIC_1300_CHARGERS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.chargerEnabledRecharging(index);

                    // TODO
                });
            });

            test('Request update buckVOut', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.buckVOut(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck voltage get ${index}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                });
            });

            test.skip('Request update buckRetentionVOut', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.buckRetentionVOut(index);

                    // TODO
                });
            });

            test('Request update buckMode', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.buckMode(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck vout select get ${index}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                });
            });

            test.skip('Request update buckModeControl', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.buckModeControl(index);

                    // TODO
                });
            });

            test.skip('Request update buckOnOffControl', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.buckOnOffControl(index);

                    // TODO
                });
            });

            test.skip('Request update buckRetentionControl', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.buckRetentionControl(index);

                    // TODO
                });
            });

            test.skip('Request update buckEnabled', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.buckEnabled(index);

                    // TODO
                });
            });

            test.skip('Request update ldoVoltage', () => {
                PMIC_1300_LDOS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.ldoVoltage(index);

                    // TODO
                });
            });

            test('Request update ldoEnabled', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.ldoEnabled(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx ldsw get ${index}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                });
            });

            test.skip('Request update ldoMode', () => {
                PMIC_1300_LDOS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.requestUpdate.ldoMode(index);

                    // TODO
                });
            });

            test('Request update fuelGauge', () => {
                pmic.requestUpdate.fuelGauge();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge get`,
                    expect.anything(),
                    expect.anything(),
                    true
                );
            });

            test('Request update activeBatteryModel', () => {
                pmic.requestUpdate.activeBatteryModel();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge model get`,
                    expect.anything(),
                    expect.anything(),
                    true
                );
            });

            test('Request update storedBatteryModel', () => {
                pmic.requestUpdate.storedBatteryModel();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge model list`,
                    expect.anything(),
                    expect.anything(),
                    true
                );
            });
        });

        describe('Setters and effects state not ek_disconnected', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });
            test('Set setChargerVTerm', () => {
                PMIC_1300_CHARGERS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.setChargerVTerm(index, 3.2);

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { vTerm: 3.2 },
                        index,
                    });

                    // turn off charging
                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx charger module charger set 0`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx charger termination_voltage normal set 3200`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                });
            });

            test.skip('Set setChargerVTrickleFast', () => {
                PMIC_1300_CHARGERS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.setChargerVTrickleFast(index, 2.5);

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { vTrickleFast: 2.5 },
                        index,
                    });

                    // TODO
                });
            });

            test.skip('Set setChargerITerm', () => {
                PMIC_1300_CHARGERS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.setChargerITerm(index, '10%');

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { iTerm: '10%' },
                        index,
                    });

                    // TODO
                });
            });

            test.skip('Set setChargerEnabledRecharging', () => {
                PMIC_1300_CHARGERS.forEach(index => {
                    [true, false].forEach(enabled => {
                        mockEnqueueRequest.mockReset();
                        pmic.setChargerEnabledRecharging(index, enabled);

                        expect(mockOnChargerUpdate).toBeCalledTimes(1);
                        expect(mockOnChargerUpdate).toBeCalledWith({
                            data: { enableRecharging: enabled },
                            index,
                        });

                        // TODO
                    });
                });
            });

            test('Set setChargerEnabled', () => {
                PMIC_1300_CHARGERS.forEach(index => {
                    [true, false].forEach(enabled => {
                        mockEnqueueRequest.mockReset();
                        pmic.setChargerEnabled(index, enabled);

                        expect(mockEnqueueRequest).toBeCalledTimes(1);
                        expect(mockEnqueueRequest).toBeCalledWith(
                            `npmx charger module charger set ${
                                enabled ? '1' : '0'
                            }`,
                            expect.anything(),
                            expect.anything(),
                            true
                        );

                        // Updates should only be emitted when we get response
                        expect(mockOnChargerUpdate).toBeCalledTimes(0);
                    });
                });
            });

            test('Set setBuckVOut', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.setBuckVOut(index, 1.8);

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck voltage set ${index} 1800`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // change from vSet to Software
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck vout select set ${index} 1`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                });
            });

            test('Set setBuckVOut 0 with warning - cancel', () => {
                mockEnqueueRequest.mockReset();

                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        warningDialog.onCancel();
                    }
                );

                pmic.setBuckVOut(0, 1.7);
                expect(mockWarningDialogHandler).toBeCalledTimes(1);

                // on cancel we should update ui
                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx buck voltage get 0`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test('Set setBuckVOut 0 with warning - confirm', () => {
                mockEnqueueRequest.mockReset();

                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        warningDialog.onConfirm();
                    }
                );

                pmic.setBuckVOut(0, 1.7);
                expect(mockWarningDialogHandler).toBeCalledTimes(1);

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck voltage set 0 1700`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // change from vSet to Software
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck vout select set 0 1`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test("Set setBuckVOut 0 with warning - yes, don't ask", () => {
                mockEnqueueRequest.mockReset();

                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        if (warningDialog?.onOptional)
                            warningDialog.onOptional();
                    }
                );

                pmic.setBuckVOut(0, 1.7);
                expect(mockWarningDialogHandler).toBeCalledTimes(1);

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck voltage set 0 1700`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // change from vSet to Software
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck vout select set 0 1`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test.skip('Set setBuckRetentionVOut', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.setBuckRetentionVOut(index, 1.7);

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { retentionVOut: 1.7 },
                        index,
                    });

                    // TODO
                });
            });

            test('Set setBuckMode - vSet', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.setBuckMode(index, 'vSet');

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck vout select set ${index} 0`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // We need to request the buckVOut
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck voltage get ${index}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                });
            });

            test('Set setBuckMode 0 with software - cancel', () => {
                mockEnqueueRequest.mockReset();

                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        warningDialog.onCancel();
                    }
                );

                pmic.setBuckMode(0, 'software');
                expect(mockWarningDialogHandler).toBeCalledTimes(1);

                // on cancel we should update ui
                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx buck voltage get 0`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test('Set setBuckMode 0 with software - confirm', () => {
                mockEnqueueRequest.mockReset();

                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        warningDialog.onConfirm();
                    }
                );

                pmic.setBuckMode(0, 'software');
                expect(mockWarningDialogHandler).toBeCalledTimes(1);

                // on cancel we should update ui
                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck vout select set 0 1`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // We need to request the buckVOut
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck voltage get 0`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test("Set setBuckMode 0 with software - yes, don't ask", () => {
                mockEnqueueRequest.mockReset();

                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        if (warningDialog.onOptional)
                            warningDialog.onOptional();
                    }
                );

                pmic.setBuckMode(0, 'software');
                expect(mockWarningDialogHandler).toBeCalledTimes(1);

                // on cancel we should update ui
                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck vout select set 0 1`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // We need to request the buckVOut
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck voltage get 0`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test.skip('Set setBuckModeControl', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.setBuckModeControl(index, 'Auto');

                    expect(mockOnBuckUpdate).toBeCalledTimes(1);
                    expect(mockOnBuckUpdate).toBeCalledWith({
                        data: { modeControl: 'Auto' },
                        index,
                    });

                    // TODO
                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                });
            });

            test.skip('Set setBuckOnOffControl', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.setBuckOnOffControl(index, 'Off');

                    expect(mockOnBuckUpdate).toBeCalledTimes(1);
                    expect(mockOnBuckUpdate).toBeCalledWith({
                        data: { onOffControl: 'Auto' },
                        index,
                    });

                    // TODO
                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                });
            });

            test.skip('Set setBuckRetentionControl', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.setBuckRetentionControl(index, 'Off');

                    expect(mockOnBuckUpdate).toBeCalledTimes(1);
                    expect(mockOnBuckUpdate).toBeCalledWith({
                        data: { retentionControl: 'Off' },
                        index,
                    });

                    // TODO
                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                });
            });

            test('Set setBuckEnabled', () => {
                PMIC_1300_BUCKS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.setBuckEnabled(index, true);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck set ${index} 1`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                });

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test('Set setBuckEnabled 0 false - cancel', () => {
                mockEnqueueRequest.mockReset();

                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        warningDialog.onCancel();
                    }
                );

                pmic.setBuckEnabled(0, false);
                expect(mockWarningDialogHandler).toBeCalledTimes(1);

                // No need to request UI update
                expect(mockEnqueueRequest).toBeCalledTimes(0);

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test("Set setBuckEnabled 0 false -  yes, don't ask", () => {
                mockEnqueueRequest.mockReset();

                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        warningDialog.onConfirm();
                    }
                );

                pmic.setBuckEnabled(0, false);
                expect(mockWarningDialogHandler).toBeCalledTimes(1);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck set 0 0`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test('Set setBuckEnabled 0 false - confirm', () => {
                mockEnqueueRequest.mockReset();

                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        if (warningDialog.onOptional)
                            warningDialog.onOptional();
                    }
                );

                pmic.setBuckEnabled(0, false);
                expect(mockWarningDialogHandler).toBeCalledTimes(1);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck set 0 0`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test.skip('Set setLdoVoltage', () => {
                PMIC_1300_LDOS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.setLdoVoltage(index, 3);

                    // TODO

                    // Updates should only be emitted when we get response
                    expect(mockOnLdoUpdate).toBeCalledTimes(0);
                });
            });

            test('Set setLdoEnabled', () => {
                PMIC_1300_LDOS.forEach(index => {
                    [true, false].forEach(enabled => {
                        mockEnqueueRequest.mockReset();
                        pmic.setLdoEnabled(index, enabled);

                        expect(mockEnqueueRequest).toBeCalledTimes(1);
                        expect(mockEnqueueRequest).nthCalledWith(
                            1,
                            `npmx ldsw set ${index} ${enabled ? '1' : '0'}`,
                            expect.anything(),
                            expect.anything(),
                            true
                        );

                        // Updates should only be emitted when we get response
                        expect(mockOnLdoUpdate).toBeCalledTimes(0);
                    });
                });
            });

            test.skip('Set setLdoMode', () => {
                PMIC_1300_LDOS.forEach(index => {
                    mockEnqueueRequest.mockReset();
                    pmic.setLdoMode(index, 'LDO');

                    // TODO

                    // Updates should only be emitted when we get response
                    expect(mockOnLdoUpdate).toBeCalledTimes(0);
                });
            });

            test('Set setFuelGaugeEnabled', () => {
                [true, false].forEach(enabled => {
                    mockEnqueueRequest.mockReset();
                    pmic.setFuelGaugeEnabled(enabled);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `fuel_gauge set ${enabled ? '1' : '0'}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
                });
            });

            test('Set setActiveBatteryModel', () => {
                mockEnqueueRequest.mockReset();
                pmic.setActiveBatteryModel('someProfileName');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `fuel_gauge model set someProfileName`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnActiveBatteryModelUpdate).toBeCalledTimes(0);
            });

            test('startBatteryStatusCheck', () => {
                mockEnqueueRequest.mockReset();
                pmic.startBatteryStatusCheck();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm_chg_status_check set 1`,
                    expect.anything(),
                    expect.anything(),
                    true
                );
            });

            test('stopBatteryStatusCheck', () => {
                mockEnqueueRequest.mockReset();
                pmic.stopBatteryStatusCheck();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm_chg_status_check set 0`,
                    expect.anything(),
                    expect.anything(),
                    true
                );
            });

            test('storeBattery', () => {
                mockEnqueueRequest.mockReset();
                pmic.storeBattery();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'fuel_gauge model store',
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnActiveBatteryModelUpdate).toBeCalledTimes(0);
            });
        });
    });

    // UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
    describe('Setters and effects ek_disconnected', () => {
        const {
            mockOnChargerUpdate,
            mockOnBuckUpdate,
            mockOnFuelGaugeUpdate,
            mockOnLdoUpdate,
            pmic,
        } = setupMocksBase();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('Set setChargerVTerm', () => {
            PMIC_1300_CHARGERS.forEach(index => {
                mockOnChargerUpdate.mockReset();
                pmic.setChargerVTerm(index, 1);

                expect(mockOnChargerUpdate).toBeCalledTimes(2);
                expect(mockOnChargerUpdate).nthCalledWith(1, {
                    data: { vTerm: 1 },
                    index,
                });
                expect(mockOnChargerUpdate).nthCalledWith(2, {
                    data: { enabled: false },
                    index,
                });
            });
        });

        test('Set setChargerIChg', () => {
            PMIC_1300_CHARGERS.forEach(index => {
                mockOnChargerUpdate.mockReset();
                pmic.setChargerIChg(index, 1);

                expect(mockOnChargerUpdate).toBeCalledTimes(2);
                expect(mockOnChargerUpdate).nthCalledWith(1, {
                    data: { iChg: 1 },
                    index,
                });
                expect(mockOnChargerUpdate).nthCalledWith(2, {
                    data: { enabled: false },
                    index,
                });
            });
        });

        test('Set setChargerVTrickleFast', () => {
            PMIC_1300_CHARGERS.forEach(index => {
                mockOnBuckUpdate.mockReset();
                pmic.setChargerVTrickleFast(index, 2.5);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({
                    data: { vTrickleFast: 2.5 },
                    index,
                });
            });
        });

        test('Set setChargerITerm', () => {
            PMIC_1300_CHARGERS.forEach(index => {
                mockOnBuckUpdate.mockReset();
                pmic.setChargerITerm(index, '10%');

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({
                    data: { iTerm: '10%' },
                    index,
                });
            });
        });

        test('Set setChargerEnabledRecharging', () => {
            PMIC_1300_CHARGERS.forEach(index => {
                mockOnBuckUpdate.mockReset();
                pmic.setChargerEnabledRecharging(index, true);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({
                    data: { enableRecharging: true },
                    index,
                });
            });
        });

        test('Set setChargerEnabled', () => {
            PMIC_1300_CHARGERS.forEach(index => {
                mockOnBuckUpdate.mockReset();
                pmic.setChargerEnabled(index, true);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({
                    data: { enabled: true },
                    index,
                });
            });
        });

        test('Set setBuckVOut', () => {
            PMIC_1300_BUCKS.forEach(index => {
                mockOnBuckUpdate.mockReset();
                pmic.setBuckVOut(index, 1.2);

                expect(mockOnBuckUpdate).toBeCalledTimes(2);
                expect(mockOnBuckUpdate).nthCalledWith(1, {
                    data: { vOut: 1.2 },
                    index,
                });
                expect(mockOnBuckUpdate).nthCalledWith(2, {
                    data: { mode: 'software' },
                    index,
                });
            });
        });

        test('Set setBuckRetentionVOut', () => {
            PMIC_1300_BUCKS.forEach(index => {
                mockOnBuckUpdate.mockReset();
                pmic.setBuckRetentionVOut(index, 1.2);

                expect(mockOnBuckUpdate).toBeCalledTimes(1);
                expect(mockOnBuckUpdate).nthCalledWith(1, {
                    data: { retentionVOut: 1.2 },
                    index,
                });
            });
        });

        test('Set setBuckMode', () => {
            PMIC_1300_BUCKS.forEach(index => {
                mockOnBuckUpdate.mockReset();
                pmic.setBuckMode(index, 'software');

                expect(mockOnBuckUpdate).toBeCalledTimes(1);
                expect(mockOnBuckUpdate).toBeCalledWith({
                    data: { mode: 'software' },
                    index,
                });
            });
        });

        test('Set setBuckModeControl', () => {
            PMIC_1300_BUCKS.forEach(index => {
                mockOnBuckUpdate.mockReset();
                pmic.setBuckModeControl(index, 'Auto');

                expect(mockOnBuckUpdate).toBeCalledTimes(1);
                expect(mockOnBuckUpdate).toBeCalledWith({
                    data: { modeControl: 'Auto' },
                    index,
                });
            });
        });

        test('Set setBuckOnOffControl', () => {
            PMIC_1300_BUCKS.forEach(index => {
                mockOnBuckUpdate.mockReset();
                pmic.setBuckOnOffControl(index, 'Off');

                expect(mockOnBuckUpdate).toBeCalledTimes(1);
                expect(mockOnBuckUpdate).toBeCalledWith({
                    data: { onOffControl: 'Off' },
                    index,
                });
            });
        });

        test('Set setBuckRetentionControl', () => {
            PMIC_1300_BUCKS.forEach(index => {
                mockOnBuckUpdate.mockReset();
                pmic.setBuckRetentionControl(index, 'Off');

                expect(mockOnBuckUpdate).toBeCalledTimes(1);
                expect(mockOnBuckUpdate).toBeCalledWith({
                    data: { retentionControl: 'Off' },
                    index,
                });
            });
        });

        test('Set setBuckEnabled', () => {
            PMIC_1300_BUCKS.forEach(index => {
                mockOnBuckUpdate.mockReset();
                pmic.setBuckEnabled(index, false);

                expect(mockOnBuckUpdate).toBeCalledTimes(1);
                expect(mockOnBuckUpdate).toBeCalledWith({
                    data: { enabled: false },
                    index,
                });
            });
        });

        test.skip('Set setLdoVoltage', () => {
            PMIC_1300_LDOS.forEach(index => {
                mockOnLdoUpdate.mockReset();
                pmic.setLdoVoltage(index, 1.2);
                // TODO
            });
        });

        test('Set setLdoEnabled', () => {
            PMIC_1300_LDOS.forEach(index => {
                mockOnLdoUpdate.mockReset();
                pmic.setLdoEnabled(index, false);

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
                expect(mockOnLdoUpdate).toBeCalledWith({
                    data: { enabled: false },
                    index,
                });
            });
        });

        test.skip('Set setLdoMode', () => {
            PMIC_1300_LDOS.forEach(index => {
                mockOnLdoUpdate.mockReset();
                pmic.setLdoMode(index, 'LDO');
                // TODO
            });
        });

        test('Set setFuelGaugeEnabled', () => {
            mockOnFuelGaugeUpdate.mockReset();
            pmic.setFuelGaugeEnabled(false);

            expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
            expect(mockOnFuelGaugeUpdate).toBeCalledWith(false);
        });
    });
});
export {};
