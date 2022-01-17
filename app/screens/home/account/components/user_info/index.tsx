// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Text, View} from 'react-native';

import ProfilePicture from '@components/profile_picture';
import {makeStyleSheetFromTheme} from '@utils/theme';

import type UserModel from '@typings/database/models/servers/user';

type Props = {
    user: UserModel;
    showFullName: boolean;
    theme: Theme;
};

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => {
    return {
        container: {
            backgroundColor: theme.sidebarBg,
            paddingBottom: 20,
            top: 0,
            paddingTop: 22,
            paddingLeft: 20,
        },
        statusStyle: {
            right: 10,
            bottom: 10,
            borderColor: theme.sidebarBg,
            backgroundColor: theme.sidebarBg,
        },
        textFullName: {
            fontSize: 28,
            lineHeight: 36,
            color: theme.sidebarText,
            fontFamily: 'Metropolis-Semibold',
            marginTop: 16,
        },
        textUserName: {
            fontSize: 16,
            lineHeight: 24,
            color: theme.sidebarText,
            fontFamily: 'OpenSans',
            marginTop: 4,
        },
    };
});

const AccountUserInfo = ({user, showFullName, theme}: Props) => {
    const styles = getStyleSheet(theme);
    const nickName = user.nickname ? ` (${user.nickname})` : '';
    const title = `${user.firstName} ${user.lastName}${nickName}`;
    const userName = `@${user.username}`;

    return (
        <View style={styles.container}>
            <ProfilePicture
                size={120}
                iconSize={28}
                showStatus={true}
                author={user}
                testID={'account.profile_picture'}
                statusStyle={styles.statusStyle}
                statusSize={24}
            />
            {showFullName && <Text style={styles.textFullName}>{title}</Text>}
            <Text style={showFullName ? styles.textUserName : styles.textFullName}>{`${userName}`}</Text>
        </View>
    );
};

export default AccountUserInfo;
