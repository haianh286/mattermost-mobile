// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {GeneralTypes, UsersTypes} from 'service/constants';

function config(state = {}, action) {
    switch (action.type) {
    case GeneralTypes.CLIENT_CONFIG_RECEIVED:
        return Object.assign({}, state, action.data);
    case UsersTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function license(state = {}, action) {
    switch (action.type) {
    case GeneralTypes.CLIENT_LICENSE_RECEIVED:
        return Object.assign({}, state, action.data);
    case UsersTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function appState(state = '', action) {
    switch (action.type) {
    case GeneralTypes.RECEIVED_APP_STATE:
        return action.data;

    default:
        return state;
    }
}

export default combineReducers({
    appState,
    config,
    license
});
