/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SidePanel } from 'pc-nrfconnect-shared';

import {
    getModem,
    getShellParser,
    setShellParser,
} from '../features/modem/modemSlice';
import { hookModemToShellParser } from '../hooks/commandParser';
import SerialSettings from './SerialSettings';

const TerminalSidePanel = () => {
    const modem = useSelector(getModem);
    const shellParserO = useSelector(getShellParser);

    const dispatch = useDispatch();

    // init shell parser
    useEffect(() => {
        dispatch(setShellParser(undefined));

        if (modem) {
            console.log('Open Shell Parser');
            const shellParser = hookModemToShellParser(modem);
            dispatch(setShellParser(shellParser));
            return shellParser.unregister;
        }
        return () => {};
    }, [dispatch, modem]);

    // init data getters
    useEffect(() => {
        const timer = setInterval(() => {
            if (!modem?.isOpen()) return;

            shellParserO?.enqueueRequest(
                'version',
                response => console.log(`version 1: ${response}`),
                error => console.error(`version 1: ${error}`)
            );
            shellParserO?.enqueueRequest(
                'date get',
                response => console.log(`date get response: ${response}`),
                error => console.error(`date get error: ${error}`)
            );
        }, 1000);
        return () => clearInterval(timer);
    }, [shellParserO, modem]);

    return (
        <SidePanel className="side-panel">
            <SerialSettings />
        </SidePanel>
    );
};

export default TerminalSidePanel;
