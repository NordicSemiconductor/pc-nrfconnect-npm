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

const helpers = {
    registerCommandCallbackError: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (message: string, command: string) => void,
        unique?: boolean
    ) => {
        if (onError) onError('', '');
        return Promise.resolve();
    },
    registerCommandCallbackSuccess: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (message: string, command: string) => void,
        unique?: boolean
    ) => {
        if (onSuccess) onSuccess('', '');
        return Promise.resolve();
    },
};

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

    const eventHandlers = {
        mockOnShellLoggingEventHandler: (state: string) => {},
    };

    const mockOnShellLoggingEvent = jest.fn(
        (handler: (state: string) => void) => {
            eventHandlers.mockOnShellLoggingEventHandler = handler;
            return () => {};
        }
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
        eventHandlers,
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

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');
jest.spyOn(global, 'clearTimeout');

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
        describe('Request commands', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            test.each(PMIC_1300_CHARGERS)(
                'Request update pmicChargingState index: %p',
                index => {
                    pmic.requestUpdate.pmicChargingState(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        'npmx charger status get',
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Request update chargerVTerm index: %p',
                index => {
                    pmic.requestUpdate.chargerVTerm(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        'npmx charger termination_voltage normal get',
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Request update chargerIChg index: %p',
                index => {
                    pmic.requestUpdate.chargerIChg(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        'npmx charger charger_current get',
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Request update chargerEnabled index: %p',
                index => {
                    pmic.requestUpdate.chargerEnabled(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        'npmx charger module charger get',
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                }
            );

            test.skip.each(PMIC_1300_CHARGERS)(
                'Request update chargerVTrickleFast index: %p',
                index => {
                    pmic.requestUpdate.chargerVTrickleFast(index);

                    // TODO
                }
            );

            test.skip.each(PMIC_1300_CHARGERS)(
                'Request update chargerITerm index: %p',
                index => {
                    pmic.requestUpdate.chargerITerm(index);

                    // TODO
                }
            );

            test.skip.each(PMIC_1300_CHARGERS)(
                'Request update chargerEnabledRecharging index: %p',
                index => {
                    pmic.requestUpdate.chargerEnabledRecharging(index);

                    // TODO
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Request update buckVOut index: %p',
                index => {
                    pmic.requestUpdate.buckVOut(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck voltage get ${index}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Request update buckRetentionVOut index: %p',
                index => {
                    pmic.requestUpdate.buckRetentionVOut(index);

                    // TODO
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Request update buckMode index: %p',
                index => {
                    pmic.requestUpdate.buckMode(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck vout select get ${index}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Request update buckModeControl index: %p',
                index => {
                    pmic.requestUpdate.buckModeControl(index);

                    // TODO
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Request update buckOnOffControl index: %p',
                index => {
                    pmic.requestUpdate.buckOnOffControl(index);

                    // TODO
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Request update buckRetentionControl index: %p',
                index => {
                    pmic.requestUpdate.buckRetentionControl(index);

                    // TODO
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Request update buckEnabled index: %p',
                index => {
                    pmic.requestUpdate.buckEnabled(index);

                    // TODO
                }
            );

            test.skip.each(PMIC_1300_LDOS)(
                'Request update ldoVoltage index: %p',
                index => {
                    pmic.requestUpdate.ldoVoltage(index);

                    // TODO
                }
            );

            test.each(PMIC_1300_LDOS)(
                'Request update ldoEnabled index: %p',
                index => {
                    pmic.requestUpdate.ldoEnabled(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx ldsw get ${index}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                }
            );

            test.skip.each(PMIC_1300_LDOS)(
                'Request update ldoMode index: %p',
                index => {
                    pmic.requestUpdate.ldoMode(index);

                    // TODO
                }
            );

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

        describe('Setters and effects state not ek_disconnected success', () => {
            beforeEach(() => {
                jest.clearAllMocks();

                mockEnqueueRequest.mockImplementation(
                    helpers.registerCommandCallbackSuccess
                );
            });
            test.each(PMIC_1300_CHARGERS)(
                'Set setChargerVTerm index: %p',
                async index => {
                    await pmic.setChargerVTerm(index, 3.2);

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
                }
            );

            test.skip.each(PMIC_1300_CHARGERS)(
                'Set setChargerVTrickleFast index: %p',
                async index => {
                    await pmic.setChargerVTrickleFast(index, 2.5);

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { vTrickleFast: 2.5 },
                        index,
                    });

                    // TODO
                }
            );

            test.skip.each(PMIC_1300_CHARGERS)(
                'Set setChargerITerm index: %p',
                async index => {
                    await pmic.setChargerITerm(index, '10%');

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { iTerm: '10%' },
                        index,
                    });

                    // TODO
                }
            );

            test.skip.each(
                PMIC_1300_CHARGERS.map(index => [
                    {
                        index,
                        enabled: false,
                    },
                    {
                        index,
                        enabled: true,
                    },
                ])
            )(
                'Set setChargerEnabledRecharging %p',
                async ({ index, enabled }) => {
                    await pmic.setChargerEnabledRecharging(index, enabled);

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { enableRecharging: enabled },
                        index,
                    });

                    // TODO
                }
            );

            test.each(
                PMIC_1300_CHARGERS.map(index => [
                    {
                        index,
                        enabled: false,
                    },
                    {
                        index,
                        enabled: true,
                    },
                ])
            )('Set setChargerEnabled %p', async ({ index, enabled }) => {
                await pmic.setChargerEnabled(index, enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx charger module charger set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnChargerUpdate).toBeCalledTimes(0);
            });

            test.each(PMIC_1300_CHARGERS)(
                'Set setBuckVOut index: %p',
                async index => {
                    await pmic.setBuckVOut(index, 1.8);

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
                }
            );

            test('Set setBuckVOut index: 0 with warning - cancel', async () => {
                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        warningDialog.onCancel();
                    }
                );

                await pmic.setBuckVOut(0, 1.7);
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

            test('Set setBuckVOut index: 0 with warning - confirm', async () => {
                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        warningDialog.onConfirm();
                    }
                );

                await pmic.setBuckVOut(0, 1.7);
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

            test("Set setBuckVOut index: 0 with warning - yes, don't ask", async () => {
                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        if (warningDialog?.onOptional)
                            warningDialog.onOptional();
                    }
                );

                await pmic.setBuckVOut(0, 1.7);
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

            test.skip.each(PMIC_1300_BUCKS)(
                'Set setBuckRetentionVOut index: %p',
                async index => {
                    await pmic.setBuckRetentionVOut(index, 1.7);

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { retentionVOut: 1.7 },
                        index,
                    });

                    // TODO
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckMode - vSet',
                async index => {
                    await pmic.setBuckMode(index, 'vSet');

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
                }
            );

            test('Set setBuckMode index: 0 with software - cancel', async () => {
                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        warningDialog.onCancel();
                    }
                );

                await pmic.setBuckMode(0, 'software');
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

            test('Set setBuckMode index: 0 with software - confirm', async () => {
                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        warningDialog.onConfirm();
                    }
                );

                await pmic.setBuckMode(0, 'software');
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

            test("Set setBuckMode index: 0 with software - yes, don't ask", async () => {
                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        if (warningDialog.onOptional)
                            warningDialog.onOptional();
                    }
                );

                await pmic.setBuckMode(0, 'software');
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

            test.skip.each(PMIC_1300_BUCKS)(
                'Set setBuckModeControl index: %p',
                async index => {
                    await pmic.setBuckModeControl(index, 'Auto');

                    expect(mockOnBuckUpdate).toBeCalledTimes(1);
                    expect(mockOnBuckUpdate).toBeCalledWith({
                        data: { modeControl: 'Auto' },
                        index,
                    });

                    // TODO
                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Set setBuckOnOffControl index: %p',
                async index => {
                    await pmic.setBuckOnOffControl(index, 'Off');

                    expect(mockOnBuckUpdate).toBeCalledTimes(1);
                    expect(mockOnBuckUpdate).toBeCalledWith({
                        data: { onOffControl: 'Auto' },
                        index,
                    });

                    // TODO
                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Set setBuckRetentionControl index: %p',
                async index => {
                    await pmic.setBuckRetentionControl(index, 'Off');

                    expect(mockOnBuckUpdate).toBeCalledTimes(1);
                    expect(mockOnBuckUpdate).toBeCalledWith({
                        data: { retentionControl: 'Off' },
                        index,
                    });

                    // TODO
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckEnabled index: %p',
                async index => {
                    await pmic.setBuckEnabled(index, true);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck set ${index} 1`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test('Set setBuckEnabled index: 0 false - cancel', async () => {
                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        warningDialog.onCancel();
                    }
                );

                await pmic.setBuckEnabled(0, false);
                expect(mockWarningDialogHandler).toBeCalledTimes(1);

                // No need to request UI update
                expect(mockEnqueueRequest).toBeCalledTimes(0);

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test("Set setBuckEnabled index: 0 false -  yes, don't ask", async () => {
                mockEnqueueRequest.mockClear();

                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        warningDialog.onConfirm();
                    }
                );

                await pmic.setBuckEnabled(0, false);
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

            test('Set setBuckEnabled index: 0 false - confirm', async () => {
                mockEnqueueRequest.mockClear();

                mockWarningDialogHandler.mockImplementationOnce(
                    (warningDialog: PmicWarningDialog) => {
                        if (warningDialog.onOptional)
                            warningDialog.onOptional();
                    }
                );

                await pmic.setBuckEnabled(0, false);
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

            test.skip.each(PMIC_1300_LDOS)(
                'Set setLdoVoltage index: %p',
                async index => {
                    await pmic.setLdoVoltage(index, 3);

                    // TODO

                    // Updates should only be emitted when we get response
                    expect(mockOnLdoUpdate).toBeCalledTimes(0);
                }
            );

            test.each(
                PMIC_1300_LDOS.map(index => [
                    {
                        index,
                        enabled: false,
                    },
                    {
                        index,
                        enabled: true,
                    },
                ])
            )('Set setLdoEnabled %p', async ({ index, enabled }) => {
                await pmic.setLdoEnabled(index, enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw set ${index} ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            });

            test.skip.each(PMIC_1300_LDOS)(
                'Set setLdoMode index: %p',
                async index => {
                    await pmic.setLdoMode(index, 'LDO');

                    // TODO
                }
            );

            test.each([true, false])(
                'Set setFuelGaugeEnabled enabled: %p',
                async enabled => {
                    await pmic.setFuelGaugeEnabled(enabled);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `fuel_gauge set ${enabled ? '1' : '0'}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
                }
            );

            test('Set setActiveBatteryModel', async () => {
                await pmic.setActiveBatteryModel('someProfileName');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge model set someProfileName`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnActiveBatteryModelUpdate).toBeCalledTimes(0);
            });

            test.each([true, false])(
                'startBatteryStatusCheck enabled: %p',
                async enabled => {
                    await pmic.setBatteryStatusCheckEnabled(enabled);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npm_chg_status_check set ${enabled ? '1' : '0'}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                }
            );

            test('storeBattery', async () => {
                await pmic.storeBattery();

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

        describe('Setters and effects state not ek_disconnected error', () => {
            beforeEach(() => {
                jest.clearAllMocks();

                mockEnqueueRequest.mockImplementation(
                    helpers.registerCommandCallbackError
                );
            });
            test.each(PMIC_1300_CHARGERS)(
                'Set setChargerVTerm onError case 1 - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setChargerVTerm(index, 3.2)
                    ).rejects.toBeUndefined();

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { vTerm: 3.2 },
                        index,
                    });

                    expect(mockEnqueueRequest).toBeCalledTimes(3);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx charger module charger set 0`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx charger module charger get`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                    expect(mockEnqueueRequest).nthCalledWith(
                        3,
                        `npmx charger termination_voltage normal get`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Set setChargerVTerm onError case 2 - Fail on second command -  index: %p',
                async index => {
                    mockEnqueueRequest.mockImplementationOnce(
                        helpers.registerCommandCallbackSuccess
                    );

                    await expect(
                        pmic.setChargerVTerm(index, 3.2)
                    ).rejects.toBeUndefined();

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { vTerm: 3.2 },
                        index,
                    });

                    // turn off charging
                    expect(mockEnqueueRequest).toBeCalledTimes(3);
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

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        3,
                        `npmx charger termination_voltage normal get`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );
                }
            );

            test.skip.each(PMIC_1300_CHARGERS)(
                'Set setChargerVTrickleFast - Fail immediately -  index: %p',
                async index => {
                    await expect(
                        pmic.setChargerVTrickleFast(index, 2.5)
                    ).rejects.toBeUndefined();

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { vTrickleFast: 2.5 },
                        index,
                    });

                    // TODO
                }
            );

            test.skip.each(PMIC_1300_CHARGERS)(
                'Set setChargerITerm - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setChargerITerm(index, '10%')
                    ).rejects.toBeUndefined();

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { iTerm: '10%' },
                        index,
                    });

                    // TODO
                }
            );

            test.skip.each(
                PMIC_1300_CHARGERS.map(index => [
                    {
                        index,
                        enabled: false,
                    },
                    {
                        index,
                        enabled: true,
                    },
                ])
            )(
                'Set setChargerEnabledRecharging - Fail immediately -  %p',
                async ({ index, enabled }) => {
                    await pmic.setChargerEnabledRecharging(index, enabled);

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { enableRecharging: enabled },
                        index,
                    });

                    // TODO
                }
            );

            test.each(
                PMIC_1300_CHARGERS.map(index => [
                    {
                        index,
                        enabled: false,
                    },
                    {
                        index,
                        enabled: true,
                    },
                ])
            )(
                'Set setChargerEnabled - Fail immediately - %p',
                async ({ index, enabled }) => {
                    await expect(
                        pmic.setChargerEnabled(index, enabled)
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx charger module charger set ${
                            enabled ? '1' : '0'
                        }`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        'npmx charger module charger get',
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnChargerUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Set setBuckVOut - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setBuckVOut(index, 1.8)
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck voltage set ${index} 1800`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck voltage get ${index}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Set setBuckVOut - Fail on second command - index: %p',
                async index => {
                    mockEnqueueRequest.mockImplementationOnce(
                        helpers.registerCommandCallbackSuccess
                    );

                    await expect(
                        pmic.setBuckVOut(index, 1.8)
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(3);
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

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        3,
                        `npmx buck vout select get ${index}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Set setBuckRetentionVOut - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setBuckRetentionVOut(index, 1.7)
                    ).rejects.toBeUndefined();

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { retentionVOut: 1.7 },
                        index,
                    });

                    // TODO
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckMode - Fail immediately - vSet',
                async index => {
                    await expect(
                        pmic.setBuckMode(index, 'vSet')
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck vout select set ${index} 0`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck vout select get ${index}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Set setBuckModeControl - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setBuckModeControl(index, 'Auto')
                    ).rejects.toBeUndefined();

                    expect(mockOnBuckUpdate).toBeCalledTimes(1);
                    expect(mockOnBuckUpdate).toBeCalledWith({
                        data: { modeControl: 'Auto' },
                        index,
                    });

                    // TODO
                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Set setBuckOnOffControl - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setBuckOnOffControl(index, 'Off')
                    ).rejects.toBeUndefined();

                    expect(mockOnBuckUpdate).toBeCalledTimes(1);
                    expect(mockOnBuckUpdate).toBeCalledWith({
                        data: { onOffControl: 'Auto' },
                        index,
                    });

                    // TODO
                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Set setBuckRetentionControl - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setBuckRetentionControl(index, 'Off')
                    ).rejects.toBeUndefined();

                    expect(mockOnBuckUpdate).toBeCalledTimes(1);
                    expect(mockOnBuckUpdate).toBeCalledWith({
                        data: { retentionControl: 'Off' },
                        index,
                    });

                    // TODO
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Set setBuckEnabled - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setBuckEnabled(index, true)
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck set ${index} 1`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Refresh data due to error
                    // TODO
                    // expect(mockEnqueueRequest).nthCalledWith(
                    //     2,
                    //     `npmx buck get ${index}`,
                    //     expect.anything(),
                    //     expect.anything(),
                    //     true
                    // );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.skip.each(PMIC_1300_LDOS)(
                'Set setLdoVoltage - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setLdoVoltage(index, 3)
                    ).rejects.toBeUndefined();

                    // TODO

                    // Updates should only be emitted when we get response
                    expect(mockOnLdoUpdate).toBeCalledTimes(0);
                }
            );

            test.each(
                PMIC_1300_LDOS.map(index => [
                    {
                        index,
                        enabled: false,
                    },
                    {
                        index,
                        enabled: true,
                    },
                ])
            )(
                'Set setLdoEnabled - Fail immediately - %p',
                async ({ index, enabled }) => {
                    await expect(
                        pmic.setLdoEnabled(index, enabled)
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx ldsw set ${index} ${enabled ? '1' : '0'}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx ldsw get ${index}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnLdoUpdate).toBeCalledTimes(0);
                }
            );

            test.skip.each(PMIC_1300_LDOS)(
                'Set setLdoMode - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setLdoMode(index, 'LDO')
                    ).rejects.toBeUndefined();

                    // TODO
                }
            );

            test.each([true, false])(
                'Set setFuelGaugeEnabled - Fail immediately - enabled: %p',
                async enabled => {
                    await expect(
                        pmic.setFuelGaugeEnabled(enabled)
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `fuel_gauge set ${enabled ? '1' : '0'}`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `fuel_gauge get`,
                        expect.anything(),
                        expect.anything(),
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
                }
            );

            test('Set setActiveBatteryModel - Fail immediately', async () => {
                await expect(
                    pmic.setActiveBatteryModel('someProfileName')
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge model set someProfileName`,
                    expect.anything(),
                    expect.anything(),
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `fuel_gauge model get`,
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

        test.each(PMIC_1300_CHARGERS)(
            'Set setChargerVTerm index: %p',
            async index => {
                await pmic.setChargerVTerm(index, 1);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).nthCalledWith(1, {
                    data: { vTerm: 1 },
                    index,
                });
            }
        );

        test.each(PMIC_1300_CHARGERS)(
            'Set setChargerIChg index: %p',
            async index => {
                await pmic.setChargerIChg(index, 1);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({
                    data: { iChg: 1 },
                    index,
                });
            }
        );

        test.each(PMIC_1300_CHARGERS)(
            'Set setChargerVTrickleFast index: %p',
            async index => {
                await pmic.setChargerVTrickleFast(index, 2.5);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({
                    data: { vTrickleFast: 2.5 },
                    index,
                });
            }
        );

        test.each(PMIC_1300_CHARGERS)('Set setChargerITerm', async index => {
            await pmic.setChargerITerm(index, '10%');

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({
                data: { iTerm: '10%' },
                index,
            });
        });

        test.each(PMIC_1300_CHARGERS)(
            'Set setChargerEnabledRecharging index: %p',
            async index => {
                await pmic.setChargerEnabledRecharging(index, true);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({
                    data: { enableRecharging: true },
                    index,
                });
            }
        );

        test.each(PMIC_1300_CHARGERS)(
            'Set setChargerEnabled index: %p',
            async index => {
                await pmic.setChargerEnabled(index, true);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({
                    data: { enabled: true },
                    index,
                });
            }
        );

        test.each(PMIC_1300_BUCKS)('Set setBuckVOut index: %p', async index => {
            await pmic.setBuckVOut(index, 1.2);

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

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckRetentionVOut  index: %p',
            index => {
                pmic.setBuckRetentionVOut(index, 1.2);

                expect(mockOnBuckUpdate).toBeCalledTimes(1);
                expect(mockOnBuckUpdate).nthCalledWith(1, {
                    data: { retentionVOut: 1.2 },
                    index,
                });
            }
        );

        test.each(PMIC_1300_BUCKS)('Set setBuckMode index: %p', async index => {
            await pmic.setBuckMode(index, 'software');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { mode: 'software' },
                index,
            });
        });

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckModeControl index: %p',
            async index => {
                await pmic.setBuckModeControl(index, 'Auto');

                expect(mockOnBuckUpdate).toBeCalledTimes(1);
                expect(mockOnBuckUpdate).toBeCalledWith({
                    data: { modeControl: 'Auto' },
                    index,
                });
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckOnOffControl index: %p',
            async index => {
                await pmic.setBuckOnOffControl(index, 'Off');

                expect(mockOnBuckUpdate).toBeCalledTimes(1);
                expect(mockOnBuckUpdate).toBeCalledWith({
                    data: { onOffControl: 'Off' },
                    index,
                });
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckRetentionControl index: %p',
            async index => {
                await pmic.setBuckRetentionControl(index, 'Off');

                expect(mockOnBuckUpdate).toBeCalledTimes(1);
                expect(mockOnBuckUpdate).toBeCalledWith({
                    data: { retentionControl: 'Off' },
                    index,
                });
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckEnabled index: %p',
            async index => {
                await pmic.setBuckEnabled(index, false);

                expect(mockOnBuckUpdate).toBeCalledTimes(1);
                expect(mockOnBuckUpdate).toBeCalledWith({
                    data: { enabled: false },
                    index,
                });
            }
        );

        test.skip.each(PMIC_1300_LDOS)(
            'Set setLdoVoltage index: %p',
            async index => {
                await pmic.setLdoVoltage(index, 1.2);
                // TODO
            }
        );

        test.each(PMIC_1300_LDOS)(
            'Set setLdoEnabled index: %p',
            async index => {
                await pmic.setLdoEnabled(index, false);

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
                expect(mockOnLdoUpdate).toBeCalledWith({
                    data: { enabled: false },
                    index,
                });
            }
        );

        test.skip.each(PMIC_1300_LDOS)(
            'Set setLdoMode index: %p',
            async index => {
                await pmic.setLdoMode(index, 'LDO');
                // TODO
            }
        );

        test('Set setFuelGaugeEnabled', async () => {
            await pmic.setFuelGaugeEnabled(false);

            expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
            expect(mockOnFuelGaugeUpdate).toBeCalledWith(false);
        });
    });

    describe('PMIC Status', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        test('Initial State', () => {
            const { pmic } = setupMocksWithShellParser();

            expect(pmic.getConnectionState()).toBe('pmic-unknown');
            expect(setTimeout).toHaveBeenCalledTimes(1);
            expect(setTimeout).toHaveBeenLastCalledWith(
                expect.any(Function),
                2000
            );
        });

        test("Goes online if no 'response error' is received within timeout", () => {
            const { mockOnPmicStateChange, pmic } = setupMocksWithShellParser();

            expect(pmic.getConnectionState()).toBe('pmic-unknown');
            jest.runAllTimers();
            expect(pmic.getConnectionState()).toBe('pmic-connected');

            expect(mockOnPmicStateChange).toBeCalledTimes(1);
            expect(mockOnPmicStateChange).toBeCalledWith('pmic-connected');
        });

        test("Goes from 'pmic-connected' to 'pmic-disconnected' if 'No response from PMIC.' is received", () => {
            const { eventHandlers, mockOnPmicStateChange, pmic } =
                setupMocksWithShellParser();

            jest.runAllTimers();

            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:02.019,531] <wrn> module_pmic: No response from PMIC.'
            );

            expect(mockOnPmicStateChange).toBeCalledTimes(2);
            expect(mockOnPmicStateChange).nthCalledWith(1, 'pmic-connected');
            expect(mockOnPmicStateChange).nthCalledWith(2, 'pmic-disconnected');
        });

        test("Goes from 'pmic-unknown' to 'pmic-disconnected' if 'No response from PMIC.' is received", () => {
            const { eventHandlers, mockOnPmicStateChange, pmic } =
                setupMocksWithShellParser();

            expect(clearTimeout).toHaveBeenCalledTimes(0);

            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:02.019,531] <wrn> module_pmic: No response from PMIC.'
            );

            expect(clearTimeout).toHaveBeenCalledTimes(1);

            expect(mockOnPmicStateChange).toBeCalledTimes(1);
            expect(mockOnPmicStateChange).toBeCalledWith('pmic-disconnected');
        });
    });
});
export {};
