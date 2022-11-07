/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Alert } from 'pc-nrfconnect-shared';

import './systemFeatures.scss';

export default () => (
    <div className="systemFeatures-container">
        <div className="graph">
            <Alert variant="info" label="nPM Studio 0.1​ - Preview release! ">
                This is an unsupported, experimental preview and it is subject
                to major redesigns in the future.
            </Alert>

            <div className="systemFeatures-cards">
                <p>TODO Placholder</p>
            </div>
        </div>
    </div>
);
