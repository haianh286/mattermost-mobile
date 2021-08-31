// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {NativeModules, useWindowDimensions} from 'react-native';

import {Device} from '@constants';

const {MattermostManaged} = NativeModules;
const isRunningInSplitView = MattermostManaged.isRunningInSplitView;

export function useSplitView() {
    const [isSplitView, setIsSplitView] = useState(false);
    const dimensions = useWindowDimensions();

    useEffect(() => {
        if (Device.IS_TABLET) {
            isRunningInSplitView().then((result: {isSplitView: boolean}) => {
                setIsSplitView(result.isSplitView);
            });
        }
    }, [dimensions]);

    return isSplitView;
}
