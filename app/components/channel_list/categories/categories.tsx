// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {useIntl} from 'react-intl';
import {FlatList, StyleSheet} from 'react-native';

import CategoryBody from './body';
import LoadCategoriesError from './error';
import CategoryHeader from './header';
import UnreadCategories from './unreads';

import type CategoryModel from '@typings/database/models/servers/category';

type Props = {
    categories: CategoryModel[];
    currentTeamId: string;
    unreadsOnTop: boolean;
}

const styles = StyleSheet.create({
    mainList: {
        flex: 1,
    },
});

const extractKey = (item: CategoryModel | 'UNREADS') => (item === 'UNREADS' ? 'UNREADS' : item.id);

const Categories = ({categories, currentTeamId, unreadsOnTop}: Props) => {
    const intl = useIntl();
    const listRef = useRef<FlatList>(null);

    const renderCategory = useCallback((data: {item: CategoryModel | 'UNREADS'}) => {
        if (data.item === 'UNREADS') {
            return <UnreadCategories currentTeamId={currentTeamId}/>;
        }
        return (
            <>
                <CategoryHeader category={data.item}/>
                <CategoryBody
                    category={data.item}
                    locale={intl.locale}
                />
            </>
        );
    }, [intl.locale]);

    useEffect(() => {
        listRef.current?.scrollToOffset({animated: false, offset: 0});
    }, [currentTeamId]);

    const categoriesToShow = useMemo(() => {
        const orderedCategories = [...categories];
        orderedCategories.sort((a, b) => a.sortOrder - b.sortOrder);
        if (unreadsOnTop) {
            return ['UNREADS' as const, ...orderedCategories];
        }
        return orderedCategories;
    }, [categories, unreadsOnTop]);

    if (!categories.length) {
        return <LoadCategoriesError/>;
    }

    return (
        <FlatList
            data={categoriesToShow}
            ref={listRef}
            renderItem={renderCategory}
            style={styles.mainList}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={extractKey}
            removeClippedSubviews={true}
            initialNumToRender={5}
            windowSize={15}
            updateCellsBatchingPeriod={10}
            maxToRenderPerBatch={5}

            // @ts-expect-error strictMode not included in the types
            strictMode={true}
        />
    );
};

export default Categories;
