/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SidePanel } from 'pc-nrfconnect-shared';
import { Terminal } from 'xterm-headless';

import {
    getModem,
    getShellParser,
    setShellParser,
} from '../features/modem/modemSlice';
import useNpmDevice from '../features/pmicControl/npm/useNpmDevice';
import { setIsPaused } from '../features/shell/shellSlice';
import {
    hookModemToShellParser,
    xTerminalShellParserWrapper,
} from '../hooks/commandParser';
import SerialSettings from './SerialSettings';

const TerminalSidePanel = () => {
    const modem = useSelector(getModem);
    const shellParserO = useSelector(getShellParser);

    const dispatch = useDispatch();
    useNpmDevice(shellParserO);

    // init shell parser
    useEffect(() => {
        const init = async () => {
            dispatch(setShellParser(undefined));

            if (modem) {
                const shellParser = await hookModemToShellParser(
                    modem,
                    xTerminalShellParserWrapper(
                        new Terminal({ allowProposedApi: true, cols: 999 })
                    ),
                    {
                        shellPromptUart: 'shell:~$ ',
                        logRegex:
                            '^[[][0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): ',
                        errorRegex: 'Error ',
                    }
                );

                const releaseOnUnknownCommand = shellParser.onUnknownCommand(
                    data => {
                        console.warn(`Unknown Command:\r\n${data}`);
                    }
                );

                dispatch(setShellParser(shellParser));
                return () => {
                    releaseOnUnknownCommand();
                    shellParser.unregister();
                };
            }
        };
        init().catch(console.error);
    }, [dispatch, modem]);

    useEffect(() => {
        shellParserO?.onPausedChange(state => {
            console.log('onPausedChange', state);
            dispatch(setIsPaused(state));
        });
    }, [dispatch, shellParserO]);

    return (
        <SidePanel className="side-panel">
            <SerialSettings />
        </SidePanel>
    );
};

export default TerminalSidePanel;
