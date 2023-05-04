/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { useSelector } from 'react-redux';

import { getNpmDevice } from '../../pmicControlSlice';
import { NpmModel } from '../types';
import { documentation as pmic1300Documentation } from './documentationPmic1300';

export const DocumentationTooltip = ({
    card,
    title,
    children,
    titleNode = title,
}: {
    card: string;
    title: string;
    children: React.ReactElement;
    titleNode?: React.ReactElement | string;
}) => {
    const npmDevice = useSelector(getNpmDevice);

    const fullDocumentation = getDocumentation(npmDevice?.getDeviceType());
    const documentation = fullDocumentation
        ? fullDocumentation[card][title]
        : null;

    return documentation ? (
        <OverlayTrigger
            key="overlay-voltage"
            placement="bottom-end"
            delay={500}
            overlay={
                <Tooltip id="tooltip-voltage">
                    <div className="info">
                        <h4>{titleNode}</h4>
                        <p> {documentation.description}</p>
                    </div>
                </Tooltip>
            }
        >
            {children}
        </OverlayTrigger>
    ) : (
        <span className="line-title">{titleNode}</span>
    );
};

export const getDocumentation = (model: NpmModel | undefined) => {
    switch (model) {
        case 'npm1300':
            return pmic1300Documentation;
    }

    return null;
};
