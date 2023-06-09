/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App, FeedbackPane } from 'pc-nrfconnect-shared';

import appReducer from './appReducer';
import Charger from './components/Charger/Charger';
import DashboardControl from './components/Dashboard/DashboardControl';
import DeviceSelector from './components/DeviceSelector';
import Graph from './components/Graph/Graph';
import ProfilingWizard from './components/Profiling/Dialog/ProfilingWizard';
import Profiles from './components/Profiling/ProfilingProjects/Profiles';
import Regulators from './components/Regulators/Regulators';
import SidePanel from './components/SidePanel/SidePanel';
import SystemFeatures from './components/SystemFeatures/SystemFeatures';
import ConfirmCloseDialog from './features/confirmBeforeClose/ConfirmCloseDialog';
import NpmGenericDialog from './features/pmicControl/npm/NpmGenericDialog';

import './index.scss';

export default () => (
    <App
        reportUsageData
        appReducer={appReducer}
        deviceSelect={<DeviceSelector />}
        sidePanel={
            <>
                <SidePanel />
                <ConfirmCloseDialog />
                <ProfilingWizard />
                <NpmGenericDialog />
            </>
        }
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
                Main: Profiles,
            },
            {
                name: 'Graph',
                Main: Graph,
            },
            {
                name: 'Feedback',
                Main: FeedbackPane,
            },
        ]}
    />
);
