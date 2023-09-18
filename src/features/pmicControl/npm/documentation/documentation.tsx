/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { useSelector } from 'react-redux';

import { getNpmDevice } from '../../pmicControlSlice';
import { documentation as pmic1300Documentation } from '../npm1300/documentationPmic1300';
import { NpmModel } from '../types';

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
    const [keepShowing, setKeepShowing] = useState<boolean>();
    const npmDevice = useSelector(getNpmDevice);

    const fullDocumentation = getDocumentation(npmDevice?.getDeviceType());
    const documentation = fullDocumentation
        ? fullDocumentation[card][item]
        : null;

    return documentation ? (
        <div className="tooltip-overlay-trigger-wrapper">
            <OverlayTrigger
                key="overlay"
                placement={placement}
                show={keepShowing}
                delay={500}
                overlay={
                    <Tooltip
                        id={`tooltip-${card}-${item}`}
                        className="tooltip"
                        show={keepShowing}
                        onMouseEnter={() => {
                            if (keepShowingOnHoverTooltip) {
                                setKeepShowing(true);
                            }
                        }}
                        onMouseLeave={() => {
                            setKeepShowing(undefined);
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="documentation-tooltip info">
                            <p className="title font-weight-bold">
                                {documentation.title}
                            </p>
                            <div> {documentation.description}</div>
                        </div>
                    </Tooltip>
                }
            >
                <div>{children}</div>
            </OverlayTrigger>
        </div>
    ) : (
        <span className="line-title">{item}</span>
    );
};

export const getDocumentation = (model: NpmModel | undefined) => {
    switch (model) {
        case 'npm1300':
            return pmic1300Documentation;
    }

    return null;
};
