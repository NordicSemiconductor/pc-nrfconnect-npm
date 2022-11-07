/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

let dataBuffer: Buffer = Buffer.from([]);

export const resetBuffer = () => {
    dataBuffer = Buffer.from([]);
};

export const processAnsiData = (
    data: Buffer,
    escCallback: (esc: Buffer) => void,
    textCallback: (text: Buffer) => void
) => {
    const tmp = new Uint8Array(dataBuffer.byteLength + data.byteLength);
    tmp.set(new Uint8Array(dataBuffer), 0);
    tmp.set(new Uint8Array(data), dataBuffer.byteLength);

    let escIndex = 0;
    let escFlag = false;

    tmp.forEach((byte, index) => {
        switch (byte) {
            case 27: // ESC (27) start of ANSI
                if (escFlag) {
                    escCallback(Buffer.from(tmp.buffer.slice(escIndex, index)));
                } else if (escIndex < index) {
                    textCallback(
                        Buffer.from(tmp.buffer.slice(escIndex, index))
                    );
                }
                escIndex = index;
                escFlag = true;
                break;
            case 109: // m (109) end of ANSI
                if (escFlag) {
                    escCallback(
                        Buffer.from(tmp.buffer.slice(escIndex, index + 1))
                    );
                    escIndex = index + 1;
                }
                escFlag = false;
                break;
        }
    });

    if (escFlag) {
        dataBuffer = Buffer.from(
            tmp.buffer.slice(escIndex, tmp.buffer.byteLength)
        );
    } else if (escIndex <= tmp.buffer.byteLength) {
        textCallback(
            Buffer.from(tmp.buffer.slice(escIndex, tmp.buffer.byteLength))
        );
        dataBuffer = Buffer.from([]);
    }
};
