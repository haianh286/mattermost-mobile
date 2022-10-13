// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import {StyleProp, Text, TextStyle, useWindowDimensions, View, ViewStyle} from 'react-native';
import Animated, {AnimatedStyleProp} from 'react-native-reanimated';

import {useIsTablet} from '@app/hooks/device';
import CompassIcon from '@components/compass_icon';
import {useTheme} from '@context/theme';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {typography} from '@utils/typography';

type ToastProps = {
    animatedStyle: AnimatedStyleProp<ViewStyle>;
    children?: React.ReactNode;
    iconName?: string;
    message?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export const TOAST_HEIGHT = 56;
const TOAST_MARGIN = 40;
const WIDTH_TABLET = 484;
const WIDTH_MOBILE = 400;

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => ({
    center: {
        alignItems: 'center',
        width: '100%',
        opacity: 0,
    },
    container: {
        alignItems: 'center',
        backgroundColor: theme.onlineIndicator,
        borderRadius: 8,
        elevation: 6,
        flex: 1,
        flexDirection: 'row',
        height: TOAST_HEIGHT,
        paddingLeft: 20,
        paddingRight: 10,
        shadowColor: changeOpacity('#000', 0.12),
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 6,
    },
    flex: {flex: 1},
    text: {
        color: theme.buttonColor,
        marginLeft: 10,
        ...typography('Body', 100, 'SemiBold'),
    },
}));

const Toast = ({animatedStyle, children, style, iconName, message, textStyle}: ToastProps) => {
    const theme = useTheme();
    const styles = getStyleSheet(theme);
    const dim = useWindowDimensions();
    const isTablet = useIsTablet();
    const containerStyle = useMemo(() => {
        const toast_width = isTablet ? WIDTH_TABLET : WIDTH_MOBILE;
        const width = Math.min(dim.height, dim.width, toast_width) - TOAST_MARGIN;
        return [styles.container, {width}, style];
    }, [dim, styles.container, style]);

    return (
        <Animated.View style={[styles.center, animatedStyle]}>
            <Animated.View style={containerStyle}>
                {Boolean(iconName) &&
                <CompassIcon
                    color={theme.buttonColor}
                    name={iconName!}
                    size={18}
                    style={textStyle}
                />
                }
                {Boolean(message) &&
                <View style={styles.flex}>
                    <Text
                        style={[styles.text, textStyle]}
                        testID='toast.message'
                    >
                        {message}
                    </Text>
                </View>
                }
                {children}
            </Animated.View>
        </Animated.View>
    );
};

export default Toast;

