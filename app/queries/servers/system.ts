// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Database} from '@nozbe/watermelondb';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {MM_TABLES, SYSTEM_IDENTIFIERS} from '@constants/database';

import type ServerDataOperator from '@database/operator/server_data_operator';
import type SystemModel from '@typings/database/models/servers/system';

export type PrepareCommonSystemValuesArgs = {
    config?: ClientConfig;
    currentChannelId?: string;
    currentTeamId?: string;
    currentUserId?: string;
    license?: ClientLicense;
    teamHistory?: string;
}

const {SERVER: {SYSTEM}} = MM_TABLES;

export const getCurrentChannelId = async (serverDatabase: Database): Promise<string> => {
    try {
        const currentChannelId = await serverDatabase.get<SystemModel>(SYSTEM).find(SYSTEM_IDENTIFIERS.CURRENT_CHANNEL_ID);
        return currentChannelId?.value || '';
    } catch {
        return '';
    }
};

export const observeCurrentChannelId = (database: Database) => {
    return database.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.CURRENT_CHANNEL_ID).pipe(
        switchMap(({value}) => of$(value as string)),
    );
};

export const getCurrentTeamId = async (serverDatabase: Database): Promise<string> => {
    try {
        const currentTeamId = await serverDatabase.get<SystemModel>(SYSTEM).find(SYSTEM_IDENTIFIERS.CURRENT_TEAM_ID);
        return currentTeamId?.value || '';
    } catch {
        return '';
    }
};

export const observeCurrentTeamId = (database: Database) => {
    return database.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.CURRENT_TEAM_ID).pipe(
        switchMap(({value}) => of$(value as string)),
    );
};

export const getCurrentUserId = async (serverDatabase: Database): Promise<string> => {
    try {
        const currentUserId = await serverDatabase.get<SystemModel>(SYSTEM).find(SYSTEM_IDENTIFIERS.CURRENT_USER_ID);
        return currentUserId?.value || '';
    } catch {
        return '';
    }
};

export const observeCurrentUserId = (database: Database) => {
    return database.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.CURRENT_USER_ID).pipe(
        switchMap(({value}) => of$(value as string)),
    );
};

export const getCommonSystemValues = async (serverDatabase: Database) => {
    const systemRecords = (await serverDatabase.collections.get(SYSTEM).query().fetch()) as SystemModel[];
    let config = {};
    let license = {};
    let currentChannelId = '';
    let currentTeamId = '';
    let currentUserId = '';
    systemRecords.forEach((systemRecord) => {
        switch (systemRecord.id) {
            case SYSTEM_IDENTIFIERS.CONFIG:
                config = systemRecord.value;
                break;
            case SYSTEM_IDENTIFIERS.CURRENT_CHANNEL_ID:
                currentChannelId = systemRecord.value;
                break;
            case SYSTEM_IDENTIFIERS.CURRENT_TEAM_ID:
                currentTeamId = systemRecord.value;
                break;
            case SYSTEM_IDENTIFIERS.CURRENT_USER_ID:
                currentUserId = systemRecord.value;
                break;
            case SYSTEM_IDENTIFIERS.LICENSE:
                license = systemRecord.value as ClientLicense;
                break;
        }
    });

    return {
        currentChannelId,
        currentTeamId,
        currentUserId,
        config: (config as ClientConfig),
        license: (license as ClientLicense),
    };
};

export const getConfig = async (serverDatabase: Database) => {
    try {
        const config = await serverDatabase.get<SystemModel>(SYSTEM).find(SYSTEM_IDENTIFIERS.CONFIG);
        return (config?.value || {}) as ClientConfig;
    } catch {
        return undefined;
    }
};

export const observeConfig = (database: Database) => {
    return database.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.CONFIG).pipe(
        switchMap(({value}) => of$(value as ClientConfig)),
    );
};

export const observeConfigValue = (database: Database, key: keyof ClientConfig) => {
    return observeConfig(database).pipe(
        switchMap((cfg) => of$(cfg[key])),
    );
};
export const observeConfigBooleanValue = (database: Database, key: keyof ClientConfig) => {
    return observeConfig(database).pipe(
        switchMap((cfg) => of$(cfg[key] === 'true')),
    );
};

export const observeLicense = (database: Database) => {
    return database.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.LICENSE).pipe(
        switchMap(({value}) => of$((value as ClientLicense))),
    );
};

export const getRecentCustomStatuses = async (serverDatabase: Database) => {
    try {
        const recent = await serverDatabase.get<SystemModel>(SYSTEM).find(SYSTEM_IDENTIFIERS.RECENT_CUSTOM_STATUS);
        return recent.value as UserCustomStatus[];
    } catch {
        return [];
    }
};

export const getExpandedLinks = async (serverDatabase: Database) => {
    try {
        const expandedLinks = await serverDatabase.get<SystemModel>(SYSTEM).find(SYSTEM_IDENTIFIERS.EXPANDED_LINKS);
        return (expandedLinks?.value || {}) as Record<string, string>;
    } catch {
        return {};
    }
};

