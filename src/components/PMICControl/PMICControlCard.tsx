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
    getEnableLdo1,
    getEnableLdo2,
    getEnableLoadSw1,
    getEnableLoadSw2,
    getEnableV1Set,
    getEnableV2Set,
    getICHG,
    getVLdo1,
    getVLdo2,
    getVOut1,
    getVOut2,
    getVTerm,
    npmEnableBuck1Changed,
    npmEnableBuck2Changed,
    npmEnableChargingChanged,
    npmEnableLdo1Change,
    npmEnableLdo2Change,
    npmEnableLoadSw1Changed,
    npmEnableLoadSw2Changed,
    npmEnableV1SetChanged,
    npmEnableV2SetChanged,
    npmICHGChanged,
    npmVLdo1Change,
    npmVLdo2Change,
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
                    ticks
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

interface ldoProps {
    cardLabel: string;
    vLdoSelector: (state: RootState) => number;
    ldoSelector: (state: RootState) => boolean;
    ldoSwitchSelector: (state: RootState) => boolean;
    onLdoToggle: (value: boolean) => void;
    onVLdoChange: (value: number) => void;
    onLdoSwitchToggle: (value: boolean) => void;
}

const LDO: FC<ldoProps> = ({
    cardLabel,
    vLdoSelector,
    ldoSelector,
    ldoSwitchSelector,
    onLdoToggle,
    onVLdoChange,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onLdoSwitchToggle,
}) => {
    const enableLdo = useSelector(ldoSelector);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const enableSwitchLdo = useSelector(ldoSwitchSelector);
    const vLdo = useSelector(vLdoSelector);
    const [internalVLdo, setInternaVLdo] = useState(vLdo);

    return (
        <Card title={cardLabel}>
            <StateSelector
                items={['Load Switch', 'LDO']}
                onSelect={() => {}}
                selectedItem="Load Switch"
            />
            <div className="slider-container">
                <FormLabel className="flex-row">
                    <div>
                        <span>V</span>
                        <span className="subscript">LDO</span>
                    </div>
                    <div className="flex-row">
                        <NumberInlineInput
                            value={internalVLdo}
                            range={{
                                min: 1,
                                max: 3.3,
                                decimals: 1,
                                step: 0.1,
                            }}
                            onChange={value => setInternaVLdo(value)}
                            onChangeComplete={() => onVLdoChange(internalVLdo)}
                        />
                        <span>V</span>
                    </div>
                </FormLabel>
                <Slider
                    values={[internalVLdo]}
                    onChange={[value => setInternaVLdo(value)]}
                    onChangeComplete={() => onVLdoChange(internalVLdo)}
                    range={{
                        min: 1.0,
                        max: 3.3,
                        decimals: 1,
                        step: 0.1,
                    }}
                />
            </div>
            <Toggle
                label="Enable"
                isToggled={enableLdo}
                onToggle={value => onLdoToggle(value)}
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
                <LDO
                    cardLabel="LDO/Load Switch 1"
                    ldoSelector={getEnableLdo1}
                    vLdoSelector={getVLdo1}
                    onLdoToggle={value => dispatch(npmEnableLdo1Change(value))}
                    onVLdoChange={value => dispatch(npmVLdo1Change(value))}
                    ldoSwitchSelector={getEnableLoadSw1}
                    onLdoSwitchToggle={value =>
                        dispatch(npmEnableLoadSw1Changed(value))
                    }
                />
                <LDO
                    cardLabel="LDO/Load Switch 2"
                    ldoSelector={getEnableLdo2}
                    vLdoSelector={getVLdo2}
                    onLdoToggle={value => dispatch(npmEnableLdo2Change(value))}
                    onVLdoChange={value => dispatch(npmVLdo2Change(value))}
                    ldoSwitchSelector={getEnableLoadSw2}
                    onLdoSwitchToggle={value =>
                        dispatch(npmEnableLoadSw2Changed(value))
                    }
                />
            </div>
        </div>
    );
};
