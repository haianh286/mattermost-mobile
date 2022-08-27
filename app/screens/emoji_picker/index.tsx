// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useRef} from 'react';
import {View, Keyboard, StyleSheet} from 'react-native';
import RNBottomSheet from 'reanimated-bottom-sheet';

import {Device, Screens} from '@app/constants';
import EmojiPicker from '@components/emoji_picker';
import useNavButtonPressed from '@hooks/navigation_button_pressed';
import {dismissBottomSheet, dismissModal, setButtons} from '@screens/navigation';

import BottomSheet, {CONTAINER_PADDING_HORIZONTAL} from '../bottom_sheet';

const styles = StyleSheet.create({
    container: {
        flex: 1, paddingHorizontal: CONTAINER_PADDING_HORIZONTAL,
    },
});

type Props = {
    componentId: string;
    onEmojiPress: (emoji: string) => void;
    closeButton: never;
};

const EMOJI_PICKER_BUTTON = 'close-add-reaction';
const INITIAL_SNAP_INDEX = 1;

const EmojiPickerScreen = ({closeButton, componentId, onEmojiPress}: Props) => {
    const bottomSheetRef = useRef<RNBottomSheet>(null);

    useEffect(() => {
        setButtons(componentId, {
            leftButtons: [
                {
                    icon: closeButton,
                    id: EMOJI_PICKER_BUTTON,
                    testID: 'close.emoji_picker.button',
                },
            ],
            rightButtons: [],
        });
    }, []);

    const close = async () => {
        Keyboard.dismiss();
        if (Device.IS_TABLET) {
            dismissModal({componentId});
        } else {
            await dismissBottomSheet(Screens.EMOJI_PICKER);
        }
    };

    useNavButtonPressed(EMOJI_PICKER_BUTTON, componentId, close, []);

    const handleEmojiPress = useCallback((emoji: string) => {
        onEmojiPress(emoji);
        close();
    }, []);

    const onSearchFocus = useCallback(() => {
        if (!Device.IS_TABLET) {
            bottomSheetRef?.current?.snapTo(0);
        }
    }, []);

    const renderContent = useCallback(() => {
        return (
            <EmojiPicker
                onEmojiPress={handleEmojiPress}
                onSearchFocus={onSearchFocus}
                testID='emoji_picker'
            />
        );
    }, []);

    if (Device.IS_TABLET) {
        return (
            <View style={styles.container}>
                {renderContent()}
            </View>
        );
    }

    return (
        <BottomSheet
            ref={bottomSheetRef}
            closeButtonId='close-emoji-picker'
            componentId={Screens.EMOJI_PICKER}
            initialSnapIndex={INITIAL_SNAP_INDEX}
            renderContent={renderContent}
            testID='emoji_picker'
        />
    );
};

export default EmojiPickerScreen;
