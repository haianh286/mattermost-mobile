// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Database, Model, Q, Query, Relation} from '@nozbe/watermelondb';
import {of as of$, map as map$, Observable} from 'rxjs';
import {switchMap, distinctUntilChanged, combineLatestWith} from 'rxjs/operators';

import {Database as DatabaseConstants, Preferences, Screens} from '@constants';
import {getPreferenceValue} from '@helpers/api/preference';
import {selectDefaultTeam} from '@helpers/api/team';
import {DEFAULT_LOCALE} from '@i18n';

import {prepareDeleteCategory} from './categories';
import {prepareDeleteChannel, getDefaultChannelForTeam, observeMyChannelMentionCount} from './channel';
import {queryPreferencesByCategoryAndName} from './preference';
import {patchTeamHistory, getConfig, getTeamHistory, observeCurrentTeamId, getCurrentTeamId} from './system';
import {observeThreadMentionCount} from './thread';
import {getCurrentUser} from './user';

import type {MyChannelModel} from '@database/models/server';
import type ServerDataOperator from '@database/operator/server_data_operator';
import type MyTeamModel from '@typings/database/models/servers/my_team';
import type TeamModel from '@typings/database/models/servers/team';
import type TeamChannelHistoryModel from '@typings/database/models/servers/team_channel_history';

const {
    MY_CHANNEL,
    MY_TEAM,
    TEAM,
    TEAM_CHANNEL_HISTORY,
} = DatabaseConstants.MM_TABLES.SERVER;

export const getCurrentTeam = async (database: Database) => {
    const currentTeamId = await getCurrentTeamId(database);
    if (currentTeamId) {
        return getTeamById(database, currentTeamId);
    }

    return undefined;
};

// Saves channels to team history & excludes & GLOBAL_THREADS from it
export const addChannelToTeamHistory = async (operator: ServerDataOperator, teamId: string, channelId: string, prepareRecordsOnly = false) => {
    let tch: TeamChannelHistory|undefined;

    try {
        // Exlude GLOBAL_THREADS from channel check
        if (channelId !== Screens.GLOBAL_THREADS) {
            const myChannel = (await operator.database.get<MyChannelModel>(MY_CHANNEL).find(channelId));
            if (!myChannel) {
                return [];
            }
        }
        const teamChannelHistory = await getTeamChannelHistory(operator.database, teamId);
        const channelIdSet = new Set(teamChannelHistory);
        if (channelIdSet.has(channelId)) {
            channelIdSet.delete(channelId);
        }

        const channelIds = Array.from(channelIdSet);
        channelIds.unshift(channelId);
        tch = {
            id: teamId,
            channel_ids: channelIds.slice(0, 5),
        };
    } catch (e) {
        tch = {
            id: teamId,
            channel_ids: [channelId],
        };
    }

    return operator.handleTeamChannelHistory({teamChannelHistories: [tch], prepareRecordsOnly});
};

export const getTeamChannelHistory = async (database: Database, teamId: string) => {
    try {
        const history = await database.get<TeamChannelHistoryModel>(TEAM_CHANNEL_HISTORY).find(teamId);
        return history.channelIds;
    } catch {
        return [];
    }
};

export const getNthLastChannelFromTeam = async (database: Database, teamId: string, n = 0) => {
    let channelId = '';

    try {
        const teamChannelHistory = await getTeamChannelHistory(database, teamId);
        if (teamChannelHistory.length > n + 1) {
            channelId = teamChannelHistory[n];
        }
    } catch {
        //Do nothing
    }

    if (!channelId) {
        // No channel history for the team
        const channel = await getDefaultChannelForTeam(database, teamId);
        if (channel) {
            channelId = channel.id;
        }
    }

    return channelId;
};

export const removeChannelFromTeamHistory = async (operator: ServerDataOperator, teamId: string, channelId: string, prepareRecordsOnly = false) => {
    let tch: TeamChannelHistory;

    try {
        const teamChannelHistory = await getTeamChannelHistory(operator.database, teamId);
        const channelIdSet = new Set(teamChannelHistory);
        if (channelIdSet.has(channelId)) {
            channelIdSet.delete(channelId);
        } else {
            return [];
        }

        const channelIds = Array.from(channelIdSet);
        tch = {
            id: teamId,
            channel_ids: channelIds,
        };
    } catch {
        return [];
    }

    return operator.handleTeamChannelHistory({teamChannelHistories: [tch], prepareRecordsOnly});
};

export const addTeamToTeamHistory = async (operator: ServerDataOperator, teamId: string, prepareRecordsOnly = false) => {
    const teamHistory = (await getTeamHistory(operator.database));
    const teamHistorySet = new Set(teamHistory);
    if (teamHistorySet.has(teamId)) {
        teamHistorySet.delete(teamId);
    }

    const teamIds = Array.from(teamHistorySet);
    teamIds.unshift(teamId);
    return patchTeamHistory(operator, teamIds, prepareRecordsOnly);
};

