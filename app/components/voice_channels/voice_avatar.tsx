// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {View} from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

import ProfilePicture from '@components/profile_picture';
import {makeStyleSheetFromTheme} from '@utils/theme';

type Props = {
    userId: string;
    volume: number;
    handRaised?: boolean;
    muted?: boolean;
    size?: 'm' | 'l';
}

const getStyleSheet = makeStyleSheetFromTheme((props: Props) => {
    const baseSize = props.size === 'm' || !props.size ? 40 : 72;

    return {
        pictureHalo: {
            backgroundColor: 'rgba(255,255,255,' + (0.16 * props.volume) + ')',
            height: baseSize + 16,
            width: baseSize + 16,
            padding: 4,
            marginRight: 4,
            borderRadius: (baseSize + 16) / 2,
        },
        pictureHalo2: {
            backgroundColor: 'rgba(255,255,255,' + (0.24 * props.volume) + ')',
            height: baseSize + 8,
            width: baseSize + 8,
            padding: 4,
            borderRadius: (baseSize + 8) / 2,
        },
        picture: {
            borderRadius: baseSize / 2,
            height: baseSize,
            width: baseSize,
        },
        mute: {
            position: 'absolute',
            bottom: -5,
            right: -5,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: props.muted ? 'black' : '#3DB887',
            borderColor: 'black',
            borderWidth: 2,
            color: 'white',
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        handRaised: {
            position: 'absolute',
            top: -5,
            right: -5,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#FFBC1F',
            color: 'white',
            borderColor: 'black',
            borderWidth: 2,
            textAlign: 'center',
            textAlignVertical: 'center',
        },
    };
});

const VoiceAvatar = (props: Props) => {
    const style = getStyleSheet(props);
    return (
        <View style={style.pictureHalo}>
            <View style={style.pictureHalo2}>
                <View style={style.picture}>
                    <ProfilePicture
                        userId={props.userId}
                        size={props.size === 'm' || !props.size ? 40 : 72}
                        showStatus={false}
                    />
                    {props.muted !== undefined &&
                        <FontAwesome5Icon
                            name={props.muted ? 'microphone-slash' : 'microphone'}
                            size={12}
                            style={style.mute}
                        />}
                    {props.handRaised === true &&
                        <FontAwesome5Icon
                            name={'hand-paper'}
                            size={14}
                            style={style.handRaised}
                        />}
                </View>
            </View>
        </View>
    );
};
export default VoiceAvatar;
