// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import {BackHandler, DeviceEventEmitter, NativeEventSubscription, StyleSheet, View} from 'react-native';
import {KeyboardTrackingViewRef} from 'react-native-keyboard-tracking-view';
import {Edge, SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import CurrentCallBar from '@app/products/calls/components/current_call_bar';
import FloatingCallContainer from '@app/products/calls/components/floating_call_container';
import JoinCallBanner from '@app/products/calls/components/join_call_banner';
import FreezeScreen from '@components/freeze_screen';
import PostDraft from '@components/post_draft';
import {Events} from '@constants';
import {ACCESSORIES_CONTAINER_NATIVE_ID} from '@constants/post_draft';
import {useAppState, useIsTablet} from '@hooks/device';
import {useDefaultHeaderHeight} from '@hooks/header';
import {useTeamSwitch} from '@hooks/team_switch';
import {popTopScreen} from '@screens/navigation';
import EphemeralStore from '@store/ephemeral_store';
import NavigationStore from '@store/navigation_store';

import ChannelPostList from './channel_post_list';
import ChannelHeader from './header';

type ChannelProps = {
    serverUrl: string;
    channelId: string;
    componentId?: string;
    isCallsPluginEnabled: boolean;
    isCallInCurrentChannel: boolean;
    isInCall: boolean;
};

const edges: Edge[] = ['left', 'right'];

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
});

const Channel = ({serverUrl, channelId, componentId, isCallsPluginEnabled, isCallInCurrentChannel, isInCall}: ChannelProps) => {
    const appState = useAppState();
    const isTablet = useIsTablet();
    const insets = useSafeAreaInsets();
    const [shouldRenderPosts, setShouldRenderPosts] = useState(false);
    const switchingTeam = useTeamSwitch();
    const defaultHeight = useDefaultHeaderHeight();
    const postDraftRef = useRef<KeyboardTrackingViewRef>(null);

    useEffect(() => {
        const listener = DeviceEventEmitter.addListener(Events.PAUSE_KEYBOARD_TRACKING_VIEW, (pause: boolean) => {
            if (pause) {
                postDraftRef.current?.pauseTracking(channelId);
                return;
            }

            postDraftRef.current?.resumeTracking(channelId);
        });

        return () => listener.remove();
    }, []);

    useEffect(() => {
        let back: NativeEventSubscription|undefined;
        if (!isTablet && componentId) {
            back = BackHandler.addEventListener('hardwareBackPress', () => {
                if (NavigationStore.getNavigationTopComponentId() === componentId) {
                    popTopScreen(componentId);
                    return true;
                }

                return false;
            });
        }

        return () => back?.remove();
    }, [componentId, isTablet]);

    const marginTop = defaultHeight + (isTablet ? insets.top : 0);
    useEffect(() => {
        // This is done so that the header renders
        // and the screen does not look totally blank
        const raf = requestAnimationFrame(() => {
            setShouldRenderPosts(Boolean(channelId));
        });

        // This is done to give time to the WS event
        const t = setTimeout(() => {
            EphemeralStore.removeSwitchingToChannel(channelId);
        }, 500);

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(t);
            EphemeralStore.removeSwitchingToChannel(channelId);
        };
    }, [channelId]);

    let callsComponents: JSX.Element | null = null;
    if (isCallsPluginEnabled && (isCallInCurrentChannel || isInCall)) {
        callsComponents = (
            <FloatingCallContainer>
                {isCallInCurrentChannel &&
                    <JoinCallBanner
                        serverUrl={serverUrl}
                        channelId={channelId}
                    />
                }
                {isInCall && <CurrentCallBar/>}
            </FloatingCallContainer>
        );
    }

    return (
        <FreezeScreen>
            <SafeAreaView
                style={styles.flex}
                mode='margin'
                edges={edges}
                testID='channel.screen'
            >
                <ChannelHeader componentId={componentId}/>
                {!switchingTeam && shouldRenderPosts && Boolean(channelId) &&
                <>
                    <View style={[styles.flex, {marginTop}]}>
                        <ChannelPostList
                            channelId={channelId}
                            forceQueryAfterAppState={appState}
                            nativeID={channelId}
                        />
                    </View>
                    <PostDraft
                        channelId={channelId}
                        keyboardTracker={postDraftRef}
                        scrollViewNativeID={channelId}
                        accessoriesContainerID={ACCESSORIES_CONTAINER_NATIVE_ID}
                        testID='channel.post_draft'
                    />
                </>
                }
                {callsComponents}
            </SafeAreaView>
        </FreezeScreen>
    );
};

export default Channel;
