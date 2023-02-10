/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React, { useEffect, useRef, useState } from 'react';

import styles from './masonryLayout.module.scss';

interface MasonryLayoutProperties {
    minWidth: number;
}

export const MasonryLayout: React.FC<MasonryLayoutProperties> = ({
    children,
    minWidth,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const [width, setWidth] = useState(-1);
    const [height, setHeight] = useState(-1);
    const [columns, setColumns] = useState(-1);
    const [orders, setOrders] = useState<number[]>([]);

    const calcMaxHeight = (col: number, masonryLayout: HTMLDivElement) => {
        let child = masonryLayout.firstElementChild;
        const heights: number[] = Array(col).fill(0);
        const newOrder = [];
        while (child) {
            if (child instanceof HTMLElement) {
                const smallest =
                    heights.findIndex(v => v === Math.min(...heights)) ?? 0;
                heights[smallest] += child.offsetHeight;
                child = child.nextElementSibling;
                newOrder.push(smallest + 1);
            }
        }

        setOrders(newOrder);

        return Math.max(...heights) + 1;
    };

    useEffect(() => {
        if (cardRef.current === null) return;

        const current = cardRef.current;

        const observer = new ResizeObserver(() => {
            if (current.clientWidth !== width) {
                setWidth(current.clientWidth);
                const noOfColumns = Math.floor(
                    current.clientWidth /
                        (minWidth + Number.parseInt(styles.margin, 10))
                );

                if (noOfColumns !== columns) {
                    setColumns(noOfColumns);
                }

                setHeight(calcMaxHeight(noOfColumns, current));
            } else {
                setHeight(calcMaxHeight(columns, current));
            }
        });
        observer.observe(cardRef.current);

        return () => {
            current && observer.unobserve(current);
        };
    }, [columns, minWidth, width]);

    return (
        <div
            ref={cardRef}
            className={styles.masonryLayout}
            style={{ maxHeight: height }}
        >
            {React.Children.map(children, (child, i) => (
                <div
                    style={{
                        minWidth,
                        order: `${orders[i]}`,
                        pageBreakBefore: `${i < columns ? 'always' : 'auto'}`,
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
};
