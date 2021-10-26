// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useManagedConfig, ManagedConfig} from '@mattermost/react-native-emm';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import {
    EventSubscription, Keyboard, KeyboardAvoidingView,
    Platform, StatusBar, StatusBarStyle, StyleSheet, TextInput, TouchableWithoutFeedback, View,
} from 'react-native';
import Button from 'react-native-button';
import {Navigation, NavigationFunctionComponent} from 'react-native-navigation';
import {ActivityIndicator, HelperText, TextInput as PaperTextInput} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import tinyColor from 'tinycolor2';

import {doPing} from '@actions/remote/general';
import {fetchConfigAndLicense} from '@actions/remote/systems';
import LocalConfig from '@assets/config.json';
import AppVersion from '@components/app_version';
import CompassIcon from '@components/compass_icon';
import ErrorText from '@components/error_text';
import FloatingTextInput from '@components/floating_text_input_label';
import FormattedText from '@components/formatted_text';
import {Screens} from '@constants';
import NetworkManager from '@init/network_manager';
import {goToScreen} from '@screens/navigation';
import {DeepLinkWithData, LaunchProps, LaunchType} from '@typings/launch';
import {isMinimumServerVersion} from '@utils/helpers';
import {preventDoubleTap} from '@utils/tap';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {getServerUrlAfterRedirect, isValidUrl, sanitizeUrl} from '@utils/url';

import ServerSvg from './background_svg';

import type ClientError from '@client/rest/error';

interface ServerProps extends LaunchProps {
    componentId: string;
    theme: Theme;
}

let cancelPing: undefined | (() => void);

