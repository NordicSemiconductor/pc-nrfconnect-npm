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
            const shellParser = hookModemToShellParser(
                modem,
                data => {
                    console.log(`Stream Log:\r\n${data}`);
                },
                data => {
                    console.warn(`Unkown Command:\r\n${data}`);
                },
                {
                    shellPromptUart: 'shell:~$ ',
                    logRegex: '^<inf> ',
                    errorRegex: '^error: ',
                }
            );
            dispatch(setShellParser(shellParser));
            return shellParser.unregister;
        }
        return () => {};
    }, [dispatch, modem]);

    // init data getters
    useEffect(() => {
        shellParserO?.registerCommandCallback(
            'test_version',
            response => console.log(`version 1:\r\n${response}`),
            error => console.error(`version error:\r\n${error}`)
        );
        shellParserO?.registerCommandCallback(
            'test_meas_read',
            response => console.log(`Measurment:\r\n${response}`),
            error => console.error(`Measurment error:\r\n${error}`)
        );
        shellParserO?.enqueueRequest('test_stream stop');

        let ledState = false;

        const timer = setInterval(() => {
            if (!modem?.isOpen()) return;

            shellParserO?.enqueueRequest(
                'test_version',
                response => console.log(`version one time:\r\n${response}`),
                error => console.error(`version error one time:\r\n${error}`)
            );
            shellParserO?.enqueueRequest('test_meas_read');
            shellParserO?.enqueueRequest(`test_led ${ledState ? 'on' : 'off'}`);
            ledState = !ledState;
        }, 2500);
        return () => clearInterval(timer);
    }, [shellParserO, modem]);

    return (
        <SidePanel className="side-panel">
            <SerialSettings />
        </SidePanel>
    );
};

export default TerminalSidePanel;
