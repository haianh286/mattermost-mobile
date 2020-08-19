// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {intlShape} from 'react-intl';

import {goToScreen} from '@actions/navigation';
import {Theme} from '@mm-redux/types/preferences';
import ChannelInfoRow from '@screens/channel_info/channel_info_row';
import {t} from '@utils/i18n';
import {preventDoubleTap} from '@utils/tap';

interface PinnedProps {
    channelId: string;
    pinnedCount: number;
    isLandscape: boolean;
    theme: Theme;
    userId: string;
}

export default class Pinned extends PureComponent<PinnedProps> {
    static contextTypes = {
        intl: intlShape.isRequired,
    };

    goToPinnedPosts = preventDoubleTap(() => {
        const {channelId} = this.props;
        const {formatMessage} = this.context.intl;
        const id = t('channel_header.pinnedPosts');
        const defaultMessage = 'Pinned Posts';
        const screen = 'PinnedPosts';
        const title = formatMessage({id, defaultMessage});
        const passProps = {
            currentChannelId: channelId,
        };

        goToScreen(screen, title, passProps);
    });

    render() {
        const {pinnedCount, isLandscape, theme} = this.props;
        return (
            <ChannelInfoRow
                action={this.goToPinnedPosts}
                defaultMessage='Pinned Posts'
                detail={pinnedCount}
                image={require('@assets/images/channel_info/pin.png')}
                textId={t('channel_header.pinnedPosts')}
                theme={theme}
                isLandscape={isLandscape}
            />
        );
    }
}
