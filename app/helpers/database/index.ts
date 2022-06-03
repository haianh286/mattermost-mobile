// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {General} from '@constants';

import type Model from '@nozbe/watermelondb/Model';
import type ChannelModel from '@typings/database/models/servers/channel';
import type MyChannelModel from '@typings/database/models/servers/my_channel';

type NotifyProps = {
    [key: string]: Partial<ChannelNotifyProps>;
}

/**
 * Filtering / Sorting:
 *
 * Unreads, Mentions, and Muted Mentions Only
 * Mentions on top, then unreads, then muted channels with mentions.
 */

 type FilterAndSortMyChannelsArgs = [
    MyChannelModel[],
    Record<string, ChannelModel>,
    NotifyProps,
]

export const extractRecordsForTable = <T>(records: Model[], tableName: string): T[] => {
    // @ts-expect-error constructor.table not exposed in type definition
    return records.filter((r) => r.constructor.table === tableName) as T[];
};

export function extractChannelDisplayName(raw: Pick<Channel, 'type' | 'display_name' | 'fake'>, record?: ChannelModel) {
    let displayName = '';
    switch (raw.type) {
        case General.DM_CHANNEL:
            displayName = raw.display_name.trim() || record?.displayName || '';
            break;
        case General.GM_CHANNEL: {
            if (raw.fake) {
                displayName = raw.display_name;
            } else {
                displayName = record?.displayName || raw.display_name;
            }
            break;
        }
        default:
            displayName = raw.display_name;
            break;
    }

    return displayName;
}

export const makeChannelsMap = (channels: ChannelModel[]) => {
    return channels.reduce<Record<string, ChannelModel>>((result, c) => {
        result[c.id] = c;
        return result;
    }, {});
};

export const filterAndSortMyChannels = ([myChannels, channels, notifyProps]: FilterAndSortMyChannelsArgs): ChannelModel[] => {
    const mentions: ChannelModel[] = [];
    const unreads: ChannelModel[] = [];
    const mutedMentions: ChannelModel[] = [];

    const isMuted = (id: string) => {
        return notifyProps[id]?.mark_unread === 'mention';
    };

    for (const myChannel of myChannels) {
        const id = myChannel.id;

        // is it a mention?
        if (!isMuted(id) && myChannel.mentionsCount > 0 && channels[id]) {
            mentions.push(channels[id]);
            continue;
        }

        // is it unread?
        if (!isMuted(myChannel.id) && myChannel.isUnread && channels[id]) {
            unreads.push(channels[id]);
            continue;
        }

        // is it a muted mention?
        if (isMuted(myChannel.id) && myChannel.mentionsCount > 0 && channels[id]) {
            mutedMentions.push(channels[id]);
            continue;
        }
    }

    return [...mentions, ...unreads, ...mutedMentions];
};
