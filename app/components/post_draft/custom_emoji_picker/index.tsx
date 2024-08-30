// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {DeviceEventEmitter} from 'react-native';
import Animated, {Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

import {Events} from '@app/constants';
import {useTheme} from '@app/context/theme';
import {changeOpacity, makeStyleSheetFromTheme} from '@app/utils/theme';

import EmojiPicker from './emoji_picker';

type Props = {
    onEmojiPress: (emoji: string) => void;
    focus?: () => void;
    deleteCharFromCurrentCursorPosition: () => void;
    setIsEmojiPickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const getStyleSheets = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            marginTop: 9,
            borderTopWidth: 1,
            borderTopColor: changeOpacity(theme.centerChannelColor, 0.16),
        },
    };
});

const EMOJI_PICKER_HEIGHT = 300;

const CustomEmojiPicker: React.FC<Props> = ({
    onEmojiPress,
    focus,
    deleteCharFromCurrentCursorPosition,
    setIsEmojiPickerOpen,
}) => {
    const theme = useTheme();
    const height = useSharedValue(EMOJI_PICKER_HEIGHT);
    const [isEmojiSearchFocused, setIsEmojiSearchFocused] = React.useState(false);

    const styles = getStyleSheets(theme);

    useEffect(() => {
        const closeEmojiPicker = DeviceEventEmitter.addListener(Events.CLOSE_EMOJI_PICKER, () => {
            if (!isEmojiSearchFocused) {
                height.value = withTiming(0, {
                    duration: 300,
                    easing: Easing.inOut(Easing.ease),
                    // eslint-disable-next-line max-nested-callbacks
                }, (finished) => {
                    if (finished) {
                        runOnJS(setIsEmojiPickerOpen)(false);
                    }
                });
            }
        });

        return () => {
            closeEmojiPicker.remove();
        };
    }, []);

    useEffect(() => {
        if (isEmojiSearchFocused) {
            height.value = withTiming(100, {duration: 0});
        } else {
            height.value = withTiming(EMOJI_PICKER_HEIGHT, {duration: 0});
        }
    }, [isEmojiSearchFocused]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: height.value, // Bind the derived height value
        };
    });

    const handleEmojiPress = (emoji: string) => {
        onEmojiPress(emoji);
    };
    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <EmojiPicker
                onEmojiPress={handleEmojiPress}
                testID='custom_emoji_picker'
                focus={focus}
                deleteCharFromCurrentCursorPosition={deleteCharFromCurrentCursorPosition}
                setIsEmojiSearchFocused={setIsEmojiSearchFocused}
                isEmojiSearchFocused={isEmojiSearchFocused}
            />
        </Animated.View>);
};

export default CustomEmojiPicker;
