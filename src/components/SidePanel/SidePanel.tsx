/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    CollapsibleGroup,
    ConfirmationDialog,
    SidePanel,
} from 'pc-nrfconnect-shared';
import { Terminal } from 'xterm-headless';

import { openFileDialog, saveFileDialog } from '../../actions/fileActions';
import useNpmDevice from '../../features/pmicControl/npm/useNpmDevice';
import {
    getNpmDevice,
    getWarningDialog,
} from '../../features/pmicControl/pmicControlSlice';
import {
    getSerialPort,
    getShellParser,
    setIsPaused,
    setShellParser,
} from '../../features/serial/serialSlice';
import {
    hookModemToShellParser,
    xTerminalShellParserWrapper,
} from '../../hooks/commandParser';
import SerialSettings from './SerialSettings';

export default () => {
    const noop = () => {};
    const currentPmicWarningDialog = useSelector(getWarningDialog);
    const showConfirmDialog = currentPmicWarningDialog !== undefined;
    const message = currentPmicWarningDialog?.message;
    const optionalLabel = currentPmicWarningDialog?.optionalLabel;
    const confirmLabel = currentPmicWarningDialog?.confirmLabel;
    const cancelLabel = currentPmicWarningDialog?.cancelLabel;
    const title = currentPmicWarningDialog?.title;
    const onConfirm = currentPmicWarningDialog?.onConfirm ?? noop;
    const onCancel = currentPmicWarningDialog?.onCancel ?? noop;
    const onOptional = currentPmicWarningDialog?.onOptional;

    const serialPort = useSelector(getSerialPort);
    const shellParserO = useSelector(getShellParser);
    const dispatch = useDispatch();
    useNpmDevice(shellParserO);

    const npmDevice = useSelector(getNpmDevice);

    // init shell parser
    useEffect(() => {
        const init = async () => {
            dispatch(setShellParser(undefined));

            if (serialPort) {
                const shellParser = await hookModemToShellParser(
                    serialPort,
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
    }, [dispatch, serialPort]);

    useEffect(() => {
        shellParserO?.onPausedChange(state => {
            dispatch(setIsPaused(state));
        });
    }, [dispatch, shellParserO]);

    return (
        <SidePanel className="side-panel">
            <CollapsibleGroup defaultCollapsed={false} heading="Settings">
                <Button
                    className="w-100 secondary-btn"
                    onClick={() => dispatch(saveFileDialog())}
                >
                    Save Configuration
                </Button>
                <Button
                    disabled={npmDevice?.getConnectionState() !== 'connected'}
                    className="w-100 secondary-btn"
                    onClick={() => dispatch(openFileDialog())}
                >
                    Load Configuration
                </Button>
                <Button
                    disabled={npmDevice?.getConnectionState() === 'offline'}
                    className="w-100 secondary-btn"
                    onClick={() => npmDevice?.kernelReset('cold')}
                >
                    Reset
                </Button>
            </CollapsibleGroup>
            <SerialSettings />
            <ConfirmationDialog
                title={title}
                isVisible={showConfirmDialog}
                onConfirm={onConfirm}
                confirmLabel={confirmLabel}
                onCancel={onCancel}
                cancelLabel={cancelLabel}
                onOptional={onOptional}
                optionalLabel={optionalLabel}
            >
                {message}
            </ConfirmationDialog>
        </SidePanel>
    );
};
