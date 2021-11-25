// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Query, Relation} from '@nozbe/watermelondb';
import Model, {Associations} from '@nozbe/watermelondb/Model';

/**
 * The Post model is the building block of communication in the Mattermost app.
 */
export default class PostModel extends Model {
    /** table (name) : Post */
    static table: string;

    /** associations : Describes every relationship to this table. */
    static associations: Associations;

    /** channel_id : The foreign key for the Channel to which this post belongs to. */
    channelId: string;

    /** create_at : The timestamp to when this post was first created */
    createAt: number;

    /** delete_at : The timestamp to when this post was last archived/deleted */
    deleteAt: number;

    /** update_at : The timestamp to when this post was last updated on the server */
    updateAt!: number;

    /** edit_at : The timestamp to when this post was last edited */
    editAt: number;

    /** is_pinned : A Boolean flag indicating if this Post is pinned */
    isPinned: boolean;

    /** message : Message in the post */
    message: string;

    /** metadata: All the extra data associated with this Post */
    metadata: PostMetadata | null;

    /** original_id : Any post will have this value empty unless it is updated */
    originalId: string;

    /** pending_post_id : The id given to a post before it is published on the server */
    pendingPostId: string;

    /** previous_post_id : Id of the previous post.  If this value is empty, this implies that it is not in the db and we will request it from server */
    previousPostId: string;

    root: Query<PostModel>;

    /** root_id : Used in threads. All posts under a thread will have this id in common */
    rootId: string;

    /** type : Type of props (e.g. system message) */
    type: string;

    /** user_id : The foreign key of the User who authored this post. */
    userId: string;

    /** failed: Whether the post has failed */
    failed: boolean;

    /** props : Additional attributes for this props */
    props: any;

    /** drafts  : Every drafts associated with this Post */
    drafts: Query<DraftModel>;

    /** files: All the files associated with this Post */
    files: Query<FileModel>;

    /** postsInThread: Every posts associated to a thread */
    postsInThread: Query<PostInThreadModel>;

    /** reactions: All the reactions associated with this Post */
    reactions: Query<ReactionModel>;

    /** author: The author of this Post */
    author: Relation<UserModel>;

    /** channel: The channel which is presenting this Post */
    channel: Relation<ChannelModel>;
}
