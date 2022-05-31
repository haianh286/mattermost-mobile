// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useTheme} from '@context/theme';
import MobileSendPush from '@screens/settings/notification_push/push_send';
import MobilePushThread from '@screens/settings/notification_push/push_thread';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {typography} from '@utils/typography';

import MobilePushStatus from './push_status';

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flex: 1,
            backgroundColor: theme.centerChannelBg,
        },
        input: {
            color: theme.centerChannelColor,
            height: 40,
            ...typography('Body', 75),
        },
        separator: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.1),
            flex: 1,
            height: 1,
            marginLeft: 15,
        },
        scrollView: {
            flex: 1,
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.06),
        },
        scrollViewContent: {
            paddingVertical: 30,
        },
        disabled: {
            color: theme.centerChannelColor,
            fontSize: 15,
            paddingHorizontal: 15,
            paddingVertical: 10,
        },
    };
});

type NotificationMobileProps = {
    isCRTEnabled: boolean;
    sendPushNotifications: boolean;
};
const NotificationPush = ({isCRTEnabled, sendPushNotifications}: NotificationMobileProps) => {
    const theme = useTheme();
    const [pushStatus, setPushStatus] = useState<PushStatus>('online');
    const [pushPref, setPushPref] = useState<PushStatus>('online');
    const [pushThread, setPushThreadPref] = useState<PushStatus>('online');

    const styles = getStyleSheet(theme);

    const setMobilePushStatus = (status: PushStatus) => {
        setPushStatus(status);
    };

    const setMobilePushPref = (status: PushStatus) => {
        setPushPref(status);
    };

    const onMobilePushThreadChanged = (status: PushStatus) => {
        setPushThreadPref(status);
    };

    return (
        <SafeAreaView
            edges={['left', 'right']}
            testID='notification_push.screen'
            style={styles.container}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                alwaysBounceVertical={false}
            >
                <MobileSendPush
                    sendPushNotifications={sendPushNotifications}
                    pushStatus={pushPref}
                    setMobilePushPref={setMobilePushPref}
                />
                {isCRTEnabled && pushPref === 'mention' && (
                    <MobilePushThread
                        pushThread={pushThread}
                        onMobilePushThreadChanged={onMobilePushThreadChanged}
                    />
                )}
                {sendPushNotifications && pushPref !== 'none' && (
                    <MobilePushStatus
                        sendPushNotifications={sendPushNotifications}
                        pushStatus={pushStatus}
                        setMobilePushStatus={setMobilePushStatus}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default NotificationPush;
