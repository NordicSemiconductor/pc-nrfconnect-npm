/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type ShellParser,
    type ShellParserCallbacks as Callbacks,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import type BaseNpmDevice from '../basePmicDevice';
import {
    type Boost,
    type Buck,
    type Charger,
    type ErrorLogs,
    type GPIO,
    type Ldo,
    type LED,
    type LowPowerConfig,
    type OnBoardLoad,
    type PartialUpdate,
    type PmicDialog,
    type POF,
    type ResetConfig,
    type TimerConfig,
    type USBPower,
} from '../types';

export const setupMocksBase = (
    createNpmDevice: (
        shellParser: ShellParser | undefined,
        dialogHandler: ((dialog: PmicDialog) => void) | null,
    ) => BaseNpmDevice,
    shellParser: ShellParser | undefined = undefined,
) => {
    const mockDialogHandler = jest.fn((_pmicDialog: PmicDialog) => {});

    const pmic = createNpmDevice(shellParser, mockDialogHandler);

    const mockOnActiveBatteryModelUpdate = jest.fn(() => {});
    const mockOnAdcSample = jest.fn(() => {});
    const mockOnBeforeReboot = jest.fn(() => {});
    const mockOnBuckUpdate = jest.fn(
        (_partialUpdate: PartialUpdate<Buck>) => {},
    );
    const mockOnBoostUpdate = jest.fn(
        (_partialUpdate: PartialUpdate<Boost>) => {},
    );
    const mockOnChargerUpdate = jest.fn(
        (_partialUpdate: Partial<Charger>) => {},
    );
    const mockOnBoardLoadUpdate = jest.fn(
        (_partialUpdate: Partial<OnBoardLoad>) => {},
    );
    const mockOnChargingStatusUpdate = jest.fn(() => {});
    const mockOnFuelGaugeUpdate = jest.fn(() => {});

    const mockOnLdoUpdate = jest.fn((_partialUpdate: PartialUpdate<Ldo>) => {});
    const mockOnGpioUpdate = jest.fn(
        (_partialUpdate: PartialUpdate<GPIO>) => {},
    );
    const mockOnLEDUpdate = jest.fn((_partialUpdate: PartialUpdate<LED>) => {});

    const mockOnPOFUpdate = jest.fn((_partialUpdate: Partial<POF>) => {});

    const mockOnTimerConfigUpdate = jest.fn(
        (_partialUpdate: Partial<TimerConfig>) => {},
    );

    const mockOnLowPowerUpdate = jest.fn(
        (_partialUpdate: Partial<LowPowerConfig>) => {},
    );

    const mockOnResetUpdate = jest.fn(
        (_partialUpdate: Partial<ResetConfig>) => {},
    );

    const mockOnUsbPower = jest.fn((_partialUpdate: Partial<USBPower>) => {});

    const mockOnErrorLogs = jest.fn((_msg: Partial<ErrorLogs>) => {});

    const mockOnLoggingEvent = jest.fn(() => {});
    const mockOnPmicStateChange = jest.fn(() => {});
    const mockOnReboot = jest.fn(() => {});
    const mockOnStoredBatteryModelUpdate = jest.fn(() => {});

    pmic.onActiveBatteryModelUpdate(mockOnActiveBatteryModelUpdate);
    pmic.onAdcSample(mockOnAdcSample);
    pmic.onBeforeReboot(mockOnBeforeReboot);
    pmic.onBuckUpdate(mockOnBuckUpdate);
    pmic.onBoostUpdate(mockOnBoostUpdate);
    pmic.onChargerUpdate(mockOnChargerUpdate);
    pmic.onOnBoardLoadUpdate(mockOnBoardLoadUpdate);
    pmic.onGPIOUpdate(mockOnGpioUpdate);
    pmic.onLEDUpdate(mockOnLEDUpdate);
    pmic.onPOFUpdate(mockOnPOFUpdate);
    pmic.onTimerConfigUpdate(mockOnTimerConfigUpdate);
    pmic.onLowPowerUpdate(mockOnLowPowerUpdate);
    pmic.onResetUpdate(mockOnResetUpdate);
    pmic.onChargingStatusUpdate(mockOnChargingStatusUpdate);
    pmic.onFuelGaugeUpdate(mockOnFuelGaugeUpdate);
    pmic.onLdoUpdate(mockOnLdoUpdate);
    pmic.onLoggingEvent(mockOnLoggingEvent);
    pmic.onPmicStateChange(mockOnPmicStateChange);
    pmic.onReboot(mockOnReboot);
    pmic.onErrorLogs(mockOnErrorLogs);
    pmic.onStoredBatteryModelUpdate(mockOnStoredBatteryModelUpdate);
    pmic.onUsbPower(mockOnUsbPower);

    return {
        mockDialogHandler,
        mockOnActiveBatteryModelUpdate,
        mockOnAdcSample,
        mockOnBeforeReboot,
        mockOnBuckUpdate,
        mockOnBoostUpdate,
        mockOnChargerUpdate,
        mockOnChargingStatusUpdate,
        mockOnBoardLoadUpdate,
        mockOnFuelGaugeUpdate,
        mockOnLdoUpdate,
        mockOnGpioUpdate,
        mockOnLEDUpdate,
        mockOnPOFUpdate,
        mockOnTimerConfigUpdate,
        mockOnLowPowerUpdate,
        mockOnResetUpdate,
        mockOnLoggingEvent,
        mockOnPmicStateChange,
        mockOnReboot,
        mockOnErrorLogs,
        mockOnStoredBatteryModelUpdate,
        mockOnUsbPower,
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

export const helpers = {
    registerCommandCallbackError: (
        _command: string,
        callbacks?: Callbacks,

        _timeout?: number,

        _unique?: boolean,
    ) => {
        callbacks?.onError('', '');
        return Promise.resolve();
    },
    registerCommandCallbackSuccess: (
        _command: string,
        callbacks?: Callbacks,

        _timeout?: number,

        _unique?: boolean,
    ) => {
        callbacks?.onSuccess('', '');
        return Promise.resolve();
    },
};

export const setupMocksWithShellParser = (
    createNpmDevice: (
        shellParser: ShellParser | undefined,
        dialogHandler: ((dialog: PmicDialog) => void) | null,
    ) => BaseNpmDevice,
) => {
    const mockOnPausedChange = jest.fn(
        (_handler: (state: boolean) => void) => () => {},
    );

    const mockOnShellLoggingEventHandler = (state: string) => {
        eventHandlers.mockOnShellLoggingEventHandlers.forEach(handler =>
            handler(state),
        );
    };

    const eventHandlers = {
        mockOnShellLoggingEventHandlers: [] as ((_state: string) => void)[],
        mockOnShellLoggingEventHandler,
        mockRegisterCommandCallbackHandlers: [] as CommandCallback[],
        mockAnyCommandResponseHandlers: [] as AnyCommandHandler[],
        mockRegisterCommandCallbackHandler: (command: string) =>
            eventHandlers.mockRegisterCommandCallbackHandlers.find(element =>
                command.match(`^(${element.command})`),
            ),
    };

    const mockOnShellLoggingEvent = jest.fn(
        (handler: (state: string) => void) => {
            eventHandlers.mockOnShellLoggingEventHandlers.push(handler);
            return () => {};
        },
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
            }) => void,
        ) => {
            eventHandlers.mockAnyCommandResponseHandlers.push(handler);
            return () => {};
        },
    );
    const mockOnUnknownCommand = jest.fn(
        (_handler: (state: string) => void) => () => {},
    );

    const mockEnqueueRequest = jest.fn(
        (
            _command: string,

            _callbacks?: Callbacks,

            _timeout?: number,

            _unique?: boolean,
        ) => Promise.resolve(),
    );
    const mockRegisterCommandCallback = jest.fn(
        (
            command: string,
            onSuccess: (data: string, command: string) => void,
            onError: (error: string, command: string) => void,
        ) => {
            eventHandlers.mockRegisterCommandCallbackHandlers.push({
                command,
                onSuccess,
                onError,
            });
            return () => {};
        },
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
            callbacks?: Callbacks,

            _timeout?: number,

            _unique?: boolean,
        ) => {
            expect(command).toBe('kernel uptime');
            callbacks?.onSuccess('Uptime: 0 ms', command);
            return Promise.resolve();
        },
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
        ...setupMocksBase(createNpmDevice, mockShellParser()),
    };
};
