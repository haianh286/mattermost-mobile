// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo} from 'react';
import {useIntl} from 'react-intl';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {hostLowerHand, hostMake, hostMuteSession, hostStopScreenshare} from '@calls/actions/calls';
import {removeFromCall} from '@calls/alerts';
import {useHostMenus} from '@calls/hooks';
import SettingSeparator from '@components/settings/separator';
import SlideUpPanelItem from '@components/slide_up_panel_item';
import {Screens} from '@constants';
import {useTheme} from '@context/theme';
import BottomSheet from '@screens/bottom_sheet';
import {dismissBottomSheet} from '@screens/navigation';
import UserProfileTitle from '@screens/user_profile/title';
import {bottomSheetSnapPoint} from '@utils/helpers';
import {makeStyleSheetFromTheme} from '@utils/theme';
import {displayUsername} from '@utils/user';

import type {CallSession, CurrentCall} from '@calls/types/calls';

const TITLE_HEIGHT = 118;
const ITEM_HEIGHT = 48;
const SEPARATOR_HEIGHT = 17;

type Props = {
    currentCall: CurrentCall;
    closeButtonId: string;
    session: CallSession;
    teammateNameDisplay: string;
    hideGuestTags: boolean;
}

const getStyleFromTheme = makeStyleSheetFromTheme((theme: Theme) => ({
    iconStyle: {
        marginRight: 6,
    },
    red: {
        color: theme.dndIndicator,
    },
    separator: {
        width: '100%',
        marginVertical: 8,
    },
}));

export const HostControls = ({
    currentCall,
    closeButtonId,
    session,
    teammateNameDisplay,
    hideGuestTags,
}: Props) => {
    const intl = useIntl();
    const {bottom} = useSafeAreaInsets();
    const theme = useTheme();
    const {openUserProfile} = useHostMenus();
    const styles = getStyleFromTheme(theme);

    const sharingScreen = currentCall.screenOn === session.sessionId;
    const displayName = displayUsername(session.userModel, intl.locale, teammateNameDisplay, true);

    const makeHostPress = useCallback(async () => {
        hostMake(currentCall.serverUrl, currentCall.channelId, session.userId);
        await dismissBottomSheet();
    }, [currentCall.serverUrl, currentCall.channelId, session.userId]);

    const mutePress = useCallback(async () => {
        hostMuteSession(currentCall.serverUrl, currentCall.channelId, session.sessionId);
        await dismissBottomSheet();
    }, [currentCall.serverUrl, currentCall.channelId, session.sessionId]);

    const lowerHandPress = useCallback(async () => {
        hostLowerHand(currentCall.serverUrl, currentCall.channelId, session.sessionId);
        await dismissBottomSheet();
    }, [currentCall.serverUrl, currentCall.channelId, session.sessionId]);

    const stopScreensharePress = useCallback(async () => {
        hostStopScreenshare(currentCall.serverUrl, currentCall.channelId, session.sessionId);
        await dismissBottomSheet();
    }, [currentCall.serverUrl, currentCall.channelId, session.sessionId]);

    const profilePress = useCallback(async () => {
        dismissBottomSheet();
        openUserProfile(session);
    }, [session]);

    const removePress = useCallback(async () => {
        removeFromCall(currentCall.serverUrl, displayName, currentCall.channelId, session.sessionId, intl);
        await dismissBottomSheet();
    }, [displayName, currentCall.serverUrl, currentCall.channelId, session.sessionId]);

    const snapPoints = useMemo(() => {
        const items = 3 + (session.muted ? 0 : 1) + (sharingScreen ? 1 : 0) + (session.raisedHand ? 1 : 0);
        return [
            1,
            bottomSheetSnapPoint(items, ITEM_HEIGHT, bottom) + TITLE_HEIGHT + SEPARATOR_HEIGHT,
        ];
    }, [bottom, session.muted, sharingScreen, session.raisedHand]);

    const makeHostText = intl.formatMessage({id: 'mobile.calls_make_host', defaultMessage: 'Make host'});
    const muteText = intl.formatMessage({id: 'mobile.calls_mute_participant', defaultMessage: 'Mute participant'});
    const lowerHandText = intl.formatMessage({id: 'mobile.calls_lower_hand', defaultMessage: 'Lower hand'});
    const stopScreenshareText = intl.formatMessage({
        id: 'mobile.calls_stop_screenshare',
        defaultMessage: 'Stop screen share',
    });
    const profileText = intl.formatMessage({id: 'mobile.calls_view_profile', defaultMessage: 'View profile'});
    const removeText = intl.formatMessage({id: 'mobile.calls_remove_participant', defaultMessage: 'Remove from call'});

    const renderContent = () => {
        if (!session?.userModel) {
            return null;
        }

        return (
            <>
                <UserProfileTitle
                    enablePostIconOverride={false}
                    enablePostUsernameOverride={false}
                    isChannelAdmin={false}
                    isSystemAdmin={false}
                    isTeamAdmin={false}
                    teammateDisplayName={teammateNameDisplay}
                    user={session.userModel}
                    hideGuestTags={hideGuestTags}
                />
                {!session.muted &&
                    <SlideUpPanelItem
                        leftIcon={'microphone-off'}
                        leftIconStyles={styles.iconStyle}
                        onPress={mutePress}
                        text={muteText}
                    />
                }
                {Boolean(session.raisedHand) &&
                    <SlideUpPanelItem
                        leftIcon={'hand-right-outline-off'}
                        leftIconStyles={styles.iconStyle}
                        onPress={lowerHandPress}
                        text={lowerHandText}
                    />
                }
                {sharingScreen &&
                    <SlideUpPanelItem
                        leftIcon={'monitor-off'}
                        leftIconStyles={styles.iconStyle}
                        onPress={stopScreensharePress}
                        text={stopScreenshareText}
                    />
                }
                <SlideUpPanelItem
                    leftIcon={'monitor-account'}
                    leftIconStyles={styles.iconStyle}
                    onPress={makeHostPress}
                    text={makeHostText}
                />
                <SlideUpPanelItem
                    leftIcon={'account-outline'}
                    leftIconStyles={styles.iconStyle}
                    onPress={profilePress}
                    text={profileText}
                />
                <SettingSeparator lineStyles={styles.separator}/>
                <SlideUpPanelItem
                    leftIcon={'minus-circle-outline'}
                    leftIconStyles={[styles.iconStyle, styles.red]}
                    onPress={removePress}
                    text={removeText}
                    textStyles={styles.red}
                />
            </>
        );
    };

    return (
        <BottomSheet
            renderContent={renderContent}
            closeButtonId={closeButtonId}
            componentId={Screens.CALL_HOST_CONTROLS}
            initialSnapIndex={1}
            snapPoints={snapPoints}
        />
    );
};
