// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import assert from 'assert';

import * as Actions from 'actions/general';
import Client from 'client';
import configureStore from 'store/configureStore';
import {RequestStatus} from 'constants';
import TestHelper from 'test_helper';

describe('Actions.General', () => {
    it('getPing', (done) => {
        TestHelper.initBasic(Client).then(() => {
            const store = configureStore();

            store.subscribe(() => {
                const ping = store.getState().requests.general.server;

                if (ping.error) {
                    done(new Error(ping.error));
                } else if (ping.status !== RequestStatus.STARTED) {
                    done();
                }
            });

            Actions.getPing()(store.dispatch, store.getState);
        });
    });

    it('getClientConfig', (done) => {
        TestHelper.initBasic(Client).then(() => {
            const store = configureStore();

            store.subscribe(() => {
                const clientConfig = store.getState().entities.general.config;
                const configRequest = store.getState().requests.general.config;
                if (configRequest.status === RequestStatus.SUCCESS || configRequest.status === RequestStatus.FAILURE) {
                    if (configRequest.error) {
                        done(new Error(configRequest.error));
                    } else {
                        // Check a few basic fields since they may change over time
                        assert.ok(clientConfig.Version);
                        assert.ok(clientConfig.BuildNumber);
                        assert.ok(clientConfig.BuildDate);
                        assert.ok(clientConfig.BuildHash);

                        done();
                    }
                }
            });

            Actions.getClientConfig()(store.dispatch, store.getState);
        });
    });

    it('getLicenseConfig', (done) => {
        TestHelper.initBasic(Client).then(() => {
            const store = configureStore();

            store.subscribe(() => {
                const licenseConfig = store.getState().entities.general.license;
                const licenseRequest = store.getState().requests.general.license;
                if (licenseRequest.status === RequestStatus.SUCCESS || licenseRequest.status === RequestStatus.FAILURE) {
                    if (licenseRequest.error) {
                        done(new Error(licenseRequest.error));
                    } else {
                        // Check a few basic fields since they may change over time
                        assert.notStrictEqual(licenseConfig.IsLicensed, undefined);

                        done();
                    }
                }
            });

            Actions.getLicenseConfig()(store.dispatch, store.getState);
        });
    });

    it('getPing - Invalid URL', (done) => {
        TestHelper.initBasic(Client).then(() => {
            const store = configureStore();

            store.subscribe(() => {
                const ping = store.getState().requests.general.server;

                if (ping.status !== RequestStatus.STARTED && ping.error) {
                    done();
                }
            });

            Client.setUrl('https://example.com/fake/url');
            Actions.getPing()(store.dispatch, store.getState);
        });
    });
});
