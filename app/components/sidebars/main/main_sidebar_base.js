// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Platform,
    StyleSheet,
    View,
} from 'react-native';

import {General} from 'mattermost-redux/constants';

import SafeAreaView from 'app/components/safe_area_view';
import tracker from 'app/utils/time_tracker';
import {t} from 'app/utils/i18n';

import ChannelsList from './channels_list';
import DrawerSwiper from './drawer_swiper';
import TeamsList from './teams_list';

import telemetry from 'app/telemetry';

export default class MainSidebarBase extends Component {
    static propTypes = {
        actions: PropTypes.shape({
            getTeams: PropTypes.func.isRequired,
            handleSelectChannel: PropTypes.func,
            joinChannel: PropTypes.func.isRequired,
            logChannelSwitch: PropTypes.func.isRequired,
            makeDirectChannel: PropTypes.func.isRequired,
            setChannelDisplayName: PropTypes.func.isRequired,
        }).isRequired,
        children: PropTypes.node,
        currentTeamId: PropTypes.string.isRequired,
        currentUserId: PropTypes.string,
        locale: PropTypes.string,
        teamsCount: PropTypes.number.isRequired,
        theme: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.swiperIndex = 1;
        this.channelListRef = React.createRef();
    }

    shouldComponentUpdate() {
        return false;
    }

    drawerSwiperRef = (ref) => {
        this.drawerSwiper = ref;
    };

    getIntl = () => {
        const {intl} = this.providerRef ? this.providerRef.getChildContext() : this.context;
        return intl;
    };

    handleUpdateTitle = (channel) => {
        let channelName = '';
        if (channel.display_name) {
            channelName = channel.display_name;
        }
        this.props.actions.setChannelDisplayName(channelName);
    };

    joinChannel = async (channel, currentChannelId) => {
        const intl = this.getIntl();
        const {
            actions,
            currentTeamId,
            currentUserId,
        } = this.props;

        const {
            joinChannel,
            makeDirectChannel,
        } = actions;

        this.closeChannelDrawer(true);

        const displayValue = {displayName: channel.display_name};
        const utils = require('app/utils/general');

        let result;
        if (channel.type === General.DM_CHANNEL) {
            result = await makeDirectChannel(channel.id, false);

            if (result.error) {
                const dmFailedMessage = {
                    id: t('mobile.open_dm.error'),
                    defaultMessage: "We couldn't open a direct message with {displayName}. Please check your connection and try again.",
                };
                utils.alertErrorWithFallback(intl, result.error, dmFailedMessage, displayValue);
            }
        } else {
            result = await joinChannel(currentUserId, currentTeamId, channel.id);

            if (result.error || !result.data || !result.data.channel) {
                const joinFailedMessage = {
                    id: t('mobile.join_channel.error'),
                    defaultMessage: "We couldn't join the channel {displayName}. Please check your connection and try again.",
                };
                utils.alertErrorWithFallback(intl, result.error, joinFailedMessage, displayValue);
            }
        }

        if (result.error || (!result.data && !result.data.channel)) {
            return;
        }

        this.selectChannel(result.data.channel || result.data, currentChannelId, false);
    };

    onSearchEnds = () => {
        this.setState({searching: false});
    };

    onSearchStart = () => {
        if (this.drawerRef?.current) {
            this.drawerRef.current.canClose = false;
        }
        this.setState({searching: true});
    };

    showTeams = () => {
        if (this.drawerSwiper && this.props.teamsCount > 1) {
            this.drawerSwiper.showTeamsPage();
        }
    };

    resetDrawer = () => {
        if (this.drawerSwiper) {
            this.drawerSwiper.resetPage();
        }

        if (this.drawerRef?.current) {
            this.drawerRef.current.canClose = true;
        }

        if (this.channelListRef?.current) {
            this.channelListRef.current.cancelSearch();
        }
    };

    renderNavigationView = (drawerWidth) => {
        const {
            teamsCount,
            theme,
        } = this.props;

        const {
            openDrawerOffset,
            searching,
        } = this.state;

        const offset = Platform.select({android: 60, ios: 0});
        const multipleTeams = teamsCount > 1;
        const showTeams = !searching && multipleTeams;
        if (this.drawerSwiper) {
            if (multipleTeams) {
                this.drawerSwiper.runOnLayout();
                this.drawerSwiper.scrollToInitial();
            } else if (!openDrawerOffset) {
                this.drawerSwiper.scrollToStart();
            }
        }

        const lists = [];
        if (multipleTeams) {
            const teamsList = (
                <View
                    key='teamsList'
                    style={style.swiperContent}
                >
                    <TeamsList
                        closeChannelDrawer={this.closeChannelDrawer}
                    />
                </View>
            );
            lists.push(teamsList);
        }

        lists.push(
            <View
                key='channelsList'
                style={style.swiperContent}
            >
                <ChannelsList
                    ref={this.channelListRef}
                    onSelectChannel={this.selectChannel}
                    onJoinChannel={this.joinChannel}
                    onShowTeams={this.showTeams}
                    onSearchStart={this.onSearchStart}
                    onSearchEnds={this.onSearchEnds}
                    theme={theme}
                />
            </View>,
        );

        return (
            <SafeAreaView
                excludeFooter={true}
                navBarBackgroundColor={theme.sidebarBg}
                backgroundColor={theme.sidebarHeaderBg}
                footerColor={theme.sidebarBg}
            >
                <DrawerSwiper
                    ref={this.drawerSwiperRef}
                    onPageSelected={this.onPageSelected}
                    showTeams={showTeams}
                    drawerOpened={this.state.drawerOpened}
                    drawerWidth={drawerWidth - offset}
                >
                    {lists}
                </DrawerSwiper>
            </SafeAreaView>
        );
    };

    selectChannel = (channel, currentChannelId, closeDrawer = true) => {
        const {logChannelSwitch, handleSelectChannel} = this.props.actions;

        logChannelSwitch(channel.id, currentChannelId);

        tracker.channelSwitch = Date.now();

        if (closeDrawer) {
            telemetry.start(['channel:close_drawer']);
            this.closeChannelDrawer(true);
        }

        if (!channel) {
            const utils = require('app/utils/general');
            const intl = this.getIntl();

            const unableToJoinMessage = {
                id: t('mobile.open_unknown_channel.error'),
                defaultMessage: "We couldn't join the channel. Please reset the cache and try again.",
            };
            const erroMessage = {};

            utils.alertErrorWithFallback(intl, erroMessage, unableToJoinMessage);
            return;
        }

        handleSelectChannel(channel.id);
    };

    render() {
        return; // eslint-disable-line no-useless-return
    }
}

const style = StyleSheet.create({
    swiperContent: {
        flex: 1,
    },
});