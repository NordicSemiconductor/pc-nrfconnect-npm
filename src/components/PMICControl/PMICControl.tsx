
import React from 'react';
import { Alert } from 'pc-nrfconnect-shared';

import './pmicControl.scss';
import PMICControlCard from './PMICControlCard';

export default () => (
    <div className="pmicControl-container">
        <div className="pmicControl">
            <Alert variant="info" label="nPM Studio 0.1​ - Preview release! ">
                This is an unsupported, experimental preview and it is subject
                to major redesigns in the future.
            </Alert>

            <div className="pmicControl-cards">
                 <PMICControlCard />
            </div>
        </div>
    </div>
);
