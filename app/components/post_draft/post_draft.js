// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Platform} from 'react-native';
import {KeyboardTrackingView} from 'react-native-keyboard-tracking-view';

import {UPDATE_NATIVE_SCROLLVIEW} from '@constants/post_draft';
import EventEmitter from '@mm-redux/utils/event_emitter';

import Archived from './archived';
import DraftInput from './draft_input';
import ReadOnly from './read_only';

export default class PostDraft extends PureComponent {
    static propTypes = {
        accessoriesContainerID: PropTypes.string,
        canPost: PropTypes.bool.isRequired,
        channelId: PropTypes.string.isRequired,
        channelIsArchived: PropTypes.bool,
        channelIsReadOnly: PropTypes.bool.isRequired,
        cursorPositionEvent: PropTypes.string,
        deactivatedChannel: PropTypes.bool.isRequired,
        registerTypingAnimation: PropTypes.func.isRequired,
        rootId: PropTypes.string,
        screenId: PropTypes.string.isRequired,
        scrollViewNativeID: PropTypes.string,
        valueEvent: PropTypes.string,
        theme: PropTypes.object.isRequired,
    };

    draftInput = React.createRef();
    keyboardTracker = React.createRef();

    componentDidMount() {
        EventEmitter.on(UPDATE_NATIVE_SCROLLVIEW, this.updateNativeScrollView);
    }

    componentWillUnmount() {
        EventEmitter.off(UPDATE_NATIVE_SCROLLVIEW, this.updateNativeScrollView);
    }

    handleInputQuickAction = (value) => {
        if (this.draftInput?.current) {
            this.draftInput.current.handleInputQuickAction(value);
        }
    };

    updateNativeScrollView = (scrollViewNativeID) => {
        if (this.keyboardTracker?.current) {
            this.keyboardTracker.current.resetScrollView(scrollViewNativeID);
        }
    };

    render = () => {
        const {
            accessoriesContainerID,
            canPost,
            channelId,
            channelIsArchived,
            channelIsReadOnly,
            cursorPositionEvent,
            deactivatedChannel,
            registerTypingAnimation,
            rootId,
            screenId,
            scrollViewNativeID,
            theme,
            valueEvent,
        } = this.props;

        if (channelIsArchived || deactivatedChannel) {
            return (
                <Archived
                    defactivated={deactivatedChannel}
                    rootId={rootId}
                    theme={theme}
                />
            );
        }

        const readonly = channelIsReadOnly || !canPost;

        if (readonly) {
            return (
                <ReadOnly theme={theme}/>
            );
        }

        const draftInput = (
            <DraftInput
                ref={this.draftInput}
                channelId={channelId}
                cursorPositionEvent={cursorPositionEvent}
                registerTypingAnimation={registerTypingAnimation}
                rootId={rootId}
                screenId={screenId}
                theme={theme}
                valueEvent={valueEvent}
            />
        );

        if (Platform.OS === 'android') {
            return draftInput;
        }

        return (
            <KeyboardTrackingView
                accessoriesContainerID={accessoriesContainerID}
                ref={this.keyboardTracker}
                scrollViewNativeID={scrollViewNativeID}
            >
                {draftInput}
            </KeyboardTrackingView>
        );
    };
}
