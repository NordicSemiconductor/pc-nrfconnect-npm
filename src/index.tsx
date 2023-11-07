/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App, render } from '@nordicsemiconductor/pc-nrfconnect-shared';
import usageData from '@nordicsemiconductor/pc-nrfconnect-shared/src/utils/usageData';

import appReducer from './appReducer';
import Charger from './components/Charger/Charger';
import DashboardControl from './components/Dashboard/DashboardControl';
import DeviceSelector from './components/DeviceSelector';
import GPIOs from './components/GPIOs/GPIOs';
import Graph from './components/Graph/Graph';
import ProfilingWizard from './components/Profiling/Dialog/ProfilingWizard';
import Profiles from './components/Profiling/ProfilingProjects/Profiles';
import Regulators from './components/Regulators/Regulators';
import SidePanel from './components/SidePanel/SidePanel';
import SystemFeatures from './components/SystemFeatures/SystemFeatures';
import ConfirmCloseDialog from './features/confirmBeforeClose/ConfirmCloseDialog';
import NpmGenericDialog from './features/pmicControl/npm/NpmGenericDialog';

import './index.scss';

usageData.enableTelemetry();

render(
    <App
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
        feedback={{ categories: ['nPM PowerUP', 'nPM1300'] }}
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
                name: 'GPIOs',
                Main: GPIOs,
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
        ]}
    />
);
