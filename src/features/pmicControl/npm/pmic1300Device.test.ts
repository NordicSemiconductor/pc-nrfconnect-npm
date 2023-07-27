/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ICallbacks, ShellParser } from '../../../hooks/commandParser';
import { getNPM1300 } from './pmic1300Device';
import {
    BatteryModel,
    Buck,
    BuckModeControlValues,
    BuckOnOffControlValues,
    Charger,
    GPIOValues,
    Ldo,
    NTCThermistor,
    PartialUpdate,
    PmicChargingState,
    PmicDialog,
} from './types';

const PMIC_1300_BUCKS = [0, 1];
const PMIC_1300_LDOS = [0, 1];

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');
jest.spyOn(global, 'clearTimeout');
const systemTime = new Date('2020-01-01');
jest.setSystemTime(systemTime);

const helpers = {
    registerCommandCallbackError: (
        _command: string,
        callbacks?: ICallbacks,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _timeout?: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _unique?: boolean
    ) => {
        callbacks?.onError('', '');
        return Promise.resolve();
    },
    registerCommandCallbackSuccess: (
        _command: string,
        callbacks?: ICallbacks,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _timeout?: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _unique?: boolean
    ) => {
        callbacks?.onSuccess('', '');
        return Promise.resolve();
    },
};

const setupMocksBase = (shellParser: ShellParser | undefined = undefined) => {
    const mockDialogHandler = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_pmicDialog: PmicDialog) => {}
    );

    const pmic = getNPM1300(shellParser, mockDialogHandler);

    const mockOnActiveBatteryModelUpdate = jest.fn(() => {});
    const mockOnAdcSample = jest.fn(() => {});
    const mockOnBeforeReboot = jest.fn(() => {});
    const mockOnBuckUpdate = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_partialUpdate: PartialUpdate<Buck>) => {}
    );
    const mockOnChargerUpdate = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_partialUpdate: Partial<Charger>) => {}
    );
    const mockOnChargingStatusUpdate = jest.fn(() => {});
    const mockOnFuelGaugeUpdate = jest.fn(() => {});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockOnLdoUpdate = jest.fn((_partialUpdate: PartialUpdate<Ldo>) => {});
    const mockOnLoggingEvent = jest.fn(() => {});
    const mockOnPmicStateChange = jest.fn(() => {});
    const mockOnReboot = jest.fn(() => {});
    const mockOnStoredBatteryModelUpdate = jest.fn(() => {});
    const mockOnUsbPowered = jest.fn(() => {});

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
        mockDialogHandler,
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

type CommandCallback = {
    command: string;
    onSuccess: (data: string, command: string) => void;
    onError: (error: string, command: string) => void;
};

type AnyCommandHandler = ({
    command,
    response,
    error,
}: {
    command: string;
    response: string;
    error: boolean;
}) => void;

const setupMocksWithShellParser = () => {
    const mockOnPausedChange = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_handler: (state: boolean) => void) => () => {}
    );

    const mockOnShellLoggingEventHandler = (state: string) => {
        eventHandlers.mockOnShellLoggingEventHandlers.forEach(handler =>
            handler(state)
        );
    };

    const eventHandlers = {
        mockOnShellLoggingEventHandlers: [] as ((_state: string) => void)[],
        mockOnShellLoggingEventHandler,
        mockRegisterCommandCallbackHandlers: [] as CommandCallback[],
        mockAnyCommandResponseHandlers: [] as AnyCommandHandler[],
        mockRegisterCommandCallbackHandler: (command: string) =>
            eventHandlers.mockRegisterCommandCallbackHandlers.find(element =>
                command.match(`^(${element.command})`)
            ),
    };

    const mockOnShellLoggingEvent = jest.fn(
        (handler: (state: string) => void) => {
            eventHandlers.mockOnShellLoggingEventHandlers.push(handler);
            return () => {};
        }
    );
    const mockOnAnyCommandResponse = jest.fn(
        (
            handler: ({
                command,
                response,
                error,
            }: {
                command: string;
                response: string;
                error: boolean;
            }) => void
        ) => {
            eventHandlers.mockAnyCommandResponseHandlers.push(handler);
            return () => {};
        }
    );
    const mockOnUnknownCommand = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_handler: (state: string) => void) => () => {}
    );

    const mockEnqueueRequest = jest.fn(
        (
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _command: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _callbacks?: ICallbacks,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _timeout?: number,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _unique?: boolean
        ) => Promise.resolve()
    );
    const mockRegisterCommandCallback = jest.fn(
        (
            command: string,
            onSuccess: (data: string, command: string) => void,
            onError: (error: string, command: string) => void
        ) => {
            eventHandlers.mockRegisterCommandCallbackHandlers.push({
                command,
                onSuccess,
                onError,
            });
            return () => {};
        }
    );

    const mockUnregister = jest.fn(() => {});
    const mockIsPause = jest.fn(() => false);
    const mockUnPause = jest.fn().mockResolvedValue(undefined);
    const mockSetShellEchos = jest.fn(() => {});

    const mockShellParser = jest.fn<ShellParser, []>(() => ({
        onPausedChange: mockOnPausedChange,
        onShellLoggingEvent: mockOnShellLoggingEvent,
        onAnyCommandResponse: mockOnAnyCommandResponse,
        onUnknownCommand: mockOnUnknownCommand,
        enqueueRequest: mockEnqueueRequest,
        registerCommandCallback: mockRegisterCommandCallback,
        unregister: mockUnregister,
        isPaused: mockIsPause,
        unPause: mockUnPause,
        setShellEchos: mockSetShellEchos,
    }));

    mockEnqueueRequest.mockImplementationOnce(
        (
            command: string,
            callbacks?: ICallbacks,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _timeout?: number,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _unique?: boolean
        ) => {
            expect(command).toBe('kernel uptime');
            callbacks?.onSuccess('Uptime: 0 ms', command);
            return Promise.resolve();
        }
    );

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