const Server: NavigationFunctionComponent = ({componentId, extra, launchType, launchError, theme}: ServerProps) => {
    // TODO: If we have LaunchProps, ensure they get passed along to subsequent screens
    // so that they are eventually accessible in the Channel screen.

    const intl = useIntl();
    const managedConfig = useManagedConfig<ManagedConfig>();
    const input = useRef<TextInput>(null);
    const [connecting, setConnecting] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const initialError = launchError && launchType === LaunchType.Notification ? intl.formatMessage({
        id: 'mobile.launchError.notification',
        defaultMessage: 'Did not find a server for this notification',
    }) : undefined;
    const [error, setError] = useState<Partial<ClientErrorProps>|string|undefined>(initialError);

    const [url, setUrl] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [urlError, setUrlError] = useState<string | undefined>();
    const styles = getStyleSheet(theme);
    const {formatMessage} = intl;

    const displayLogin = (serverUrl: string, config: ClientConfig, license: ClientLicense) => {
        const samlEnabled = config.EnableSaml === 'true' && license.IsLicensed === 'true' && license.SAML === 'true';
        const gitlabEnabled = config.EnableSignUpWithGitLab === 'true';
        const googleEnabled = config.EnableSignUpWithGoogle === 'true' && license.IsLicensed === 'true';
        const o365Enabled = config.EnableSignUpWithOffice365 === 'true' && license.IsLicensed === 'true' && license.Office365OAuth === 'true';
        const openIdEnabled = config.EnableSignUpWithOpenId === 'true' && license.IsLicensed === 'true' && isMinimumServerVersion(config.Version, 5, 33, 0);

        let screen = Screens.LOGIN;
        let title = formatMessage({id: 'mobile.routes.login', defaultMessage: 'Login'});
        if (samlEnabled || gitlabEnabled || googleEnabled || o365Enabled || openIdEnabled) {
            screen = Screens.LOGIN_OPTIONS;
            title = formatMessage({id: 'mobile.routes.loginOptions', defaultMessage: 'Login Chooser'});
        }

        const {allowOtherServers} = managedConfig;
        let visible = !LocalConfig.AutoSelectServerUrl;

        if (allowOtherServers === 'false') {
            visible = false;
        }

        const passProps = {
            config,
            extra,
            launchError,
            launchType,
            license,
            theme,
            serverUrl,
        };

        const defaultOptions = {
            popGesture: visible,
            topBar: {
                visible,
                height: visible ? null : 0,
            },
        };

        goToScreen(screen, title, passProps, defaultOptions);
        setConnecting(false);
        setUrl(serverUrl);
    };

    const defaultServerUrlMessage = (intl.formatMessage({
        id: 'mobile.server_url.empty',
        defaultMessage: 'Please enter a valid server URL',
    }));

    const serverLabelText = formatMessage({
        id: 'mobile.components.select_server_view.enterServerUrl',
        defaultMessage: 'Enter Server URL',
    });

    const displayNameLabelText = formatMessage({
        id: 'mobile.components.select_server_view.displayName',
        defaultMessage: 'Display Name',
    });

    const displayNameHelperText = formatMessage({
        id: 'mobile.components.select_server_view.displayHelp',
        defaultMessage: 'Choose a display name for the server in your sidebar',
    });

    const handleConnect = preventDoubleTap((manualUrl?: string) => {
        if (connecting && cancelPing) {
            cancelPing();
            return;
        }

        let serverUrl = typeof manualUrl === 'string' ? manualUrl : url;
        if (!serverUrl || serverUrl.trim() === '') {
            setUrlError(defaultServerUrlMessage);
            return;
        }

        serverUrl = sanitizeUrl(serverUrl);
        if (!isValidUrl(serverUrl)) {
            setUrlError(formatMessage({
                id: 'mobile.server_url.invalid_format',
                defaultMessage: 'URL must start with http:// or https://',
            }));

            return;
        }

        pingServer(serverUrl);
    });

    const pingServer = async (pingUrl: string, retryWithHttp = true) => {
        let canceled = false;
        setConnecting(true);
        cancelPing = () => {
            // We should not need this once we have the cancelable network-client library
            canceled = true;
            setConnecting(false);
            cancelPing = undefined;
        };

        const serverUrl = await getServerUrlAfterRedirect(pingUrl, !retryWithHttp);
        const result = await doPing(serverUrl);

        if (canceled) {
            return;
        }

        if (result.error) {
            if (retryWithHttp) {
                const nurl = serverUrl.replace('https:', 'http:');
                pingServer(nurl, false);
            } else {
                setError(result.error as ClientError);
                setConnecting(false);
            }
            setUrlError(defaultServerUrlMessage);
            setButtonDisabled(true);
            return;
        }

        const data = await fetchConfigAndLicense(serverUrl);
        if (data.error) {
            setUrlError(defaultServerUrlMessage);
            setButtonDisabled(true);
            setError(data.error as ClientError);
            setConnecting(false);
            return;
        }

        displayLogin(serverUrl, data.config!, data.license!);
    };

    const blur = useCallback(() => {
        input.current?.blur();
    }, []);

    useEffect(() => {
        if (url && displayName) {
            setButtonDisabled(false);
            return;
        }
        setButtonDisabled(true);
    }, [url, displayName]);

    const handleUrlTextChanged = useCallback((text: string) => {
        setUrlError('');
        setUrl(text);
    }, []);

    const handleDisplayNameTextChanged = useCallback((text: string) => {
        setUrlError('');
        setDisplayName(text);
    }, []);

    useEffect(() => {
        let listener: EventSubscription;
        if (Platform.OS === 'android') {
            listener = Keyboard.addListener('keyboardDidHide', blur);
        }

        return () => listener?.remove();
    }, []);

    useEffect(() => {
        let serverUrl = managedConfig?.serverUrl || LocalConfig.DefaultServerUrl;
        let autoconnect = managedConfig?.allowOtherServers === 'false' || LocalConfig.AutoSelectServerUrl;

        if (launchType === LaunchType.DeepLink) {
            const deepLinkServerUrl = (extra as DeepLinkWithData).data?.serverUrl;
            if (managedConfig) {
                autoconnect = (managedConfig.allowOtherServers === 'false' && managedConfig.serverUrl === deepLinkServerUrl);
                if (managedConfig.serverUrl !== deepLinkServerUrl || launchError) {
                    setError(intl.formatMessage({
                        id: 'mobile.server_url.deeplink.emm.denied',
                        defaultMessage: 'This app is controlled by an EMM and the DeepLink server url does not match the EMM allowed server',
                    }));
                }
            } else {
                autoconnect = true;
                serverUrl = deepLinkServerUrl;
            }
        }

        if (serverUrl) {
            // If a server Url is set by the managed or local configuration, use it.
            setUrl(serverUrl);

            if (autoconnect) {
                // If no other servers are allowed or the local config for AutoSelectServerUrl is set, attempt to connect
                handleConnect(managedConfig?.serverUrl || LocalConfig.DefaultServerUrl);
            }
        }
    }, []);

    useEffect(() => {
        const listener = {
            componentDidAppear: () => {
                if (url) {
                    NetworkManager.invalidateClient(url);
                }
            },
        };
        const unsubscribe = Navigation.events().registerComponentListener(listener, componentId);

        return () => unsubscribe.remove();
    }, [componentId, url]);

    let buttonIcon;
    let id: string;
    let defaultMessage: string;
    let buttonTextStyle = styles.connectButtonText;

    const buttonStyle = [styles.connectButton];
    if (connecting) {
        buttonStyle.push(styles.buttonEnabled);
        buttonIcon = (
            <ActivityIndicator
                animating={true}
                size='small'
                color={Colors.white}
                style={styles.connectingIndicator}
            />
        );
        id = 'mobile.components.select_server_view.connecting';
        defaultMessage = 'Connecting';
    } else {
        if (buttonDisabled) {
            buttonStyle.push(styles.buttonDisabled);
            buttonTextStyle = styles.connectInvalidText;
        } else {
            buttonStyle.push(styles.buttonEnabled);
        }
        id = 'mobile.components.select_server_view.connect';
        defaultMessage = 'Connect';
    }

    const buttonText = (
        <FormattedText
            id={id}
            defaultMessage={defaultMessage}
            style={buttonTextStyle}
        />
    );

    const statusColor = tinyColor(theme.centerChannelBg);
    const inputDisabled = managedConfig.allowOtherServers === 'false' || connecting;
    let barStyle: StatusBarStyle = 'light-content';
    if (Platform.OS === 'ios' && statusColor.isLight()) {
        barStyle = 'dark-content';
    }

    const inputStyle = [styles.inputBox];
    if (inputDisabled) {
        inputStyle.push(styles.disabledInput);
    }

    const inputTheme = (type: string) => {
        let primary: string;
        let placeholder: string;
        if (type === 'url' && urlError) {
            primary = theme.errorTextColor;
            placeholder = theme.errorTextColor;
        } else {
            primary = theme.buttonBg;
            placeholder = changeOpacity(theme.centerChannelColor, 0.64);
        }
        return {
            colors:
            {
                primary,
                placeholder,
                text: theme.centerChannelColor,
            }}
        ;
    };

    return (
        <SafeAreaView
            testID='select_server.screen'
            style={styles.container}
        >
            <View style={styles.serverSvg}>
                <ServerSvg/>
            </View>
            <KeyboardAvoidingView
                behavior='padding'
                style={styles.flex}
                keyboardVerticalOffset={0}
                enabled={Platform.OS === 'ios'}
            >
                <StatusBar barStyle={barStyle}/>
                <TouchableWithoutFeedback
                    onPress={blur}
                    accessible={false}
                >
                    <View style={styles.formContainer}>
                        <FormattedText
                            style={styles.welcomeText}
                            id='mobile.components.select_server_view.msg_welcome'
                            defaultMessage='Welcome'
                        />
                        <FormattedText
                            style={styles.connectText}
                            id='mobile.components.select_server_view.msg_connect'
                            defaultMessage='Let’s Connect to a Server'
                        />
                        <FormattedText
                            style={styles.descriptionText}
                            id='mobile.components.select_server_view.msg_description'
                            defaultMessage="A Server is your team's communication hub which is accessed through a unique URL"
                        />
                        <FloatingTextInput
                            value={url}
                            editable={!inputDisabled}
                            label={serverLabelText}
                            theme={theme}

                            onChangeText={handleUrlTextChanged}

                            // errorIcon={'alert-outline'}
                            // error={'jaosn'}
                            //  error={(Boolean(urlError) && 'jason') || undefined}
                        />
                        {Boolean(urlError) &&
                            <HelperText
                                type='error'
                                style={styles.urlHelper}
                            >
                                <CompassIcon
                                    name='alert-outline'
                                />
                                {' ' + urlError}
                            </HelperText>
                        }
                        <PaperTextInput
                            mode='outlined'
                            testID='select_server.server_display_name.input'
                            ref={input}
                            value={displayName}
                            editable={!inputDisabled}
                            onChangeText={handleDisplayNameTextChanged}
                            onSubmitEditing={handleConnect}
                            style={StyleSheet.flatten([inputStyle, styles.inputBoxDisplayName])}
                            autoCapitalize='none'
                            autoCorrect={false}
                            label={displayNameLabelText}
                            theme={inputTheme('displayName')}
                            returnKeyType='go'
                            underlineColorAndroid='transparent'
                            disableFullscreenUI={true}
                        />
                        <HelperText
                            type='info'
                            style={styles.displayNameHelper}
                        >
                            {displayNameHelperText}
                        </HelperText>
                        <Button
                            disabled={buttonDisabled}
                            testID='select_server.connect.button'
                            onPress={handleConnect}
                            containerStyle={buttonStyle}
                        >
                            {buttonIcon}
                            {buttonText}
                        </Button>
                        {Boolean(error) &&
                            <ErrorText
                                testID='select_server.error.text'
                                error={error!}
                                theme={theme}
                            />
                        }
                    </View>
                </TouchableWithoutFeedback>
                <AppVersion textStyle={styles.appInfo}/>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => ({
    appInfo: {
        color: theme.centerChannelColor,
    },
    container: {
        flex: 1,
        backgroundColor: theme.centerChannelBg,
    },
    flex: {
        flex: 1,
    },
    serverSvg: {
        position: 'absolute',
    },
    formContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
        paddingRight: 24,
        paddingLeft: 24,
    },
    disabledInput: {
        backgroundColor: changeOpacity(theme.centerChannelColor, 0.1),
    },
    buttonEnabled: {
        backgroundColor: theme.buttonBg,
    },
    connectButton: {
        backgroundColor: changeOpacity(theme.centerChannelColor, 0.08),
        flex: 0,
        borderRadius: 4,
        alignItems: 'center',
        alignSelf: 'stretch',
        marginTop: 32,
        padding: 15,
    },
    connectingIndicator: {
        marginRight: 10,
    },
    inputBox: {
        fontSize: 16,
        height: 48,
        flex: 0,
        alignSelf: 'stretch',
        backgroundColor: Colors.white,
    },
    inputBoxDisplayName: {
        marginTop: 20,
        marginBottom: 0,
    },
    inputBoxServerUrl: {
        marginTop: 20,
        marginBottom: 0,
    },
    welcomeText: {
        width: 374,
        height: 28,
        fontSize: 20,
        lineHeight: 28,
        alignItems: 'center',
        flex: 0,
        alignSelf: 'stretch',
        marginTop: 12,
        marginBottom: 0,
        fontWeight: '600',
        fontFamily: 'Metropolis',
        color: changeOpacity(theme.centerChannelColor, 0.64),
    },
    connectText: {
        width: 270,
        height: 96,
        fontFamily: 'Metropolis',
        fontSize: 40,
        lineHeight: 48,
        alignItems: 'center',
        letterSpacing: -1,
        flex: 0,
        alignSelf: 'stretch',
        color: theme.buttonBg,
        marginTop: 12,
        marginBottom: 0,
        marginRight: 20,
        marginLeft: 0,
        paddingLeft: 0,
        flexGrow: 0,
        fontWeight: '600',
        display: 'flex',
    },
    descriptionText: {
        width: 374,
        height: 48,
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 16,
        lineHeight: 24,
        alignItems: 'center',
        flex: 0,
        alignSelf: 'stretch',
        marginTop: 12,
        marginBottom: 0,
        marginRight: 20,
        color: changeOpacity(theme.centerChannelColor, 0.64),
    },
    displayNameHelper: {
        width: 374,
        marginTop: 4,
        marginBottom: 0,
        paddingLeft: 0,
        flex: 0,
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 12,
        alignItems: 'center',
        alignSelf: 'stretch',
        color: changeOpacity(theme.centerChannelColor, 0.64),
    },
    urlHelper: {
        width: 374,
        marginTop: 4,
        marginBottom: 0,
        padding: 0,
        flex: 0,
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 12,
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    connectButtonText: {
        textAlign: 'center',
        color: Colors.white,
        fontSize: 17,
    },
    connectInvalidText: {
        textAlign: 'center',
        color: changeOpacity(theme.centerChannelColor, 0.32),
        fontSize: 17,
    },
}));

export default Server;
