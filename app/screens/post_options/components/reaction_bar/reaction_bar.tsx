// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';
import {DeviceEventEmitter, useWindowDimensions, View} from 'react-native';

import CompassIcon from '@components/compass_icon';
import {Navigation, Screens} from '@constants';
import {LARGE_CONTAINER_SIZE, LARGE_ICON_SIZE, REACTION_PICKER_HEIGHT, SMALL_CONTAINER_SIZE, SMALL_ICON_BREAKPOINT, SMALL_ICON_SIZE} from '@constants/reaction_picker';
import {showModal} from '@screens/navigation';
import {makeStyleSheetFromTheme} from '@utils/theme';

import PickReaction from './pick_reaction';
import Reaction from './reaction';

type QuickReactionProps = {
    theme: Theme;
    recentEmojis: string[];
};

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            backgroundColor: theme.centerChannelBg,
            flexDirection: 'row',
            alignItems: 'center',
            height: REACTION_PICKER_HEIGHT,
            justifyContent: 'space-between',
            marginTop: -16,
        },
    };
});

const ReactionBar = ({recentEmojis = [], theme}: QuickReactionProps) => {
    const intl = useIntl();
    const {width} = useWindowDimensions();
    const isSmallDevice = width < SMALL_ICON_BREAKPOINT;
    const styles = getStyleSheet(theme);

    const handleEmojiPress = useCallback((emoji: string) => {
        // eslint-disable-next-line no-console
        console.log('>>>  selected this emoji', emoji);
    }, []);

    const openEmojiPicker = useCallback(async () => {
        DeviceEventEmitter.emit(Navigation.NAVIGATION_CLOSE_MODAL);

        requestAnimationFrame(() => {
            const closeButton = CompassIcon.getImageSourceSync('close', 24, theme.sidebarHeaderTextColor);
            const screen = Screens.EMOJI_PICKER;
            const title = intl.formatMessage({id: 'mobile.post_info.add_reaction', defaultMessage: 'Add Reaction'});
            const passProps = {closeButton, onEmojiPress: handleEmojiPress};

            showModal(screen, title, passProps);
        });
    }, [intl, theme]);

    let containerSize = LARGE_CONTAINER_SIZE;
    let iconSize = LARGE_ICON_SIZE;

    if (isSmallDevice) {
        containerSize = SMALL_CONTAINER_SIZE;
        iconSize = SMALL_ICON_SIZE;
    }

    return (
        <View
            style={styles.container}
        >
            {
                recentEmojis.map((emoji) => {
                    return (
                        <Reaction
                            key={emoji}
                            onPressReaction={handleEmojiPress}
                            emoji={emoji}
                            iconSize={iconSize}
                            containerSize={containerSize}
                        />
                    );
                })
            }
            <PickReaction
                openEmojiPicker={openEmojiPicker}
                theme={theme}
                width={containerSize}
                height={containerSize}
            />
        </View>
    );
};

export default ReactionBar;
