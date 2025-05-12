/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { USBDetectStatusValues } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1300 - Command callbacks', () => {
    const { eventHandlers, mockOnUsbPower } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(USBDetectStatusValues.map((state, index) => ({ state, index })))(
        'powerup_vbusin status get %p',
        ({ state, index }) => {
            const command = `powerup_vbusin status get`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${index}`, command);

            expect(mockOnUsbPower).toBeCalledTimes(1);
            expect(mockOnUsbPower).toBeCalledWith({ detectStatus: state });
        }
    );

    test.each(['get', 'set 500'])('npmx vbusin current_limit %p', append => {
        const command = `npmx vbusin current_limit ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 500 mA.`, command);

        expect(mockOnUsbPower).toBeCalledTimes(1);
        expect(mockOnUsbPower).toBeCalledWith({
            currentLimiter: 0.5,
        });
    });
});
export {};
