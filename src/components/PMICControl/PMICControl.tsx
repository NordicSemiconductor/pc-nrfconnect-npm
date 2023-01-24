/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Alert, PaneProps } from 'pc-nrfconnect-shared';

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

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {active && (
                <div className="pmicControl-container">
                    <div className="pmicControl">
                        <Alert
                            variant="info"
                            label="nPM powerUP 0.1​ - Preview release! "
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
                        {pmicState !== 'offline' && paused && (
                            <Alert variant="warning" label="Shell Paused: ">
                                There is a command written in the shell that has
                                not been submitted. Release shall to use APP
                            </Alert>
                        )}
                        {supportedVersion !== undefined && !supportedVersion && (
                            <Alert variant="warning" label="Wrong firmware: ">
                                This firmware version is not supported, expected
                                version is {npmDevice?.getSupportedVersion()}
                            </Alert>
                        )}

                        <div className="pmicControl-cards">
                            <PMICControlCard />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PMICControl;
