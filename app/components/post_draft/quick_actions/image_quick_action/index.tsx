// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';
import {Alert, StyleSheet} from 'react-native';

import CompassIcon from '@components/compass_icon';
import TouchableWithFeedback from '@components/touchable_with_feedback';
import {MAX_FILE_COUNT} from '@constants/files';
import {ICON_SIZE} from '@constants/post_draft';
import {useTheme} from '@context/theme';
import {fileMaxWarning} from '@utils/file';
import PickerUtil from '@utils/file/file_picker';
import {changeOpacity} from '@utils/theme';

import type {QuickActionAttachmentProps} from '@typings/components/post_draft_quick_action';

const style = StyleSheet.create({
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
});

export default function ImageQuickAction({
    disabled,
    fileCount = 0,
    onUploadFiles,
    maxFilesReached,
    testID = '',
}: QuickActionAttachmentProps) {
    const intl = useIntl();
    const theme = useTheme();

    const handleButtonPress = useCallback(() => {
        if (maxFilesReached) {
            Alert.alert(
                intl.formatMessage({
                    id: 'mobile.link.error.title',
                    defaultMessage: 'Error',
                }),
                fileMaxWarning(intl),
            );
            return;
        }

        const picker = new PickerUtil(intl,
            onUploadFiles);

        picker.attachFileFromPhotoGallery(MAX_FILE_COUNT - fileCount);
    }, [onUploadFiles, fileCount]);

    const actionTestID = disabled ? `${testID}.disabled` : testID;
    const color = disabled ? changeOpacity(theme.centerChannelColor, 0.16) : changeOpacity(theme.centerChannelColor, 0.64);

    return (
        <TouchableWithFeedback
            testID={actionTestID}
            disabled={disabled}
            onPress={handleButtonPress}
            style={style.icon}
            type={'opacity'}
        >
            <CompassIcon
                color={color}
                name='image-outline'
                size={ICON_SIZE}
            />
        </TouchableWithFeedback>
    );
}

