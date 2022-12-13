/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from 'pc-nrfconnect-shared';

import {
    getEnableBuck1,
    getEnableBuck2,
    getEnableCharging,
    getEnableLdo1,
    getEnableLdo2,
    getEnableLoadSw1,
    getEnableLoadSw2,
    getEnableV1Set,
    getEnableV2Set,
    getICHG,
    getVLdo1,
    getVLdo2,
    getVOut1,
    getVOut2,
    getVTerm,
    npmEnableBuck1Changed,
    npmEnableBuck2Changed,
    npmEnableChargingChanged,
    npmEnableLdo1Change,
    npmEnableLdo2Change,
    npmEnableLoadSw1Changed,
    npmEnableLoadSw2Changed,
    npmEnableV1SetChanged,
    npmEnableV2SetChanged,
    npmICHGChanged,
    npmVLdo1Change,
    npmVLdo2Change,
    npmVOut1Changed,
    npmVOut2Changed,
    npmVTermChanged,
} from '../../features/pmicControl/pmicControlSlice';
import Battery from '../Battery/Battery';
import BuckCard from '../cards/Buck/BuckCard';
import LDOCard from '../cards/LDO/LDOCard';
import PowerCard from '../cards/Power/PowerCard';

export default () => {
    const dispatch = useDispatch();

    const vOut1 = useSelector(getVOut1);
    const [internalVout1, setInternalVOut1] = useState(vOut1);

    const vOut2 = useSelector(getVOut2);
    const [internalVout2, setInternalVOut2] = useState(vOut2);

    return (
        <div className="pmic-control">
            <div className="pmic-control-inner">
                <Card title="Fuel Guage">
                    <Battery percent={80} state={undefined} />
                </Card>
                <PowerCard
                    cardLabel="Charging"
                    vTermSelector={getVTerm}
                    iCHGSelector={getICHG}
                    enableChargingSelector={getEnableCharging}
                    onVTermChange={value => dispatch(npmVTermChanged(value))}
                    onEnableChargingToggle={value =>
                        dispatch(npmEnableChargingChanged(value))
                    }
                    onICHGChange={value => dispatch(npmICHGChanged(value))}
                />
                <BuckCard
                    cardLabel="BUCK 1"
                    vOut={internalVout1}
                    buckSelector={getEnableBuck1}
                    vSetSelector={getEnableV1Set}
                    onVSetToggle={value =>
                        dispatch(npmEnableV1SetChanged(value))
                    }
                    onVOutChange={value => setInternalVOut1(value)}
                    onVOutChangeComplete={() =>
                        dispatch(npmVOut1Changed(internalVout1))
                    }
                    onBuckToggle={value =>
                        dispatch(npmEnableBuck1Changed(value))
                    }
                />
                <BuckCard
                    cardLabel="BUCK 2"
                    vOut={internalVout2}
                    buckSelector={getEnableBuck2}
                    vSetSelector={getEnableV2Set}
                    onVSetToggle={value =>
                        dispatch(npmEnableV2SetChanged(value))
                    }
                    onVOutChange={value => setInternalVOut2(value)}
                    onVOutChangeComplete={() =>
                        dispatch(npmVOut2Changed(internalVout2))
                    }
                    onBuckToggle={value =>
                        dispatch(npmEnableBuck2Changed(value))
                    }
                />
                <LDOCard
                    cardLabel="LDO/Load Switch 1"
                    ldoSelector={getEnableLdo1}
                    vLdoSelector={getVLdo1}
                    onLdoToggle={value => dispatch(npmEnableLdo1Change(value))}
                    onVLdoChange={value => dispatch(npmVLdo1Change(value))}
                    ldoSwitchSelector={getEnableLoadSw1}
                    onLdoSwitchToggle={value =>
                        dispatch(npmEnableLoadSw1Changed(value))
                    }
                />
                <LDOCard
                    cardLabel="LDO/Load Switch 2"
                    ldoSelector={getEnableLdo2}
                    vLdoSelector={getVLdo2}
                    onLdoToggle={value => dispatch(npmEnableLdo2Change(value))}
                    onVLdoChange={value => dispatch(npmVLdo2Change(value))}
                    ldoSwitchSelector={getEnableLoadSw2}
                    onLdoSwitchToggle={value =>
                        dispatch(npmEnableLoadSw2Changed(value))
                    }
                />
            </div>
        </div>
    );
};
