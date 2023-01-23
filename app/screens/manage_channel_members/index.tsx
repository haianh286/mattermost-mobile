// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import {of as of$, combineLatest, switchMap} from 'rxjs';

import {Permissions} from '@constants';
import {observeProfileLongPresTutorial} from '@queries/app/global';
import {observeCurrentChannel} from '@queries/servers/channel';
import {observeCanManageChannelMembers, observePermissionForChannel} from '@queries/servers/role';
import {observeCurrentChannelId, observeCurrentTeamId, observeCurrentUserId} from '@queries/servers/system';
import {observeCurrentUser, observeTeammateNameDisplay} from '@queries/servers/user';

import ManageChannelMembers from './manage_channel_members';

import type {WithDatabaseArgs} from '@typings/database/database';

const enhanced = withObservables([], ({database}: WithDatabaseArgs) => {
    const currentUser = observeCurrentUser(database);
    const currentChannelId = observeCurrentChannelId(database);
    const currentChannel = observeCurrentChannel(database);

    // fixme: this needs polishing
    const canManageMembers = combineLatest([currentChannelId, currentUser]).pipe(switchMap(([cId, u]) => (cId && u ? observeCanManageChannelMembers(database, cId, u) : of$(false))));

    const canChangeMemberRoles = combineLatest([currentChannel, currentUser, canManageMembers]).pipe(
        switchMap(([c, u, m]) => (of$(c) && of$(u) && of$(m) && observePermissionForChannel(database, c, u, Permissions.MANAGE_CHANNEL_ROLES, true))));

    const canRemoveMember = canManageMembers;

    return {
        currentUserId: observeCurrentUserId(database),
        currentTeamId: observeCurrentTeamId(database),
        canManageMembers,
        teammateNameDisplay: observeTeammateNameDisplay(database),
        tutorialWatched: observeProfileLongPresTutorial(),
        canChangeMemberRoles,
        canRemoveMember,
    };
});

export default withDatabase(enhanced(ManageChannelMembers));
