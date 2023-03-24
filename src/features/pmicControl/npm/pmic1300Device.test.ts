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

const setupMocks = () => {
    const mockWarningDialogHandler = jest.fn(
        (pmicWarningDialog: PmicWarningDialog) => {}
    );

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
        mockWarningDialogHandler,
        mockOnPausedChange,
        mockOnShellLoggingEvent,
        mockOnUnknownCommand,
        mockEnqueueRequest,
        mockRegisterCommandCallback,
        mockUnregister,
        mockIsPause,
        mockUnPause,
        mockShellParser,
        pmic: getNPM1300(mockShellParser(), mockWarningDialogHandler),
    };
};

const {
    mockWarningDialogHandler,
    mockOnPausedChange,
    mockOnShellLoggingEvent,
    mockOnUnknownCommand,
    mockEnqueueRequest,
    mockRegisterCommandCallback,
    mockUnregister,
    mockIsPause,
    mockUnPause,
    mockShellParser,
    pmic,
} = setupMocks();

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

// describe('Setters and effects ed_disconnected', () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });
//     // test('Request update pmicChargingState', () => {
//     //     PMIC_1300_CHARGERS.forEach(index => {
//     //         mockEnqueueRequest.mockReset();
//     //         pmic.setChargerEnabled(index, false);

//     //         expect(mockEnqueueRequest).toBeCalledTimes(1);
//     //         expect(mockEnqueueRequest).toBeCalledWith(
//     //             'npmx charger status set 1',
//     //             expect.anything(),
//     //             expect.anything(),
//     //             true
//     //         );
//     //     });
//     // });
// });

export {};
