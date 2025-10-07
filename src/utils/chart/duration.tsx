/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const format = (milliseconds: number): string | null => {
    if (Number.isNaN(milliseconds)) return null;
    const t = new Date(Math.floor(milliseconds));
    const s = `${t.getUTCSeconds()}`;
    const m = `${t.getUTCMinutes()}`;
    const h = `${t.getUTCHours()}`;
    const d = Math.floor(milliseconds / 86400000);

    return `${d > 0 ? `${d} day${d > 1 ? 's ' : ' '} ` : ''}${h.padStart(
        2,
        '0',
    )}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`;
};

export const formatDuration = (milliseconds: number) => format(milliseconds);
