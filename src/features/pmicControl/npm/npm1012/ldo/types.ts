/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const onOffControlValues = ['GPIO', 'Software', 'VSET'] as const;
export type OnOffControl = (typeof onOffControlValues)[number];
