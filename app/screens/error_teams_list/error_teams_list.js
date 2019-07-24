// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    InteractionManager,
    View,
} from 'react-native';
import {Navigation} from 'react-native-navigation';

import FailedNetworkAction from 'app/components/failed_network_action';
import FormattedText from 'app/components/formatted_text';
import Loading from 'app/components/loading';
import StatusBar from 'app/components/status_bar';
import {makeStyleSheetFromTheme, setNavigatorStyles} from 'app/utils/theme';
import {t} from 'app/utils/i18n';

export default class ErrorTeamsList extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            loadMe: PropTypes.func.isRequired,
            connection: PropTypes.func.isRequired,
            logout: PropTypes.func.isRequired,
            selectDefaultTeam: PropTypes.func.isRequired,
            resetToChannel: PropTypes.func.isRequired,
        }).isRequired,
        componentId: PropTypes.string,
        theme: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
        };
    }

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.theme !== nextProps.theme) {
            setNavigatorStyles(this.props.componentId, nextProps.theme);
        }
    }

    navigationButtonPressed({buttonId}) {
        const {logout} = this.props.actions;
        if (buttonId === 'logout') {
            InteractionManager.runAfterInteractions(logout);
        }
    }

    goToChannelView = () => {
        const passProps = {
            disableTermsModal: true,
        };
        this.props.actions.resetToChannel(passProps);
    };

    getUserInfo = async () => {
        try {
            this.setState({loading: true});
            this.props.actions.connection(true);
            await this.props.actions.loadMe();
            this.props.actions.selectDefaultTeam();
            this.goToChannelView();
        } catch {
            this.props.actions.connection(false);
        } finally {
            this.setState({loading: false});
        }
    }

    render() {
        const {theme} = this.props;
        const style = getStyleFromTheme(theme);

        const errorDescription = {
            id: t('mobile.failed_network_action.shortDescription'),
            defaultMessage: '{type} will load when you have an internet connection or {refresh}.',
            values: {
                type: (
                    <FormattedText
                        id='mobile.failed_network_action.description.teams'
                        defaultMessage='Teams'
                    />
                ),
                refresh: (
                    <FormattedText
                        id='mobile.failed_network_action.retry'
                        defaultMessage='try again'
                        style={style.link}
                        onPress={this.getUserInfo}
                    />
                ),
            },
        };

        if (this.state.loading) {
            return <Loading/>;
        }

        return (
            <View style={style.container}>
                <StatusBar/>
                <FailedNetworkAction
                    theme={theme}
                    errorDescription={errorDescription}
                />
            </View>
        );
    }
}

const getStyleFromTheme = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            backgroundColor: theme.centerChannelBg,
            flex: 1,
        },
        link: {
            color: theme.linkColor,
        },
    };
});
