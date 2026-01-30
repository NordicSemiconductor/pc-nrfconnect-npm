/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const LdoOnOffControlValues1012 = ['GPIO', 'Software', 'VSET'] as const;
export type LdoOnOffControl1012 = (typeof LdoOnOffControlValues1012)[number];
