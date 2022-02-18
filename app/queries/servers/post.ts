// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Database, Model, Q, Query, Relation} from '@nozbe/watermelondb';

import {MM_TABLES} from '@constants/database';

import type PostModel from '@typings/database/models/servers/post';
import type PostInChannelModel from '@typings/database/models/servers/posts_in_channel';
import type PostsInThreadModel from '@typings/database/models/servers/posts_in_thread';

const {SERVER: {POST, POSTS_IN_CHANNEL, POSTS_IN_THREAD}} = MM_TABLES;

export const prepareDeletePost = async (post: PostModel): Promise<Model[]> => {
    const preparedModels: Model[] = [post.prepareDestroyPermanently()];
    const relations: Array<Relation<Model> | Query<Model>> = [post.drafts, post.postsInThread];
    for await (const relation of relations) {
        try {
            const model = await relation.fetch();
            if (model) {
                if (Array.isArray(model)) {
                    model.forEach((m) => preparedModels.push(m.prepareDestroyPermanently()));
                } else {
                    preparedModels.push(model.prepareDestroyPermanently());
                }
            }
        } catch {
            // Record not found, do nothing
        }
    }

    const associatedChildren: Array<Query<any>> = [post.files, post.reactions];
    for await (const children of associatedChildren) {
        const models = await children.fetch() as Model[];
        models.forEach((model) => preparedModels.push(model.prepareDestroyPermanently()));
    }

    return preparedModels;
};

export const getPostById = async (database: Database, postId: string) => {
    try {
        const postModel = await database.collections.get<PostModel>(MM_TABLES.SERVER.POST).find(postId);
        return postModel;
    } catch {
        return undefined;
    }
};

export const queryPostsInChannel = (database: Database, channelId: string) => {
    return database.get<PostInChannelModel>(POSTS_IN_CHANNEL).query(
        Q.where('channel_id', channelId),
        Q.sortBy('latest', Q.desc),
    );
};

export const queryPostsInThread = (database: Database, rootId: string, sorted = false, includeDeleted = false) => {
    const clauses: Q.Clause[] = [Q.where('root_id', rootId)];
    if (sorted) {
        clauses.push(Q.sortBy('latest', Q.desc));
    }

    if (includeDeleted) {
        clauses.push(Q.where('delete_at', Q.eq(0)));
    }
    return database.get<PostsInThreadModel>(POSTS_IN_THREAD).query(...clauses);
};

export const getRecentPostsInThread = async (database: Database, rootId: string) => {
    const chunks = await queryPostsInThread(database, rootId, true, true).fetch();
    if (chunks.length) {
        const recent = chunks[0];
        const post = await getPostById(database, rootId);
        if (post) {
            return queryPostsChunk(database, post.channelId, recent.earliest, recent.latest).fetch();
        }
    }
    return [];
};

export const queryPostsChunk = (database: Database, channelId: string, earliest: number, latest: number) => {
    return database.get<PostModel>(POST).query(
        Q.and(
            Q.where('channel_id', channelId),
            Q.where('create_at', Q.between(earliest, latest)),
            Q.where('delete_at', Q.eq(0)),
        ),
        Q.sortBy('create_at', Q.desc),
    );
};

export const queryRecentPostsInChannel = async (database: Database, channelId: string) => {
    const chunks = await queryPostsInChannel(database, channelId).fetch();
    if (chunks.length) {
        const recent = chunks[0];
        return queryPostsChunk(database, channelId, recent.earliest, recent.latest).fetch();
    }
    return [];
};

export const queryPostsById = (database: Database, postIds: string[], sort?: Q.SortOrder) => {
    const clauses: Q.Clause[] = [Q.where('id', Q.oneOf(postIds))];
    if (sort) {
        clauses.push(Q.sortBy('create_at', sort));
    }
    return database.get<PostModel>(POST).query(...clauses);
};

export const queryPostsBetween = (database: Database, earliest: number, latest: number, sort: Q.SortOrder | null, userId?: string, channelId?: string, rootId?: string) => {
    const andClauses = [Q.where('create_at', Q.between(earliest, latest))];
    if (channelId) {
        andClauses.push(Q.where('channel_id', channelId));
    }

    if (userId) {
        andClauses.push(Q.where('user_id', userId));
    }

    if (rootId) {
        andClauses.push(Q.where('root_id', rootId));
    }

    const clauses: Q.Clause[] = [Q.and(...andClauses)];
    if (sort != null) {
        clauses.push(Q.sortBy('create_at', sort));
    }
    return database.get<PostModel>(POST).query(...clauses);
};
