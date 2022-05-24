// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import RoundedHeaderContext from '@components/rounded_header_context';
import {HEADER_SEARCH_BOTTOM_MARGIN, HEADER_SEARCH_HEIGHT} from '@constants/view';

type Props = {
    defaultHeight: number;
    hasSearch: boolean;
    isLargeTitle: boolean;
    largeHeight: number;
    headerPosition?: Animated.SharedValue<number>;
}

const NavigationHeaderContext = ({
    defaultHeight,
    hasSearch,
    isLargeTitle,
    largeHeight,
    headerPosition,
}: Props) => {
    const marginTop = useAnimatedStyle(() => {
        const searchHeight = hasSearch ? HEADER_SEARCH_HEIGHT + HEADER_SEARCH_BOTTOM_MARGIN : 0;
        let margin: number;
        if (isLargeTitle) {
            margin = Math.max((-(headerPosition?.value || 0) + largeHeight + searchHeight), defaultHeight);
        } else {
            margin = defaultHeight;
        }

        return {
            position: 'absolute',
            width: '100%',
            height: '100%',
            marginTop: margin,
        };
    }, [defaultHeight, largeHeight, isLargeTitle, hasSearch]);

    return (
        <Animated.View style={marginTop}>
            <RoundedHeaderContext/>
        </Animated.View>
    );
};

export default NavigationHeaderContext;

