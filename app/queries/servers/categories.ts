// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Database, Model, Q, Query} from '@nozbe/watermelondb';

import {MM_TABLES} from '@constants/database';

import type ServerDataOperator from '@database/operator/server_data_operator';
import type CategoryModel from '@typings/database/models/servers/category';

const {SERVER: {CATEGORY}} = MM_TABLES;

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

export const prepareCategories = (operator: ServerDataOperator, categories: CategoryWithChannels[]) => {
    try {
        const categoryRecords = operator.handleCategories({categories, prepareRecordsOnly: true});
        return [categoryRecords];
    } catch {
        return undefined;
    }
};

export const prepareCategoryChannels = (
    operator: ServerDataOperator,
    categories: CategoryWithChannels[],
) => {
    try {
        const categoryChannels: CategoryChannel[] = [];

        categories.forEach((category) => {
            category.channel_ids.forEach((channelId, index) => {
                categoryChannels.push({
                    id: `${category.team_id}_${channelId}`,
                    category_id: category.id,
                    channel_id: channelId,
                    sort_order: index,
                });
            });
        });

        if (categoryChannels.length) {
            const categoryChannelRecords = operator.handleCategoryChannels({categoryChannels, prepareRecordsOnly: true});
            return [categoryChannelRecords];
        }

        return [];
    } catch (e) {
        return undefined;
    }
};

export const prepareDeleteCategory = async (category: CategoryModel): Promise<Model[]> => {
    const preparedModels: Model[] = [category.prepareDestroyPermanently()];

    const associatedChildren: Array<Query<any>> = [
        category.categoryChannels,
    ];
    for await (const children of associatedChildren) {
        const models = await children?.fetch?.() as Model[] | undefined;
        models?.forEach((model) => preparedModels.push(model.prepareDestroyPermanently()));
    }

    return preparedModels;
};
