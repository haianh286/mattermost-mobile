// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Model} from '@nozbe/watermelondb';
import {DeviceEventEmitter} from 'react-native';

import {Navigation as NavigationConstants, Screens} from '@constants';
import DatabaseManager from '@database/manager';
import {prepareDeleteChannel, prepareMyChannelsForTeam, queryAllMyChannelIds, queryChannelsById, queryMyChannel} from '@queries/servers/channel';
import {prepareCommonSystemValues, PrepareCommonSystemValuesArgs, queryCommonSystemValues, queryCurrentTeamId} from '@queries/servers/system';
import {addChannelToTeamHistory, addTeamToTeamHistory, queryLastChannelFromTeam, removeChannelFromTeamHistory} from '@queries/servers/team';
import {dismissAllModalsAndPopToRoot, dismissAllModalsAndPopToScreen} from '@screens/navigation';
import {isTablet} from '@utils/helpers';

import type ChannelModel from '@typings/database/models/servers/channel';

export const switchToChannel = async (serverUrl: string, channelId: string, teamId?: string) => {
    const database = DatabaseManager.serverDatabases[serverUrl]?.database;
    if (!database) {
        return {error: `${serverUrl} database not found`};
    }

    try {
        const dt = Date.now();
        const isTabletDevice = await isTablet();
        const system = await queryCommonSystemValues(database);
        const member = await queryMyChannel(database, channelId);

        if (member) {
            const channel: ChannelModel = await member.channel.fetch();
            const {operator} = DatabaseManager.serverDatabases[serverUrl];
            const models = [];
            const commonValues: PrepareCommonSystemValuesArgs = {currentChannelId: channelId};

            if (teamId && system.currentTeamId !== teamId) {
                commonValues.currentTeamId = teamId;
                const history = await addTeamToTeamHistory(operator, teamId, true);
                models.push(...history);
            }

            const common = await prepareCommonSystemValues(operator, commonValues);
            if (common) {
                models.push(...common);
            }

            if (system.currentChannelId !== channelId) {
                const history = await addChannelToTeamHistory(operator, system.currentTeamId, channelId, true);
                models.push(...history);
            }

            const {member: viewedAt} = await markChannelAsViewed(serverUrl, channelId, undefined, true);
            if (viewedAt) {
                models.push(viewedAt);
            }

            if (models.length) {
                await operator.batchRecords(models);
            }

            if (isTabletDevice) {
                dismissAllModalsAndPopToRoot();
                DeviceEventEmitter.emit(NavigationConstants.NAVIGATION_HOME);
            } else {
                dismissAllModalsAndPopToScreen(Screens.CHANNEL, '', undefined, {topBar: {visible: false}});
            }

            console.log('channel switch to', channel?.displayName, channelId, (Date.now() - dt), 'ms'); //eslint-disable-line
        }
    } catch (error) {
        return {error};
    }

    return {error: undefined};
};

//Used for testing purposes
export const switchToDefault = async (serverUrl: string) => {
    const serverDatabase = DatabaseManager.serverDatabases[serverUrl];
    if (!serverDatabase) {
        return;
    }

    const currentTeamId = await queryCurrentTeamId(serverDatabase.database);
    const channelToJumpTo = await queryLastChannelFromTeam(serverDatabase.database, currentTeamId);
    if (channelToJumpTo) {
        switchToChannel(serverUrl, channelToJumpTo);
    }
};

export const localRemoveUserFromChannel = async (serverUrl: string, channelId: string) => {
    const serverDatabase = DatabaseManager.serverDatabases[serverUrl];
    if (!serverDatabase) {
        return;
    }

    const {operator, database} = serverDatabase;

    const myChannel = await queryMyChannel(database, channelId);
    if (myChannel) {
        const channel = await myChannel.channel.fetch() as ChannelModel;
        const models = await prepareDeleteChannel(channel);
        let teamId = channel.teamId;
        if (teamId) {
            teamId = await queryCurrentTeamId(database);
        }
        const system = await removeChannelFromTeamHistory(operator, teamId, channel.id, true);
        if (system) {
            models.push(...system);
        }
        if (models.length) {
            try {
                await operator.batchRecords(models);
            } catch {
                // eslint-disable-next-line no-console
                console.log('FAILED TO BATCH CHANGES FOR REMOVE USER FROM CHANNEL');
            }
        }
    }
};

