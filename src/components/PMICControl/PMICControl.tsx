/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Alert, PaneProps } from 'pc-nrfconnect-shared';

import PMICControlCard from './PMICControlCard';

import './pmicControl.scss';

const PMICControl = ({ active }: PaneProps) => (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
        {active && (
            <div className="pmicControl-container">
                <div className="pmicControl">
                    <Alert
                        variant="info"
                        label="nPM powerUP 0.1​ - Preview release! "
                    >
                        This is an unsupported, experimental preview and it is
                        subject to major redesigns in the future.
                    </Alert>

                    <div className="pmicControl-cards">
                        <PMICControlCard />
                    </div>
                </div>
            </div>
        )}
    </>
);

export default PMICControl;
