/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useEffect } from 'react';
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
                        <span>V</span>
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
                        <span>mA</span>
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
            />
        </Card>
    );
};

interface buckProps {
    cardLabel: string;
    vOutSelector: (state: RootState) => number;
    buckSelector: (state: RootState) => boolean;
    vSetSelector: (state: RootState) => boolean;
    onVOutChange: (value: number) => void;
    onVOutChangeComplete: () => void;
    onVSetToggle: (value: boolean) => void;
    onBuckToggle: (value: boolean) => void;
}

const BuckCard: FC<buckProps> = ({
    cardLabel,
    vOutSelector,
    buckSelector,
    vSetSelector,
    onVOutChange,
    onVOutChangeComplete,
    onVSetToggle,
    onBuckToggle,
}) => {
    const initVOut = useSelector(vOutSelector);
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
                            value={initVOut}
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
                    values={[initVOut]}
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
    const initLoadSW1 = useSelector(getEnableLoadSw1);
    const initLoadSW2 = useSelector(getEnableLoadSw2);

    const vOut1 = useSelector(getVOut1);
    const enableBuck1 = useSelector(getEnableBuck1);
    const enableV1Set = useSelector(getEnableV1Set);

    useEffect(() => {
        console.log(`Vset1: npmx buck vout select set 0 ${enableV1Set}`);
    }, [enableV1Set]);

    useEffect(() => {
        console.log(
            `EnableBuck1: npmx buck enable, disable 0 ${
                enableBuck1
                    ? 'NPMX_BUCK_TASK_ENABLE'
                    : ' NPMX_BUCK_TASK_DISABLE'
            }`
        );
    }, [enableBuck1]);

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
                    onVOutChangeComplete={() => {
                        console.log(
                            `Vout1: npmx buck voltage normal set 0 ${vOut1}`
                        );
                    }}
                    onBuckToggle={value =>
                        dispatch(npmEnableBuck1Changed(value))
                    }
                    onVOutChange={value => {
                        dispatch(npmVOut1Changed(value));
                    }}
                />
                <BuckCard
                    cardLabel="BUCK 2"
                    vOutSelector={getVOut2}
                    buckSelector={getEnableBuck2}
                    vSetSelector={getEnableV2Set}
                    onVSetToggle={value =>
                        dispatch(npmEnableV2SetChanged(value))
                    }
                    onVOutChangeComplete={() => {}}
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
                    />
                </Card>
                <Card title="Load SW 2">
                    <Toggle
                        label="Enable"
                        isToggled={initLoadSW2}
                        onToggle={value =>
                            dispatch(npmEnableLoadSw2Changed(value))
                        }
                    />
                </Card>
            </div>
        </div>
    );
};
