// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {Text, View} from 'react-native';

import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';

export default class ChannelDisplayName extends PureComponent {
    static propTypes = {
        displayName: PropTypes.string,
        theme: PropTypes.object.isRequired,
        channelTeamName: PropTypes.string,
    };

    render() {
        const {displayName, theme, channelTeamName} = this.props;
        const styles = getStyleFromTheme(theme);

        return (
            <View style={styles.container}>
                <Text style={styles.channelName}>{displayName}</Text>
                {Boolean(channelTeamName) &&
                <Text style={styles.teamName}>{' | ' + channelTeamName}</Text>
                }
            </View>
        );
    }
}

const getStyleFromTheme = makeStyleSheetFromTheme((theme) => {
    return {
        channelName: {
            color: changeOpacity(theme.centerChannelColor, 0.8),
            fontSize: 14,
            fontWeight: '600',
        },
        teamName: {
            color: changeOpacity(theme.centerChannelColor, 0.5),
            fontSize: 12,
            fontWeight: '400',
            padding: 1,
        },
        container: {
            flexDirection: 'row',
            marginTop: 5,
            paddingHorizontal: 16,
            alignItems: 'baseline',
        },
    };
});
