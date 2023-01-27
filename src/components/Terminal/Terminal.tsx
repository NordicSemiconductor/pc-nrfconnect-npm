/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { XTerm } from 'xterm-for-react';

import useFitAddon from '../../hooks/useFitAddon';

import 'xterm/css/xterm.css';
import './terminal.scss';
import styles from './Terminal.module.scss';

interface Props {
    commandCallback: (command: string) => string | undefined;
    onSerialData: (listener: (data: Uint8Array) => Promise<void>) => () => void;
}

const Terminal: React.FC<Props> = ({ commandCallback, onSerialData }) => {
    const xtermRef = useRef<XTerm | null>(null);
    const { width, height, ref: resizeRef } = useResizeDetector();
    const fitAddon = useFitAddon(height, width);
    const echoOnShell = true;

    // In Shell mode we need to only write to the serial port
    // Shell mode will guarantee that data is echoed back and hence
    // all we need to do is write the data back to the terminal and let
    // the shell mode device do all the auto complete etc...
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

    useEffect(
        () =>
            onSerialData(
                data =>
                    new Promise<void>(resolve => {
                        xtermRef.current?.terminal.write(data);
                        resolve();
                    })
            ),
        [onSerialData]
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