export const observeExpandedLinks = (serverDatabase: Database) => {
    return serverDatabase.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.EXPANDED_LINKS).pipe(
        switchMap(({value}) => of$((value as Record<string, string>))),
    );
};

export const observeRecentMentions = (database: Database) => {
    return database.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.RECENT_MENTIONS).pipe(
        switchMap(({value}) => of$(value as string[])),
    );
};

export const getRecentReactions = async (database: Database) => {
    try {
        const reactions = await database.get<SystemModel>(SYSTEM).find(SYSTEM_IDENTIFIERS.RECENT_REACTIONS);
        return reactions.value as string[];
    } catch {
        return [];
    }
};

export const observeRecentReactions = (database: Database) => {
    return database.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.RECENT_REACTIONS).pipe(
        switchMap(({value}) => of$(value as string[])),
    );
};

export const observeRecentCustomStatus = (database: Database) => {
    return database.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.RECENT_CUSTOM_STATUS).pipe(
        switchMap(({value}) => of$(value as UserCustomStatus[])),
    );
};

export const getWebSocketLastDisconnected = async (serverDatabase: Database) => {
    try {
        const websocketLastDisconnected = await serverDatabase.get<SystemModel>(SYSTEM).find(SYSTEM_IDENTIFIERS.WEBSOCKET);
        return (parseInt(websocketLastDisconnected?.value || 0, 10) || 0);
    } catch {
        return 0;
    }
};

export const observeWebsocket = (serverDatabase: Database) => {
    return serverDatabase.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.WEBSOCKET).pipe(
        switchMap(({value}) => of$(parseInt(value || 0, 10) || 0)),
    );
};

export const resetWebSocketLastDisconnected = async (operator: ServerDataOperator, prepareRecordsOnly = false) => {
    const lastDisconnectedAt = await getWebSocketLastDisconnected(operator.database);

    if (lastDisconnectedAt) {
        return operator.handleSystem({systems: [{
            id: SYSTEM_IDENTIFIERS.WEBSOCKET,
            value: 0,
        }],
        prepareRecordsOnly});
    }

    return [];
};

export const getTeamHistory = async (serverDatabase: Database) => {
    try {
        const teamHistory = await serverDatabase.get<SystemModel>(SYSTEM).find(SYSTEM_IDENTIFIERS.TEAM_HISTORY);
        return (teamHistory.value) as string[];
    } catch {
        return [];
    }
};

export const patchTeamHistory = (operator: ServerDataOperator, value: string[], prepareRecordsOnly = false) => {
    return operator.handleSystem({systems: [{
        id: SYSTEM_IDENTIFIERS.TEAM_HISTORY,
        value: JSON.stringify(value),
    }],
    prepareRecordsOnly});
};

export const prepareCommonSystemValues = (
    operator: ServerDataOperator, values: PrepareCommonSystemValuesArgs) => {
    try {
        const {config, currentChannelId, currentTeamId, currentUserId, license} = values;
        const systems: IdValue[] = [];
        if (config !== undefined) {
            systems.push({
                id: SYSTEM_IDENTIFIERS.CONFIG,
                value: JSON.stringify(config),
            });
        }

        if (license !== undefined) {
            systems.push({
                id: SYSTEM_IDENTIFIERS.LICENSE,
                value: JSON.stringify(license),
            });
        }

        if (currentUserId !== undefined) {
            systems.push({
                id: SYSTEM_IDENTIFIERS.CURRENT_USER_ID,
                value: currentUserId,
            });
        }

        if (currentTeamId !== undefined) {
            systems.push({
                id: SYSTEM_IDENTIFIERS.CURRENT_TEAM_ID,
                value: currentTeamId,
            });
        }

        if (currentChannelId !== undefined) {
            systems.push({
                id: SYSTEM_IDENTIFIERS.CURRENT_CHANNEL_ID,
                value: currentChannelId,
            });
        }

        return operator.handleSystem({
            systems,
            prepareRecordsOnly: true,
        });
    } catch {
        return undefined;
    }
};

export const setCurrentChannelId = async (operator: ServerDataOperator, channelId: string) => {
    try {
        const models = await prepareCommonSystemValues(operator, {currentChannelId: channelId});
        if (models) {
            await operator.batchRecords(models);
        }

        return {currentChannelId: channelId};
    } catch (error) {
        return {error};
    }
};

export const setCurrentTeamAndChannelId = async (operator: ServerDataOperator, teamId?: string, channelId?: string) => {
    try {
        const models = await prepareCommonSystemValues(operator, {
            currentChannelId: channelId,
            currentTeamId: teamId,
        });
        if (models) {
            await operator.batchRecords(models);
        }

        return {currentChannelId: channelId};
    } catch (error) {
        return {error};
    }
};

