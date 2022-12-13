/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useEffect, useRef, useState } from 'react';
import {
    mdiArrowDownBold,
    mdiArrowUpBold,
    mdiAutorenew,
    mdiClose,
} from '@mdi/js';
import Icon from '@mdi/react';

import './battery.scss';
import styles from './Battery.module.scss';

interface batteryProps {
    percent: number;
    state?: 'missing' | 'charging' | 'discharging' | 'updating' | 'unavailable';
}

const Battery: FC<batteryProps> = ({ percent, state }) => {
    const [iconSize, setIconSize] = useState(0);
    const iconWrapper = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const newIconSize = (iconWrapper.current?.clientHeight ?? 20) * 0.9;
        if (newIconSize !== iconSize) setIconSize(newIconSize);
    }, [iconSize]);

    const animated = state === 'charging' || state === 'discharging';

    const showPercent = state === undefined || animated ? percent : 0;

    return (
        <div className="battery-wrapper">
            <div className="battery-graphic-wrapper">
                <div className="battery-nipple" />
                <div className="battery">
                    <div
                        className={`gauge ${animated ? 'animated' : ''} ${
                            state === 'charging' ? 'charging' : ''
                        } ${state === 'discharging' ? 'discharging' : ''}`}
                        style={{
                            height: `calc(${showPercent}% + 8px)`,
                        }}
                    />
                </div>
                <div
                    className={`state-missing ${
                        state === 'missing' ? '' : 'hidden'
                    }`}
                />
                <div
                    ref={iconWrapper}
                    className={`icon-wrapper ${
                        state !== 'missing' && state !== undefined
                            ? ''
                            : 'hidden'
                    }`}
                >
                    {state === 'charging' && (
                        <Icon
                            className="bounce"
                            path={mdiArrowUpBold}
                            size={`${iconSize}px`}
                            color={styles.gray700}
                        />
                    )}
                    {state === 'discharging' && (
                        <Icon
                            className="bounce"
                            path={mdiArrowDownBold}
                            size={`${iconSize}px`}
                            color={styles.gray700}
                        />
                    )}
                    {state === 'updating' && (
                        <Icon
                            path={mdiAutorenew}
                            size={`${iconSize}px`}
                            color={styles.gray700}
                            spin={2}
                        />
                    )}
                    {state === 'unavailable' && (
                        <Icon
                            path={mdiClose}
                            size={`${iconSize}px`}
                            color={styles.gray700}
                        />
                    )}
                </div>
            </div>
            <div>
                {state === 'charging' && (
                    <div className="battery-side-panel">
                        <div>Charging</div>
                        <h2>{`${percent}%`}</h2>
                    </div>
                )}
                {state === 'discharging' && (
                    <div className="battery-side-panel">
                        <div>Discharging</div>
                        <h2>{`${percent}%`}</h2>
                    </div>
                )}
                {state === 'updating' && (
                    <div className="battery-side-panel">
                        <h2>Updating Battery Status</h2>
                    </div>
                )}
                {state === 'missing' && (
                    <div className="battery-side-panel">
                        <h2>No Battery Connected</h2>
                    </div>
                )}
                {state === 'unavailable' && (
                    <div className="battery-side-panel">
                        <h2>Fuel Guage Unavailable </h2>
                    </div>
                )}
                {!state && (
                    <div className="battery-side-panel">
                        <div>Charge</div>
                        <h2>{`${percent}%`}</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Battery;
