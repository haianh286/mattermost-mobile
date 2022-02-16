// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import {switchMap} from 'rxjs/operators';

// groups: MM-41882 import {from as from$} from 'rxjs';
// groups: MM-41882 import {queryGroupForPosts} from '@helpers/database/groups';
import {MM_TABLES, SYSTEM_IDENTIFIERS} from '@constants/database';

// groups: MM-41882 import GroupModel from '@typings/database/models/servers/group';

import Message from './message';

import type {WithDatabaseArgs} from '@typings/database/database';
import type PostModel from '@typings/database/models/servers/post';
import type SystemModel from '@typings/database/models/servers/system';
import type UserModel from '@typings/database/models/servers/user';

const {SERVER: {SYSTEM, USER}} = MM_TABLES;

type MessageInputArgs = {
    post: PostModel;
}

const withMessageInput = withObservables(['post'], ({database}: WithDatabaseArgs & MessageInputArgs) => {
    const currentUser = database.get<SystemModel>(SYSTEM).findAndObserve(SYSTEM_IDENTIFIERS.CURRENT_USER_ID).pipe(
        switchMap(({value}) => database.get<UserModel>(USER).findAndObserve(value)),
    );

    // groups: MM-41882 const groupsForPosts = from$(queryGroupForPosts(post));
    return {
        currentUser,

        // groups: MM-41882 groupsForPosts,
    };
});

export default withDatabase(withMessageInput(Message));
