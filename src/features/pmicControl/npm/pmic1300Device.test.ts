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
    Charger,
    Ldo,
    PartialUpdate,
    PmicChargingState,
    PmicDialog,
} from './types';

const PMIC_1300_BUCKS = [0, 1];
const PMIC_1300_LDOS = [0, 1];
const PMIC_1300_CHARGERS = [0];

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
        (_partialUpdate: PartialUpdate<Charger>) => {}
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

    const eventHandlers = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        mockOnShellLoggingEventHandler: (_state: string) => {},
        mockRegisterCommandCallbackHandlers: [] as CommandCallback[],
        mockAnyCommandResponseHandlers: [] as AnyCommandHandler[],
        mockRegisterCommandCallbackHandler: (command: string) =>
            eventHandlers.mockRegisterCommandCallbackHandlers.find(element =>
                command.match(`^(${element.command})`)
            ),
    };

    const mockOnShellLoggingEvent = jest.fn(
        (handler: (state: string) => void) => {
            eventHandlers.mockOnShellLoggingEventHandler = handler;
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
    const mockUnPause = jest.fn(() => {});
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

            test.each(PMIC_1300_CHARGERS)(
                'Request update pmicChargingState index: %p',
                index => {
                    pmic.requestUpdate.pmicChargingState(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        'npmx charger status get',
                        expect.anything(),
                        undefined,
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
                        undefined,
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
                        undefined,
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
                        undefined,
                        true
                    );
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Request update chargerVTrickleFast index: %p',
                index => {
                    pmic.requestUpdate.chargerVTrickleFast(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        'npmx charger trickle get',
                        expect.anything(),
                        undefined,
                        true
                    );
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Request update chargerITerm index: %p',
                index => {
                    pmic.requestUpdate.chargerITerm(index);

                    expect(mockEnqueueRequest).toBeCalledTimes(1);
                    expect(mockEnqueueRequest).toBeCalledWith(
                        'npmx charger termination_current get',
                        expect.anything(),
                        undefined,
                        true
                    );
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
                        undefined,
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

            test('Request getDefaultBatteryModels success', async () => {
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
                    Default battery models:
                            name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
                            name="LP502540",T={25.00 C},Q={563.08 mAh}
                    Battery model stored in database:
                            name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}`,
                            'fuel_gauge model list'
                        );
                        return Promise.resolve();
                    }
                );

                await expect(
                    pmic.getDefaultBatteryModels()
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
                pmic.startAdcSample(2000);

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
                    'npm_adc sample 1000 0',
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
                        callbacks?.onSuccess('app_version=0.0.0+14', command);
                        return Promise.resolve();
                    }
                );

                await expect(pmic.isSupportedVersion()).resolves.toBe(true);

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

                await expect(pmic.isSupportedVersion()).resolves.toBe(false);

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
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Set setChargerIChg index: %p',
                async index => {
                    await pmic.setChargerIChg(index, 32);

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { iChg: 32 },
                        index,
                    });

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
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Set setChargerVTrickleFast index: %p',
                async index => {
                    await pmic.setChargerVTrickleFast(index, 2.5);

                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx charger trickle set 2500`,
                        expect.anything(),
                        undefined,
                        true
                    );
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Set setChargerITerm index: %p',
                async index => {
                    await pmic.setChargerITerm(index, '10%');

                    expect(mockEnqueueRequest).toBeCalledWith(
                        `npmx charger termination_current set 10`,
                        expect.anything(),
                        undefined,
                        true
                    );
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
                ]).flat()
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
                ]).flat()
            )('Set setChargerEnabled %p', async ({ index, enabled }) => {
                await pmic.setChargerEnabled(index, enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx charger module charger set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnChargerUpdate).toBeCalledTimes(0);
            });

            test.each(PMIC_1300_CHARGERS)(
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

                await pmic.setBuckVOutNormal(1, 1.7);
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

                await pmic.setBuckVOutNormal(1, 1.7);
                expect(mockDialogHandler).toBeCalledTimes(1);

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck voltage normal set 1 1700`,
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

                await pmic.setBuckVOutNormal(1, 1.7);
                expect(mockDialogHandler).toBeCalledTimes(1);

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck voltage normal set 1 1700`,
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

                await pmic.setBuckMode(1, 'software');
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

                await pmic.setBuckEnabled(1, false);
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
                    `fuel_gauge model set someProfileName`,
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

            test('storeBattery', async () => {
                await pmic.storeBattery();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    'fuel_gauge model store',
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnActiveBatteryModelUpdate).toBeCalledTimes(0);
            });
        });

        describe('Setters and effects state - error', () => {
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
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Set setChargerIChg onError case 1 - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setChargerIChg(index, 32)
                    ).rejects.toBeUndefined();

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { iChg: 32 },
                        index,
                    });

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
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Set setChargerIChg onError case 2 - Fail on second command -  index: %p',
                async index => {
                    mockEnqueueRequest.mockImplementationOnce(
                        helpers.registerCommandCallbackSuccess
                    );

                    await expect(
                        pmic.setChargerIChg(index, 32)
                    ).rejects.toBeUndefined();

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { iChg: 32 },
                        index,
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
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Set setChargerVTrickleFast onError case 1 - Fail immediately -  index: %p',
                async index => {
                    await expect(
                        pmic.setChargerVTrickleFast(index, 2.5)
                    ).rejects.toBeUndefined();

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { vTrickleFast: 2.5 },
                        index,
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
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Set setChargerVTrickleFast onError case 2 - Fail immediately -  index: %p',
                async index => {
                    mockEnqueueRequest.mockImplementationOnce(
                        helpers.registerCommandCallbackSuccess
                    );

                    await expect(
                        pmic.setChargerVTrickleFast(index, 2.5)
                    ).rejects.toBeUndefined();

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { vTrickleFast: 2.5 },
                        index,
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
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Set setChargerITerm  onError case 1 - Fail immediately - index: %p',
                async index => {
                    await expect(
                        pmic.setChargerITerm(index, '10%')
                    ).rejects.toBeUndefined();

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { iTerm: '10%' },
                        index,
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
                        `npmx charger termination_current get`,
                        expect.anything(),
                        undefined,
                        true
                    );
                }
            );

            test.each(PMIC_1300_CHARGERS)(
                'Set setChargerITerm  onError case 2 - Fail immediately - index: %p',
                async index => {
                    mockEnqueueRequest.mockImplementationOnce(
                        helpers.registerCommandCallbackSuccess
                    );

                    await expect(
                        pmic.setChargerITerm(index, '10%')
                    ).rejects.toBeUndefined();

                    expect(mockOnChargerUpdate).toBeCalledTimes(1);
                    expect(mockOnChargerUpdate).toBeCalledWith({
                        data: { iTerm: '10%' },
                        index,
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
                ]).flat()
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
                ]).flat()
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

            test.each(PMIC_1300_CHARGERS)(
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

            test.each(PMIC_1300_CHARGERS)(
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
                    `fuel_gauge model set someProfileName`,
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

        test.each(PMIC_1300_LDOS)('Set setLdoMode index: %p', async index => {
            await pmic.setLdoMode(index, 'LDO');

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { mode: 'LDO' },
                index,
            });
        });

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

        test('Number of Chargers', () =>
            expect(pmic.getNumberOfChargers()).toBe(1));

        test('Number of Bucks', () => expect(pmic.getNumberOfBucks()).toBe(2));

        test('Number of LDOs', () => expect(pmic.getNumberOfLdos()).toBe(2));

        test('Number of LDOs', () => expect(pmic.getNumberOfGPIOs()).toBe(5));

        test('Device Type', () => expect(pmic.getDeviceType()).toBe('npm1300'));

        test.each(PMIC_1300_CHARGERS)(
            'Charger Voltage Range index: %p',
            index =>
                expect(pmic.getChargerVoltageRange(index)).toStrictEqual([
                    3.5, 3.55, 3.6, 3.65, 4, 4.05, 4.1, 4.15, 4.2, 4.25, 4.3,
                    4.35, 4.4, 4.45,
                ])
        );

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

        let chargers: Charger[] = [];
        let bucks: Buck[] = [];
        let ldos: Ldo[] = [];

        beforeEach(() => {
            jest.clearAllMocks();

            chargers = [];
            bucks = [];
            ldos = [];

            mockOnChargerUpdate.mockImplementation(
                (partialUpdate: PartialUpdate<Charger>) => {
                    chargers[partialUpdate.index] = {
                        ...(chargers[partialUpdate.index] ?? initCharger),
                        ...partialUpdate.data,
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
            expect(chargers).toStrictEqual([
                {
                    vTerm: 3.5,
                    vTrickleFast: 2.5,
                    iChg: 32,
                    enabled: false,
                    iTerm: '10%',
                    enableRecharging: false,
                },
            ]);

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

            expect(mockOnChargerUpdate).toBeCalledTimes(6);
            expect(mockOnBuckUpdate).toBeCalledTimes(16); // 7 states + 1 (mode change on vOut) * 2 Bucks
            expect(mockOnLdoUpdate).toBeCalledTimes(6);

            expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
            expect(mockOnFuelGaugeUpdate).toBeCalledWith(true);
        };

        test('Apply Correct config', () => {
            pmic.applyConfig({
                chargers: [
                    {
                        vTerm: 3.5,
                        vTrickleFast: 2.5,
                        iChg: 32,
                        enabled: false,
                        iTerm: '10%',
                        enableRecharging: false,
                    },
                ],
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
                firmwareVersion: '0.0.0+14',
                deviceType: 'npm1300',
            });
            verifyApplyConfig();
        });

        test('Apply wrong firmware version -- Yes', () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            pmic.applyConfig({
                chargers: [
                    {
                        vTerm: 3.5,
                        vTrickleFast: 2.5,
                        iChg: 32,
                        enabled: false,
                        iTerm: '10%',
                        enableRecharging: false,
                    },
                ],
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
            });

            expect(mockDialogHandler).toBeCalledTimes(1);

            verifyApplyConfig();
        });

        test("Apply wrong firmware version -- Yes, Don't ask again", () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                if (dialog.onOptional) dialog.onOptional();
            });

            pmic.applyConfig({
                chargers: [
                    {
                        vTerm: 3.5,
                        vTrickleFast: 2.5,
                        iChg: 32,
                        enabled: false,
                        iTerm: '10%',
                        enableRecharging: false,
                    },
                ],
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
            });

            expect(mockDialogHandler).toBeCalledTimes(1);

            verifyApplyConfig();
        });

        test('Apply wrong firmware version -- Cancel', () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onCancel();
            });

            pmic.applyConfig({
                chargers: [
                    {
                        vTerm: 3.5,
                        vTrickleFast: 2.5,
                        iChg: 32,
                        enabled: false,
                        iTerm: '10%',
                        enableRecharging: false,
                    },
                ],
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

        test.each(
            PMIC_1300_CHARGERS.map(index => [
                {
                    index,
                    append: 'get',
                },
                {
                    index,
                    append: 'set 2300',
                },
            ]).flat()
        )('npmx charger termination_voltage normal %p', ({ index, append }) => {
            const command = `npmx charger termination_voltage normal ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 2300 mv', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                data: { vTerm: 2.3 },
                index,
            });
        });

        test.each(
            PMIC_1300_CHARGERS.map(index => [
                {
                    index,
                    append: 'get',
                },
                {
                    index,
                    append: 'set 400',
                },
            ]).flat()
        )('npmx charger charger_current %p', ({ index, append }) => {
            const command = `npmx charger charger_current ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 400 mA', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                data: { iChg: 400 },
                index,
            });
        });

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
            PMIC_1300_CHARGERS.map(index => [
                ...[true, false]
                    .map(enabled => [
                        {
                            index,
                            append: 'get',
                            enabled,
                        },
                        {
                            index,
                            append: `set ${enabled ? '1' : '0'}`,
                            enabled,
                        },
                    ])
                    .flat(),
            ]).flat()
        )('npmx charger module charger %p', ({ index, append, enabled }) => {
            const command = `npmx charger module charger ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${enabled ? '1' : '0'}`, command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                data: { enabled },
                index,
            });
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

        test.each(['get', 'set LP803448'])('fuel_gauge model %p', append => {
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
    Default battery models:
            name="LP302535",T={5.00 C,25.00 C,45.00 C},Q={273.95 mAh,272.80 mAh,269.23 mAh}
            name="LP353035",T={5.00 C,25.00 C,45.00 C},Q={406.15 mAh,422.98 mAh,420.56 mAh}
            name="LP301226",T={5.00 C,25.00 C,45.00 C},Q={68.99 mAh,70.43 mAh,65.50 mAh}
            name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
            name="LP502540",T={25.00 C},Q={563.08 mAh}
            name="LP503030",T={25.00 C},Q={495.98 mAh}
    Battery model stored in database:
            name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}`;

            callback?.onSuccess(response, command);

            expect(mockOnStoredBatteryModelUpdate).toBeCalledTimes(1);
            expect(mockOnStoredBatteryModelUpdate).toBeCalledWith({
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

        test('fuel_gauge model list no stored battery', () => {
            const command = 'fuel_gauge model list';
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            const response = `Currently active battery model:
                name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
        Default battery models:
                name="LP302535",T={5.00 C,25.00 C,45.00 C},Q={273.95 mAh,272.80 mAh,269.23 mAh}
                name="LP353035",T={5.00 C,25.00 C,45.00 C},Q={406.15 mAh,422.98 mAh,420.56 mAh}
                name="LP301226",T={5.00 C,25.00 C,45.00 C},Q={68.99 mAh,70.43 mAh,65.50 mAh}
                name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
                name="LP502540",T={25.00 C},Q={563.08 mAh}
                name="LP503030",T={25.00 C},Q={495.98 mAh}`;
            callback?.onSuccess(response, command);

            expect(mockOnStoredBatteryModelUpdate).toBeCalledTimes(1);
            expect(mockOnStoredBatteryModelUpdate).toBeCalledWith(undefined);
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
        )('npmx buck %p', ({ index, append, enabled }) => {
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
    });

    describe('Logging Events', () => {
        let {
            eventHandlers,
            mockOnAdcSample,
            mockOnBeforeReboot,
            mockOnUsbPowered,
            mockOnChargingStatusUpdate,
        } = setupMocksWithShellParser();

        beforeEach(() => {
            const setupMock = setupMocksWithShellParser();

            eventHandlers = setupMock.eventHandlers;
            mockOnAdcSample = setupMock.mockOnAdcSample;
            mockOnBeforeReboot = setupMock.mockOnBeforeReboot;
            mockOnUsbPowered = setupMock.mockOnUsbPowered;
            mockOnChargingStatusUpdate = setupMock.mockOnChargingStatusUpdate;
        });

        test('Reboot when device PMIC is available', async () => {
            await eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:02.019,531] <wrn> module_pmic: PMIC available. Application can be restarted.'
            );

            expect(mockOnBeforeReboot).toBeCalledTimes(1);
            expect(mockOnBeforeReboot).toBeCalledWith(expect.anything());
        }); // TODO fix promise of profiler

        test('Adc Sample Logging event once', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:17.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tbat=26.656051,soc=98.705001,tte=312,ttf=514'
            );

            expect(mockOnAdcSample).toBeCalledTimes(1);
            expect(mockOnAdcSample).toBeCalledWith({
                timestamp: 17525,
                vBat: 4.248,
                iBat: 0.617, // converted to mA
                tBat: 26.656051,
                soc: 98.705001,
                tte: 312,
                ttf: 514,
            });
        });

        test('Adc Sample Logging event - overflow 99hrs +', () => {
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
                vBat: 4.248,
                iBat: 0.617, // converted to mA
                tBat: 26.656051,
                soc: 98.705001,
                tte: 312,
                ttf: 514,
            });

            expect(mockOnAdcSample).nthCalledWith(2, {
                timestamp: 359999999 + 10525, // 99hrs 59min 59sec 999ms + 10.525 sec
                vBat: 4.248,
                iBat: 0.617, // converted to mA
                tBat: 26.656051,
                soc: 98.705001,
                tte: 312,
                ttf: 514,
            });

            expect(mockOnAdcSample).nthCalledWith(3, {
                timestamp: 359999999 + 359999999 + 8525, // 99hrs 59min 59sec 999ms + 8.525 sec
                vBat: 4.248,
                iBat: 0.617, // converted to mA
                tBat: 26.656051,
                soc: 98.705001,
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
            const { eventHandlers, mockOnPmicStateChange } =
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
            const { eventHandlers, mockOnPmicStateChange } =
                setupMocksWithShellParser();

            expect(clearTimeout).toHaveBeenCalledTimes(0);

            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:02.019,531] <wrn> module_pmic: No response from PMIC.'
            );

            expect(clearTimeout).toHaveBeenCalledTimes(1);

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