export const localSetChannelDeleteAt = async (serverUrl: string, channelId: string, deleteAt: number) => {
    const serverDatabase = DatabaseManager.serverDatabases[serverUrl];
    if (!serverDatabase) {
        return;
    }

    const {operator, database} = serverDatabase;

    const channels = await queryChannelsById(database, [channelId]);
    if (!channels?.length) {
        return;
    }

    const channel = channels[0];
    const model = channel.prepareUpdate((c) => {
        c.deleteAt = deleteAt;
    });

    try {
        await operator.batchRecords([model]);
    } catch {
        // eslint-disable-next-line no-console
        console.log('FAILED TO BATCH CHANGES FOR CHANNEL DELETE AT');
    }
};

export const selectAllMyChannelIds = async (serverUrl: string) => {
    const database = DatabaseManager.serverDatabases[serverUrl]?.database;
    if (!database) {
        return [];
    }

    return queryAllMyChannelIds(database);
};

export const markChannelAsViewed = async (serverUrl: string, channelId: string, newLastPostAt?: number, prepareRecordsOnly = false) => {
    const operator = DatabaseManager.serverDatabases[serverUrl]?.operator;
    if (!operator) {
        return {error: `${serverUrl} database not found`};
    }

    const member = await queryMyChannel(operator.database, channelId);
    if (!member) {
        return {error: 'not a member'};
    }

    const lastPostAt = newLastPostAt != null && newLastPostAt > member.lastPostAt ? newLastPostAt : member.lastPostAt;
    member.prepareUpdate((m) => {
        m.messageCount = 0;
        m.mentionsCount = 0;
        m.manuallyUnread = false;
        m.viewedAt = member.lastViewedAt;
        m.lastViewedAt = lastPostAt + 1;
        m.lastPostAt = lastPostAt;
    });

    try {
        if (!prepareRecordsOnly) {
            await operator.batchRecords([member]);
        }

        return {member};
    } catch (error) {
        return {error};
    }
};

export const markChannelAsUnread = async (serverUrl: string, channelId: string, messageCount: number, mentionsCount: number, manuallyUnread: boolean, newLastPostAt?: number, lastViewed?: number, prepareRecordsOnly = false) => {
    const operator = DatabaseManager.serverDatabases[serverUrl]?.operator;
    if (!operator) {
        return {error: `${serverUrl} database not found`};
    }

    const member = await queryMyChannel(operator.database, channelId);
    if (!member) {
        return {error: 'not a member'};
    }

    const lastPostAt = newLastPostAt != null && newLastPostAt > member.lastPostAt ? newLastPostAt : member.lastPostAt;
    member.prepareUpdate((m) => {
        m.viewedAt = lastViewed == null ? m.lastViewedAt : lastViewed;
        m.lastViewedAt = lastViewed == null ? m.lastViewedAt : lastViewed;
        m.messageCount = messageCount;
        m.mentionsCount = mentionsCount;
        m.manuallyUnread = manuallyUnread;
        m.lastPostAt = lastPostAt;
    });

    try {
        if (!prepareRecordsOnly) {
            await operator.batchRecords([member]);
        }

        return {member};
    } catch (error) {
        return {error};
    }
};

export const updateLastPostAt = async (serverUrl: string, channelId: string, lastPostAt: number, prepareRecordsOnly = false) => {
    const operator = DatabaseManager.serverDatabases[serverUrl]?.operator;
    if (!operator) {
        return {error: `${serverUrl} database not found`};
    }

    const member = await queryMyChannel(operator.database, channelId);
    if (!member) {
        return {error: 'not a member'};
    }

    member.prepareUpdate((m) => {
        m.lastPostAt = lastPostAt > member.lastPostAt ? lastPostAt : member.lastPostAt;
    });

    try {
        if (!prepareRecordsOnly) {
            await operator.batchRecords([member]);
        }

        return {member};
    } catch (error) {
        return {error};
    }
};

export const storeMyChannelsForTeam = async (serverUrl: string, teamId: string, channels: Channel[], memberships: ChannelMembership[], prepareRecordsOnly = false) => {
    const operator = DatabaseManager.serverDatabases[serverUrl]?.operator;
    if (!operator) {
        return {error: `${serverUrl} database not found`};
    }
    const modelPromises: Array<Promise<Model[]>> = [];
    const prepare = await prepareMyChannelsForTeam(operator, teamId, channels, memberships);
    if (prepare) {
        modelPromises.push(...prepare);
    }

    const models = await Promise.all(modelPromises);
    const flattenedModels = models.flat() as Model[];

    if (prepareRecordsOnly) {
        return {models: flattenedModels};
    }

    if (flattenedModels?.length > 0) {
        try {
            await operator.batchRecords(flattenedModels);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log('FAILED TO BATCH CHANNELS');
            return {error};
        }
    }

    return {models: flattenedModels};
};
