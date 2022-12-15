// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SYSTEM_IDENTIFIERS} from '@constants/database';
import General from '@constants/general';
import DatabaseManager from '@database/manager';
import {getRecentCustomStatuses} from '@queries/servers/system';
import {getCurrentUser, getUserById} from '@queries/servers/user';
import {logError} from '@utils/log';

import {addRecentReaction} from './reactions';

import type Model from '@nozbe/watermelondb/Model';
import type UserModel from '@typings/database/models/servers/user';

export async function setCurrentUserStatusOffline(serverUrl: string) {
    try {
        const {database, operator} = DatabaseManager.getServerDatabaseAndOperator(serverUrl);
        const user = await getCurrentUser(database);
        if (!user) {
            throw new Error(`No current user for ${serverUrl}`);
        }

        user.prepareStatus(General.OFFLINE);
        await operator.batchRecords([user]);
        return null;
    } catch (error) {
        logError('Failed setCurrentUserStatusOffline', error);
        return {error};
    }
}

export async function updateLocalCustomStatus(serverUrl: string, user: UserModel, customStatus?: UserCustomStatus) {
    try {
        const {operator} = DatabaseManager.getServerDatabaseAndOperator(serverUrl);
        const models: Model[] = [];
        const currentProps = {...user.props, customStatus: customStatus || {}};
        const userModel = user.prepareUpdate((u: UserModel) => {
            u.props = currentProps;
        });

        models.push(userModel);
        if (customStatus) {
            const recent = await updateRecentCustomStatuses(serverUrl, customStatus, true);
            if (Array.isArray(recent)) {
                models.push(...recent);
            }

            if (customStatus.emoji) {
                const recentEmojis = await addRecentReaction(serverUrl, [customStatus.emoji], true);
                if (Array.isArray(recentEmojis)) {
                    models.push(...recentEmojis);
                }
            }
        }

        await operator.batchRecords(models);

        return {};
    } catch (error) {
        logError('Failed updateLocalCustomStatus', error);
        return {error};
    }
}

export const updateRecentCustomStatuses = async (serverUrl: string, customStatus: UserCustomStatus, prepareRecordsOnly = false, remove = false) => {
    try {
        const {database, operator} = DatabaseManager.getServerDatabaseAndOperator(serverUrl);
        const recentStatuses = await getRecentCustomStatuses(database);
        const index = recentStatuses.findIndex((cs) => (
            cs.emoji === customStatus.emoji &&
        cs.text === customStatus.text &&
        cs.duration === customStatus.duration
        ));

        if (index !== -1) {
            recentStatuses.splice(index, 1);
        }

        if (!remove) {
            recentStatuses.unshift(customStatus);
        }

        return operator.handleSystem({
            systems: [{
                id: SYSTEM_IDENTIFIERS.RECENT_CUSTOM_STATUS,
                value: JSON.stringify(recentStatuses),
            }],
            prepareRecordsOnly,
        });
    } catch (error) {
        logError('Failed updateRecentCustomStatuses', error);
        return {error};
    }
};

export const updateLocalUser = async (
    serverUrl: string,
    userDetails: Partial<UserProfile> & { status?: string},
    userId?: string,
) => {
    try {
        const {database} = DatabaseManager.getServerDatabaseAndOperator(serverUrl);

        let user: UserModel | undefined;

        if (userId) {
            user = await getUserById(database, userId);
        } else {
            user = await getCurrentUser(database);
        }

        if (user) {
            const u = user;
            await database.write(async () => {
                await u.update((userRecord: UserModel) => {
                    userRecord.authService = userDetails.auth_service ?? u.authService;
                    userRecord.email = userDetails.email ?? u.email;
                    userRecord.firstName = userDetails.first_name ?? u.firstName;
                    userRecord.lastName = userDetails.last_name ?? u.lastName;
                    userRecord.lastPictureUpdate = userDetails.last_picture_update ?? u.lastPictureUpdate;
                    userRecord.locale = userDetails.locale ?? u.locale;
                    userRecord.nickname = userDetails.nickname ?? u.nickname;
                    userRecord.notifyProps = userDetails.notify_props ?? u.notifyProps;
                    userRecord.position = userDetails?.position ?? u.position;
                    userRecord.props = userDetails.props ?? u.props;
                    userRecord.roles = userDetails.roles ?? u.roles;
                    userRecord.status = userDetails?.status ?? u.status;
                    userRecord.timezone = userDetails.timezone ?? u.timezone;
                    userRecord.username = userDetails.username ?? u.username;
                });
            });
        }
        return {user};
    } catch (error) {
        logError('Failed updateLocalUser', error);
        return {error};
    }
};

export const storeProfile = async (serverUrl: string, profile: UserProfile) => {
    try {
        const {database, operator} = DatabaseManager.getServerDatabaseAndOperator(serverUrl);
        const user = await getUserById(database, profile.id);
        if (user) {
            return {user};
        }

        const records = await operator.handleUsers({
            users: [profile],
            prepareRecordsOnly: false,
        });

        return {user: records[0]};
    } catch (error) {
        logError('Failed storeProfile', error);
        return {error};
    }
};
