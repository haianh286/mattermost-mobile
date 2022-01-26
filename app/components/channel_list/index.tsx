// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo, useState} from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

import {TABLET_SIDEBAR_WIDTH, TEAM_SIDEBAR_WIDTH} from '@constants/view';
import {useTheme} from '@context/theme';
import {makeStyleSheetFromTheme} from '@utils/theme';

import Categories from './categories';
import ChannelListHeader from './header';
import LoadChannelsError from './load_channels_error';
import LoadTeamsError from './load_teams_error';
import SearchField from './search';

// import Loading from '@components/loading';

const channels: TempoChannel[] = [
    {id: '1', name: 'Just a channel'},
    {id: '2', name: 'A Highlighted Channel!!!', highlight: true},
    {id: '3', name: 'And a longer channel name.'},
];

const categories: TempoCategory[] = [
    {id: '1', title: 'My first Category', channels},
    {id: '2', title: 'Another Cat', channels},
];

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.sidebarBg,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },

}));

type ChannelListProps = {
    currentTeamId?: string;
    iconPad?: boolean;
    isTablet: boolean;
    teamsCount: number;
}

const ChannelList = ({currentTeamId, iconPad, isTablet, teamsCount}: ChannelListProps) => {
    const theme = useTheme();
    const styles = getStyleSheet(theme);
    const tabletWidth = useSharedValue(TABLET_SIDEBAR_WIDTH);
    const tabletStyle = useAnimatedStyle(() => {
        if (!isTablet) {
            return {
                maxWidth: '100%',
            };
        }

        return {maxWidth: withTiming(tabletWidth.value, {duration: 350})};
    }, [isTablet]);

    useEffect(() => {
        if (isTablet) {
            tabletWidth.value = TABLET_SIDEBAR_WIDTH - (teamsCount > 1 ? TEAM_SIDEBAR_WIDTH : 0);
        }
    }, [isTablet, teamsCount]);

    const [showCats, setShowCats] = useState<boolean>(true);
    const content = useMemo(() => {
        if (currentTeamId) {
            if (showCats) {
                return (
                    <>
                        <SearchField/>
                        <Categories categories={categories}/>
                    </>
                );
            }
            return (<LoadChannelsError teamId={currentTeamId}/>);
        }

        return (<LoadTeamsError/>);
    }, [currentTeamId, showCats]);
    return (
        <Animated.View style={[styles.container, tabletStyle]}>
            <TouchableOpacity onPress={() => setShowCats(!showCats)}>
                <ChannelListHeader
                    iconPad={iconPad}
                />
            </TouchableOpacity>
            {content}
        </Animated.View>
    );
};

export default ChannelList;
