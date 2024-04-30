// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo} from 'react';
import {useIntl} from 'react-intl';
import {StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {makeHost, muteSession, stopScreenshare} from '@calls/actions/calls';
import SlideUpPanelItem from '@components/slide_up_panel_item';
import {Screens} from '@constants';
import BottomSheet from '@screens/bottom_sheet';
import {dismissBottomSheet} from '@screens/navigation';
import UserProfileTitle from '@screens/user_profile/title';
import {bottomSheetSnapPoint} from '@utils/helpers';

import type {CallSession, CurrentCall} from '@calls/types/calls';

const TITLE_HEIGHT = 118;
const ITEM_HEIGHT = 48;

type Props = {
    currentCall: CurrentCall;
    closeButtonId: string;
    session: CallSession;
    teammateNameDisplay: string;
    hideGuestTags: boolean;
}

const styles = StyleSheet.create({
    iconStyle: {
        marginRight: 6,
    },
});

export const HostControls = ({
    currentCall,
    closeButtonId,
    session,
    teammateNameDisplay,
    hideGuestTags,
}: Props) => {
    const intl = useIntl();
    const {bottom} = useSafeAreaInsets();

    const sharingScreen = currentCall.screenOn === session.sessionId;

    const makeHostPress = useCallback(async () => {
        await makeHost(currentCall.serverUrl, currentCall.channelId, session.userId);
        await dismissBottomSheet();
    }, [currentCall.serverUrl, currentCall.channelId, session.userId]);

    const mutePress = useCallback(async () => {
        await muteSession(currentCall.serverUrl, currentCall.channelId, session.sessionId);
        await dismissBottomSheet();
    }, [currentCall.serverUrl, currentCall.channelId, session.sessionId]);

    const stopScreensharePress = useCallback(async () => {
        await stopScreenshare(currentCall.serverUrl, currentCall.channelId, session.sessionId);
        await dismissBottomSheet();
    }, [currentCall.serverUrl, currentCall.id, session.sessionId]);

    const snapPoints = useMemo(() => {
        const items = 1 + (session.muted ? 0 : 1) + (sharingScreen ? 1 : 0);
        return [
            1,
            bottomSheetSnapPoint(items, ITEM_HEIGHT, bottom) + TITLE_HEIGHT,
        ];
    }, [bottom, session.muted, sharingScreen]);

    const makeHostText = intl.formatMessage({id: 'mobile.calls_make_host', defaultMessage: 'Make host'});
    const muteText = intl.formatMessage({id: 'mobile.calls_mute_participant', defaultMessage: 'Mute participant'});
    const stopScreenshareText = intl.formatMessage({id: 'mobile.calls_stop_screenshare', defaultMessage: 'Stop screen share'});

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
