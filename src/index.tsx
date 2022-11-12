/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App } from 'pc-nrfconnect-shared';

import appReducer from './appReducer';
import Charger from './components/Charger/Charger';
import DeviceSelector from './components/DeviceSelector';
import DocumentationSections from './components/DocumentationSection';
import Graph from './components/Graph/Graph';
import PMICControl from './components/PMICControl/PMICControl';
import Regulators from './components/Regulators/Regulators';
import SidePanel from './components/SidePanel';
import SystemFeatures from './components/SystemFeatures/SystemFeatures';
import Terminal from './components/Terminal/Main';

// import logLibVersions from './utils/logLibVersions';
import './index.scss';

// logLibVersions();

export default () => (
    <App
        reportUsageData
        appReducer={appReducer}
        deviceSelect={<DeviceSelector />}
        sidePanel={<SidePanel />}
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
            {
                name: 'Terminal',
                Main: Terminal,
            },
        ]}
        documentation={DocumentationSections}
    />
);
