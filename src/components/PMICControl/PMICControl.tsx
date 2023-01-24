/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, PaneProps } from 'pc-nrfconnect-shared';

import { getShellParser } from '../../features/modem/modemSlice';
import {
    getNpmDevice,
    getPmicState,
    isSupportedVersion,
} from '../../features/pmicControl/pmicControlSlice';
import { isPaused } from '../../features/shell/shellSlice';
import PMICControlCard from './PMICControlCard';

import './pmicControl.scss';

const PMICControl = ({ active }: PaneProps) => {
    const paused = useSelector(isPaused);
    const supportedVersion = useSelector(isSupportedVersion);

    const npmDevice = useSelector(getNpmDevice);
    const pmicState = useSelector(getPmicState);
    const shellParser = useSelector(getShellParser);

    const [pauseFor1Second, setPauseFor1Second] = useState(paused);
    const disabled = pmicState === 'disconnected' || pauseFor1Second;

    useEffect(() => {
        if (!paused) {
            setPauseFor1Second(paused);
        } else {
            const t = setTimeout(() => {
                setPauseFor1Second(paused);
            }, 1000);

            return () => clearTimeout(t);
        }
    }, [paused]);

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {active && (
                <div className="pmicControl-container">
                    <div className="pmicControl">
                        <Alert
                            variant="info"
                            label="nPM PowerUP​ 0.1​ - Preview release! "
                        >
                            This is an unsupported, experimental preview and it
                            is subject to major redesigns in the future.
                        </Alert>
                        {pmicState === 'offline' && (
                            <Alert variant="warning" label="Offline Mode: ">
                                No Device is connected
                            </Alert>
                        )}
                        {pmicState === 'disconnected' && (
                            <Alert variant="warning" label="PMIC offline: ">
                                PMIC does not have a power source. Connect a
                                battery or USB to the EK
                            </Alert>
                        )}
                        {pmicState !== 'offline' && pauseFor1Second && (
                            <Alert variant="warning" label="Shell Paused: ">
                                There is a command written in the shell that has
                                not been submitted. Release shall to use
                                APP.&nbsp;
                                <Button
                                    title="Unpause"
                                    onClick={() => shellParser?.unPause()}
                                >
                                    Unpause
                                </Button>
                            </Alert>
                        )}
                        {supportedVersion !== undefined && !supportedVersion && (
                            <Alert variant="warning" label="Wrong firmware: ">
                                This firmware version is not supported, expected
                                version is {npmDevice?.getSupportedVersion()}
                            </Alert>
                        )}

                        <div className="pmicControl-cards">
                            <PMICControlCard disabled={disabled} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PMICControl;
