// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    ActivityIndicator,
    Animated,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';

import FormattedText from 'app/components/formatted_text';

import {RequestStatus} from 'mattermost-redux/constants';

const HEIGHT = 38;
const NAVBAR = Platform.OS === 'ios' ? 64 : 46;
const INITIAL_TOP = NAVBAR - HEIGHT;
const OFFLINE = 'offline';
const CONNECTING = 'connecting';
const CONNECTED = 'connected';

export default class OfflineIndicator extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            closeWebSocket: PropTypes.func.isRequired,
            initWebSocket: PropTypes.func.isRequired
        }).isRequired,
        appState: PropTypes.bool,
        isConnecting: PropTypes.bool,
        isOnline: PropTypes.bool,
        webSocketStatus: PropTypes.string
    };

    static defaultProps: {
        appState: true,
        isOnline: true
    };

    constructor(props) {
        super(props);

        this.state = {
            network: null,
            top: new Animated.Value(INITIAL_TOP)
        };

        this.backgroundColor = new Animated.Value(0);
    }

    componentWillReceiveProps(nextProps) {
        const {appState, isConnecting, isOnline, webSocketStatus} = nextProps;
        if (appState) { // The app is in the foreground
            if (isOnline) {
                if (this.state.network && webSocketStatus === RequestStatus.SUCCESS) {
                    // Show the connected animation only if we had a previous network status
                    this.connected();
                } else if ((webSocketStatus === RequestStatus.STARTED || webSocketStatus === RequestStatus.FAILURE) && isConnecting) {
                    // Show the connecting bar if it failed to connect at least twice
                    this.connecting();
                }
            } else {
                this.offline();
            }
        }
    }

    offline = () => {
        this.setState({network: OFFLINE}, () => {
            this.show();
        });
    };

    connect = () => {
        const {actions, isOnline, webSocketStatus} = this.props;
        const {closeWebSocket, initWebSocket} = actions;
        initWebSocket(Platform.OS);

        // close the WS connection after trying for 5 seconds
        setTimeout(() => {
            if (webSocketStatus !== RequestStatus.SUCCESS) {
                closeWebSocket(true);
                this.setState({network: isOnline ? OFFLINE : CONNECTING});
            }
        }, 5000);
    };

    connecting = () => {
        const prevState = this.state.network;
        this.setState({network: CONNECTING}, () => {
            if (prevState !== OFFLINE) {
                this.show();
            }
        });
    };

    connected = () => {
        this.setState({network: CONNECTED});
        Animated.sequence([
            Animated.timing(
                this.backgroundColor, {
                    toValue: 1,
                    duration: 100
                }
            ),
            Animated.timing(
                this.state.top, {
                    toValue: INITIAL_TOP,
                    duration: 300,
                    delay: 1000
                }
            )
        ]).start(() => {
            this.backgroundColor.setValue(0);
            this.setState({network: null});
        });
    };

    show = () => {
        Animated.timing(
            this.state.top, {
                toValue: NAVBAR,
                duration: 300
            }
        ).start();
    };

    render() {
        if (!this.state.network) {
            return null;
        }

        const background = this.backgroundColor.interpolate({
            inputRange: [0, 1],
            outputRange: ['#939393', '#629a41']
        });

        let i18nId;
        let defaultMessage;
        let action;
        switch (this.state.network) {
        case OFFLINE:
            i18nId = 'mobile.offlineIndicator.offline';
            defaultMessage = 'No internet connection';
            action = (
                <TouchableOpacity
                    onPress={this.connect}
                    style={[styles.actionContainer, styles.actionButton]}
                >
                    <IonIcon
                        color='#FFFFFF'
                        name='ios-refresh'
                        size={20}
                    />
                </TouchableOpacity>
            );
            break;
        case CONNECTING:
            i18nId = 'mobile.offlineIndicator.connecting';
            defaultMessage = 'Connecting...';
            action = (
                <View style={styles.actionContainer}>
                    <ActivityIndicator
                        color='#FFFFFF'
                        size='small'
                    />
                </View>
            );
            break;
        case CONNECTED:
            i18nId = 'mobile.offlineIndicator.connected';
            defaultMessage = 'Connected';
            action = (
                <View style={styles.actionContainer}>
                    <IonIcon
                        color='#FFFFFF'
                        name='md-checkmark'
                        size={20}
                    />
                </View>
            );
            break;
        }

        return (
            <Animated.View style={[styles.container, {top: this.state.top, backgroundColor: background}]}>
                <Animated.View style={styles.wrapper}>
                    <FormattedText
                        defaultMessage={defaultMessage}
                        id={i18nId}
                        style={styles.message}
                    />
                    {action}
                </Animated.View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: HEIGHT,
        width: '100%',
        zIndex: 9,
        position: 'absolute'
    },
    wrapper: {
        alignItems: 'center',
        flex: 1,
        height: HEIGHT,
        flexDirection: 'row',
        paddingLeft: 12,
        paddingRight: 5
    },
    message: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        flex: 1
    },
    actionButton: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFFFFF'
    },
    actionContainer: {
        alignItems: 'flex-end',
        height: 24,
        justifyContent: 'center',
        paddingRight: 10,
        width: 60
    }
});
