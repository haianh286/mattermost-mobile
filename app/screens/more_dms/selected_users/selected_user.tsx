// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import CompassIcon from '@components/compass_icon';
import {useTheme} from '@context/theme';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {displayUsername} from '@utils/user';

type Props = {

    /*
     * How to display the names of users.
     */
    teammateNameDisplay: string;

    /*
     * The user that this component represents.
     */
    user: UserProfile;

    /*
     * A handler function that will deselect a user when clicked on.
     */
    onRemove: (id: string) => void;

    /*
     * The test ID.
     */
    testID?: string;
}

const getStyleFromTheme = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            alignItems: 'center',
            flexDirection: 'row',
            height: 27,
            borderRadius: 3,
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.2),
            marginBottom: 4,
            marginRight: 10,
            paddingLeft: 10,
        },
        remove: {
            paddingHorizontal: 10,
        },
        text: {
            color: theme.centerChannelColor,
            fontSize: 13,
        },
    };
});

export default function SelectedUser({
    teammateNameDisplay,
    user,
    onRemove,
    testID,
}: Props) {
    const theme = useTheme();
    const style = getStyleFromTheme(theme);
    const intl = useIntl();

    const onPress = useCallback(() => {
        onRemove(user.id);
    }, [onRemove, user.id]);

    return (
        <View
            style={style.container}
            testID={`${testID}.${user.id}`}
        >
            <Text
                style={style.text}
                testID={`${testID}.${user.id}.display_username`}
            >
                {displayUsername(user, intl.locale, teammateNameDisplay)}
            </Text>
            <TouchableOpacity
                style={style.remove}
                onPress={onPress}
                testID={`${testID}.${user.id}.remove.button`}
            >
                <CompassIcon
                    name='close'
                    size={14}
                    color={theme.centerChannelColor}
                />
            </TouchableOpacity>
        </View>
    );
}
