// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Model} from '@nozbe/watermelondb';

import {pluckUnique} from '@app/utils/helpers';
import DatabaseManager from '@database/manager';
import {prepareCategories, prepareCategoryChannels, queryCategoriesByTeamIds, queryCategoryById} from '@queries/servers/categories';

export const deleteCategory = async (serverUrl: string, categoryId: string) => {
    const database = DatabaseManager.serverDatabases[serverUrl]?.database;
    if (!database) {
        return {error: `${serverUrl} database not found`};
    }

    try {
        const category = await queryCategoryById(database, categoryId);

        if (category) {
            await database.write(async () => {
                await category.destroyPermanently();
            });
        }

        return true;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log('FAILED TO DELETE CATEGORY', categoryId);
        return {error};
    }
};

export const storeCategories = async (serverUrl: string, categories: CategoryWithChannels[], prune = false, prepareRecordsOnly = false) => {
    const operator = DatabaseManager.serverDatabases[serverUrl]?.operator;

    if (!operator) {
        return {error: `${serverUrl} database not found`};
    }
    const modelPromises: Array<Promise<Model[]>> = [];
    const preparedCategories = prepareCategories(operator, categories);
    if (preparedCategories) {
        modelPromises.push(...preparedCategories);
    }

    const preparedCategoryChannels = prepareCategoryChannels(operator, categories);
    if (preparedCategoryChannels) {
        modelPromises.push(...preparedCategoryChannels);
    }

    const models = await Promise.all(modelPromises);
    const flattenedModels = models.flat() as Model[];

    if (prune && categories.length) {
        const {database} = operator;
        const remoteCategoryIds = categories.map((cat) => cat.id);

        // If the passed categories have more than one team, we want to update across teams
        const teamIds = pluckUnique('team_id')(categories) as string[];
        const localCategories = await queryCategoriesByTeamIds(database, teamIds);

        localCategories.forEach((localCategory) => {
            if (!remoteCategoryIds.includes(localCategory.id)) {
                localCategory.prepareDestroyPermanently();
                flattenedModels.push(localCategory);
            }
        });
    }

    if (prepareRecordsOnly) {
        return {models: flattenedModels};
    }

    if (flattenedModels?.length > 0) {
        try {
            await operator.batchRecords(flattenedModels);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log('FAILED TO BATCH CATEGORIES', error);
            return {error};
        }
    }

    return {models: flattenedModels};
};
