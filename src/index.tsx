/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App } from 'pc-nrfconnect-shared';

import appReducer from './reducers';

import PMICControl from './components/PMICControl/PMICControl';
import Charger from './components/Charger/Charger';
import Regulators from './components/Regulators/Regulators';
import SystemFeatures from './components/SystemFeatures/SystemFeatures';
import Graph from './components/Graph/Graph';

import DeviceSelector from './components/DeviceSelector';
import DocumentationSections from './components/DocumentationSection';
// import logLibVersions from './utils/logLibVersions';

import './index.scss';

// logLibVersions();

export default () => (
    <App
        reportUsageData
        appReducer={appReducer}
        deviceSelect={<DeviceSelector />}
        sidePanel={<div />}
        panes={[
            {
                name: 'PMIC Control',
                Main: PMICControl,
            },
            {
                name: 'Charger',
                Main: Charger,
            },
            {
                name: 'Regulators',
                Main: Regulators,
            },
            {
                name: 'System Features',
                Main: SystemFeatures,
            },
            {
                name: 'Graph',
                Main: Graph,
            },
        ]}
        documentation={DocumentationSections}
    />
);
