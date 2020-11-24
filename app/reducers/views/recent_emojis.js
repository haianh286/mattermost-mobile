// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ViewTypes} from 'app/constants';

const MAXIMUM_RECENT_EMOJI = 27;

export default function recentEmojis(state = [], action) {
    switch (action.type) {
    case ViewTypes.ADD_RECENT_EMOJI: {
        const nextState = [...state];

        const index = nextState.indexOf(action.emoji);
        if (index !== -1) {
            nextState.splice(index, 1);
        }

        nextState.unshift(action.emoji);

        return nextState;
    }
    case ViewTypes.ADD_RECENT_EMOJI_ARRAY: {
        const nextRecentEmojis = action.emojis.reduce((currentState, emoji) => {
            return [...currentState.filter((currentEmoji) => currentEmoji !== emoji), emoji];
        }, state);
        if (nextRecentEmojis.length > MAXIMUM_RECENT_EMOJI) {
            nextRecentEmojis.splice(0, recentEmojis.length - MAXIMUM_RECENT_EMOJI);
        }
        return nextRecentEmojis;
    }

    default:
        return state;
    }
}