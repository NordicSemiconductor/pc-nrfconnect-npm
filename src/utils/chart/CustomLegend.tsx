/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import type { Chart } from 'chart.js';

import './customLegend.scss';

interface CustomLegendProps {
    chart: Chart | undefined;
}

const CustomLegend: FC<CustomLegendProps> = ({ chart }) => {
    const [lagendsState, setLagendsState] = useState<boolean[]>([]);

    useEffect(() => {
        chart?.data.datasets.forEach((dataset, index) => {
            const newState = [...lagendsState];
            if (newState[index] !== chart.isDatasetVisible(index)) {
                newState[index] = chart.isDatasetVisible(index);
                setLagendsState(newState);
            }
        });
    }, [chart, lagendsState]);

    const toggelState = useCallback(
        (index: number) => {
            if (!chart) return;

            const newState = [...lagendsState];
            newState[index] = !chart.isDatasetVisible(index);
            setLagendsState(newState);
            chart.setDatasetVisibility(index, newState[index]);
            chart.update();
        },
        [chart, lagendsState]
    );

    const items = useMemo(
        () => (
            <div className="custom-legend-wrapper">
                {chart &&
                    chart.data.datasets.map((dataset, index) => (
                        <div className="custom-legend" key={dataset.label}>
                            <span
                                className={`title ${
                                    lagendsState[index] ? 'active' : 'inactive'
                                }`}
                                tabIndex={index}
                                role="button"
                                onClick={() => {
                                    toggelState(index);
                                }}
                                onKeyDown={keyEvent => {
                                    if (keyEvent.key !== 'Space') return;

                                    toggelState(index);
                                }}
                                data-dataset-index={index}
                                style={{
                                    borderColor:
                                        dataset.borderColor?.toString(),
                                }}
                            >
                                {dataset.label ?? ''}
                            </span>
                            <span
                                className="line"
                                style={{
                                    backgroundColor:
                                        dataset.backgroundColor?.toString(),
                                    borderColor:
                                        dataset.borderColor?.toString(),
                                }}
                            />
                        </div>
                    ))}
            </div>
        ),
        [chart, lagendsState, toggelState]
    );

    return items;
};

export default CustomLegend;
