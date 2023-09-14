/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { Form, ProgressBar } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
    DialogButton,
    GenericDialog,
    selectedDevice,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import useShellParser from '../../serial/useShellParser';
import { getDialog } from '../pmicControlSlice';
import { noop } from './pmicHelpers';

export default () => {
    const currentPmicDialog = useSelector(getDialog);
    const device = useSelector(selectedDevice);
    useShellParser();

    useEffect(() => {
        if (!device && currentPmicDialog) {
            currentPmicDialog?.onCancel();
        }
    }, [currentPmicDialog, device]);

    return currentPmicDialog ? (
        <GenericDialog
            title={currentPmicDialog?.title ?? ''}
            headerIcon={currentPmicDialog?.type}
            isVisible
            className="app-dialog"
            showSpinner={currentPmicDialog?.progress !== undefined}
            closeOnEsc
            onHide={currentPmicDialog?.onCancel}
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        disabled={currentPmicDialog?.confirmDisabled}
                        onClick={currentPmicDialog?.onConfirm ?? noop}
                    >
                        {currentPmicDialog?.confirmLabel}
                    </DialogButton>
                    <DialogButton
                        disabled={currentPmicDialog?.cancelDisabled}
                        onClick={currentPmicDialog?.onCancel ?? noop}
                    >
                        {currentPmicDialog?.cancelLabel}
                    </DialogButton>
                    {currentPmicDialog?.optionalLabel && (
                        <DialogButton
                            disabled={currentPmicDialog?.optionalDisabled}
                            onClick={currentPmicDialog?.onOptional ?? noop}
                        >
                            {currentPmicDialog?.optionalLabel}
                        </DialogButton>
                    )}
                </>
            }
        >
            {currentPmicDialog?.message}
            {currentPmicDialog?.progress !== undefined && (
                <Form.Group>
                    <br />
                    <ProgressBar
                        now={currentPmicDialog?.progress}
                        style={{ height: '4px' }}
                    />
                </Form.Group>
            )}
        </GenericDialog>
    ) : null;
};
