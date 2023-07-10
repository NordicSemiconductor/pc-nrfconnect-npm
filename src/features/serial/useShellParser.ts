/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Terminal } from 'xterm-headless';

import {
    hookModemToShellParser,
    xTerminalShellParserWrapper,
} from '../../hooks/commandParser';
import { noop } from '../pmicControl/npm/pmicHelpers';
import useNpmDevice from '../pmicControl/npm/useNpmDevice';
import {
    getSerialPort,
    getShellParser,
    setIsPaused,
    setSerialPort,
    setShellParser,
} from './serialSlice';

export default () => {
    const serialPort = useSelector(getSerialPort);
    const shellParserO = useSelector(getShellParser);
    const dispatch = useDispatch();

    useNpmDevice();

    useEffect(() => {
        const init = async () => {
            if (serialPort) {
                const shellParser = await hookModemToShellParser(
                    serialPort,
                    xTerminalShellParserWrapper(
                        new Terminal({ allowProposedApi: true, cols: 999 })
                    ),
                    {
                        shellPromptUart: 'shell:~$ ',
                        logRegex:
                            /[[][0-9]{2,}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): .*(\r\n|\r|\n)$/,
                        errorRegex: /Error: /,
                        timeout: 5000,
                        columnWidth: 80,
                    }
                );

                const releaseOnUnknownCommand = shellParser.onUnknownCommand(
                    data => {
                        console.warn(`Unknown Command:\r\n${data}`);
                    }
                );

                const onClosedRelease = serialPort.onClosed(() => {
                    dispatch(setSerialPort(undefined));
                });

                dispatch(setShellParser(shellParser));
                return () => {
                    releaseOnUnknownCommand();
                    onClosedRelease();
                    shellParser.unregister();
                };
            }

            dispatch(setShellParser(undefined));
        };
        init().catch(console.error);
    }, [dispatch, serialPort]);

    useEffect(
        () =>
            shellParserO?.onPausedChange(state => {
                dispatch(setIsPaused(state));
            }) ?? noop,
        [dispatch, shellParserO]
    );
};
