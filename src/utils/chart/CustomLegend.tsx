/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, {
    type FC,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import type { Chart } from 'chart.js';

import './customLegend.scss';

interface CustomLegendProps {
    charts: (Chart | undefined)[];
}

const CustomLegend: FC<CustomLegendProps> = ({ charts }) => {
    const [legendsState, setLegendsState] = useState<boolean[]>([]);

    const updateLegendsState = useCallback(() => {
        setLegendsState(
            charts
                ?.map(
                    chart =>
                        chart?.data.datasets.map((_, index) =>
                            chart.isDatasetVisible(index),
                        ) ?? false,
                )
                .flat(),
        );
    }, [charts]);

    const toggleState = useCallback(
        (chart: Chart, index: number) => {
            if (chart.data.datasets.length === 1) return;
            chart.setDatasetVisibility(index, !chart.isDatasetVisible(index));
            chart.update();
            updateLegendsState();
        },
        [updateLegendsState],
    );

    useEffect(() => {
        updateLegendsState();
    }, [charts, updateLegendsState]);

    // todo allowExpressionValues: true, for role
    // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/93f78856655696a55309440593e0948c6fb96134/docs/rules/no-static-element-interactions.md
    const items = useMemo(
        () => (
            <div className="custom-legend-wrapper">
                {charts &&
                    charts
                        .map(chart =>
                            chart?.data.datasets.map((dataset, index) => (
                                <div
                                    className="custom-legend"
                                    key={dataset.label}
                                >
                                    <span
                                        className={`title ${
                                            legendsState[index]
                                                ? 'active'
                                                : 'inactive'
                                        }`}
                                        tabIndex={index}
                                        role="button"
                                        onClick={() => {
                                            toggleState(chart, index);
                                        }}
                                        onKeyDown={keyEvent => {
                                            if (keyEvent.key !== 'Space')
                                                return;

                                            toggleState(chart, index);
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
                            )),
                        )
                        .flat()}
            </div>
        ),
        [charts, legendsState, toggleState],
    );

    return items;
};

export default CustomLegend;