export const removeTeamFromTeamHistory = async (operator: ServerDataOperator, teamId: string, prepareRecordsOnly = false) => {
    const teamHistory = (await getTeamHistory(operator.database));
    const teamHistorySet = new Set(teamHistory);
    if (!teamHistorySet.has(teamId)) {
        return undefined;
    }

    teamHistorySet.delete(teamId);
    const teamIds = Array.from(teamHistorySet).slice(0, 5);

    return patchTeamHistory(operator, teamIds, prepareRecordsOnly);
};

export const getLastTeam = async (database: Database) => {
    const teamHistory = (await getTeamHistory(database));
    if (teamHistory.length > 0) {
        return teamHistory[0];
    }

    return getDefaultTeamId(database);
};

export async function syncTeamTable(operator: ServerDataOperator, teams: Team[]) {
    try {
        const deletedTeams = teams.filter((t) => t.delete_at > 0).map((t) => t.id);
        const deletedSet = new Set(deletedTeams);
        const availableTeams = teams.filter((a) => !deletedSet.has(a.id));
        const models = [];

        if (deletedTeams.length) {
            const notAvailable = await operator.database.get<TeamModel>(TEAM).query(Q.where('id', Q.oneOf(deletedTeams))).fetch();
            const deletions = await Promise.all(notAvailable.map((t) => prepareDeleteTeam(t)));
            for (const d of deletions) {
                models.push(...d);
            }
        }

        models.push(...await operator.handleTeam({teams: availableTeams, prepareRecordsOnly: true}));
        if (models.length) {
            await operator.batchRecords(models);
        }
        return {};
    } catch (error) {
        return {error};
    }
}

export const getDefaultTeamId = async (database: Database) => {
    const user = await getCurrentUser(database);
    const config = await getConfig(database);
    const teamOrderPreferences = await queryPreferencesByCategoryAndName(database, Preferences.TEAMS_ORDER, '').fetch();
    let teamOrderPreference = '';
    if (teamOrderPreferences.length) {
        teamOrderPreference = teamOrderPreferences[0].value;
    }

    const teamModels = await database.get<TeamModel>(TEAM).query(Q.on(MY_TEAM, Q.where('id', Q.notEq('')))).fetch();

    const defaultTeam = selectDefaultTeam(teamModels, user?.locale || DEFAULT_LOCALE, teamOrderPreference, config?.ExperimentalPrimaryTeam);
    return defaultTeam?.id;
};

export function prepareMyTeams(operator: ServerDataOperator, teams: Team[], memberships: TeamMembership[]): Array<Promise<Model[]>> {
    try {
        const teamRecords = operator.handleTeam({prepareRecordsOnly: true, teams});
        const teamIds = new Set(teams.map((t) => t.id));
        const teamMemberships = memberships.filter((m) => teamIds.has(m.team_id) && m.delete_at === 0);
        const teamMembershipRecords = operator.handleTeamMemberships({prepareRecordsOnly: true, teamMemberships});
        const myTeams: MyTeam[] = teamMemberships.map((tm) => {
            return {id: tm.team_id, roles: tm.roles ?? ''};
        });
        const myTeamRecords = operator.handleMyTeam({
            prepareRecordsOnly: true,
            myTeams,
        });

        return [teamRecords, teamMembershipRecords, myTeamRecords];
    } catch {
        return [];
    }
}

export async function deleteMyTeams(operator: ServerDataOperator, myTeams: MyTeamModel[]) {
    try {
        const preparedModels: Model[] = [];
        for (const myTeam of myTeams) {
            preparedModels.push(myTeam.prepareDestroyPermanently());
        }

        if (preparedModels.length) {
            await operator.batchRecords(preparedModels);
        }
        return {};
    } catch (error) {
        return {error};
    }
}

export const prepareDeleteTeam = async (team: TeamModel): Promise<Model[]> => {
    try {
        const preparedModels: Model[] = [team.prepareDestroyPermanently()];

        const relations: Array<Relation<Model>> = [team.myTeam, team.teamChannelHistory];
        await Promise.all(relations.map(async (relation) => {
            try {
                const model = await relation?.fetch();
                if (model) {
                    preparedModels.push(model.prepareDestroyPermanently());
                }
            } catch (error) {
                // Record not found, do nothing
            }
        }));

        const associatedChildren: Array<Query<Model>|undefined> = [
            team.members,
            team.teamSearchHistories,
        ];
        await Promise.all(associatedChildren.map(async (children) => {
            try {
                const models = await children?.fetch();
                models?.forEach((model) => preparedModels.push(model.prepareDestroyPermanently()));
            } catch {
                // Record not found, do nothing
            }
        }));

        const categories = await team.categories?.fetch();
        if (categories.length) {
            for await (const category of categories) {
                try {
                    const preparedCategory = await prepareDeleteCategory(category);
                    preparedModels.push(...preparedCategory);
                } catch {
                    // Record not found, do nothing
                }
            }
        }

        const channels = await team.channels?.fetch();
        if (channels.length) {
            for await (const channel of channels) {
                try {
                    const preparedChannel = await prepareDeleteChannel(channel);
                    preparedModels.push(...preparedChannel);
                } catch {
                    // Record not found, do nothing
                }
            }
        }

        return preparedModels;
    } catch (error) {
        return [];
    }
};

