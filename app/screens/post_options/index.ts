// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import {combineLatest, from as from$, of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {General, Permissions, Preferences, Screens} from '@constants';
import {MAX_ALLOWED_REACTIONS} from '@constants/emoji';
import {queryPreferencesByCategoryAndName} from '@queries/servers/preference';
import {observeConfig, observeLicense} from '@queries/servers/system';
import {observeCurrentUser} from '@queries/servers/user';
import {isMinimumServerVersion} from '@utils/helpers';
import {isSystemMessage} from '@utils/post';
import {hasPermissionForChannel, hasPermissionForPost} from '@utils/role';
import {isSystemAdmin} from '@utils/user';

import PostOptions from './post_options';

import type {WithDatabaseArgs} from '@typings/database/database';
import type ChannelModel from '@typings/database/models/servers/channel';
import type PostModel from '@typings/database/models/servers/post';
import type ReactionModel from '@typings/database/models/servers/reaction';
import type UserModel from '@typings/database/models/servers/user';

const canEditPost = (isOwner: boolean, post: PostModel, postEditTimeLimit: number, isLicensed: boolean, channel: ChannelModel, user: UserModel): boolean => {
    if (!post || isSystemMessage(post)) {
        return false;
    }

    let cep: boolean;

    const permissions = [Permissions.EDIT_POST];
    if (!isOwner) {
        permissions.push(Permissions.EDIT_OTHERS_POSTS);
    }

    cep = permissions.every((permission) => hasPermissionForChannel(channel, user, permission, false));
    if (isLicensed && postEditTimeLimit !== -1) {
        const timeLeft = (post.createAt + (postEditTimeLimit * 1000)) - Date.now();
        if (timeLeft <= 0) {
            cep = false;
        }
    }

    return cep;
};

const enhanced = withObservables([], ({post, showAddReaction, location, database}: WithDatabaseArgs & { post: PostModel; showAddReaction: boolean; location: string }) => {
    const channel = post.channel.observe();
    const channelIsArchived = channel.pipe(switchMap((ch: ChannelModel) => of$(ch.deleteAt !== 0)));
    const currentUser = observeCurrentUser(database);
    const config = observeConfig(database);
    const isLicensed = observeLicense(database).pipe(switchMap((lcs) => of$(lcs.IsLicensed === 'true')));
    const allowEditPost = config.pipe(switchMap((cfg) => of$(cfg.AllowEditPost)));
    const serverVersion = config.pipe(switchMap((cfg) => cfg.Version));
    const postEditTimeLimit = config.pipe(switchMap((cfg) => of$(parseInt(cfg.PostEditTimeLimit || '-1', 10))));

    const canPostPermission = combineLatest([channel, currentUser]).pipe(switchMap(([c, u]) => from$(hasPermissionForChannel(c, u, Permissions.CREATE_POST, false))));
    const hasAddReactionPermission = currentUser.pipe(switchMap((u) => from$(hasPermissionForPost(post, u, Permissions.ADD_REACTION, true))));
    const canDeletePostPermission = currentUser.pipe(switchMap((u) => {
        const isOwner = post.userId === u.id;
        return from$(hasPermissionForPost(post, u, isOwner ? Permissions.DELETE_POST : Permissions.DELETE_OTHERS_POSTS, false));
    }));

    const experimentalTownSquareIsReadOnly = config.pipe(switchMap((value) => of$(value.ExperimentalTownSquareIsReadOnly === 'true')));
    const channelIsReadOnly = combineLatest([currentUser, channel, experimentalTownSquareIsReadOnly]).pipe(switchMap(([u, c, readOnly]) => {
        return of$(c?.name === General.DEFAULT_CHANNEL && !isSystemAdmin(u.roles) && readOnly);
    }));

    const isUnderMaxAllowedReactions = post.reactions.observe().pipe(
        // eslint-disable-next-line max-nested-callbacks
        switchMap((reactions: ReactionModel[]) => of$(new Set(reactions.map((r) => r.emojiName)).size < MAX_ALLOWED_REACTIONS)),
    );

    const canEditUntil = combineLatest([isLicensed, allowEditPost, postEditTimeLimit, serverVersion, channelIsArchived, channelIsReadOnly]).pipe(
        switchMap(([ls, alw, limit, semVer, isArchived, isReadOnly]) => {
            if (!isArchived && !isReadOnly && ls && ((alw === Permissions.ALLOW_EDIT_POST_TIME_LIMIT && !isMinimumServerVersion(semVer, 6)) || (limit !== -1))) {
                return of$(post.createAt + (limit * (1000)));
            }
            return of$(-1);
        }),
    );

    const canReply = combineLatest([channelIsArchived, channelIsReadOnly, canPostPermission]).pipe(switchMap(([isArchived, isReadOnly, canPost]) => {
        return of$(!isArchived && !isReadOnly && location !== Screens.THREAD && !isSystemMessage(post) && canPost);
    }));

    const canPin = combineLatest([channelIsArchived, channelIsReadOnly]).pipe(switchMap(([isArchived, isReadOnly]) => {
        return of$(!isSystemMessage(post) && !isArchived && !isReadOnly);
    }));

    const isSaved = queryPreferencesByCategoryAndName(database, Preferences.CATEGORY_SAVED_POST, post.id).observe().pipe(switchMap((pref) => of$(Boolean(pref[0]?.value === 'true'))));

    const canEdit = combineLatest([postEditTimeLimit, isLicensed, channel, currentUser, channelIsArchived, channelIsReadOnly, canEditUntil, canPostPermission]).pipe(switchMap(([lt, ls, c, u, isArchived, isReadOnly, until, canPost]) => {
        const isOwner = u.id === post.userId;
        const canEditPostPermission = canEditPost(isOwner, post, lt, ls, c, u);
        const timeReached = until === -1 || until > Date.now();
        return of$(canEditPostPermission && isSystemMessage(post) && !isArchived && !isReadOnly && !timeReached && canPost);
    }));

    const canMarkAsUnread = combineLatest([currentUser, channelIsArchived]).pipe(
        switchMap(([user, isArchived]) => of$(!isArchived && user.id !== post.userId && !isSystemMessage(post))),
    );

    const canAddReaction = combineLatest([hasAddReactionPermission, channelIsReadOnly, isUnderMaxAllowedReactions, channelIsArchived]).pipe(
        switchMap(([permission, readOnly, maxAllowed, isArchived]) => {
            return of$(!isSystemMessage(post) && permission && !readOnly && !isArchived && maxAllowed && showAddReaction);
        }),
    );

    const canDelete = combineLatest([canDeletePostPermission, channelIsArchived, channelIsReadOnly, canPostPermission]).pipe(switchMap(([permission, isArchived, isReadOnly, canPost]) => {
        return of$(permission && !isArchived && !isReadOnly && canPost);
    }));

    return {
        canMarkAsUnread,
        canAddReaction,
        canDelete,
        canReply,
        canPin,
        isSaved,
        canEdit,
        post,
    };
});

export default withDatabase(enhanced(PostOptions));

