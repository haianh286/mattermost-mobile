// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {intlShape} from 'react-intl';
import {
    Alert,
    Platform,
    ScrollView,
    View,
} from 'react-native';
import deepEqual from 'deep-equal';

import {General, RequestStatus} from '@mm-redux/constants';

import StatusBar from 'app/components/status_bar';
import NotificationPreferences from 'app/notification_preferences';
import SettingsItem from 'app/screens/settings/settings_item';
import {getNotificationProps} from 'app/utils/notify_props';
import {preventDoubleTap} from 'app/utils/tap';
import {changeOpacity, makeStyleSheetFromTheme} from 'app/utils/theme';
import {t} from 'app/utils/i18n';
import {goToScreen} from 'app/actions/navigation';

export default class NotificationSettings extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            updateMe: PropTypes.func.isRequired,
        }),
        currentUser: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        updateMeRequest: PropTypes.object.isRequired,
        currentUserStatus: PropTypes.string.isRequired,
        enableAutoResponder: PropTypes.bool.isRequired,
        isLandscape: PropTypes.bool.isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    componentDidUpdate(prevProps) {
        const {updateMeRequest} = this.props;
        const {intl} = this.context;
        if (prevProps.updateMeRequest.status !== updateMeRequest.status && updateMeRequest.status === RequestStatus.FAILURE) {
            Alert.alert(
                intl.formatMessage({
                    id: 'mobile.notification_settings.save_failed_title',
                    defaultMessage: 'Connection issue',
                }),
                intl.formatMessage({
                    id: 'mobile.notification_settings.save_failed_description',
                    defaultMessage: 'The notification settings failed to save due to a connection issue, please try again.',
                }),
            );
        }
    }

    handlePress = preventDoubleTap((action) => {
        action();
    });

    goToNotificationSettingsAutoResponder = () => {
        const {currentUser} = this.props;
        const {intl} = this.context;
        const screen = 'NotificationSettingsAutoResponder';
        const title = intl.formatMessage({
            id: 'mobile.notification_settings.auto_responder_short',
            defaultMessage: 'Automatic Replies',
        });
        const passProps = {
            currentUser,
            onBack: this.saveAutoResponder,
        };

        goToScreen(screen, title, passProps);
    };

    goToNotificationSettingsEmail = () => {
        const {intl} = this.context;
        const screen = 'NotificationSettingsEmail';
        const title = intl.formatMessage({
            id: 'mobile.notification_settings.email_title',
            defaultMessage: 'Email Notifications',
        });

        goToScreen(screen, title);
    };

    goToNotificationSettingsMentions = () => {
        const {currentUser} = this.props;
        const {intl} = this.context;
        const screen = 'NotificationSettingsMentions';
        const title = intl.formatMessage({
            id: 'mobile.notification_settings.mentions_replies',
            defaultMessage: 'Mentions and Replies',
        });
        const passProps = {
            currentUser,
            onBack: this.saveNotificationProps,
        };

        goToScreen(screen, title, passProps);
    };

    goToNotificationSettingsMobile = () => {
        const {currentUser} = this.props;
        const {intl} = this.context;
        const screen = 'NotificationSettingsMobile';
        const title = intl.formatMessage({
            id: 'mobile.notification_settings.mobile_title',
            defaultMessage: 'Mobile Notifications',
        });

        NotificationPreferences.getPreferences().then((notificationPreferences) => {
            const passProps = {
                currentUser,
                onBack: this.saveNotificationProps,
                notificationPreferences,
            };
            requestAnimationFrame(() => {
                goToScreen(screen, title, passProps);
            });
        }).catch((e) => {
            Alert.alert('There was a problem getting the device preferences', e.message);
        });
    };

    saveNotificationProps = (notifyProps) => {
        const {currentUser} = this.props;
        const prevProps = getNotificationProps(currentUser);
        const updatedProps = {
            ...prevProps,
            ...notifyProps,
        };

        if (!deepEqual(prevProps, notifyProps)) {
            this.props.actions.updateMe({notify_props: updatedProps});
        }
    };

    /**
     * shouldSaveAutoResponder
     *
     * Necessary in order to properly update the notifyProps when
     * enabling/disabling the Auto Responder.
     *
     * Reason being, on mobile when the AutoResponder is disabled on the server
     * for some reason the update does not get received on mobile, it does for web
     */
    shouldSaveAutoResponder = (notifyProps) => {
        const {currentUserStatus} = this.props;
        const {auto_responder_active: autoResponderActive} = notifyProps;

        const enabling = currentUserStatus !== General.OUT_OF_OFFICE && autoResponderActive === 'true';
        const disabling = currentUserStatus === General.OUT_OF_OFFICE && autoResponderActive === 'false';

        return enabling || disabling;
    };

    saveAutoResponder = (notifyProps) => {
        const {intl} = this.context;

        if (!notifyProps.auto_responder_message || notifyProps.auto_responder_message === '') {
            notifyProps.auto_responder_message = intl.formatMessage({
                id: 'mobile.notification_settings.auto_responder.default_message',
                defaultMessage: 'Hello, I am out of office and unable to respond to messages.',
            });
        }

        if (this.shouldSaveAutoResponder(notifyProps)) {
            this.props.actions.updateMe({notify_props: notifyProps});
        }
    };

    render() {
        const {theme, enableAutoResponder, isLandscape} = this.props;
        const style = getStyleSheet(theme);
        const showArrow = Platform.OS === 'ios';

        const showEmailSeparator = enableAutoResponder;
        let autoResponder;
        if (enableAutoResponder) {
            autoResponder = (
                <SettingsItem
                    defaultMessage='Automatic Direct Message Replies'
                    i18nId={t('mobile.notification_settings.ooo_auto_responder')}
                    iconName='beach-access'
                    iconType='material'
                    onPress={() => this.handlePress(this.goToNotificationSettingsAutoResponder)}
                    separator={false}
                    showArrow={showArrow}
                    theme={theme}
                    isLandscape={isLandscape}
                />
            );
        }

        return (
            <View style={style.container}>
                <StatusBar/>
                <ScrollView
                    contentContainerStyle={style.wrapper}
                    alwaysBounceVertical={false}
                >
                    <View style={style.divider}/>
                    <SettingsItem
                        defaultMessage='Mentions and Replies'
                        i18nId={t('mobile.notification_settings.mentions_replies')}
                        iconName='md-at'
                        iconType='ion'
                        onPress={() => this.handlePress(this.goToNotificationSettingsMentions)}
                        separator={true}
                        showArrow={showArrow}
                        theme={theme}
                        isLandscape={isLandscape}
                    />
                    <SettingsItem
                        defaultMessage='Mobile'
                        i18nId={t('mobile.notification_settings.mobile')}
                        iconName='md-phone-portrait'
                        iconType='ion'
                        onPress={() => this.handlePress(this.goToNotificationSettingsMobile)}
                        separator={true}
                        showArrow={showArrow}
                        theme={theme}
                        isLandscape={isLandscape}
                    />
                    <SettingsItem
                        defaultMessage='Email'
                        i18nId={t('mobile.notification_settings.email')}
                        iconName='ios-mail'
                        iconType='ion'
                        onPress={() => this.handlePress(this.goToNotificationSettingsEmail)}
                        separator={showEmailSeparator}
                        showArrow={showArrow}
                        theme={theme}
                        isLandscape={isLandscape}
                    />
                    {autoResponder}
                    <View style={style.divider}/>
                </ScrollView>
            </View>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flex: 1,
            backgroundColor: theme.centerChannelBg,
        },
        wrapper: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.06),
            ...Platform.select({
                ios: {
                    paddingTop: 35,
                },
            }),
        },
        divider: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.1),
            height: 1,
            width: '100%',
        },
    };
});
