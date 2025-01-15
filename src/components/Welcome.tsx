/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import {
    Button,
    getAppDir,
    InfoDialog,
    openUrl,
    SidePanel,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

export const WelcomeSidePanel = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <SidePanel className="tw-flex tw-flex-col tw-gap-2">
            <p className="tw-mb-0 tw-uppercase tw-tracking-[2px]">
                Instructions
            </p>
            <p className="tw-mt-0">
                Select a device to start evaluating and implementing the PMIC of
                choice.
            </p>
            <Button
                variant="secondary"
                className="tw-w-full"
                onClick={() => setShowModal(true)}
            >
                Buy PMIC Evaluation Kit...
            </Button>
            <Button
                variant="secondary"
                className="tw-w-full"
                onClick={() =>
                    openUrl(
                        'https://www.nordicsemi.com/Products/Power-Management-ICs'
                    )
                }
            >
                Learn about our PMICs
            </Button>
            <BuyModal isVisible={showModal} setShowModal={setShowModal} />
        </SidePanel>
    );
};

const BuyModal = ({
    isVisible,
    setShowModal,
}: {
    isVisible: boolean;
    setShowModal: (show: boolean) => void;
}) => (
    <InfoDialog
        isVisible={isVisible}
        title="Buy PMIC Evaluation Kit"
        onHide={() => setShowModal(false)}
    >
        <p>Choose a development kit to see the global vendor availability.</p>
        <div className="tw-flex tw-flex-col tw-gap-2">
            <Button
                variant="link-button"
                className="tw-w-32"
                onClick={() =>
                    openUrl(
                        'https://www.nordicsemi.com/About-us/BuyOnline?search_token=NPM1300EK'
                    )
                }
            >
                nPM1300-EK
            </Button>
            <Button
                variant="link-button"
                className="tw-w-32"
                onClick={() =>
                    openUrl(
                        'https://www.nordicsemi.com/About-us/BuyOnline?search_token=NPM1300EK'
                    )
                }
            >
                nPM1300-EK
            </Button>
        </div>
    </InfoDialog>
);

export default () => (
    <div className="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center">
        <img
            style={{ maxWidth: '100%' }}
            src={`${getAppDir()}/resources/nPM_Logo.png`}
            alt="nPM Family Logo"
        />
    </div>
);
