/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { resetDataset } from '../graph/graphSlice';
import { getModem } from '../modem/modemSlice';
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
} from '../pmicControl/pmicControlSlice';

export default () => {
    // const shellParser = useSelector(getShellParser);
    const dispatch = useDispatch();
    const modem = useSelector(getModem);

    const vTerm = useSelector(getVTerm);
    const iCHG = useSelector(getICHG);
    const enableCharging = useSelector(getEnableCharging);

    const vOut1 = useSelector(getVOut1);
    const enableBuck1 = useSelector(getEnableBuck1);
    const enableV1Set = useSelector(getEnableV1Set);

    const vOut2 = useSelector(getVOut2);
    const enableBuck2 = useSelector(getEnableBuck2);
    const enableV2Set = useSelector(getEnableV2Set);

    const vLdo1 = useSelector(getVLdo1);
    const enableLdo1 = useSelector(getEnableLdo1);
    const loadSW1 = useSelector(getEnableLoadSw1);

    const vLdo2 = useSelector(getVLdo2);
    const enableLdo2 = useSelector(getEnableLdo2);
    const loadSW2 = useSelector(getEnableLoadSw2);

    // Poll on open
    useEffect(
        () =>
            modem?.onOpen(() => {
                dispatch(resetDataset());
                console.log(
                    `vTerm GET: npmx charger termination_voltage normal get`
                );
                console.log(`iCHG GET: npmx charger charging_current get`);
                console.log(`Enable Charging GET: No NPMX Command avalable`);
                console.log(`Vout1 GET: npmx buck voltage normal get 0`);
                console.log(`Vset1 GET: npmx buck vout select get 0`);
                console.log(`EnableBuck1 GET:  No NPMX Command avalable`);
                console.log(`Vout2 GET: npmx buck voltage normal get 1`);
                console.log(`Vset2 GET: npmx buck vout select get 1`);
                console.log(`EnableBuck2 GET:  No NPMX Command avalable`);
                console.log(`vLdo1 GET: No NPMX Command avalable`);
                console.log(`Enable Ldo1 GET: No NPMX Command avalable`);
                console.log(`LoadSW1 GET: No NPMX Command avalable`);
                console.log(`vLdo2 GET: No NPMX Command avalable`);
                console.log(`Enable Ldo2 GET: No NPMX Command avalable`);
                console.log(`LoadSW2 GET: No NPMX Command avalable`);
            }),
        [dispatch, modem]
    );

    //  ----- Trigger Set Commands Start -------
    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(
            `vTerm SET: npmx charger termination_voltage normal set ${vTerm}`
        );
    }, [modem, vTerm]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(`iCHG SET: npmx charger charging_current set ${iCHG}`);
    }, [modem, iCHG]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(
            `Enable Charging SET: npmx charger module charger ${
                enableCharging ? 'enable' : 'disable'
            }`
        );
    }, [modem, enableCharging]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

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
    }, [modem, vOut1]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(
            `Vset1 SET: npmx buck vout select set 0 ${enableV1Set}????`
        );
        console.log(`Vout1 GET: npmx buck voltage normal get 0`);
    }, [modem, enableV1Set]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(
            `EnableBuck1 SET: npmx buck ${enableBuck1 ? 'enable' : 'disable'} 0`
        );
    }, [modem, enableBuck1]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(`Vout2 SET: npmx buck voltage normal set 1 ${vOut2}`);
    }, [modem, vOut2]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(
            `Vset2 SET: npmx buck vout select set 1 ${enableV2Set}?????`
        );
        console.log(`Vout2 GET: npmx buck voltage normal get 1`);
    }, [modem, enableV2Set]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(
            `EnableBuck2 SET: npmx buck ${enableBuck2 ? 'enable' : 'disable'} 1`
        );
    }, [modem, enableBuck2]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(`vLdo1 SET: No NPMX Command avalable`);
    }, [modem, vLdo1]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(`Enable Ldo1 SET: No NPMX Command avalable`);
    }, [modem, enableLdo1]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(
            `LoadSW1 SET: npmx ldsw ${loadSW1 ? 'enable' : 'disable'} 0`
        );
    }, [modem, loadSW1]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(`vLdo2 SET: No NPMX Command avalable`);
    }, [modem, vLdo2]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(`Enable Ldo2 SET: No NPMX Command avalable`);
    }, [modem, enableLdo2]);

    useEffect(() => {
        if (!modem?.isOpen()) return;

        console.log(
            `LoadSW2 SET: npmx ldsw ${loadSW2 ? 'enable' : 'disable'} 1`
        );
    }, [modem, loadSW2]);
};
