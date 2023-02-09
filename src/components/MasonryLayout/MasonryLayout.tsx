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

    const calcMaxHeight = (col: number, masonryLayout: HTMLDivElement) => {
        let child = masonryLayout.firstElementChild;
        const heights: number[] = Array(col).fill(0);
        let i = 0;
        while (child) {
            if (child instanceof HTMLElement) {
                heights[i % col] +=
                    child.offsetHeight + Number.parseInt(styles.margin, 10);
                child = child.nextElementSibling;
                i += 1;
            }
        }

        return Math.max(...heights);
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
                    setHeight(calcMaxHeight(noOfColumns, current));
                }
            } else {
                setHeight(calcMaxHeight(columns, current));
                console.log('noOfColumns', columns);
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
                        order: `${(i % columns) + 1}`,
                        pageBreakBefore: `${i < columns ? 'always' : 'auto'}`,
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
};
