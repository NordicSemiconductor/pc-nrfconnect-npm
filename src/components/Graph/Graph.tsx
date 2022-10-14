
import React from 'react';
import { Alert } from 'pc-nrfconnect-shared';

import './graph.scss';

export default () => (
    <div className="graph-container">
        <div className="graph">
            <Alert variant="info" label="Experimental release!">
                This is an unsupported, experimental preview and it is subject
                to major redesigns in the future.
            </Alert>

            <div className="graph-cards">
                <p>TODO Placholder</p>
            </div>
        </div>
    </div>
);
