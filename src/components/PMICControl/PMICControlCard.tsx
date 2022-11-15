/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { useDispatch, useSelector } from 'react-redux';
import {
    Card,
    NumberInlineInput,
    Slider,
    StateSelector,
    Toggle,
} from 'pc-nrfconnect-shared';

import { RootState } from '../../appReducer';
import {
    getEnableBuck1,
    getEnableBuck2,
    getEnableCharging,
    getEnableLoadSw1,
    getEnableLoadSw2,
    getEnableV1Set,
    getEnableV2Set,
    getICHG,
    getVOut1,
    getVOut2,
    getVTerm,
    npmEnableBuck1Changed,
    npmEnableBuck2Changed,
    npmEnableChargingChanged,
    npmEnableLoadSw1Changed,
    npmEnableLoadSw2Changed,
    npmEnableV1SetChanged,
    npmEnableV2SetChanged,
    npmICHGChanged,
    npmVOut1Changed,
    npmVOut2Changed,
    npmVTermChanged,
} from '../../features/pmicControl/pmicControlSlice';
import vTermValues from '../../utils/vTermValues';

const PowerCard = () => {
    const vTerm = useSelector(getVTerm);
    const [internalVTerm, setInternaVTerm] = useState(vTerm);
    const iCHG = useSelector(getICHG);
    const [internalICHG, setInternaICHG] = useState(iCHG);
    const enableCharging = useSelector(getEnableCharging);
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
                            value={internalVTerm}
                            range={{
                                min: 3.5,
                                max: 4.45,
                                decimals: 2,
                                step: 0.05,
                                explicitRange: vTermValues,
                            }}
                            disabled={false}
                            onChange={value => setInternaVTerm(value)}
                            onChangeComplete={() =>
                                dispatch(npmVTermChanged(internalVTerm))
                            }
                        />
                        <span>V</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[vTermValues.indexOf(internalVTerm)]}
                    disabled={false}
                    onChange={[index => setInternaVTerm(vTermValues[index])]}
                    onChangeComplete={() =>
                        dispatch(npmVTermChanged(internalVTerm))
                    }
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
                            value={internalICHG}
                            range={{
                                min: 32,
                                max: 800,
                                decimals: 0,
                                step: 2,
                            }}
                            disabled={false}
                            onChange={value => setInternaICHG(value)}
                            onChangeComplete={() => {
                                dispatch(npmEnableChargingChanged(false));
                                dispatch(npmICHGChanged(internalICHG));
                            }}
                        />
                        <span>mA</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[internalICHG]}
                    disabled={false}
                    onChange={[value => setInternaICHG(value)]}
                    onChangeComplete={() => {
                        dispatch(npmEnableChargingChanged(false));
                        dispatch(npmICHGChanged(internalICHG));
                    }}
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
                isToggled={enableCharging}
                onToggle={value => dispatch(npmEnableChargingChanged(value))}
            />
        </Card>
    );
};

interface buckProps {
    cardLabel: string;
    vOut: number;
    buckSelector: (state: RootState) => boolean;
    vSetSelector: (state: RootState) => boolean;
    onVOutChange: (value: number) => void;
    onVOutChangeComplete: () => void;
    onVSetToggle: (value: boolean) => void;
    onBuckToggle: (value: boolean) => void;
}

const BuckCard: FC<buckProps> = ({
    cardLabel,
    vOut,
    buckSelector,
    vSetSelector,
    onVOutChange,
    onVOutChangeComplete,
    onVSetToggle,
    onBuckToggle,
}) => {
    const initBuck = useSelector(buckSelector);
    const initVSet = useSelector(vSetSelector);

    const vSetItems = ['Software', 'Vset'];

    return (
        <Card title={cardLabel}>
            <StateSelector
                items={vSetItems}
                defaultIndex={0}
                onSelect={index => onVSetToggle(index === 1)}
                selectedItem={initVSet ? vSetItems[1] : vSetItems[0]}
            />
            <div className="slider-container">
                <FormLabel className="flex-row">
                    <div>
                        <span>V</span>
                        <span className="subscript">OUT</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            value={vOut}
                            range={{
                                min: 1,
                                max: 3.3,
                                decimals: 1,
                            }}
                            disabled={false}
                            onChange={value => onVOutChange(value)}
                            onChangeComplete={() => {
                                onVOutChangeComplete();
                                onVSetToggle(false);
                            }}
                        />
                        <span>V</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[vOut]}
                    disabled={false}
                    ticks={false}
                    onChange={[value => onVOutChange(value)]}
                    onChangeComplete={() => {
                        onVOutChangeComplete();
                        onVSetToggle(false);
                    }}
                    range={{
                        min: 1.0,
                        max: 3.3,
                        decimals: 1,
                    }}
                />
            </div>
            <Toggle
                label="Enable BUCK"
                isToggled={initBuck}
                onToggle={value => onBuckToggle(value)}
            />
        </Card>
    );
};

export default () => {
    const dispatch = useDispatch();

    const vOut1 = useSelector(getVOut1);
    const [internalVout1, setInternalVOut1] = useState(vOut1);

    const vOut2 = useSelector(getVOut2);
    const [internalVout2, setInternalVOut2] = useState(vOut2);

    const loadSW1 = useSelector(getEnableLoadSw1);
    const loadSW2 = useSelector(getEnableLoadSw2);

    return (
        <div className="pmic-control">
            <div className="pmic-control-inner">
                <PowerCard />
                <BuckCard
                    cardLabel="BUCK 1"
                    vOut={internalVout1}
                    buckSelector={getEnableBuck1}
                    vSetSelector={getEnableV1Set}
                    onVSetToggle={value =>
                        dispatch(npmEnableV1SetChanged(value))
                    }
                    onVOutChange={value => setInternalVOut1(value)}
                    onVOutChangeComplete={() =>
                        dispatch(npmVOut1Changed(internalVout1))
                    }
                    onBuckToggle={value =>
                        dispatch(npmEnableBuck1Changed(value))
                    }
                />
                <BuckCard
                    cardLabel="BUCK 2"
                    vOut={internalVout2}
                    buckSelector={getEnableBuck2}
                    vSetSelector={getEnableV2Set}
                    onVSetToggle={value =>
                        dispatch(npmEnableV2SetChanged(value))
                    }
                    onVOutChange={value => setInternalVOut2(value)}
                    onVOutChangeComplete={() =>
                        dispatch(npmVOut2Changed(internalVout2))
                    }
                    onBuckToggle={value =>
                        dispatch(npmEnableBuck2Changed(value))
                    }
                />
                <Card title="Load SW 1">
                    <Toggle
                        label="Enable"
                        isToggled={loadSW1}
                        onToggle={value =>
                            dispatch(npmEnableLoadSw1Changed(value))
                        }
                    />
                </Card>
                <Card title="Load SW 2">
                    <Toggle
                        label="Enable"
                        isToggled={loadSW2}
                        onToggle={value =>
                            dispatch(npmEnableLoadSw2Changed(value))
                        }
                    />
                </Card>
            </div>
        </div>
    );
};
