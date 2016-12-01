// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {UsersTypes} from 'constants';
import {profilesToSet} from 'utils/users';

function currentId(state = '', action) {
    switch (action.type) {
    case UsersTypes.RECEIVED_ME:
        return action.data.id;

    case UsersTypes.LOGOUT_SUCCESS:
        return '';

    }

    return state;
}

function myPreferences(state = {}, action) {
    switch (action.type) {
    case UsersTypes.RECEIVED_PREFERENCES:
        const preferences = action.data;
        const nextState = {...state};
        for (const p of preferences) {
            nextState[`${p.category}--${p.name}`] = p.value;
        }
        return nextState;
    case UsersTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function mySessions(state = [], action) {
    switch (action.type) {
    case UsersTypes.RECEIVED_SESSIONS:
        return [].concat(...action.data);
    case UsersTypes.RECEIVED_REVOKED_SESSION:
        let index = -1;
        const length = state.length;
        for (let i = 0; i < length; i++) {
            if (state[i].id === action.data.id) {
                index = i;
                break;
            }
        }
        if (index > -1) {
            return state.slice(0, index).concat(state.slice(index + 1));
        }

        return [].concat(...action.data);
    case UsersTypes.LOGOUT_SUCCESS:
        return state.slice(state.length + 1).concat([]);
    default:
        return state;
    }
}

function myAudits(state = [], action) {
    switch (action.type) {
    case UsersTypes.RECEIVED_AUDITS:
        return [].concat(...action.data);
    case UsersTypes.LOGOUT_SUCCESS:
        return state.slice(state.length + 1).concat([]);
    default:
        return state;
    }
}

function profiles(state = {items: {}, offset: 0, count: 0}, action) {
    const nextState = {...state};
    switch (action.type) {
    case UsersTypes.RECEIVED_ME:
        nextState.items[action.data.id] = action.data;
        break;
    case UsersTypes.RECEIVED_PROFILES:
        if (action.offset != null && action.count != null) {
            nextState.offset = action.offset + action.count;
            nextState.count += action.count;
        }
        nextState.items = Object.assign({}, nextState.items, action.data);
        break;
    case UsersTypes.LOGOUT_SUCCESS:
        return {...state, items: {}, offset: 0, count: 0};
    }

    return nextState;
}

function profilesInTeam(state = {items: new Set(), offset: 0, count: 0}, action) {
    switch (action.type) {
    case UsersTypes.RECEIVED_PROFILES_IN_TEAM:
        return profilesToSet(state, action);
    case UsersTypes.LOGOUT_SUCCESS:
        return {...state, items: new Set(), offset: 0, count: 0};
    default:
        return state;
    }
}

function profilesInChannel(state = {items: new Set(), offset: 0, count: 0}, action) {
    switch (action.type) {
    case UsersTypes.RECEIVED_PROFILES_IN_CHANNEL:
        return profilesToSet(state, action);
    case UsersTypes.LOGOUT_SUCCESS:
        return {...state, items: new Set(), offset: 0, count: 0};
    default:
        return state;
    }
}

function profilesNotInChannel(state = {items: new Set(), offset: 0, count: 0}, action) {
    switch (action.type) {
    case UsersTypes.RECEIVED_PROFILES_NOT_IN_CHANNEL:
        return profilesToSet(state, action);
    case UsersTypes.LOGOUT_SUCCESS:
        return {...state, items: new Set(), offset: 0, count: 0};
    default:
        return state;
    }
}

function statuses(state = {}, action) {
    switch (action.type) {
    case UsersTypes.RECEIVED_STATUSES:
        const nextState = {...state};
        return Object.assign({}, nextState, action.data);
    case UsersTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export default combineReducers({

    // the current selected user
    currentId,

    // object where the key is the category-name and has the corresponding value
    myPreferences,

    // array with the user's sessions
    mySessions,

    // array with the user's audits
    myAudits,

    // object containing items, count and offset where items is an object where every key is a user id
    // and has an object with the users details
    profiles,

    // object containing items, count and offset where items is an object where every key is a user id
    // and has a Set with the users id that are members of the team
    profilesInTeam,

    // object containing items, count and offset where items is an object where every key is a user id
    // and has a Set with the users id that are members of the channel
    profilesInChannel,

    // object containing items, count and offset where items is an object where every key is a user id
    // and has a Set with the users id that are members of the channel
    profilesNotInChannel,

    // object where every key is the user id and has a value with the current status of each user
    statuses
});
