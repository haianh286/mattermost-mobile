// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';

import {MAX_FILE_COUNT} from '@constants/files';

import CameraAction from './camera_quick_action';
import FileAction from './file_quick_action';
import ImageAction from './image_quick_action';
import InputAction from './input_quick_action';

type Props = {
    testID?: string;
    canUploadFiles: boolean;
    fileCount: number;

    // Draft Handler
    value: string;
    updateValue: (value: string) => void;
    addFiles: (file: FileInfo[]) => void;
    focus: () => void;
}

const style = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: Platform.select({
            ios: 1,
            android: 2,
        }),
    },
    quickActionsContainer: {
        display: 'flex',
        flexDirection: 'row',
        height: 44,
    },
});

export default function QuickActions({
    testID,
    canUploadFiles,
    value,
    fileCount,
    updateValue,
    addFiles,
    focus,
}: Props) {
    const atDisabled = value[value.length - 1] === '@';
    const slashDisabled = value.length > 0;

    const atInputActionTestID = `${testID}.at_input_action`;
    const slashInputActionTestID = `${testID}.slash_input_action`;
    const fileActionTestID = `${testID}.file_action`;
    const imageActionTestID = `${testID}.image_action`;
    const cameraActionTestID = `${testID}.camera_action`;

    const uploadProps = {
        disabled: !canUploadFiles,
        fileCount,
        maxFilesReached: fileCount >= MAX_FILE_COUNT,
        onUploadFiles: addFiles,
    };

    return (
        <View
            testID={testID}
            style={style.quickActionsContainer}
        >
            <InputAction
                testID={atInputActionTestID}
                disabled={atDisabled}
                inputType='at'
                updateValue={updateValue}
                focus={focus}
            />
            <InputAction
                testID={slashInputActionTestID}
                disabled={slashDisabled}
                inputType='slash'
                updateValue={updateValue}
                focus={focus}
            />
            <FileAction
                testID={fileActionTestID}
                {...uploadProps}
            />
            <ImageAction
                testID={imageActionTestID}
                {...uploadProps}
            />
            <CameraAction
                testID={cameraActionTestID}
                {...uploadProps}
            />
        </View>
    );
}
