// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import {TouchableOpacity, View} from 'react-native';

import CompassIcon from '@components/compass_icon';
import FormattedText from '@components/formatted_text';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';

type DrawerItemProps = {
    centered?: boolean;
    defaultMessage?: string;
    i18nId?: string;
    iconName?: string;
    isDestructor?: boolean;
    labelComponent?: ReactNode;
    leftComponent?: ReactNode;
    onPress: () => void;
    separator?: boolean;
    testID: string;
    theme: Theme;
};

const DrawerItem = (props: DrawerItemProps) => {
    const {
        centered,
        defaultMessage = '',
        i18nId,
        iconName,
        isDestructor = false,
        labelComponent,
        leftComponent,
        onPress,
        separator = true,
        testID,
        theme,
    } = props;

    const style = getStyleSheet(theme);

    const destructor: any = {};
    if (isDestructor) {
        destructor.color = theme.errorTextColor;
    }

    let divider;
    if (separator) {
        divider = (<View style={style.divider}/>);
    }

    let icon;
    if (leftComponent) {
        icon = leftComponent;
    } else if (iconName) {
        icon = (
            <CompassIcon
                name={iconName}
                style={[style.icon, destructor]}
            />
        );
    }

    let label;
    if (labelComponent) {
        label = labelComponent;
    } else if (i18nId) {
        label = (
            <FormattedText
                id={i18nId}
                defaultMessage={defaultMessage}
                style={[style.label, destructor, centered ? style.centerLabel : {}]}
            />
        );
    }

    return (
        <TouchableOpacity
            testID={testID}
            onPress={onPress}
        >
            <View style={style.container}>
                {icon && (
                    <View style={style.iconContainer}>
                        {icon}
                    </View>
                )}
                <View style={style.wrapper}>
                    <View style={style.labelContainer}>
                        {label}
                    </View>
                    {divider}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            backgroundColor: theme.centerChannelBg,
            flexDirection: 'row',
            minHeight: 50,
        },
        iconContainer: {
            width: 45,
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 5,
        },
        icon: {
            color: changeOpacity(theme.centerChannelColor, 0.64),
            fontSize: 24,
        },
        wrapper: {
            flex: 1,
        },
        labelContainer: {
            flex: 1,
            justifyContent: 'center',
            paddingTop: 14,
            paddingBottom: 14,
        },
        centerLabel: {
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        label: {
            color: changeOpacity(theme.centerChannelColor, 0.5),
            fontSize: 17,
            textAlignVertical: 'center',
            includeFontPadding: false,
        },
        divider: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.2),
            height: 1,
        },
    };
});

export default DrawerItem;
