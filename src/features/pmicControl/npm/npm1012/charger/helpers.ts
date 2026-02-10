/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Charger, ChargerJeitaILabel, ChargerJeitaVLabel } from '../../types';

export const advancedChargingProfileOnUpdate = (
    advancedChargingProfile: boolean,
): Partial<Charger> => ({
    enableAdvancedChargingProfile: advancedChargingProfile,
    jeitaILabelCool: advancedChargingProfile
        ? ChargerJeitaILabel.coolIChgCool
        : ChargerJeitaILabel.coolIChg50percent,
    jeitaVLabelCool: advancedChargingProfile
        ? ChargerJeitaVLabel.coolVTermCool
        : ChargerJeitaVLabel.coolVTerm,
    jeitaILabelWarm: advancedChargingProfile
        ? ChargerJeitaILabel.warmIChgWarm
        : ChargerJeitaILabel.warmIChg,
    jeitaVLabelWarm: advancedChargingProfile
        ? ChargerJeitaVLabel.warmVTermWarm
        : ChargerJeitaVLabel.warmVTerm100mVOff,
});
