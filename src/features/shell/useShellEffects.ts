/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import {
    getEnableBuck1,
    getEnableBuck2,
    getEnableCharging,
    getEnableLoadSw1,
    getEnableLoadSw2,
    getEnableV1Set,
    getEnableV2Set,
    getICHG,
    getVOut1,
    getVOut2,
    getVTerm,
} from '../pmicControl/pmicControlSlice';

export default () => {
    const vTerm = useSelector(getVTerm);
    const iCHG = useSelector(getICHG);
    const enableCharging = useSelector(getEnableCharging);

    const vOut1 = useSelector(getVOut1);
    const enableBuck1 = useSelector(getEnableBuck1);
    const enableV1Set = useSelector(getEnableV1Set);

    const vOut2 = useSelector(getVOut2);
    const enableBuck2 = useSelector(getEnableBuck2);
    const enableV2Set = useSelector(getEnableV2Set);

    const loadSW1 = useSelector(getEnableLoadSw1);
    const loadSW2 = useSelector(getEnableLoadSw2);

    // TODO move shell related user effects into some generic 'shell' component

    // << ----------------------- START SHELL EFFECTS --------------------- >>
    useEffect(() => {
        console.log(
            `vTerm SET: npmx charger termination_voltage normal set ${vTerm}`
        );
    }, [vTerm]);

    useEffect(() => {
        console.log(`iCHG SET: npmx charger charging_current get ${iCHG}`);
    }, [iCHG]);

    useEffect(() => {
        console.log(
            `Enable Charging SET: npmx charger module charger ${
                enableCharging ? 'enable' : 'disable'
            }`
        );
    }, [enableCharging]);

    useEffect(() => {
        if (vOut1 <= 1.2) {
            console.log(`Show dialog with warning message. OK, CANCEL`);

            console.log(
                `On OK -- Vout1 SET: npmx buck voltage normal set 0 ${vOut1}`
            );

            console.log(
                `On CANCEL -- Vout1 SET: npmx buck voltage normal get 0`
            );
        } else {
            console.log(`Vout1 SET: npmx buck voltage normal set 0 ${vOut1}`);
        }
    }, [vOut1]);

    useEffect(() => {
        console.log(`Vset1 SET: npmx buck vout select set 0 ${enableV1Set}`);
        console.log(`Vout1 GET: npmx buck voltage normal get 0`);
    }, [enableV1Set]);

    useEffect(() => {
        console.log(
            `EnableBuck1 SET: npmx buck ${enableBuck1 ? 'enable' : 'disable'} 0`
        );
    }, [enableBuck1]);

    useEffect(() => {
        console.log(`Vout2 SET: npmx buck voltage normal set 1 ${vOut2}`);
    }, [vOut2]);

    useEffect(() => {
        console.log(`Vset2 SET: npmx buck vout select set 1 ${enableV2Set}`);
        console.log(`Vout2 GET: npmx buck voltage normal get 1`);
    }, [enableV2Set]);

    useEffect(() => {
        console.log(
            `EnableBuck1 SET: npmx buck ${enableBuck2 ? 'enable' : 'disable'} 1`
        );
    }, [enableBuck2]);

    useEffect(() => {
        console.log(
            `EnableBuck2 SET: npmx ldsw ${loadSW1 ? 'enable' : 'disable'} 0`
        );
    }, [loadSW1]);

    useEffect(() => {
        console.log(
            `EnableBuck2 SET: npmx ldsw ${loadSW2 ? 'enable' : 'disable'} 1`
        );
    }, [loadSW2]);
};
