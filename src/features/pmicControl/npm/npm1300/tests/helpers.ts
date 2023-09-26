/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    ShellParser,
    ShellParserCallbacks as Callbacks,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    Buck,
    Charger,
    GPIO,
    Ldo,
    LED,
    PartialUpdate,
    PmicDialog,
    POF,
    ShipModeConfig,
    TimerConfig,
} from '../../types';
import { getNPM1300 } from '../pmic1300Device';

export const PMIC_1300_BUCKS = [0, 1];
export const PMIC_1300_LDOS = [0, 1];
export const PMIC_1300_GPIOS = [0, 1, 2, 3, 4];
export const PMIC_1300_LEDS = [0, 1, 2];

export const setupMocksBase = (
    shellParser: ShellParser | undefined = undefined
) => {
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
    const mockOnGpioUpdate = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_partialUpdate: PartialUpdate<GPIO>) => {}
    );
    const mockOnLEDUpdate = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_partialUpdate: PartialUpdate<LED>) => {}
    );

    const mockOnPOFUpdate = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_partialUpdate: Partial<POF>) => {}
    );

    const mockOnTimerConfigUpdate = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_partialUpdate: Partial<TimerConfig>) => {}
    );

    const mockOnShipUpdate = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_partialUpdate: Partial<ShipModeConfig>) => {}
    );

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
    pmic.onGPIOUpdate(mockOnGpioUpdate);
    pmic.onLEDUpdate(mockOnLEDUpdate);
    pmic.onPOFUpdate(mockOnPOFUpdate);
    pmic.onTimerConfigUpdate(mockOnTimerConfigUpdate);
    pmic.onShipUpdate(mockOnShipUpdate);
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
        mockOnGpioUpdate,
        mockOnLEDUpdate,
        mockOnPOFUpdate,
        mockOnTimerConfigUpdate,
        mockOnShipUpdate,
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

export const helpers = {
    registerCommandCallbackError: (
        _command: string,
        callbacks?: Callbacks,
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
        callbacks?: Callbacks,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _timeout?: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _unique?: boolean
    ) => {
        callbacks?.onSuccess('', '');
        return Promise.resolve();
    },
};

export const setupMocksWithShellParser = () => {
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
            _callbacks?: Callbacks,
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
            callbacks?: Callbacks,
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
