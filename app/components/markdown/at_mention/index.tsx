// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useManagedConfig} from '@mattermost/react-native-emm';
import {Database, Q} from '@nozbe/watermelondb';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import Clipboard from '@react-native-community/clipboard';
import React, {useCallback, useMemo} from 'react';
import {useIntl} from 'react-intl';
import {GestureResponderEvent, StyleProp, StyleSheet, Text, TextStyle, View} from 'react-native';
import {combineLatest, of as of$} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import CompassIcon from '@components/compass_icon';
import SlideUpPanelItem, {ITEM_HEIGHT} from '@components/slide_up_panel_item';
import {Preferences} from '@constants';
import {MM_TABLES, SYSTEM_IDENTIFIERS} from '@constants/database';
import {useTheme} from '@context/theme';
import UserModel from '@database/models/server/user';
import {getTeammateNameDisplaySetting} from '@helpers/api/preference';
import {bottomSheet, dismissBottomSheet, showModal} from '@screens/navigation';
import {displayUsername, getUserMentionKeys, getUsersByUsername} from '@utils/user';

// groups: MM-41882 import type GroupModel from '@typings/database/models/servers/group';
// groups: MM-41882 import type GroupMembershipModel from '@typings/database/models/servers/group_membership';
import type {WithDatabaseArgs} from '@typings/database/database';
import type PreferenceModel from '@typings/database/models/servers/preference';
import type SystemModel from '@typings/database/models/servers/system';
import type UserModelType from '@typings/database/models/servers/user';

type AtMentionProps = {
    currentUserId: string;
    database: Database;
    disableAtChannelMentionHighlight?: boolean;

    // groups: MM-41882 groups: GroupModel[];
    isSearchResult?: boolean;
    mentionKeys?: Array<{key: string }>;
    mentionName: string;
    mentionStyle: TextStyle;

    // groups: MM-41882 myGroups: GroupMembershipModel[];
    onPostPress?: (e: GestureResponderEvent) => void;
    teammateNameDisplay: string;
    textStyle?: StyleProp<TextStyle>;
    users: UserModelType[];
}

// groups: MM-41882 const {SERVER: {GROUP, GROUP_MEMBERSHIP, PREFERENCE, SYSTEM, USER}} = MM_TABLES;
const {SERVER: {PREFERENCE, SYSTEM, USER}} = MM_TABLES;

const style = StyleSheet.create({
    bottomSheet: {
        flex: 1,
    },
});

