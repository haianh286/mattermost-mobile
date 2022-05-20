// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Database, Model, Q, Query} from '@nozbe/watermelondb';
import {of as of$} from 'rxjs';
import {switchMap, distinctUntilChanged} from 'rxjs/operators';

import {FAVORITES_CATEGORY} from '@constants/categories';
import {MM_TABLES} from '@constants/database';
import {makeCategoryChannelId} from '@utils/categories';

import type ServerDataOperator from '@database/operator/server_data_operator';
import type CategoryModel from '@typings/database/models/servers/category';
import type CategoryChannelModel from '@typings/database/models/servers/category_channel';

const {SERVER: {CATEGORY, CATEGORY_CHANNEL}} = MM_TABLES;

export const getCategoryById = async (database: Database, categoryId: string) => {
    try {
        const record = (await database.collections.get<CategoryModel>(CATEGORY).find(categoryId));
        return record;
    } catch {
        return undefined;
    }
};

export const queryCategoriesById = (database: Database, categoryIds: string[]) => {
    return database.get<CategoryModel>(CATEGORY).query(Q.where('id', Q.oneOf(categoryIds)));
};

export const queryCategoriesByTeamIds = (database: Database, teamIds: string[]) => {
    return database.get<CategoryModel>(CATEGORY).query(Q.where('team_id', Q.oneOf(teamIds)));
};

export const prepareCategories = (operator: ServerDataOperator, categories?: CategoryWithChannels[]) => {
    return operator.handleCategories({categories, prepareRecordsOnly: true});
};

export async function prepareCategoryChannels(
    operator: ServerDataOperator,
    categories?: CategoryWithChannels[],
): Promise<CategoryChannelModel[]> {
    try {
        const categoryChannels: CategoryChannel[] = [];

        categories?.forEach((category) => {
            category.channel_ids.forEach((channelId, index) => {
                categoryChannels.push({
                    id: makeCategoryChannelId(category.team_id, channelId),
                    category_id: category.id,
                    channel_id: channelId,
                    sort_order: index,
                });
            });
        });

        return operator.handleCategoryChannels({categoryChannels, prepareRecordsOnly: true});
    } catch (e) {
        return [];
    }
}

export const prepareDeleteCategory = async (category: CategoryModel): Promise<Model[]> => {
    const preparedModels: Model[] = [category.prepareDestroyPermanently()];

    const associatedChildren: Array<Query<Model>> = [
        category.categoryChannels,
    ];
    await Promise.all(associatedChildren.map(async (children) => {
        const models = await children.fetch();
        models.forEach((model) => preparedModels.push(model.prepareDestroyPermanently()));
    }));

    return preparedModels;
};

export const queryChannelCategory = (database: Database, teamId: string, channelId: string) => {
    return database.get<CategoryModel>(CATEGORY).query(
        Q.on(CATEGORY_CHANNEL, Q.where('id', makeCategoryChannelId(teamId, channelId))),
    );
};

export const getChannelCategory = async (database: Database, teamId: string, channelId: string) => {
    const result = await queryChannelCategory(database, teamId, channelId).fetch();
    if (result.length) {
        return result[0];
    }

    return undefined;
};

export const getIsChannelFavorited = async (database: Database, teamId: string, channelId: string) => {
    const result = await queryChannelCategory(database, teamId, channelId).fetch();
    if (result.length > 0) {
        return result[0].type === FAVORITES_CATEGORY;
    }

    return false;
};

export const observeIsChannelFavorited = (database: Database, teamId: string, channelId: string) => {
    return queryChannelCategory(database, teamId, channelId).observe().pipe(
        switchMap((result) => (result.length ? of$(result[0].type === FAVORITES_CATEGORY) : of$(false))),
        distinctUntilChanged(),
    );
};
