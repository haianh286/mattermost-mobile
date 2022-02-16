// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post} from '@constants';
import {DEFAULT_LOCALE} from '@i18n';
import {displayUsername} from '@utils/user';

// groups: MM-41882 import type GroupModel from '@typings/database/models/servers/group';
import type PostModel from '@typings/database/models/servers/post';
import type UserModel from '@typings/database/models/servers/user';
import type {UserMentionKey} from '@typings/global/markdown';

export function areConsecutivePosts(post: PostModel, previousPost: PostModel) {
    let consecutive = false;

    if (post && previousPost) {
        const postFromWebhook = Boolean(post?.props?.from_webhook); // eslint-disable-line camelcase
        const prevPostFromWebhook = Boolean(previousPost?.props?.from_webhook); // eslint-disable-line camelcase
        const isFromSameUser = previousPost.userId === post.userId;
        const isNotSystemMessage = !isSystemMessage(post) && !isSystemMessage(previousPost);
        const isInTimeframe = (post.createAt - previousPost.createAt) <= Post.POST_COLLAPSE_TIMEOUT;

        // Were the last post and this post made by the same user within some time?
        consecutive = previousPost && isFromSameUser && isInTimeframe && !postFromWebhook &&
        !prevPostFromWebhook && isNotSystemMessage;
    }

    return consecutive;
}

export function isFromWebhook(post: PostModel | Post): boolean {
    return post.props && post.props.from_webhook === 'true';
}

export function isEdited(post: PostModel): boolean {
    return post.editAt > 0;
}

export function isPostEphemeral(post: PostModel): boolean {
    return post.type === Post.POST_TYPES.EPHEMERAL || post.type === Post.POST_TYPES.EPHEMERAL_ADD_TO_CHANNEL || post.deleteAt > 0;
}

export function isPostPendingOrFailed(post: PostModel): boolean {
    return post.pendingPostId === post.id || post.props?.failed;
}

export function isSystemMessage(post: PostModel | Post): boolean {
    return Boolean(post.type && post.type?.startsWith(Post.POST_TYPES.SYSTEM_MESSAGE_PREFIX));
}

export function fromAutoResponder(post: PostModel): boolean {
    return Boolean(post.type && (post.type === Post.POST_TYPES.SYSTEM_AUTO_RESPONDER));
}

export function postUserDisplayName(post: PostModel, author?: UserModel, teammateNameDisplay?: string, enablePostUsernameOverride = false) {
    if (isFromWebhook(post) && post.props?.override_username && enablePostUsernameOverride) {
        return post.props.override_username;
    }

    return displayUsername(author, author?.locale || DEFAULT_LOCALE, teammateNameDisplay, true);
}

// groups: MM-41882 export const getMentionKeysForPost = (user: UserModel, post: PostModel, groups: GroupModel[] | null) => {
export const getMentionKeysForPost = (user: UserModel) => {
    const keys: UserMentionKey[] = user.mentionKeys;

    // groups: MM-41882 if (groups?.length) {
    // groups: MM-41882     for (const group of groups) {
    // groups: MM-41882         if (group.name && group.name.trim()) {
    // groups: MM-41882             keys.push({key: `@${group.name}`});
    // groups: MM-41882         }
    // groups: MM-41882     }
    // groups: MM-41882 }

    return keys;
};

export function shouldIgnorePost(post: Post): boolean {
    return Post.IGNORE_POST_TYPES.includes(post.type);
}

export const sortPostsByNewest = (posts: PostModel[]) => {
    return posts.sort((a, b) => {
        if (a.createAt > b.createAt) {
            return 1;
        }

        return -1;
    });
};
