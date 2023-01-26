/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
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
import BatteryCard from '../Cards/Battery/BatteryCard';
import BuckCard from '../Cards/Buck/BuckCard';
import LDOCard from '../Cards/LDO/LDOCard';
import PowerCard from '../Cards/Power/PowerCard';

interface PMICControlCardProps {
    disabled: boolean;
}

const PMICControlCard: FC<PMICControlCardProps> = ({ disabled }) => {
    const npmDevice = useSelector(getNpmDevice);
    const chargers = useSelector(getChargers);
    const bucks = useSelector(getBucks);
    const ldos = useSelector(getLdos);
    const batteryConnected = useSelector(isBatteryConnected);

    const stateOfCharge = useSelector(getStateOfCharge);
    const pmicChargingState = useSelector(getPmicChargingState);
    const fuelGauge = useSelector(getFuelGauge);

    return (
        <div className="pmic-control">
            <div className="pmic-control-inner">
                <BatteryCard
                    soc={stateOfCharge}
                    pmicChargingState={pmicChargingState}
                    batteryConnected={batteryConnected}
                    fuelGauge={fuelGauge}
                    disabled={disabled}
                />
                {bucks.map((buck, index) => (
                    <BuckCard
                        buck={buck}
                        npmDevice={npmDevice}
                        key={`Buck${1 + index}`}
                        index={index}
                        disabled={disabled}
                    />
                ))}
                {chargers.map((charger, index) => (
                    <PowerCard
                        npmDevice={npmDevice}
                        charger={charger}
                        key={`Charger${1 + index}`}
                        index={index}
                        cardLabel="Charger"
                        disabled={disabled}
                    />
                ))}
                {ldos.map((ldo, index) => (
                    <LDOCard
                        ldo={ldo}
                        npmDevice={npmDevice}
                        key={`Buck${1 + index}`}
                        index={index}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    );
};

export default PMICControlCard;