describe('PMIC 1300', () => {
    describe('State not ek_disconnected', () => {
        const {
            mockDialogHandler,
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

            test('Request update pmicChargingState', () => {
                pmic.requestUpdate.pmicChargingState();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'npmx charger status get',
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request update chargerVTerm', () => {
                pmic.requestUpdate.chargerVTerm();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'npmx charger termination_voltage normal get',
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request update chargerIChg', () => {
                pmic.requestUpdate.chargerIChg();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'npmx charger charger_current get',
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request update chargerEnabled', () => {
                pmic.requestUpdate.chargerEnabled();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'npmx charger module charger get',
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request update chargerVTrickleFast', () => {
                pmic.requestUpdate.chargerVTrickleFast();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'npmx charger trickle get',
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request update chargerITerm', () => {
                pmic.requestUpdate.chargerITerm();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'npmx charger termination_current get',
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request update chargerEnabledRecharging', () => {
                pmic.requestUpdate.chargerEnabledRecharging();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'npmx charger module recharge get',
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request update chargerNTCThermistor', () => {
                pmic.requestUpdate.chargerNTCThermistor();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'npmx adc ntc get',
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test.each(PMIC_1300_BUCKS)(
                'Request update buckVOut index: %p',
                index => {
                    pmic.requestUpdate.buckVOutNormal(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck voltage normal get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Request update buckVOutRetention index: %p',
                index => {
                    pmic.requestUpdate.buckVOutRetention(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck voltage retention get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );
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
                        undefined,
                        true
                    );
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Request update buckModeControl index: %p',
                index => {
                    pmic.requestUpdate.buckModeControl(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck gpio pwm_force get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Request update buckOnOffControl index: %p',
                index => {
                    pmic.requestUpdate.buckOnOffControl(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck gpio on_off get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Request update buckRetentionControl index: %p',
                index => {
                    pmic.requestUpdate.buckRetentionControl(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck gpio retention get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );
                }
            );

            test.skip.each(PMIC_1300_BUCKS)(
                'Request update buckEnabled index: %p',
                index => {
                    pmic.requestUpdate.buckEnabled(index);

                    // TODO
                }
            );

            test.each(PMIC_1300_LDOS)(
                'Request update ldoVoltage index: %p',
                index => {
                    pmic.requestUpdate.ldoVoltage(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx ldsw ldo_voltage get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );
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
                        undefined,
                        true
                    );
                }
            );

            test.each(PMIC_1300_LDOS)(
                'Request update ldoMode index: %p',
                index => {
                    pmic.requestUpdate.ldoMode(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx ldsw mode get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );
                }
            );

            test('Request update fuelGauge', () => {
                pmic.requestUpdate.fuelGauge();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge get`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request update activeBatteryModel', () => {
                pmic.requestUpdate.activeBatteryModel();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge model get`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request update storedBatteryModel', () => {
                pmic.requestUpdate.storedBatteryModel();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge model list`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request getHardcodedBatteryModels success', async () => {
                mockEnqueueRequest.mockImplementationOnce(
                    (
                        _command: string,
                        callbacks?: ICallbacks,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        _timeout?: number,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        _unique?: boolean
                    ) => {
                        callbacks?.onSuccess(
                            `Currently active battery model:
                            name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
                    Hardcoded battery models:
                            name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
                            name="LP502540",T={25.00 C},Q={563.08 mAh}
                    Battery models stored in database:
                            Slot 0: Empty
                            Slot 1: Empty
                            Slot 2: Empty`,
                            'fuel_gauge model list'
                        );
                        return Promise.resolve();
                    }
                );

                await expect(
                    pmic.getHardcodedBatteryModels()
                ).resolves.toStrictEqual([
                    {
                        name: 'LP803448',
                        characterizations: [
                            {
                                temperature: 45,
                                capacity: 1500.11,
                            },
                            {
                                temperature: 25,
                                capacity: 1518.28,
                            },
                            {
                                temperature: 5,
                                capacity: 1413.4,
                            },
                        ],
                    },
                    {
                        name: 'LP502540',
                        characterizations: [
                            {
                                temperature: 25,
                                capacity: 563.08,
                            },
                        ],
                    },
                ] as BatteryModel[]);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge model list`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request startAdcSample', () => {
                pmic.startAdcSample(2000, 1000);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'npm_adc sample 1000 2000',
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request stopAdcSample', () => {
                pmic.stopAdcSample();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'npm_adc sample 0',
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request getKernelUptime', async () => {
                mockEnqueueRequest.mockImplementationOnce(
                    (
                        command: string,
                        callbacks?: ICallbacks,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        _timeout?: number,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        _unique?: boolean
                    ) => {
                        callbacks?.onSuccess('Uptime: 2945165 ms', command);
                        return Promise.resolve();
                    }
                );

                await expect(pmic.getKernelUptime()).resolves.toBe(2945165);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'kernel uptime',
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request isSupportedVersion - latests', async () => {
                mockEnqueueRequest.mockImplementationOnce(
                    (
                        command: string,
                        callbacks?: ICallbacks,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        _timeout?: number,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        _unique?: boolean
                    ) => {
                        callbacks?.onSuccess('app_version=0.9.2+0', command);
                        return Promise.resolve();
                    }
                );

                await expect(pmic.isSupportedVersion()).resolves.toStrictEqual({
                    supported: true,
                    version: '0.9.2+0',
                });

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'app_version',
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Request isSupportedVersion - old version', async () => {
                mockEnqueueRequest.mockImplementationOnce(
                    (
                        command: string,
                        callbacks?: ICallbacks,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        _timeout?: number,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        _unique?: boolean
                    ) => {
                        callbacks?.onSuccess('app_version=0.0.0+9', command);
                        return Promise.resolve();
                    }
                );

                await expect(pmic.isSupportedVersion()).resolves.toStrictEqual({
                    supported: false,
                    version: '0.0.0+9',
                });

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'app_version',
                    expect.anything(),
                    undefined,
                    true
                );
            });
        });

        describe('Setters and effects state - success', () => {
            beforeEach(() => {
                jest.clearAllMocks();

                mockEnqueueRequest.mockImplementation(
                    helpers.registerCommandCallbackSuccess
                );
            });
            test('Set setChargerVTerm', async () => {
                await pmic.setChargerVTerm(3.2);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({ vTerm: 3.2 });

                // turn off charging
                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger termination_voltage normal set 3200`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Set setChargerIChg', async () => {
                await pmic.setChargerIChg(32);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 32 });

                // turn off charging
                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger charger_current set 32`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Set setChargerVTrickleFast', async () => {
                await pmic.setChargerVTrickleFast(2.5);

                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx charger trickle set 2500`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Set setChargerITerm', async () => {
                await pmic.setChargerITerm('10%');

                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx charger termination_current set 10`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test.each([true, false])(
                'Set setChargerEnabledRecharging enabled: %p',
                async enabled => {
                    await pmic.setChargerEnabledRecharging(enabled);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx charger module recharge set ${
                            enabled ? '1' : '0'
                        }`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnChargerUpdate).toBeCalledTimes(0);
                }
            );

            test.each([true, false])(
                'Set setChargerEnabled enabled: %p',
                async enabled => {
                    await pmic.setChargerEnabled(enabled);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx charger module charger set ${
                            enabled ? '1' : '0'
                        }`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnChargerUpdate).toBeCalledTimes(0);
                }
            );

            test.each([
                {
                    mode: '100 kΩ',
                    cliMode: 'ntc_100k',
                },
                {
                    mode: '10 kΩ',
                    cliMode: 'ntc_10k',
                },
                {
                    mode: '47 kΩ',
                    cliMode: 'ntc_47k',
                },
            ] as { mode: NTCThermistor; cliMode: string }[])(
                'Set setChargerNTCThermistor %p',
                async ({ mode, cliMode }) => {
                    await pmic.setChargerNTCThermistor(mode);

                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx adc ntc set ${cliMode}`,
                        expect.anything(),
                        undefined,
                        true
                    );
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckVOut index: %p',
                async index => {
                    await pmic.setBuckVOutNormal(index, 1.8);

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck voltage normal set ${index} 1800`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // change from vSet to Software
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck vout select set ${index} 1`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test('Set setBuckVOut index: 1 with warning - cancel', async () => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onCancel();
                    }
                );

                await expect(
                    pmic.setBuckVOutNormal(1, 1.6)
                ).rejects.toBeUndefined();

                expect(mockDialogHandler).toBeCalledTimes(1);

                // on cancel we should update ui
                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx buck voltage normal get 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test('Set setBuckVOut index: 1 with warning - confirm', async () => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await pmic.setBuckVOutNormal(1, 1.6);
                expect(mockDialogHandler).toBeCalledTimes(1);

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck voltage normal set 1 1600`,
                    expect.anything(),
                    undefined,
                    true
                );

                // change from vSet to Software
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck vout select set 1 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test("Set setBuckVOut index: 1 with warning - yes, don't ask", async () => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        if (dialog?.onOptional) dialog.onOptional();
                    }
                );

                await pmic.setBuckVOutNormal(1, 1.6);
                expect(mockDialogHandler).toBeCalledTimes(1);

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck voltage normal set 1 1600`,
                    expect.anything(),
                    undefined,
                    true
                );

                // change from vSet to Software
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck vout select set 1 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckRetentionVOut index: %p',
                async index => {
                    await pmic.setBuckVOutRetention(index, 1.8);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck voltage retention set ${index} 1800`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
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
                        undefined,
                        true
                    );

                    // We need to request the buckVOut
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck voltage normal get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test('Set setBuckMode index: 1 with software - cancel', async () => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onCancel();
                    }
                );

                await expect(
                    pmic.setBuckMode(1, 'software')
                ).rejects.toBeUndefined();

                expect(mockDialogHandler).toBeCalledTimes(1);

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test('Set setBuckMode index: 1 with software - confirm', async () => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await pmic.setBuckMode(1, 'software');
                expect(mockDialogHandler).toBeCalledTimes(1);

                // on cancel we should update ui
                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck vout select set 1 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // We need to request the buckVOut
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck voltage normal get 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test("Set setBuckMode index: 1 with software - yes, don't ask", async () => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        if (dialog.onOptional) dialog.onOptional();
                    }
                );

                await pmic.setBuckMode(1, 'software');
                expect(mockDialogHandler).toBeCalledTimes(1);

                // on cancel we should update ui
                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck vout select set 1 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // We need to request the buckVOut
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck voltage normal get 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckModeControl index: %p',
                async index => {
                    await pmic.setBuckModeControl(index, 'GPIO2');

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck gpio pwm_force set ${index} 2 0`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckOnOffControl index: %p',
                async index => {
                    await pmic.setBuckOnOffControl(index, 'GPIO2');

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck gpio on_off set ${index} 2 0`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckRetentionControl index: %p',
                async index => {
                    await pmic.setBuckRetentionControl(index, 'GPIO2');

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx buck gpio retention set ${index} 2 0`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
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
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test('Set setBuckEnabled index: 1 false - cancel', async () => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onCancel();
                    }
                );

                await expect(
                    pmic.setBuckEnabled(1, false)
                ).rejects.toBeUndefined();
                expect(mockDialogHandler).toBeCalledTimes(1);

                // No need to request UI update
                expect(mockEnqueueRequest).toBeCalledTimes(0);

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test("Set setBuckEnabled index: 1 false -  yes, don't ask", async () => {
                mockEnqueueRequest.mockClear();

                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await pmic.setBuckEnabled(1, false);
                expect(mockDialogHandler).toBeCalledTimes(1);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck set 1 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test('Set setBuckEnabled index: 1 false - confirm', async () => {
                mockEnqueueRequest.mockClear();

                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        if (dialog.onOptional) dialog.onOptional();
                    }
                );

                await pmic.setBuckEnabled(1, false);
                expect(mockDialogHandler).toBeCalledTimes(1);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck set 1 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            });

            test.each(PMIC_1300_LDOS)(
                'Set setLdoVoltage index: %p',
                async index => {
                    mockDialogHandler.mockImplementationOnce(
                        (dialog: PmicDialog) => {
                            dialog.onConfirm();
                        }
                    );

                    await pmic.setLdoVoltage(index, 1);

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx ldsw mode set ${index} 1`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx ldsw ldo_voltage set ${index} ${1000}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    expect(mockOnLdoUpdate).toBeCalledTimes(1);
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
                ]).flat()
            )('Set setLdoEnabled %p', async ({ index, enabled }) => {
                await pmic.setLdoEnabled(index, enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw set ${index} ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            });

            test.each(
                PMIC_1300_LDOS.map(index => [
                    {
                        index,
                        mode: 0,
                    },
                    {
                        index,
                        mode: 1,
                    },
                ]).flat()
            )('Set setLdoMode index: %p', async ({ index, mode }) => {
                if (mode === 1)
                    mockDialogHandler.mockImplementationOnce(
                        (dialog: PmicDialog) => {
                            dialog.onConfirm();
                        }
                    );

                await pmic.setLdoMode(index, mode === 0 ? 'ldoSwitch' : 'LDO');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw mode set ${index} ${mode}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            });

            test.each(PMIC_1300_LDOS)(
                'Set setLdoMode index: %p - confirm',
                async index => {
                    mockDialogHandler.mockImplementationOnce(
                        (dialog: PmicDialog) => {
                            dialog.onConfirm();
                        }
                    );
                    await pmic.setLdoMode(index, 'LDO');

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx ldsw mode set ${index} 1`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnLdoUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_LDOS)(
                "Set setLdoMode index: %p - Yes, Don' ask again",
                async index => {
                    mockDialogHandler.mockImplementationOnce(
                        (dialog: PmicDialog) => {
                            if (dialog.onOptional) dialog.onOptional();
                        }
                    );
                    await pmic.setLdoMode(index, 'LDO');

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx ldsw mode set ${index} 1`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnLdoUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_LDOS)(
                'Set setLdoMode index: %p - Cancel',
                async index => {
                    mockDialogHandler.mockImplementationOnce(
                        (dialog: PmicDialog) => {
                            dialog.onCancel();
                        }
                    );
                    await expect(
                        pmic.setLdoMode(index, 'LDO')
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(0);
                    expect(mockOnLdoUpdate).toBeCalledTimes(0);
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
                        undefined,
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
                    `fuel_gauge model set "someProfileName"`,
                    expect.anything(),
                    undefined,
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
                        undefined,
                        true
                    );
                }
            );
        });

        describe('Setters and effects state - error', () => {
            beforeEach(() => {
                jest.clearAllMocks();

                mockEnqueueRequest.mockImplementation(
                    helpers.registerCommandCallbackError
                );
            });
            test('Set setChargerVTerm onError case 1 - Fail immediately', async () => {
                await expect(pmic.setChargerVTerm(3.2)).rejects.toBeUndefined();

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({ vTerm: 3.2 });

                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger module charger get`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx charger termination_voltage normal get`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Set setChargerVTerm onError case 2 - Fail on second command', async () => {
                mockEnqueueRequest.mockImplementationOnce(
                    helpers.registerCommandCallbackSuccess
                );

                await expect(pmic.setChargerVTerm(3.2)).rejects.toBeUndefined();

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({ vTerm: 3.2 });

                // turn off charging
                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger termination_voltage normal set 3200`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx charger termination_voltage normal get`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Set setChargerIChg onError case 1 - Fail immediately', async () => {
                await expect(pmic.setChargerIChg(32)).rejects.toBeUndefined();

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 32 });

                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger module charger get`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx charger charger_current get`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Set setChargerIChg onError case 2 - Fail on second command', async () => {
                mockEnqueueRequest.mockImplementationOnce(
                    helpers.registerCommandCallbackSuccess
                );

                await expect(pmic.setChargerIChg(32)).rejects.toBeUndefined();

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 32 });

                // turn off charging
                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger charger_current set 32`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx charger charger_current get`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Set setChargerVTrickleFast onError case 1 - Fail immediately', async () => {
                await expect(
                    pmic.setChargerVTrickleFast(2.5)
                ).rejects.toBeUndefined();

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({
                    vTrickleFast: 2.5,
                });

                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger module charger get`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx charger trickle get`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Set setChargerVTrickleFast onError case 2 - Fail immediately', async () => {
                mockEnqueueRequest.mockImplementationOnce(
                    helpers.registerCommandCallbackSuccess
                );

                await expect(
                    pmic.setChargerVTrickleFast(2.5)
                ).rejects.toBeUndefined();

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({
                    vTrickleFast: 2.5,
                });

                // turn off charging
                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger trickle set 2500`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx charger trickle get`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Set setChargerITerm  onError case 1 - Fail immediately', async () => {
                await expect(
                    pmic.setChargerITerm('10%')
                ).rejects.toBeUndefined();

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({ iTerm: '10%' });

                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger module charger get`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx charger termination_current get`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test('Set setChargerITerm  onError case 2 - Fail immediately', async () => {
                mockEnqueueRequest.mockImplementationOnce(
                    helpers.registerCommandCallbackSuccess
                );

                await expect(
                    pmic.setChargerITerm('10%')
                ).rejects.toBeUndefined();

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).toBeCalledWith({ iTerm: '10%' });

                // turn off charging
                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger termination_current set 10`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx charger termination_current get`,
                    expect.anything(),
                    undefined,
                    true
                );
            });

            test.each([true, false])(
                'Set setChargerEnabledRecharging - Fail immediately -  enabled: %p',
                async enabled => {
                    await expect(
                        pmic.setChargerEnabledRecharging(enabled)
                    ).rejects.toBeUndefined();

                    // turn off recharge
                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx charger module recharge set ${
                            enabled ? '1' : '0'
                        }`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx charger module recharge get`,
                        expect.anything(),
                        undefined,
                        true
                    );
                }
            );

            test.each([
                {
                    mode: '100 kΩ',
                    cliMode: 'ntc_100k',
                },
                {
                    mode: '10 kΩ',
                    cliMode: 'ntc_10k',
                },
                {
                    mode: '47 kΩ',
                    cliMode: 'ntc_47k',
                },
            ] as { mode: NTCThermistor; cliMode: string }[])(
                'Set setChargerNTCThermistor - onError case 2 - Fail immediately -  %p',
                async ({ mode, cliMode }) => {
                    mockEnqueueRequest.mockImplementationOnce(
                        helpers.registerCommandCallbackSuccess
                    );

                    await expect(
                        pmic.setChargerNTCThermistor(mode)
                    ).rejects.toBeUndefined();

                    // turn chance ntc thermistor
                    expect(mockEnqueueRequest).toBeCalledTimes(3);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx charger module charger set 0`,
                        expect.anything(),
                        undefined,
                        true
                    );
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx adc ntc set ${cliMode}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        3,
                        `npmx adc ntc get`,
                        expect.anything(),
                        undefined,
                        true
                    );
                }
            );

            test.each(['100 kΩ', '10 kΩ', '47 kΩ'] as NTCThermistor[])(
                'Set setChargerNTCThermistor - Fail immediately - mode: %p',
                async mode => {
                    await expect(
                        pmic.setChargerNTCThermistor(mode)
                    ).rejects.toBeUndefined();

                    // turn chance ntc thermistor
                    expect(mockEnqueueRequest).toBeCalledTimes(3);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx charger module charger set 0`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx charger module charger get`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        3,
                        `npmx adc ntc get`,
                        expect.anything(),
                        undefined,
                        true
                    );
                }
            );

            test.each([true, false])(
                'Set setChargerEnabled - Fail immediately - enabled: %p',
                async enabled => {
                    await expect(
                        pmic.setChargerEnabled(enabled)
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx charger module charger set ${
                            enabled ? '1' : '0'
                        }`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        'npmx charger module charger get',
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnChargerUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckVOut - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setBuckVOutNormal(index, 1.8)
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck voltage normal set ${index} 1800`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck voltage normal get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckVOut - Fail on second command - index: %p',
                async index => {
                    mockEnqueueRequest.mockImplementationOnce(
                        helpers.registerCommandCallbackSuccess
                    );

                    await expect(
                        pmic.setBuckVOutNormal(index, 1.8)
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(3);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck voltage normal set ${index} 1800`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // change from vSet to Software
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck vout select set ${index} 1`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        3,
                        `npmx buck vout select get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckRetentionVOut - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setBuckVOutRetention(index, 1.7)
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck voltage retention set ${index} 1700`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck voltage retention get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
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
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck vout select get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckModeControl - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setBuckModeControl(index, 'GPIO2')
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck gpio pwm_force set ${index} 2 0`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck gpio pwm_force get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckOnOffControl - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setBuckOnOffControl(index, 'GPIO2')
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck gpio on_off set ${index} 2 0`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck gpio on_off get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_BUCKS)(
                'Set setBuckRetentionControl - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setBuckRetentionControl(index, 'GPIO2')
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx buck gpio retention set ${index} 2 0`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx buck gpio retention get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
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
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    // TODO
                    // expect(mockEnqueueRequest).nthCalledWith(
                    //     2,
                    //     `npmx buck get ${index}`,
                    //     expect.anything(),
                    //     undefined,
                    //     true
                    // );

                    // Updates should only be emitted when we get response
                    expect(mockOnBuckUpdate).toBeCalledTimes(0);
                }
            );

            test.each(PMIC_1300_LDOS)(
                'Set setLdoVoltage onError case 1  - Fail immediately - index: %p',
                async index => {
                    mockDialogHandler.mockImplementationOnce(
                        (dialog: PmicDialog) => {
                            dialog.onConfirm();
                        }
                    );

                    await expect(
                        pmic.setLdoVoltage(index, 3)
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(3);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx ldsw mode set ${index} 1`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx ldsw mode get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    expect(mockEnqueueRequest).nthCalledWith(
                        3,
                        `npmx ldsw ldo_voltage get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    expect(mockOnLdoUpdate).toBeCalledTimes(1);
                }
            );

            test.each(PMIC_1300_LDOS)(
                'Set setLdoVoltage onError case 2  - Fail immediately - index: %p',
                async index => {
                    mockDialogHandler.mockImplementationOnce(
                        (dialog: PmicDialog) => {
                            dialog.onConfirm();
                        }
                    );

                    mockEnqueueRequest.mockImplementationOnce(
                        helpers.registerCommandCallbackSuccess
                    );

                    await expect(
                        pmic.setLdoVoltage(index, 3)
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(3);
                    expect(mockEnqueueRequest).nthCalledWith(
                        1,
                        `npmx ldsw mode set ${index} 1`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx ldsw ldo_voltage set ${index} 3000`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        3,
                        `npmx ldsw ldo_voltage get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    expect(mockOnLdoUpdate).toBeCalledTimes(1);
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
                ]).flat()
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
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx ldsw get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnLdoUpdate).toBeCalledTimes(0);
                }
            );

            test.each(
                PMIC_1300_LDOS.map(index => [
                    {
                        index,
                        mode: 0,
                    },
                    {
                        index,
                        mode: 1,
                    },
                ]).flat()
            )(
                'Set setLdoMode - Fail immediately - index: %p',
                async ({ index, mode }) => {
                    mockDialogHandler.mockImplementationOnce(
                        (dialog: PmicDialog) => {
                            dialog.onConfirm();
                        }
                    );

                    await expect(
                        pmic.setLdoMode(index, mode === 0 ? 'ldoSwitch' : 'LDO')
                    ).rejects.toBeUndefined();

                    expect(mockEnqueueRequest).toBeCalledTimes(2);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx ldsw mode set ${index} ${mode}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `npmx ldsw mode get ${index}`,
                        expect.anything(),
                        undefined,
                        true
                    );

                    // Updates should only be emitted when we get response
                    expect(mockOnLdoUpdate).toBeCalledTimes(0);
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
                        undefined,
                        true
                    );

                    // Refresh data due to error
                    expect(mockEnqueueRequest).nthCalledWith(
                        2,
                        `fuel_gauge get`,
                        expect.anything(),
                        undefined,
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
                    `fuel_gauge model set "someProfileName"`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `fuel_gauge model get`,
                    expect.anything(),
                    undefined,
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
            mockDialogHandler,
            mockOnChargerUpdate,
            mockOnBuckUpdate,
            mockOnFuelGaugeUpdate,
            mockOnLdoUpdate,
            pmic,
        } = setupMocksBase();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('Set setChargerVTerm ', async () => {
            await pmic.setChargerVTerm(1);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, { vTerm: 1 });
        });

        test('Set setChargerIChg', async () => {
            await pmic.setChargerIChg(1);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 1 });
        });

        test('Set setChargerVTrickleFast ', async () => {
            await pmic.setChargerVTrickleFast(2.5);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ vTrickleFast: 2.5 });
        });

        test('Set setChargerITerm', async () => {
            await pmic.setChargerITerm('10%');

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iTerm: '10%' });
        });

        test('Set setChargerEnabledRecharging ', async () => {
            await pmic.setChargerEnabledRecharging(true);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({
                enableRecharging: true,
            });
        });

        test('Set setChargerEnabled', async () => {
            await pmic.setChargerEnabled(true);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ enabled: true });
        });

        test.each(PMIC_1300_BUCKS)('Set setBuckVOut index: %p', async index => {
            await pmic.setBuckVOutNormal(index, 1.2);

            expect(mockOnBuckUpdate).toBeCalledTimes(2);
            expect(mockOnBuckUpdate).nthCalledWith(1, {
                data: { vOutNormal: 1.2 },
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
                pmic.setBuckVOutRetention(index, 1.2);

                expect(mockOnBuckUpdate).toBeCalledTimes(1);
                expect(mockOnBuckUpdate).nthCalledWith(1, {
                    data: { vOutRetention: 1.2 },
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

        test.each(PMIC_1300_LDOS)(
            'Set setLdoVoltage index: %p',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await pmic.setLdoVoltage(index, 1.2);

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
                expect(mockOnLdoUpdate).toBeCalledWith({
                    data: { voltage: 1.2 },
                    index,
                });
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

        test('Set setFuelGaugeEnabled', async () => {
            await pmic.setFuelGaugeEnabled(false);

            expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
            expect(mockOnFuelGaugeUpdate).toBeCalledWith(false);
        });
    });

    describe('Static getters', () => {
        const { pmic } = setupMocksBase();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('Has of Charger', () => expect(pmic.hasCharger()).toBeTruthy());

        test('Number of Bucks', () => expect(pmic.getNumberOfBucks()).toBe(2));

        test('Number of LDOs', () => expect(pmic.getNumberOfLdos()).toBe(2));

        test('Number of LDOs', () => expect(pmic.getNumberOfGPIOs()).toBe(5));

        test('Device Type', () => expect(pmic.getDeviceType()).toBe('npm1300'));

        test('Charger Voltage Range', () =>
            expect(pmic.getChargerVoltageRange()).toStrictEqual([
                3.5, 3.55, 3.6, 3.65, 4, 4.05, 4.1, 4.15, 4.2, 4.25, 4.3, 4.35,
                4.4, 4.45,
            ]));

        test.each(PMIC_1300_BUCKS)('Buck Voltage Range index: %p', index =>
            expect(pmic.getBuckVoltageRange(index)).toStrictEqual({
                min: 1,
                max: 3.3,
                decimals: 1,
            })
        );

        test.each(PMIC_1300_BUCKS)('Buck RetVOut Range index: %p', index =>
            expect(pmic.getBuckRetVOutRange(index)).toStrictEqual({
                min: 1,
                max: 3,
                decimals: 1,
            })
        );

        test.each(PMIC_1300_LDOS)('LDO Voltage Range index: %p', index =>
            expect(pmic.getLdoVoltageRange(index)).toStrictEqual({
                min: 1,
                max: 3.3,
                decimals: 1,
                step: 0.1,
            })
        );
    });

    describe('Apply Config ', () => {
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

    describe('Logging Event on any command callback', () => {
        const { eventHandlers, mockOnLoggingEvent } =
            setupMocksWithShellParser();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        const verifyLogging = (
            logLevel: 'err' | 'inf',
            command: string,
            response: string
        ) => {
            expect(mockOnLoggingEvent).toBeCalledTimes(1);
            expect(mockOnLoggingEvent).toBeCalledWith({
                loggingEvent: {
                    timestamp: 0,
                    module: 'shell_commands',
                    logLevel,
                    message: `command: "${command}" response: "${response}"`,
                },
                dataPair: false,
            });
        };

        test('Any Command callback error type', () => {
            eventHandlers.mockAnyCommandResponseHandlers.forEach(handler =>
                handler({
                    command: 'command',
                    response: 'response',
                    error: true,
                })
            );

            verifyLogging('err', 'command', 'response');
        });

        test('Any Command callback error type', () => {
            eventHandlers.mockAnyCommandResponseHandlers.forEach(handler =>
                handler({
                    command: 'command',
                    response: 'response',
                    error: false,
                })
            );

            verifyLogging('inf', 'command', 'response');
        });
    });

    describe('Command callbacks', () => {
        const {
            eventHandlers,
            mockOnChargerUpdate,
            mockOnChargingStatusUpdate,
            mockOnFuelGaugeUpdate,
            mockOnActiveBatteryModelUpdate,
            mockEnqueueRequest,
            mockOnStoredBatteryModelUpdate,
            mockOnUsbPowered,
            mockOnBuckUpdate,
            mockOnLdoUpdate,
            mockOnReboot,
        } = setupMocksWithShellParser();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('kernel reboot - success', () => {
            const command = `delayed_reboot 100`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Success:', command);

            expect(mockOnReboot).toBeCalledTimes(1);
            expect(mockOnReboot).toBeCalledWith(true);
        });

        test('kernel reboot - error', () => {
            const command = `delayed_reboot 100`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onError('Error: some message', command);

            expect(mockOnReboot).toBeCalledTimes(1);
            expect(mockOnReboot).toBeCalledWith(false, 'Error: some message');
        });

        test.each(['get', 'set 2300'])(
            'npmx charger termination_voltage normal %p',
            append => {
                const command = `npmx charger termination_voltage normal ${append}`;
                const callback =
                    eventHandlers.mockRegisterCommandCallbackHandler(command);

                callback?.onSuccess('Value: 2300 mv', command);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).nthCalledWith(1, { vTerm: 2.3 });
            }
        );

        test.each(['get', 'set 400'])(
            'npmx charger charger_current %p',
            append => {
                const command = `npmx charger charger_current ${append}`;
                const callback =
                    eventHandlers.mockRegisterCommandCallbackHandler(command);

                callback?.onSuccess('Value: 400 mA', command);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).nthCalledWith(1, { iChg: 400 });
            }
        );

        test.each(['get', 'set 1'])(
            'npmx charger enable recharging %p',
            append => {
                const command = `npmx charger module recharge ${append}`;
                const callback =
                    eventHandlers.mockRegisterCommandCallbackHandler(command);

                callback?.onSuccess('Value: 1.', command);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).nthCalledWith(1, {
                    enableRecharging: true,
                });
            }
        );

        test.each(['get', 'set 20'])('npmx charger iTerm %p', append => {
            const command = `npmx charger termination_current ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 20%', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, { iTerm: '20%' });
        });

        test.each([
            {
                append: 'get',
                successReturn: 'Value: 47k.',
                ntcThermistor: '47 kΩ' as NTCThermistor,
            },
            {
                append: 'set ntc_47k',
                successReturn: 'Value: 47k.',
                ntcThermistor: '47 kΩ' as NTCThermistor,
            },
            {
                append: 'set ntc_10k',
                successReturn: 'Value: 10k.',
                ntcThermistor: '10 kΩ' as NTCThermistor,
            },
            {
                append: 'set ntc_100k',
                successReturn: 'Value: 100k.',
                ntcThermistor: '100 kΩ' as NTCThermistor,
            },
        ])(
            'npmx charger ntc thermistor %p',
            ({ append, successReturn, ntcThermistor }) => {
                const command = `npmx adc ntc ${append}`;
                const callback =
                    eventHandlers.mockRegisterCommandCallbackHandler(command);

                callback?.onSuccess(successReturn, command);

                expect(mockOnChargerUpdate).toBeCalledTimes(1);
                expect(mockOnChargerUpdate).nthCalledWith(1, { ntcThermistor });
            }
        );

        test.each(
            [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80]
                .map(setValue => [
                    {
                        append: 'get',
                        value: setValue,
                    },
                    {
                        append: `set ${setValue}`,
                        value: setValue,
                    },
                ])
                .flat()
        )('npmx charger status %p', ({ append, value }) => {
            const command = `npmx charger status ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${value}`, command);

            expect(mockOnChargingStatusUpdate).toBeCalledTimes(1);
            expect(mockOnChargingStatusUpdate).toBeCalledWith({
                // eslint-disable-next-line no-bitwise
                batteryDetected: (value & 0x01) > 0,
                // eslint-disable-next-line no-bitwise
                batteryFull: (value & 0x02) > 0,
                // eslint-disable-next-line no-bitwise
                trickleCharge: (value & 0x04) > 0,
                // eslint-disable-next-line no-bitwise
                constantCurrentCharging: (value & 0x08) > 0,
                // eslint-disable-next-line no-bitwise
                constantVoltageCharging: (value & 0x10) > 0,
                // eslint-disable-next-line no-bitwise
                batteryRechargeNeeded: (value & 0x20) > 0,
                // eslint-disable-next-line no-bitwise
                dieTempHigh: (value & 0x40) > 0,
                // eslint-disable-next-line no-bitwise
                supplementModeActive: (value & 0x80) > 0,
            } as PmicChargingState);
        });

        test.each(
            [true, false]
                .map(enabled => [
                    {
                        append: 'get',
                        enabled,
                    },
                    {
                        append: `set ${enabled ? '1' : '0'}`,
                        enabled,
                    },
                ])
                .flat()
        )('npmx charger module charger %p', ({ append, enabled }) => {
            const command = `npmx charger module charger ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${enabled ? '1' : '0'}`, command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, { enabled });
        });

        test.each(
            [true, false]
                .map(enabled => [
                    {
                        enabled,
                        append: 'get',
                    },
                    {
                        enabled,
                        append: `set ${enabled ? '1' : '0'}`,
                    },
                ])
                .flat()
        )('fuel_gauge %p', ({ enabled, append }) => {
            const command = `fuel_gauge ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${enabled ? '1' : '0'}`, command);

            expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
            expect(mockOnFuelGaugeUpdate).toBeCalledWith(enabled);
        });

        test.each(['get', 'set "LP803448"'])('fuel_gauge model %p', append => {
            const command = `fuel_gauge model ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(
                `Value: name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}`,
                command
            );

            expect(mockOnActiveBatteryModelUpdate).toBeCalledTimes(1);
            expect(mockOnActiveBatteryModelUpdate).toBeCalledWith({
                name: 'LP803448',
                characterizations: [
                    {
                        temperature: 45,
                        capacity: 1500.11,
                    },
                    {
                        temperature: 25,
                        capacity: 1518.28,
                    },
                    {
                        temperature: 5,
                        capacity: 1413.4,
                    },
                ],
            } as BatteryModel);
        });

        test('fuel_gauge model store', () => {
            const command = `fuel_gauge model store`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(
                'Success: Model stored to persistent memory.',
                command
            );

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'fuel_gauge model list',
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'fuel_gauge model get',
                expect.anything(),
                undefined,
                true
            );
        });

        test('fuel_gauge model list has stored battery', () => {
            const command = 'fuel_gauge model list';
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            const response = `Currently active battery model:
            name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
    Hardcoded battery models:
            name="LP302535",T={5.00 C,25.00 C,45.00 C},Q={273.95 mAh,272.80 mAh,269.23 mAh}
            name="LP353035",T={5.00 C,25.00 C,45.00 C},Q={406.15 mAh,422.98 mAh,420.56 mAh}
            name="LP301226",T={5.00 C,25.00 C,45.00 C},Q={68.99 mAh,70.43 mAh,65.50 mAh}
            name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
            name="LP502540",T={25.00 C},Q={563.08 mAh}
            name="LP503030",T={25.00 C},Q={495.98 mAh}
    Battery models stored in database:
            Slot 0: Empty
            Slot 1: name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
            Slot 2: Empty`;

            callback?.onSuccess(response, command);

            expect(mockOnStoredBatteryModelUpdate).toBeCalledTimes(1);
            expect(mockOnStoredBatteryModelUpdate).toBeCalledWith([
                null,
                {
                    name: 'LP803448',
                    characterizations: [
                        {
                            temperature: 45,
                            capacity: 1500.11,
                        },
                        {
                            temperature: 25,
                            capacity: 1518.28,
                        },
                        {
                            temperature: 5,
                            capacity: 1413.4,
                        },
                    ],
                },
                null,
            ] as (BatteryModel | null)[]);
        });

        test('fuel_gauge model list no stored battery', () => {
            const command = 'fuel_gauge model list';
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            const response = `Currently active battery model:
                name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
            Hardcoded battery models:
                name="LP302535",T={5.00 C,25.00 C,45.00 C},Q={273.95 mAh,272.80 mAh,269.23 mAh}
                name="LP353035",T={5.00 C,25.00 C,45.00 C},Q={406.15 mAh,422.98 mAh,420.56 mAh}
                name="LP301226",T={5.00 C,25.00 C,45.00 C},Q={68.99 mAh,70.43 mAh,65.50 mAh}
                name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
                name="LP502540",T={25.00 C},Q={563.08 mAh}
                name="LP503030",T={25.00 C},Q={495.98 mAh}
            Battery models stored in database:
                Slot 0: Empty
                Slot 1: Empty
                Slot 2: Empty`;
            callback?.onSuccess(response, command);

            expect(mockOnStoredBatteryModelUpdate).toBeCalledTimes(1);
            expect(mockOnStoredBatteryModelUpdate).toBeCalledWith([
                null,
                null,
                null,
            ]);
        });

        test.each([true, false])('npmx vbusin vbus status get %p', value => {
            const command = `npmx vbusin vbus status get`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${value ? '1' : '0'}`, command);

            expect(mockOnUsbPowered).toBeCalledTimes(1);
            expect(mockOnUsbPowered).toBeCalledWith(value);
        });

        test.each(
            PMIC_1300_BUCKS.map(index => [
                {
                    index,
                    append: `get ${index}`,
                },
                {
                    index,
                    append: `set ${index} 2300`,
                },
            ]).flat()
        )('npmx buck voltage normal %p', ({ index, append }) => {
            const command = `npmx buck voltage normal ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 2300 mv', command);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { vOutNormal: 2.3 },
                index,
            });
        });

        test.each(
            PMIC_1300_BUCKS.map(index => [
                {
                    index,
                    append: `get ${index}`,
                },
                {
                    index,
                    append: `set ${index} 2300`,
                },
            ]).flat()
        )('npmx buck voltage retention %p', ({ index, append }) => {
            const command = `npmx buck voltage retention ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 2300 mv', command);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { vOutRetention: 2.3 },
                index,
            });
        });

        test.each(
            PMIC_1300_BUCKS.map(index => [
                ...[0, 1].map(value =>
                    [
                        {
                            index,
                            append: `get ${index}`,
                            value,
                        },
                        {
                            index,
                            append: `set ${index} ${value} `,
                            value,
                        },
                    ].flat()
                ),
            ]).flat()
        )('npmx buck vout select %p', ({ index, append, value }) => {
            const command = `npmx buck vout select ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${value}`, command);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { mode: value === 0 ? 'vSet' : 'software' },
                index,
            });
        });

        test.each(
            PMIC_1300_BUCKS.map(index => [
                ...[true, false].map(enabled =>
                    [
                        {
                            index,
                            append: `get ${index}`,
                            enabled,
                        },
                        {
                            index,
                            append: `set ${index} ${enabled ? '1' : '0'} `,
                            enabled,
                        },
                    ].flat()
                ),
            ]).flat()
        )('npmx buck enable %p', ({ index, append, enabled }) => {
            const command = `npmx buck ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${enabled ? '1' : '0'}`, command);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { enabled },
                index,
            });
        });

        test.each(
            PMIC_1300_BUCKS.map(index => [
                ...[-1, 0, 1, 2, 3, 4].map(value =>
                    [
                        {
                            index,
                            append: `get ${index}`,
                            value,
                        },
                        {
                            index,
                            append: `set ${index} ${value} 0`,
                            value,
                        },
                    ].flat()
                ),
            ]).flat()
        )('npmx buck mode control %p', ({ index, append, value }) => {
            const command = `npmx buck gpio pwm_force ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${value} 0.`, command);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    modeControl:
                        value === -1
                            ? BuckModeControlValues[0]
                            : GPIOValues[value],
                },
                index,
            });
        });

        test.each(
            PMIC_1300_BUCKS.map(index => [
                ...[-1, 0, 1, 2, 3, 4].map(value =>
                    [
                        {
                            index,
                            append: `get ${index}`,
                            value,
                        },
                        {
                            index,
                            append: `set ${index} ${value} 0`,
                            value,
                        },
                    ].flat()
                ),
            ]).flat()
        )('npmx buck on/off control %p', ({ index, append, value }) => {
            const command = `npmx buck gpio on_off ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${value} 0.`, command);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    onOffControl:
                        value === -1
                            ? BuckOnOffControlValues[0]
                            : GPIOValues[value],
                },
                index,
            });
        });

        test.each(
            PMIC_1300_BUCKS.map(index => [
                ...[-1, 0, 1, 2, 3, 4].map(value =>
                    [
                        {
                            index,
                            append: `get ${index}`,
                            value,
                        },
                        {
                            index,
                            append: `set ${index} ${value} 0`,
                            value,
                        },
                    ].flat()
                ),
            ]).flat()
        )('npmx buck retention control %p', ({ index, append, value }) => {
            const command = `npmx buck gpio retention ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${value} 0.`, command);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    retentionControl:
                        value === -1
                            ? BuckOnOffControlValues[0]
                            : GPIOValues[value],
                },
                index,
            });
        });

        test.each(
            PMIC_1300_LDOS.map(index => [
                ...[true, false].map(enabled =>
                    [
                        {
                            index,
                            append: `get ${index}`,
                            enabled,
                        },
                        {
                            index,
                            append: `set ${index} ${enabled ? '1' : '0'} `,
                            enabled,
                        },
                    ].flat()
                ),
            ]).flat()
        )('npmx ldsw %p', ({ index, append, enabled }) => {
            const command = `npmx ldsw ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${enabled ? '1' : '0'}`, command);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { enabled },
                index,
            });
        });

        test.each(
            PMIC_1300_LDOS.map(index => [
                [
                    {
                        index,
                        append: `get ${index}`,
                    },
                    {
                        index,
                        append: `set ${index} 1300`,
                    },
                ].flat(),
            ]).flat()
        )('npmx ldsw voltage %p', ({ index, append }) => {
            const command = `npmx ldsw ldo_voltage ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: 1300mV.`, command);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { voltage: 1.3 },
                index,
            });
        });

        test.each(
            PMIC_1300_LDOS.map(index => [
                ...['LDO', 'ldoSwitch'].map(mode =>
                    [
                        {
                            index,
                            append: `get ${index}`,
                            mode,
                        },
                        {
                            index,
                            append: `set ${index} ${
                                mode === 'LDO' ? '1' : '0'
                            } `,
                            mode,
                        },
                    ].flat()
                ),
            ]).flat()
        )('npmx ldsw mode %p', ({ index, append, mode }) => {
            const command = `npmx ldsw mode ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(
                `Value:  ${mode === 'LDO' ? '1' : '0'}.`,
                command
            );

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { mode },
                index,
            });
        });
    });

    describe('Logging Events', () => {
        let {
            eventHandlers,
            mockOnAdcSample,
            mockOnBeforeReboot,
            mockOnUsbPowered,
            mockOnChargingStatusUpdate,
            pmic,
        } = setupMocksWithShellParser();

        beforeEach(() => {
            const setupMock = setupMocksWithShellParser();

            eventHandlers = setupMock.eventHandlers;
            mockOnAdcSample = setupMock.mockOnAdcSample;
            mockOnBeforeReboot = setupMock.mockOnBeforeReboot;
            mockOnUsbPowered = setupMock.mockOnUsbPowered;
            mockOnChargingStatusUpdate = setupMock.mockOnChargingStatusUpdate;
            pmic = setupMock.pmic;
        });

        test('Reboot when device PMIC is available', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:02.019,531] <wrn> module_pmic: PMIC available. Application can be restarted.'
            );

            expect(mockOnBeforeReboot).toBeCalledTimes(1);
        });

        test('Does not Reboot if auto reboot is off PMIC is available', async () => {
            pmic.setAutoRebootDevice(false);
            await eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:02.019,531] <wrn> module_pmic: PMIC available. Application can be restarted.'
            );

            expect(mockOnBeforeReboot).toBeCalledTimes(0);

            pmic.setAutoRebootDevice(true);

            expect(mockOnBeforeReboot).toBeCalledTimes(1);
        });

        test('Adc Sample Logging event once', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:17.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tbat=26.656051,soc=98.705001,tte=312,ttf=514'
            );

            expect(mockOnAdcSample).toBeCalledTimes(1);
            expect(mockOnAdcSample).toBeCalledWith({
                timestamp: 17525,
                vBat: 4.25,
                iBat: 0.62, // converted to mA
                tBat: 26.7,
                soc: 98.7,
                tte: 312,
                ttf: 514,
            });
        });

        test('Adc Sample Logging event - overflow 1193.046471111111 hrs +', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:16.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tbat=26.656051,soc=98.705001,tte=312,ttf=514'
            );

            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:10.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tbat=26.656051,soc=98.705001,tte=312,ttf=514'
            );

            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:8.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tbat=26.656051,soc=98.705001,tte=312,ttf=514'
            );

            expect(mockOnAdcSample).toBeCalledTimes(3);
            expect(mockOnAdcSample).nthCalledWith(1, {
                timestamp: 16525,
                vBat: 4.25,
                iBat: 0.62, // converted to mA
                tBat: 26.7,
                soc: 98.7,
                tte: 312,
                ttf: 514,
            });

            expect(mockOnAdcSample).nthCalledWith(2, {
                timestamp: 2 ** 32 - 1 + 10525, // 1193hrs 02min 47sec 295ms + 10.525 sec
                vBat: 4.25,
                iBat: 0.62, // converted to mA
                tBat: 26.7,
                soc: 98.7,
                tte: 312,
                ttf: 514,
            });

            expect(mockOnAdcSample).nthCalledWith(3, {
                timestamp: (2 ** 32 - 1) * 2 + 8525, // 1193hrs 02min 47sec 295ms + 8.525 sec
                vBat: 4.25,
                iBat: 0.62, // converted to mA
                tBat: 26.7,
                soc: 98.7,
                tte: 312,
                ttf: 514,
            });
        });

        test('USB Power detected  event', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:17.525,000] <inf> module_pmic_irq: type=EVENTSVBUSIN0SET,bit=EVENTVBUSDETECTED'
            );

            expect(mockOnUsbPowered).toBeCalledTimes(1);
            expect(mockOnUsbPowered).toBeCalledWith(true);
        });

        test('USB Power removed event', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:17.525,000] <inf> module_pmic_irq: type=EVENTSVBUSIN0SET,bit=EVENTVBUSREMOVED'
            );

            expect(mockOnUsbPowered).toBeCalledTimes(1);
            expect(mockOnUsbPowered).toBeCalledWith(false);
        });

        test.each([0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80])(
            'Charging status event %p',
            value => {
                eventHandlers.mockOnShellLoggingEventHandler(
                    `[00:28:48.730,346] <inf> module_pmic_charger: charger status=${value}`
                );

                expect(mockOnChargingStatusUpdate).toBeCalledTimes(1);
                expect(mockOnChargingStatusUpdate).toBeCalledWith({
                    // eslint-disable-next-line no-bitwise
                    batteryDetected: (value & 0x01) > 0,
                    // eslint-disable-next-line no-bitwise
                    batteryFull: (value & 0x02) > 0,
                    // eslint-disable-next-line no-bitwise
                    trickleCharge: (value & 0x04) > 0,
                    // eslint-disable-next-line no-bitwise
                    constantCurrentCharging: (value & 0x08) > 0,
                    // eslint-disable-next-line no-bitwise
                    constantVoltageCharging: (value & 0x10) > 0,
                    // eslint-disable-next-line no-bitwise
                    batteryRechargeNeeded: (value & 0x20) > 0,
                    // eslint-disable-next-line no-bitwise
                    dieTempHigh: (value & 0x40) > 0,
                    // eslint-disable-next-line no-bitwise
                    supplementModeActive: (value & 0x80) > 0,
                } as PmicChargingState);
            }
        );
    });

    describe('Pmic State Change tests', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        test('Initial State', () => {
            const { pmic } = setupMocksWithShellParser();

            expect(pmic.getConnectionState()).toBe('pmic-connected');
        });

        test("Goes from 'pmic-connected' to 'pmic-disconnected' if 'No response from PMIC.' is received", () => {
            const { eventHandlers, mockOnPmicStateChange } =
                setupMocksWithShellParser();

            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:02.019,531] <wrn> module_pmic: No response from PMIC.'
            );

            expect(mockOnPmicStateChange).toBeCalledTimes(1);
            expect(mockOnPmicStateChange).toBeCalledWith('pmic-disconnected');
        });

        test("Goes from 'pmic-unknown' to 'pmic-disconnected' if 'No response from PMIC.' is received", () => {
            const { eventHandlers, mockOnPmicStateChange } =
                setupMocksWithShellParser();

            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:02.019,531] <wrn> module_pmic: No response from PMIC.'
            );

            expect(mockOnPmicStateChange).toBeCalledTimes(1);
            expect(mockOnPmicStateChange).toBeCalledWith('pmic-disconnected');
        });

        test('Request kernelReset %p', () => {
            const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

            mockEnqueueRequest.mockClear();

            pmic.kernelReset();
            pmic.kernelReset(); // this should not be sent

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `delayed_reboot 100`,
                expect.anything(),
                undefined,
                true
            );
        });
    });
});
export {};
