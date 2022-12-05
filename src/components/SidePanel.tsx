/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SidePanel } from 'pc-nrfconnect-shared';
import { Terminal } from 'xterm-headless';

import { addData } from '../features/graph/graphSlice';
import {
    getModem,
    getShellParser,
    setShellParser,
} from '../features/modem/modemSlice';
import { setIsPaused } from '../features/shell/shellSlice';
import useShellEffects from '../features/shell/useShellEffects';
import {
    hookModemToShellParser,
    xTerminalShellParserWrapper,
} from '../hooks/commandParser';
import SerialSettings from './SerialSettings';

const TerminalSidePanel = () => {
    const modem = useSelector(getModem);
    const shellParserO = useSelector(getShellParser);

    const dispatch = useDispatch();
    useShellEffects();

    // init shell parser
    useEffect(() => {
        dispatch(setShellParser(undefined));

        if (modem) {
            console.log('Open Shell Parser');
            const shellParser = hookModemToShellParser(
                modem,
                xTerminalShellParserWrapper(
                    new Terminal({ allowProposedApi: true })
                ),
                {
                    shellPromptUart: 'shell:~$ ',
                    logRegex:
                        '^[[][0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <inf>',
                    errorRegex: '^error: ',
                }
            );

            const relaseShellLoggingEvent = shellParser.onShellLoggingEvent(
                data => {
                    const splitData = data.split(' <inf> main:');

                    const variables = splitData[1].trim().split(',');
                    const time = splitData[0]
                        .trim()
                        .replace('[', '')
                        .replace(']', '')
                        .split(',')[0]
                        .replace('.', ':')
                        .split(':');

                    const v = Number(variables[0].split('=')[1]);
                    const i = Number(variables[1].split('=')[1]);

                    const timestamp =
                        Number(time[3]) +
                        Number(time[2]) * 1000 +
                        Number(time[1]) * 1000 * 60 +
                        Number(time[0]) * 1000 * 60 * 60;

                    dispatch(
                        addData({
                            iBat: {
                                timestamp,
                                value: i,
                            },
                            tBat: {
                                timestamp,
                                value: 50,
                            },
                            vBat: {
                                timestamp,
                                value: v,
                            },
                        })
                    );
                }
            );

            const relaseOnUnknowCommand = shellParser.onUnknowCommand(data => {
                console.warn(`Unkown Command:\r\n${data}`);
            });

            dispatch(setShellParser(shellParser));
            return () => {
                relaseShellLoggingEvent();
                relaseOnUnknowCommand();
                shellParser.unregister();
            };
        }
        return () => {};
    }, [dispatch, modem]);

    useEffect(() => {
        shellParserO?.onPausedChange(state => {
            dispatch(setIsPaused(state));
        });
    }, [dispatch, shellParserO]);

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
        shellParserO?.enqueueRequest('test_stream start 5');

        let ledState = false;

        const timer = setInterval(() => {
            if (!modem?.isOpen() || shellParserO?.isPaused()) return;

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
