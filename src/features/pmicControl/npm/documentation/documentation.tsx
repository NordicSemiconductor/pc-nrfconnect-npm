/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Overlay } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { getNpmDevice } from '../../pmicControlSlice';
import BaseNpmDevice from '../basePmicDevice';
import { documentation as pmic1300Documentation } from '../npm1300/documentationPmic1300';
import Npm1300 from '../npm1300/pmic1300Device';
import { documentation as pmic1304Documentation } from '../npm1304/documentationPmic1304';
import Npm1304 from '../npm1304/pmic1304Device';
import { documentation as pmic2100Documentation } from '../npm2100/documentationPmic2100';
import Npm2100 from '../npm2100/pmic2100Device';

export const DocumentationTooltip = ({
    card,
    item,
    placement = 'bottom-start',
    keepShowingOnHoverTooltip = false,
    children,
}: {
    card: string;
    item: string;
    placement?: 'bottom-start' | 'right-start';
    keepShowingOnHoverTooltip?: boolean;
    children: React.ReactElement | string;
}) => {
    const npmDevice = useSelector(getNpmDevice);

    const fullDocumentation = getDocumentation(npmDevice);
    const documentation =
        fullDocumentation && fullDocumentation[card]
            ? fullDocumentation[card]?.[item]
            : null;

    return documentation ? (
        <Overlay
            tooltipId={`tooltip-${card}-${item}`}
            keepShowingOnHoverTooltip={keepShowingOnHoverTooltip}
            placement={placement}
            tooltipChildren={
                <div className="tw-preflight tw-flex tw-flex-col tw-gap-4 tw-bg-gray-900 tw-px-4 tw-py-2 tw-text-left tw-text-gray-100">
                    {documentation.map(it => (
                        <div
                            key={`tooltip-${card}-${item}-${it.title}`}
                            className="tw-flex tw-flex-col tw-gap-2"
                        >
                            <p className="tw-font-bold tw-text-white">
                                {it.title}
                            </p>
                            <div className="tw-flex tw-flex-col tw-gap-1">
                                {...it.content}
                            </div>
                        </div>
                    ))}
                </div>
            }
        >
            {children}
        </Overlay>
    ) : (
        <span>{children}</span>
    );
};

export const getDocumentation = (npmDevice: BaseNpmDevice | undefined) => {
    if (npmDevice instanceof Npm2100) {
        return pmic2100Documentation;
    }
    if (npmDevice instanceof Npm1304) {
        return pmic1304Documentation(npmDevice);
    }
    if (npmDevice instanceof Npm1300) {
        return pmic1300Documentation(npmDevice);
    }

    return null;
};
