// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithIntl} from '@test/intl-test-helper';

import Header from './header';
import { PUSH_PROXY_STATUS_VERIFIED } from '@app/constants/push_proxy';

describe('components/channel_list/header', () => {
    it('Channel List Header Component should match snapshot', () => {
        const {toJSON} = renderWithIntl(
            <Header
                pushProxyStatus={PUSH_PROXY_STATUS_VERIFIED}
                canCreateChannels={true}
                canJoinChannels={true}
                displayName={'Test!'}
            />,
        );

        expect(toJSON()).toMatchSnapshot();
    });
});
