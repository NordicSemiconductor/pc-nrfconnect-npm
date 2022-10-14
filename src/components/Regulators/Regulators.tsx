
import React from 'react';
import { Alert } from 'pc-nrfconnect-shared';

import './regulators.scss';

export default () => (
    <div className="regulators-container">
        <div className="graph">
            <Alert variant="info" label="nPM Studio 0.1​ - Preview release! ">
                This is an unsupported, experimental preview and it is subject
                to major redesigns in the future.
            </Alert>

            <div className="regulators-cards">
                <p>TODO Placholder</p>
            </div>
        </div>
    </div>
);
