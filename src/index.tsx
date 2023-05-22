/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App } from 'pc-nrfconnect-shared';

import appReducer from './appReducer';
import Charger from './components/Charger/Charger';
import DashboardControl from './components/Dashboard/DashboardControl';
import DeviceSelector from './components/DeviceSelector';
import Graph from './components/Graph/Graph';
import ProfilingProjects from './components/Profiling/ProfilingProjects/ProfilingProjects';
import Regulators from './components/Regulators/Regulators';
import SidePanel from './components/SidePanel/SidePanel';
import SystemFeatures from './components/SystemFeatures/SystemFeatures';

import './index.scss';

export default () => (
    <App
        reportUsageData
        appReducer={appReducer}
        deviceSelect={<DeviceSelector />}
        sidePanel={<SidePanel />}
        panes={[
            {
                name: 'Dashboard',
                Main: DashboardControl,
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
                name: 'Profiles',
                Main: ProfilingProjects,
            },
            {
                name: 'Graph',
                Main: Graph,
            },
        ]}
    />
);
