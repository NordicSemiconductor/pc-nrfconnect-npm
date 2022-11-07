/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'pc-nrfconnect-shared';

import {
    getModem,
    getShellParser,
    setShellParser,
} from '../../features/modem/modemSlice';
import { hookModemToParser } from '../../hooks/commandParser';
import PMICControlCard from './PMICControlCard';

import './pmicControl.scss';

export default () => {
    const modem = useSelector(getModem);
    const shellParserO = useSelector(getShellParser);

    const dispatch = useDispatch();

    useEffect(() => {
        if (modem) {
            const shellParser = hookModemToParser(modem);
            dispatch(setShellParser(shellParser));
            return shellParser.unregister;
        }

        dispatch(setShellParser(undefined));
        return () => {};
    }, [dispatch, modem]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (!modem?.isOpen()) return;

            shellParserO?.enqueueRequest(
                'version',
                response => {
                    console.log(`version 1: ${response}`);
                },
                error => {
                    console.error(`version 1: ${error}`);
                }
            );
        }, 1000);
        return () => clearInterval(timer);
    }, [shellParserO, modem]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (!modem?.isOpen()) return;

            shellParserO?.enqueueRequest(
                'date get',
                response => {
                    console.log(`date get response: ${response}`);
                },
                error => {
                    console.error(`date get error: ${error}`);
                }
            );
        }, 1000);
        return () => clearInterval(timer);
    }, [shellParserO, modem]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (!modem?.isOpen()) return;

            shellParserO?.enqueueRequest(
                'version',
                response => {
                    console.log(`version 2: ${response}`);
                },
                error => {
                    console.error(`version 2: ${error}`);
                }
            );
        }, 1000);
        return () => clearInterval(timer);
    }, [shellParserO, modem]);

    return (
        <div className="pmicControl-container">
            <div className="pmicControl">
                <Alert
                    variant="info"
                    label="nPM Studio 0.1​ - Preview release! "
                >
                    This is an unsupported, experimental preview and it is
                    subject to major redesigns in the future.
                </Alert>

                <div className="pmicControl-cards">
                    <PMICControlCard />
                </div>
            </div>
        </div>
    );
};