const AtMention = ({
    currentUserId,
    database,
    disableAtChannelMentionHighlight,

    // groups: MM-41882 groups,
    isSearchResult,
    mentionName,
    mentionKeys,
    mentionStyle,

    // groups: MM-41882 myGroups,
    onPostPress,
    teammateNameDisplay,
    textStyle,
    users,
}: AtMentionProps) => {
    const intl = useIntl();
    const managedConfig = useManagedConfig();
    const theme = useTheme();
    const user = useMemo(() => {
        const usersByUsername = getUsersByUsername(users);
        let mn = mentionName.toLowerCase();

        while (mn.length > 0) {
            if (usersByUsername[mn]) {
                return usersByUsername[mn];
            }

            // Repeatedly trim off trailing punctuation in case this is at the end of a sentence
            if ((/[._-]$/).test(mn)) {
                mn = mn.substring(0, mn.length - 1);
            } else {
                break;
            }
        }

        // @ts-expect-error: The model constructor is hidden within WDB type definition
        return new UserModel(database.get(USER), {username: ''});
    }, [users, mentionName]);
    const userMentionKeys = useMemo(() => {
        if (mentionKeys) {
            return mentionKeys;
        }

        if (user.id !== currentUserId) {
            return [];
        }

        // groups: MM-41882 return getUserMentionKeys(user, groups, myGroups);
        return getUserMentionKeys(user);

    // groups: MM-41882 }, [currentUserId, groups, mentionKeys, myGroups, user]);
    }, [currentUserId, mentionKeys, user]);

    // groups: MM-41882 const getGroupFromMentionName = () => {
    // groups: MM-41882     const mentionNameTrimmed = mentionName.toLowerCase().replace(/[._-]*$/, '');
    // groups: MM-41882     return groups.find((g) => g.name === mentionNameTrimmed);
    // groups: MM-41882 };

    const goToUserProfile = useCallback(() => {
        const screen = 'UserProfile';
        const title = intl.formatMessage({id: 'mobile.routes.user_profile', defaultMessage: 'Profile'});
        const passProps = {
            userId: user.id,
        };

        const closeButton = CompassIcon.getImageSourceSync('close', 24, theme.sidebarHeaderTextColor);

        const options = {
            topBar: {
                leftButtons: [{
                    id: 'close-settings',
                    icon: closeButton,
                    testID: 'close.settings.button',
                }],
            },
        };

        showModal(screen, title, passProps, options);
    }, [user]);

    const handleLongPress = useCallback(() => {
        if (managedConfig?.copyAndPasteProtection !== 'true') {
            const renderContent = () => {
                return (
                    <View
                        testID='at_mention.bottom_sheet'
                        style={style.bottomSheet}
                    >
                        <SlideUpPanelItem
                            icon='content-copy'
                            onPress={() => {
                                dismissBottomSheet();
                                let username = mentionName;
                                if (user.username) {
                                    username = user.username;
                                }

                                Clipboard.setString(`@${username}`);
                            }}
                            testID='at_mention.bottom_sheet.copy_mention'
                            text={intl.formatMessage({id: 'mobile.mention.copy_mention', defaultMessage: 'Copy Mention'})}
                        />
                        <SlideUpPanelItem
                            destructive={true}
                            icon='cancel'
                            onPress={() => {
                                dismissBottomSheet();
                            }}
                            testID='at_mention.bottom_sheet.cancel'
                            text={intl.formatMessage({id: 'mobile.post.cancel', defaultMessage: 'Cancel'})}
                        />
                    </View>
                );
            };

            bottomSheet({
                closeButtonId: 'close-at-mention',
                renderContent,
                snapPoints: [3 * ITEM_HEIGHT, 10],
                title: intl.formatMessage({id: 'post.options.title', defaultMessage: 'Options'}),
                theme,
            });
        }
    }, [managedConfig, intl, theme]);

    const mentionTextStyle = [];

    let backgroundColor;
    let canPress = false;
    let highlighted;
    let isMention = false;
    let mention;
    let onLongPress;
    let onPress;
    let suffix;
    let suffixElement;
    let styleText;

    if (textStyle) {
        backgroundColor = theme.mentionHighlightBg;
        styleText = textStyle;
    }

    if (user?.username) {
        suffix = mentionName.substring(user.username.length);
        highlighted = userMentionKeys.some((item) => item.key.includes(user.username));
        mention = displayUsername(user, user.locale, teammateNameDisplay);
        isMention = true;
        canPress = true;
    } else {
        // groups: MM-41882 const group = getGroupFromMentionName();
        // groups: MM-41882 if (group?.allowReference) {
        // groups: MM-41882     highlighted = userMentionKeys.some((item) => item.key === `@${group.name}`);
        // groups: MM-41882     isMention = true;
        // groups: MM-41882     mention = group.name;
        // groups: MM-41882     suffix = mentionName.substring(group.name.length);
        // groups: MM-41882 } else {
        const pattern = new RegExp(/\b(all|channel|here)(?:\.\B|_\b|\b)/, 'i');
        const mentionMatch = pattern.exec(mentionName);

        if (mentionMatch && !disableAtChannelMentionHighlight) {
            mention = mentionMatch.length > 1 ? mentionMatch[1] : mentionMatch[0];
            suffix = mentionName.replace(mention, '');
            isMention = true;
            highlighted = true;
        } else {
            mention = mentionName;
        }

        // groups: MM-41882 }
    }

    if (canPress) {
        onLongPress = handleLongPress;
        onPress = isSearchResult ? onPostPress : goToUserProfile;
    }

    if (suffix) {
        const suffixStyle = {...StyleSheet.flatten(styleText), color: theme.centerChannelColor};
        suffixElement = (
            <Text style={suffixStyle}>
                {suffix}
            </Text>
        );
    }

    if (isMention) {
        mentionTextStyle.push(mentionStyle);
    }

    if (highlighted) {
        mentionTextStyle.push({backgroundColor, color: theme.mentionHighlightLink});
    }

    return (
        <Text
            style={styleText}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <Text style={mentionTextStyle}>
                {'@' + mention}
            </Text>
            {suffixElement}
        </Text>
    );
};

const withAtMention = withObservables(['mentionName'], ({database, mentionName}: {mentionName: string} & WithDatabaseArgs) => {
    const config = database.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.CONFIG);
    const license = database.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.LICENSE);
    const preferences = database.get<PreferenceModel>(PREFERENCE).query(Q.where('category', Preferences.CATEGORY_DISPLAY_SETTINGS)).observe();
    const currentUserId = database.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.CURRENT_USER_ID).pipe(
        switchMap(({value}) => of$(value)),
    );
    const teammateNameDisplay = combineLatest([config, license, preferences]).pipe(
        map(
            ([{value: cfg}, {value: lcs}, prefs]) => getTeammateNameDisplaySetting(prefs, cfg, lcs),
        ),
    );

    let mn = mentionName.toLowerCase();
    if ((/[._-]$/).test(mn)) {
        mn = mn.substring(0, mn.length - 1);
    }

    return {
        currentUserId,

        // groups: MM-41882 groups: database.get(GROUP).query(Q.where('delete_at', Q.eq(0))).observe(),
        // groups: MM-41882 myGroups: database.get(GROUP_MEMBERSHIP).query().observe(),
        teammateNameDisplay,
        users: database.get(USER).query(
            Q.where('username', Q.like(
                `%${Q.sanitizeLikeString(mn)}%`,
            )),
        ).observeWithColumns(['username']),
    };
});

export default withDatabase(withAtMention(React.memo(AtMention)));
