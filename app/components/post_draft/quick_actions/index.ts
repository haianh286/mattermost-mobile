// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import {combineLatest, of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {observeConfig, observeLicense} from '@app/queries/servers/system';
import {isMinimumServerVersion} from '@utils/helpers';

import QuickActions from './quick_actions';

import type {WithDatabaseArgs} from '@typings/database/database';

const enhanced = withObservables([], ({database}: WithDatabaseArgs) => {
    const config = observeConfig(database);
    const license = observeLicense(database);

    const canUploadFiles = combineLatest([config, license]).pipe(
        switchMap(([c, l]) => of$(
            c.EnableFileAttachments !== 'false' &&
                (l.IsLicensed === 'false' || l.Compliance === 'false' || c.EnableMobileFileUpload !== 'false'),
        ),
        ),
    );

    const maxFileCount = config.pipe(
        switchMap((cfg) => of$(isMinimumServerVersion(cfg.Version, 6, 0) ? 10 : 5)),
    );

    return {
        canUploadFiles,
        maxFileCount,
    };
});

export default withDatabase(enhanced(QuickActions));
