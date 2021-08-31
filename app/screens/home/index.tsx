// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator, BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Platform} from 'react-native';
import {enableScreens} from 'react-native-screens';

import {useTheme} from '@context/theme';

import Account from './account';
import ChannelList from './channel_list';
import RecentMentions from './recent_mentions';
import Search from './search';
import TabBar from './tab_bar';

import type {LaunchProps} from '@typings/launch';

if (Platform.OS === 'ios') {
    // We do this on iOS to avoid conflicts betwen ReactNavigation & Wix ReactNativeNavigation
    enableScreens(false);
}

type HomeProps = LaunchProps & {
    time?: number;
};

const Tab = createBottomTabNavigator();

export default function HomeScreen(props: HomeProps) {
    const theme = useTheme();

    return (
        <NavigationContainer
            theme={{
                dark: false,
                colors: {
                    primary: theme.centerChannelColor,
                    background: theme.centerChannelBg,
                    card: theme.centerChannelBg,
                    text: theme.centerChannelColor,
                    border: 'white',
                    notification: theme.mentionHighlightBg,
                },
            }}
        >
            <Tab.Navigator
                screenOptions={{headerShown: false, lazy: true, unmountOnBlur: true}}
                tabBar={(tabProps: BottomTabBarProps) => (
                    <TabBar
                        {...tabProps}
                        theme={theme}
                    />)}
            >
                <Tab.Screen
                    name='Home'
                    options={{title: 'Channel', unmountOnBlur: false}}
                >
                    {() => <ChannelList {...props}/>}
                </Tab.Screen>
                <Tab.Screen
                    name='Search'
                    component={Search}
                    options={{unmountOnBlur: false}}
                />
                <Tab.Screen
                    name='Mentions'
                    component={RecentMentions}
                />
                <Tab.Screen
                    name='Account'
                    component={Account}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
