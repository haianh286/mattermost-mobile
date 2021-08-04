// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Relation} from '@nozbe/watermelondb';
import Model, {Associations} from '@nozbe/watermelondb/Model';

/**
 * PostsInChannel model helps us to combine adjacent posts together without leaving
 * gaps in between for an efficient user reading experience of posts.
 */
export default class PostsInChannelModel extends Model {
    /** table (name) : PostsInChannel */
    static table: string;

    /** associations : Describes every relationship to this table. */
    static associations: Associations;

    /** channel_id: Asociated channel identifier */
    channelId: string;

    /** earliest : The earliest timestamp of the post in that channel  */
    earliest: number;

    /** latest : The latest timestamp of the post in that channel  */
    latest: number;

    /** channel : The parent record of the channel for those posts */
    channel: Relation<ChannelModel>;
}
