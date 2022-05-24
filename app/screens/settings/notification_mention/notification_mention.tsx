// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useReducer, useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import FormattedText from '@components/formatted_text';
import Section from '@components/section';
import SectionItem from '@components/section_item';
import {useTheme} from '@context/theme';
import {t} from '@i18n';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';

import type UserModel from '@typings/database/models/servers/user';

const UPDATE_MENTION_PREF = 'UPDATE_MENTION_PREF';
const INITIAL_STATE = {
    firstName: false,
    usernameMention: false,
    channel: false,
};
type Action = {
    type: string;
    data: Partial<typeof INITIAL_STATE>;
}
const reducer = (state: typeof INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case UPDATE_MENTION_PREF:
            return {
                ...state,
                ...action.data,
            };

        default:
            return state;
    }
};

const mentionHeaderText = {
    id: t('notification_settings.mentions.wordsTrigger'),
    defaultMessage: 'WORDS THAT TRIGGER MENTIONS',
};
const replyHeaderText = {
    id: t('notification_settings.mention.reply'),
    defaultMessage: 'SEND REPLY NOTIFICATIONS FOR',
};

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flex: 1,
            backgroundColor: theme.centerChannelBg,
        },
        input: {
            color: theme.centerChannelColor,
            fontSize: 12,
            height: 40,
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
            paddingVertical: 35,
        },
        area: {
            paddingHorizontal: 16,
        },
    };
});

type NotificationMentionProps = {
    isCRTEnabled?: boolean;
    currentUser?: UserModel;
    mentionKeys: string;
}
const NotificationMention = ({currentUser, mentionKeys, isCRTEnabled}: NotificationMentionProps) => {
    const [{firstName, usernameMention, channel}, dispatch] = useReducer(reducer, INITIAL_STATE);
    const [replyNotificationType, setReplyNotificationType] = useState('any'); //todo: initialize with value from db/api
    const theme = useTheme();
    const styles = getStyleSheet(theme);

    const renderMentionSection = () => {
        let mentionKeysComponent;
        if (mentionKeys) {
            mentionKeysComponent = (<Text>{mentionKeys}</Text>);
        } else {
            mentionKeysComponent = (
                <FormattedText
                    id='notification_settings.mentions.keywordsDescription'
                    defaultMessage='Other words that trigger a mention'
                />
            );
        }

        return (
            <Section
                headerText={mentionHeaderText}
                containerStyles={styles.area}
            >
                <>
                    { Boolean(currentUser?.firstName) && (
                        <>
                            <SectionItem
                                label={(
                                    <Text>
                                        {currentUser!.firstName}
                                    </Text>
                                )}
                                description={(
                                    <FormattedText
                                        id='notification_settings.mentions.sensitiveName'
                                        defaultMessage='Your case sensitive first name'
                                    />
                                )}
                                action={toggleFirstNameMention}
                                actionType='toggle'
                                selected={firstName}
                            />
                            <View style={styles.separator}/>
                        </>
                    )
                    }
                    {Boolean(currentUser?.username) && (
                        <SectionItem
                            label={(
                                <Text>
                                    {currentUser!.username}
                                </Text>
                            )}
                            description={(
                                <FormattedText
                                    id='notification_settings.mentions.sensitiveUsername'
                                    defaultMessage='Your non-case sensitive username'
                                />
                            )}
                            selected={usernameMention}
                            action={toggleUsernameMention}
                            actionType='toggle'
                        />
                    )}
                    <View style={styles.separator}/>
                    <SectionItem
                        label={(
                            <Text>
                                {'@channel, @all, @here'}
                            </Text>
                        )}
                        description={(
                            <FormattedText
                                id='notification_settings.mentions.channelWide'
                                defaultMessage='Channel-wide mentions'
                            />
                        )}
                        action={toggleChannelMentions}
                        actionType='toggle'
                        selected={channel}
                    />
                    <View style={styles.separator}/>
                    <SectionItem
                        label={(
                            <FormattedText
                                id='notification_settings.mentions.keywords'
                                defaultMessage='Keywords'
                            />
                        )}
                        description={mentionKeysComponent}
                        action={goToNotificationSettingsMentionKeywords}
                        actionType='arrow'
                    />
                </>
            </Section>
        );
    };

    const goToNotificationSettingsMentionKeywords = () => {
        return Alert.alert(
            'The functionality you are trying to use has not yet been implemented.',
        );
    };
    const toggleChannelMentions = () => {
        dispatch({
            type: UPDATE_MENTION_PREF,
            data: {
                channel: !channel,
            },
        });
    };
    const toggleUsernameMention = () => {
        dispatch({
            type: UPDATE_MENTION_PREF,
            data: {
                usernameMention: !usernameMention,
            },
        });
    };
    const toggleFirstNameMention = () => {
        dispatch({
            type: UPDATE_MENTION_PREF,
            data: {
                firstName: !firstName,
            },
        });
    };

    const setReplyNotifications = (notifType: string) => {
        setReplyNotificationType(notifType);
    };

    const renderReplySection = () => {
        return (
            <Section
                headerText={replyHeaderText}
                containerStyles={styles.area}
            >
                <SectionItem
                    label={(
                        <FormattedText
                            id='notification_settings.threads_start_participate'
                            defaultMessage='Threads that I start or participate in'
                        />
                    )}
                    action={setReplyNotifications}
                    actionType='select'
                    actionValue='any'
                    selected={replyNotificationType === 'any'}
                />
                <View style={styles.separator}/>
                <SectionItem
                    label={(
                        <FormattedText
                            id='notification_settings.threads_start'
                            defaultMessage='Threads that I start'
                        />
                    )}
                    action={setReplyNotifications}
                    actionType='select'
                    actionValue='root'
                    selected={replyNotificationType === 'root'}
                />
                <View style={styles.separator}/>
                <SectionItem
                    label={(
                        <FormattedText
                            id='notification_settings.threads_mentions'
                            defaultMessage='Mentions in threads'
                        />
                    )}
                    action={setReplyNotifications}
                    actionType='select'
                    actionValue='never'
                    selected={replyNotificationType === 'never'}
                />
            </Section>
        );
    };

    return (
        <SafeAreaView
            edges={['left', 'right']}
            testID='notification_settings.screen'
            style={styles.container}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                alwaysBounceVertical={false}
            >
                {renderMentionSection()}
                {!isCRTEnabled && (
                    renderReplySection()
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default NotificationMention;

