/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import ansiEscapes from 'ansi-escapes';
import { XTerm } from 'xterm-for-react';

import useFitAddon from '../../hooks/useFitAddon';

import 'xterm/css/xterm.css';
import './terminal.scss';
import styles from './Terminal.module.scss';

interface Props {
    commandCallback: (command: string) => string | undefined;
    onModemData: (listener: (data: Buffer) => void) => () => void;
    onModemOpen: (listener: () => void) => () => void;
}

const Terminal: React.FC<Props> = ({
    commandCallback,
    onModemData,
    onModemOpen,
}) => {
    const xtermRef = useRef<XTerm | null>(null);
    const { width, height, ref: resizeRef } = useResizeDetector();
    const fitAddon = useFitAddon(height, width);
    const echoOnShell = true;

    // In Shell mode we need to only write to the serial port
    // Shell mode will garantee that data is echoed back and hence
    // all we need to do is write the data back to the terminal and let
    // the shell mode devide do all the auto complete etc...
    const handleUserInputShellMode = useCallback(
        (data: string) => {
            if (!echoOnShell) {
                if (data === '\r') xtermRef.current?.terminal.write('\r\n');
                else xtermRef.current?.terminal.write(data);
            }

            const ret = commandCallback(data);
            if (ret) {
                xtermRef.current?.terminal.write(ret);
            }
        },
        [commandCallback, echoOnShell]
    );

    const clearTermial = () => {
        xtermRef.current?.terminal.write(
            ansiEscapes.eraseLine + ansiEscapes.cursorTo(0)
        );
        xtermRef.current?.terminal.clear();
    };

    // Prepare Terminal for new connection or mode
    useEffect(() => {
        commandCallback(String.fromCharCode(12)); // init shell mode
        // we need New Page (Ascii 12) so not to create an empty line on top of shell
    }, [commandCallback, onModemOpen]);

    useEffect(
        () => onModemData(data => xtermRef.current?.terminal.write(data)),
        [onModemData]
    );

    useEffect(
        () =>
            onModemOpen(() => {
                clearTermial(); // New connection or mode: clear terminal
                commandCallback(String.fromCharCode(12)); // init shell mode
                // we need New Page (Ascii 12) so not to create an empty line on top of shell
            }),
        [commandCallback, onModemOpen]
    );

    const terminalOptions = {
        convertEol: false,
        theme: {
            foreground: styles.terminalForeground,
            background: styles.terminalBackground,
        },
    };

    return (
        <div ref={resizeRef} style={{ height: '100%' }}>
            <div style={{ height: '100%' }}>
                <XTerm
                    onKey={v => {
                        handleUserInputShellMode(v.key);
                    }}
                    ref={xtermRef}
                    addons={[fitAddon]}
                    className="terminal-window"
                    options={terminalOptions}
                />
            </div>
        </div>
    );
};

export default Terminal;
