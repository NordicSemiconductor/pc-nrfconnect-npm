/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import {
    getBucks,
    getChargers,
    getFuelGauge,
    getLdos,
    getNpmDevice,
    getPmicChargingState,
    getStateOfCharge,
    isBatteryConnected,
} from '../../features/pmicControl/pmicControlSlice';
import BatteryCard from '../cards/Battery/BatteryCard';
import BuckCard from '../cards/Buck/BuckCard';
import LDOCard from '../cards/LDO/LDOCard';
import PowerCard from '../cards/Power/PowerCard';

export default () => {
    const npmDevice = useSelector(getNpmDevice);
    const chargers = useSelector(getChargers);
    const bucks = useSelector(getBucks);
    const ldos = useSelector(getLdos);
    const batteryConnected = useSelector(isBatteryConnected);

    const stateOfCharge = useSelector(getStateOfCharge);
    const pmicChargingState = useSelector(getPmicChargingState);
    const fuelGauge = useSelector(getFuelGauge);
    const pmicState = npmDevice?.getConnectionState();

    return (
        <div className="pmic-control">
            <div className="pmic-control-inner">
                <BatteryCard
                    percent={stateOfCharge ?? 0}
                    pmicChargingState={pmicChargingState}
                    batteryConnected={batteryConnected}
                    fuelGauge={fuelGauge}
                    disabled={pmicState === 'disconnected'}
                />
                {chargers.map((charger, index) => (
                    <PowerCard
                        npmDevice={npmDevice}
                        charger={charger}
                        key={`Charging${1 + index}`}
                        index={index}
                        cardLabel="Charging"
                        disabled={pmicState === 'disconnected'}
                    />
                ))}
                {bucks.map((buck, index) => (
                    <BuckCard
                        buck={buck}
                        npmDevice={npmDevice}
                        key={`Buck${1 + index}`}
                        index={index}
                        disabled={pmicState === 'disconnected'}
                    />
                ))}
                {ldos.map((ldo, index) => (
                    <LDOCard
                        ldo={ldo}
                        npmDevice={npmDevice}
                        key={`Buck${1 + index}`}
                        index={index}
                        disabled={pmicState === 'disconnected'}
                    />
                ))}
            </div>
        </div>
    );
};
