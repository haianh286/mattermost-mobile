// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import {Platform, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Navigation} from 'react-native-navigation';
import {SafeAreaView} from 'react-native-safe-area-context';

import DatabaseManager from '@database/manager';
import {queryServerByDisplayName} from '@queries/app/servers';
import Background from '@screens/background';
import {dismissModal} from '@screens/navigation';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';

import Form from './form';
import Header from './header';

import type ServersModel from '@typings/database/models/app/servers';

interface ServerProps {
    closeButtonId?: string;
    componentId: string;
    server: ServersModel;
    theme: Theme;
}

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => ({
    appInfo: {
        color: changeOpacity(theme.centerChannelColor, 0.56),
    },
    flex: {
        flex: 1,
    },
    scrollContainer: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
    },
}));

const EditServer = ({closeButtonId, componentId, server, theme}: ServerProps) => {
    const intl = useIntl();
    const keyboardAwareRef = useRef<KeyboardAwareScrollView>();
    const [saving, setSaving] = useState(false);
    const [displayName, setDisplayName] = useState<string>(server.displayName);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [displayNameError, setDisplayNameError] = useState<string | undefined>();
    const styles = getStyleSheet(theme);
    const {formatMessage} = intl;

    useEffect(() => {
        if (displayName && displayName !== server.displayName) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [displayName]);

    useEffect(() => {
        const navigationEvents = Navigation.events().registerNavigationButtonPressedListener(({buttonId}) => {
            if (closeButtonId && buttonId === closeButtonId) {
                dismissModal({componentId});
            }
        });

        return () => navigationEvents.remove();
    }, []);

    const handleUpdate = useCallback(async () => {
        if (buttonDisabled) {
            return;
        }

        if (displayNameError) {
            setDisplayNameError(undefined);
        }

        setSaving(true);
        const exists = await queryServerByDisplayName(DatabaseManager.appDatabase!.database, displayName);
        if (exists && exists.lastActiveAt > 0 && exists.url !== server.url) {
            setButtonDisabled(true);
            setDisplayNameError(formatMessage({
                id: 'mobile.server_name.exists',
                defaultMessage: 'You are using this name for another server.',
            }));
            setSaving(false);
            return;
        }

        await DatabaseManager.updateServerDisplayName(server.url, displayName);
        dismissModal({componentId});
    }, [buttonDisabled, displayName, displayNameError]);

    const handleDisplayNameTextChanged = useCallback((text: string) => {
        setDisplayName(text);
        setDisplayNameError(undefined);
    }, []);

    return (
        <View style={styles.flex}>
            <Background theme={theme}/>
            <SafeAreaView
                key={'server_content'}
                style={styles.flex}
                testID='select_server.screen'
            >
                <KeyboardAwareScrollView
                    bounces={false}
                    contentContainerStyle={styles.scrollContainer}
                    enableAutomaticScroll={Platform.OS === 'android'}
                    enableOnAndroid={false}
                    enableResetScrollToCoords={true}
                    extraScrollHeight={20}
                    keyboardDismissMode='on-drag'
                    keyboardShouldPersistTaps='handled'

                    // @ts-expect-error legacy ref
                    ref={keyboardAwareRef}
                    scrollToOverflowEnabled={true}
                    style={styles.flex}
                >
                    <Header theme={theme}/>
                    <Form
                        buttonDisabled={buttonDisabled}
                        connecting={saving}
                        displayName={displayName}
                        displayNameError={displayNameError}
                        handleUpdate={handleUpdate}
                        handleDisplayNameTextChanged={handleDisplayNameTextChanged}
                        keyboardAwareRef={keyboardAwareRef}
                        serverUrl={server.url}
                        theme={theme}
                    />
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </View>
    );
};

export default EditServer;