export const getMyTeamById = async (database: Database, teamId: string) => {
    try {
        const myTeam = (await database.get<MyTeamModel>(MY_TEAM).find(teamId));
        return myTeam;
    } catch (err) {
        return undefined;
    }
};

export const observeMyTeam = (database: Database, teamId: string) => {
    return database.get<MyTeamModel>(MY_TEAM).query(Q.where('id', teamId), Q.take(1)).observe().pipe(
        switchMap((result) => (result.length ? result[0].observe() : of$(undefined))),
    );
};

export const getTeamById = async (database: Database, teamId: string) => {
    try {
        const team = (await database.get<TeamModel>(TEAM).find(teamId));
        return team;
    } catch {
        return undefined;
    }
};

export const observeTeam = (database: Database, teamId: string) => {
    return database.get<TeamModel>(TEAM).query(Q.where('id', teamId), Q.take(1)).observe().pipe(
        switchMap((result) => (result.length ? result[0].observe() : of$(undefined))),
    );
};

export const queryTeamsById = (database: Database, teamIds: string[]) => {
    return database.get<TeamModel>(TEAM).query(Q.where('id', Q.oneOf(teamIds)));
};

export const queryTeamByName = (database: Database, teamName: string) => {
    return database.get<TeamModel>(TEAM).query(Q.where('name', teamName));
};

export const queryOtherTeams = (database: Database, teamIds: string[]) => {
    return database.get<TeamModel>(TEAM).query(Q.where('id', Q.notIn(teamIds)));
};

export const queryJoinedTeams = (database: Database) => {
    return database.get<TeamModel>(TEAM).query(
        Q.on(MY_TEAM, Q.where('id', Q.notEq(''))),
    );
};

export const getTeamByName = async (database: Database, teamName: string) => {
    const teams = await database.get<TeamModel>(TEAM).query(Q.where('name', teamName)).fetch();

    // Check done to force types
    if (teams.length) {
        return teams[0];
    }
    return undefined;
};

export const queryMyTeams = (database: Database) => {
    return database.get<MyTeamModel>(MY_TEAM).query();
};

export const queryMyTeamsByIds = (database: Database, teamIds: string[]) => {
    return database.get<MyTeamModel>(MY_TEAM).query(Q.where('id', Q.oneOf(teamIds)));
};

export const getAvailableTeamIds = async (database: Database, excludeTeamId: string, teams?: Team[], preferences?: PreferenceType[], locale?: string): Promise<string[]> => {
    let availableTeamIds: string[] = [];

    if (teams) {
        let teamOrderPreference;
        if (preferences) {
            teamOrderPreference = getPreferenceValue(preferences, Preferences.TEAMS_ORDER, '', '') as string;
        } else {
            const dbPreferences = await queryPreferencesByCategoryAndName(database, Preferences.TEAMS_ORDER, '').fetch();
            teamOrderPreference = dbPreferences[0].value;
        }

        const userLocale = locale || (await getCurrentUser(database))?.locale;
        const config = await getConfig(database);
        const defaultTeam = selectDefaultTeam(teams, userLocale, teamOrderPreference, config?.ExperimentalPrimaryTeam);

        if (defaultTeam) {
            availableTeamIds = [defaultTeam.id];
        }
    } else {
        const dbTeams = await queryMyTeams(database).fetch();
        availableTeamIds = dbTeams.map((team) => team.id);
    }

    return availableTeamIds.filter((id) => id !== excludeTeamId);
};

export const observeCurrentTeam = (database: Database) => {
    return observeCurrentTeamId(database).pipe(
        switchMap((id) => observeTeam(database, id)),
    );
};

export function observeMentionCount(database: Database, teamId?: string, includeDmGm?: boolean): Observable<number> {
    const channelMentionCountObservable = observeMyChannelMentionCount(database, teamId);
    const threadMentionCountObservable = observeThreadMentionCount(database, teamId, includeDmGm);

    return channelMentionCountObservable.pipe(
        combineLatestWith(threadMentionCountObservable),
        map$(([ccount, tcount]) => ccount + tcount),
        distinctUntilChanged(),
    );
}
