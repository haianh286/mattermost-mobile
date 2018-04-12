// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {intlShape} from 'react-intl';
import {
    Keyboard,
    FlatList,
    SafeAreaView,
    View,
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';

import ChannelLoader from 'app/components/channel_loader';
import DateHeader from 'app/components/post_list/date_header';
import FailedNetworkAction from 'app/components/failed_network_action';
import NoResults from 'app/components/no_results';
import StatusBar from 'app/components/status_bar';
import mattermostManaged from 'app/mattermost_managed';
import SearchResultPost from 'app/screens/search/search_result_post';
import ChannelDisplayName from 'app/screens/search/channel_display_name';
import {DATE_LINE} from 'app/selectors/post_list';
import {changeOpacity, makeStyleSheetFromTheme} from 'app/utils/theme';

const SEPARATOR_HEIGHT = 3;

export default class FlaggedPosts extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            clearSearch: PropTypes.func.isRequired,
            loadChannelsByTeamName: PropTypes.func.isRequired,
            loadThreadIfNecessary: PropTypes.func.isRequired,
            getFlaggedPosts: PropTypes.func.isRequired,
            selectFocusedPostId: PropTypes.func.isRequired,
            selectPost: PropTypes.func.isRequired,
        }).isRequired,
        didFail: PropTypes.bool,
        isLoading: PropTypes.bool,
        navigator: PropTypes.object,
        postIds: PropTypes.array,
        theme: PropTypes.object.isRequired,
    };

    static defaultProps = {
        postIds: [],
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);

        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
        props.actions.clearSearch();
        props.actions.getFlaggedPosts();

        this.state = {
            managedConfig: {},
        };
    }

    componentWillMount() {
        this.listenerId = mattermostManaged.addEventListener('change', this.setManagedConfig);
    }

    componentDidMount() {
        this.setManagedConfig();
    }

    componentWillUnmount() {
        mattermostManaged.removeEventListener(this.listenerId);
    }

    goToThread = (post) => {
        const {actions, navigator, theme} = this.props;
        const channelId = post.channel_id;
        const rootId = (post.root_id || post.id);

        Keyboard.dismiss();
        actions.loadThreadIfNecessary(rootId, channelId);
        actions.selectPost(rootId);

        const options = {
            screen: 'Thread',
            animated: true,
            backButtonTitle: '',
            navigatorStyle: {
                navBarTextColor: theme.sidebarHeaderTextColor,
                navBarBackgroundColor: theme.sidebarHeaderBg,
                navBarButtonColor: theme.sidebarHeaderTextColor,
                screenBackgroundColor: theme.centerChannelBg,
            },
            passProps: {
                channelId,
                rootId,
            },
        };

        navigator.push(options);
    };

    handleClosePermalink = () => {
        const {actions} = this.props;
        actions.selectFocusedPostId('');
        this.showingPermalink = false;
    };

    handlePermalinkPress = (postId, teamName) => {
        this.props.actions.loadChannelsByTeamName(teamName);
        this.showPermalinkView(postId, true);
    };

    keyExtractor = (item) => item;

    onNavigatorEvent = (event) => {
        if (event.type === 'NavBarButtonPress') {
            if (event.id === 'close-settings') {
                this.props.navigator.dismissModal({
                    animationType: 'slide-down',
                });
            }
        }
    };

    previewPost = (post) => {
        Keyboard.dismiss();

        this.showPermalinkView(post.id, false);
    };

    renderDateHeader = (date, index) => {
        return (
            <DateHeader
                date={date}
                index={index}
            />
        );
    };

    renderEmpty = () => {
        const {formatMessage} = this.context.intl;
        const {theme} = this.props;
        const icon = (
            <IonIcon
                size={76}
                color={changeOpacity(theme.centerChannelColor, 0.4)}
                name='ios-flag-outline'
            />
        );

        return (
            <NoResults
                description={formatMessage({
                    id: 'mobile.flagged_posts.empty_description',
                    defaultMessage: 'Flags are a way to mark messages for follow up. Your flags are personal, and cannot be seen by other users.',
                })}
                icon={icon}
                title={formatMessage({id: 'mobile.flagged_posts.empty_title', defaultMessage: 'No Flagged Posts'})}
                theme={theme}
            />
        );
    };

    renderPost = ({item, index}) => {
        const {postIds} = this.props;
        const {managedConfig} = this.state;
        if (item.indexOf(DATE_LINE) === 0) {
            const date = item.substring(DATE_LINE.length);
            return this.renderDateHeader(new Date(date), index);
        }

        let separator;
        const nextPost = postIds[index + 1];
        if (nextPost && nextPost.indexOf(DATE_LINE) === -1) {
            separator = this.renderPostSeparator();
        }

        return (
            <View>
                <ChannelDisplayName postId={item}/>
                <SearchResultPost
                    postId={item}
                    previewPost={this.previewPost}
                    goToThread={this.goToThread}
                    navigator={this.props.navigator}
                    onPermalinkPress={this.handlePermalinkPress}
                    managedConfig={managedConfig}
                    showFullDate={false}
                />
                {separator}
            </View>
        );
    };

    renderPostSeparator = () => {
        const {theme} = this.props;
        const style = getStyleFromTheme(theme);

        return (
            <View style={[style.separatorContainer, style.postsSeparator]}>
                <View style={style.separator}/>
            </View>
        );
    };

    setManagedConfig = async (config) => {
        let nextConfig = config;
        if (!nextConfig) {
            nextConfig = await mattermostManaged.getLocalConfig();
        }

        this.setState({
            managedConfig: nextConfig,
        });
    };

    showPermalinkView = (postId, isPermalink) => {
        const {actions, navigator} = this.props;

        actions.selectFocusedPostId(postId);

        if (!this.showingPermalink) {
            const options = {
                screen: 'Permalink',
                animationType: 'none',
                backButtonTitle: '',
                overrideBackPress: true,
                navigatorStyle: {
                    navBarHidden: true,
                    screenBackgroundColor: changeOpacity('#000', 0.2),
                    modalPresentationStyle: 'overCurrentContext',
                },
                passProps: {
                    isPermalink,
                    onClose: this.handleClosePermalink,
                    onPermalinkPress: this.handlePermalinkPress,
                },
            };

            this.showingPermalink = true;
            navigator.showModal(options);
        }
    };

    retry = () => {
        this.props.actions.getFlaggedPosts();
    };

    render() {
        const {didFail, isLoading, postIds, theme} = this.props;

        const style = getStyleFromTheme(theme);

        let component;
        if (didFail) {
            component = (
                <FailedNetworkAction
                    onRetry={this.retry}
                    theme={theme}
                />
            );
        } else if (isLoading) {
            component = (
                <ChannelLoader channelIsLoading={true}/>
            );
        } else if (postIds.length) {
            component = (
                <FlatList
                    ref='list'
                    contentContainerStyle={style.sectionList}
                    data={postIds}
                    keyExtractor={this.keyExtractor}
                    keyboardShouldPersistTaps='always'
                    keyboardDismissMode='interactive'
                    renderItem={this.renderPost}
                />
            );
        } else {
            component = this.renderEmpty();
        }

        return (
            <SafeAreaView style={style.container}>
                <View style={style.container}>
                    <StatusBar/>
                    {component}
                </View>
            </SafeAreaView>
        );
    }
}

const getStyleFromTheme = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flex: 1,
        },
        separatorContainer: {
            justifyContent: 'center',
            flex: 1,
            height: SEPARATOR_HEIGHT,
        },
        postsSeparator: {
            height: 15,
        },
        separator: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.1),
            height: 1,
        },
    };
});
