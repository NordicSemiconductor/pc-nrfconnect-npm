/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { Card, NumberInlineInput, Slider, Toggle } from 'pc-nrfconnect-shared';

import { useDispatch, useSelector } from 'react-redux';
import {
    getICHG,
    getVOut1,
    getVOut2,
    getVTerm,
    npmEnableBuck1Changed,
    npmEnableBuck2Changed,
    npmEnableChargingChanged,
    npmEnableLoadSw1Changed,
    npmEnableLoadSw2Changed,
    npmICHGChanged,
    npmVOut1Changed,
    npmVOut2Changed,
    npmVTermChanged,
    npmEnableV1SetChanged,
    npmEnableV2SetChanged,
    getEnableBuck1,
    getEnableV1Set,
    getEnableBuck2,
    getEnableV2Set,
    getEnableLoadSw1,
    getEnableLoadSw2,
    getEnableCharging,
} from '../../reducers/settingsReducer';
import vTermValues from '../../utils/vTermValues';
import { RootState } from '../../reducers/types';

const PowerCard = () => {
    const initVTerm = useSelector(getVTerm);
    const initICHG = useSelector(getICHG);
    const initEnableCharging = useSelector(getEnableCharging);
    const dispatch = useDispatch();

    return (
        <Card title="Charger">
            <div className="slider-container">
                <FormLabel className="flex-row">
                    <div>
                        <span>V</span>
                        <span className="subscript">TERM</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            value={initVTerm}
                            range={{
                                min: 3.5,
                                max: 4.45,
                                decimals: 2,
                                step: 0.05,
                                explicitRange: vTermValues,
                            }}
                            disabled={false}
                            onChange={value => dispatch(npmVTermChanged(value))}
                        />
                        <span>{'V'}</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[vTermValues.indexOf(initVTerm)]}
                    disabled={false}
                    onChange={[
                        index => dispatch(npmVTermChanged(vTermValues[index])),
                    ]}
                    range={{
                        min: 0,
                        max: vTermValues.length - 1,
                    }}
                />
            </div>
            <div className="slider-container">
                <FormLabel className="flex-row">
                    <div>
                        <span>I</span>
                        <span className="subscript">CHG</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            value={initICHG}
                            range={{
                                min: 32,
                                max: 800,
                                decimals: 0,
                                step: 2,
                            }}
                            disabled={false}
                            onChange={value => dispatch(npmICHGChanged(value))}
                        />
                        <span>{'mA'}</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[initICHG]}
                    disabled={false}
                    onChange={[value => dispatch(npmICHGChanged(value))]}
                    range={{
                        min: 32,
                        max: 800,
                        decimals: 0,
                        step: 2,
                    }}
                />
            </div>
            <Toggle
                label="Enable Charging"
                isToggled={initEnableCharging}
                onToggle={value => dispatch(npmEnableChargingChanged(value))}
            ></Toggle>
        </Card>
    );
};

interface buckProps {
    cardLabel: string;
    vOutSelector: (state: RootState) => number;
    buckSelector: (state: RootState) => boolean;
    vSetSelector: (state: RootState) => boolean;
    onVOutChange: (value: number) => void;
    onVSetToggle: (value: boolean) => void;
    onBuckToggle: (value: boolean) => void;
}

const BuckCard: FC<buckProps> = ({
    cardLabel,
    vOutSelector,
    buckSelector,
    vSetSelector,
    onVOutChange,
    onVSetToggle,
    onBuckToggle,
}) => {
    const initVOut = useSelector(vOutSelector);
    const initBuck = useSelector(buckSelector);
    const initVSet = useSelector(vSetSelector);

    return (
        <Card title={cardLabel}>
            <div className="slider-container">
                <FormLabel className="flex-row">
                    <div>
                        <span>V</span>
                        <span className="subscript">OUT</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            value={initVOut}
                            range={{
                                min: 1,
                                max: 3,
                                decimals: 1,
                            }}
                            disabled={false}
                            onChange={value => onVOutChange(value)}
                        />
                        <span>{'V'}</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[initVOut]}
                    disabled={false}
                    ticks={false}
                    onChange={[value => onVOutChange(value)]}
                    range={{
                        min: 1.0,
                        max: 3.0,
                        decimals: 1,
                    }}
                />
            </div>
            <div className="flex-row">
                <div>
                    <span>V</span>
                    <span className="subscript">SET</span>
                </div>
                <Toggle
                    isToggled={initVSet}
                    onToggle={value => {
                        if (value) onBuckToggle(false);

                        onVSetToggle(value);
                    }}
                ></Toggle>
            </div>
            <Toggle
                label="BUCK"
                isToggled={initBuck}
                disabled={initVSet}
                onToggle={value => onBuckToggle(value)}
            ></Toggle>
        </Card>
    );
};

export default () => {
    const dispatch = useDispatch();
    const initLoadSW1 = useSelector(getEnableLoadSw1);
    const initLoadSW2 = useSelector(getEnableLoadSw2);

    return (
        <div className="pmic-control">
            <div className="pmic-control-inner">
                <PowerCard />
                <BuckCard
                    cardLabel="BUCK 1"
                    vOutSelector={getVOut1}
                    buckSelector={getEnableBuck1}
                    vSetSelector={getEnableV1Set}
                    onVSetToggle={value =>
                        dispatch(npmEnableV1SetChanged(value))
                    }
                    onBuckToggle={value =>
                        dispatch(npmEnableBuck1Changed(value))
                    }
                    onVOutChange={value => dispatch(npmVOut1Changed(value))}
                />
                <BuckCard
                    cardLabel="BUCK 2"
                    vOutSelector={getVOut2}
                    buckSelector={getEnableBuck2}
                    vSetSelector={getEnableV2Set}
                    onVSetToggle={value =>
                        dispatch(npmEnableV2SetChanged(value))
                    }
                    onBuckToggle={value =>
                        dispatch(npmEnableBuck2Changed(value))
                    }
                    onVOutChange={value => dispatch(npmVOut2Changed(value))}
                />
                <Card title="Load SW 1">
                    <Toggle
                        label="Enable"
                        isToggled={initLoadSW1}
                        onToggle={value =>
                            dispatch(npmEnableLoadSw1Changed(value))
                        }
                    ></Toggle>
                </Card>
                <Card title="Load SW 2">
                    <Toggle
                        label="Enable"
                        isToggled={initLoadSW2}
                        onToggle={value =>
                            dispatch(npmEnableLoadSw2Changed(value))
                        }
                    ></Toggle>
                </Card>
            </div>
        </div>
    );
};
