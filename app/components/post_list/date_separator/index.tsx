// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

import FormattedDate from '@components/formatted_date';
import FormattedText from '@components/formatted_text';
import {isSameYear, isToday, isYesterday} from '@utils/datetime';
import {makeStyleSheetFromTheme} from '@utils/theme';
import {typography} from '@utils/typography';

type DateSeparatorProps = {
    date: number | Date;
    style?: StyleProp<ViewStyle>;
    theme: Theme;
    timezone?: string | null;
};

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => {
    return {
        container: {
            alignItems: 'center',
            flexDirection: 'row',
            marginVertical: 8,
        },
        line: {
            flex: 1,
            height: 1,
            backgroundColor: theme.centerChannelColor,
            opacity: 0.1,
        },
        date: {
            color: theme.centerChannelColor,
            marginHorizontal: 16,
            ...typography('Body', 75, 'SemiBold'),
        },
    };
});

const RecentDate = (props: DateSeparatorProps) => {
    const {date, ...otherProps} = props;
    const when = new Date(date);

    if (isToday(when)) {
        return (
            <FormattedText
                {...otherProps}
                id='date_separator.today'
                defaultMessage='Today'
            />
        );
    } else if (isYesterday(when)) {
        return (
            <FormattedText
                {...otherProps}
                id='date_separator.yesterday'
                defaultMessage='Yesterday'
            />
        );
    }

    const format = isSameYear(when, new Date()) ? 'MMM DD' : 'MMM DD, YYYY';

    return (
        <FormattedDate
            {...otherProps}
            format={format}
            value={date}
        />
    );
};

const DateSeparator = (props: DateSeparatorProps) => {
    const styles = getStyleSheet(props.theme);

    return (
        <View style={[styles.container, props.style]}>
            <View style={styles.line}/>
            <RecentDate
                {...props}
                style={styles.date}
            />
            <View style={styles.line}/>
        </View>
    );
};

export default DateSeparator;
