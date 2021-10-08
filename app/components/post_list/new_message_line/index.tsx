// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

import FormattedText from '@components/formatted_text';
import {makeStyleSheetFromTheme} from '@utils/theme';

type NewMessagesLineProps = {
    moreMessages: boolean;
    style?: StyleProp<ViewStyle>;
    theme: Theme;
    testID?: string;
}

function NewMessagesLine({moreMessages, style, testID, theme}: NewMessagesLineProps) {
    const styles = getStyleFromTheme(theme);

    let text = (
        <FormattedText
            id='posts_view.newMsg'
            defaultMessage='New Messages'
            style={styles.text}
            testID={testID}
        />
    );

    if (moreMessages) {
        text = (
            <FormattedText
                id='mobile.posts_view.moreMsg'
                defaultMessage='More New Messages Above'
                style={styles.text}
                testID={testID}
            />
        );
    }

    return (
        <View style={[styles.container, style]}>
            <View style={styles.line}/>
            <View style={styles.textContainer}>
                {text}
            </View>
            <View style={styles.line}/>
        </View>
    );
}

const getStyleFromTheme = makeStyleSheetFromTheme((theme: Theme) => {
    return {
        container: {
            alignItems: 'center',
            flexDirection: 'row',
            height: 28,
        },
        textContainer: {
            marginHorizontal: 15,
        },
        line: {
            flex: 1,
            height: 1,
            backgroundColor: theme.newMessageSeparator,
        },
        text: {
            lineHeight: 16,
            fontSize: 12,
            color: theme.newMessageSeparator,
        },
    };
});

export default NewMessagesLine;
