// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {intlShape} from 'react-intl';
import {Keyboard} from 'react-native';

import {dismissAllModals, showModalOverCurrentContext} from '@actions/navigation';
import {loadChannelsByTeamName} from '@actions/views/channel';
import {selectFocusedPostId} from '@mm-redux/actions/posts';
import {getCurrentTeam} from '@mm-redux/selectors/entities/teams';
import {permalinkBadTeam} from '@utils/general';
import {changeOpacity} from '@utils/theme';

import type {DispatchFunc, GetStateFunc} from '@mm-redux/types/actions';

let showingPermalink = false;

export function showPermalink(intl: typeof intlShape, teamName: string, postId: string, openAsPermalink = true) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let name = teamName;
        if (!name) {
            name = getCurrentTeam(getState()).name;
        }

        const loadTeam = await dispatch(loadChannelsByTeamName(name, permalinkBadTeam.bind(null, intl)));

        if (!loadTeam.error) {
            Keyboard.dismiss();
            dispatch(selectFocusedPostId(postId));
            if (showingPermalink) {
                await dismissAllModals();
            }

            const screen = 'Permalink';
            const passProps = {
                isPermalink: openAsPermalink,
                teamName,
            };

            const options = {
                layout: {
                    componentBackgroundColor: changeOpacity('#000', 0.2),
                },
            };

            showingPermalink = true;
            showModalOverCurrentContext(screen, passProps, options);
        }

        return {};
    };
}

export function closePermalink() {
    return async (dispatch: DispatchFunc) => {
        showingPermalink = false;
        return dispatch(selectFocusedPostId(''));
    };
}
