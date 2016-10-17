// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

const HEADER_AUTH = 'Authorization';
const HEADER_BEARER = 'BEARER';
const HEADER_REQUESTED_WITH = 'X-Requested-With';
const HEADER_TOKEN = 'token';

export default class Client {
    constructor() {
        this.teamId = '';
        this.logToConsole = false;
        this.token = '';
        this.url = '';
        this.urlVersion = '/api/v3';

        this.translations = {
            connectionError: 'There appears to be a problem with your internet connection.',
            unknownError: 'We received an unexpected status code from the server.'
        };
    }

    setUrl(url) {
        this.url = url;
    }

    setTeamId(id) {
        this.teamId = id;
    }

    getTeamId() {
        if (!this.teamId) {
            console.error('You are trying to use a route that requires a team_id, but you have not called setTeamId() in client.jsx'); // eslint-disable-line no-console
        }

        return this.teamId;
    }

    getBaseRoute() {
        return `${this.url}${this.urlVersion}`;
    }

    getAdminRoute() {
        return `${this.url}${this.urlVersion}/admin`;
    }

    getGeneralRoute() {
        return `${this.url}${this.urlVersion}/general`;
    }

    getLicenseRoute() {
        return `${this.url}${this.urlVersion}/license`;
    }

    getTeamsRoute() {
        return `${this.url}${this.urlVersion}/teams`;
    }

    getTeamNeededRoute() {
        return `${this.url}${this.urlVersion}/teams/${this.getTeamId()}`;
    }

    getChannelsRoute() {
        return `${this.url}${this.urlVersion}/teams/${this.getTeamId()}/channels`;
    }

    getChannelNameRoute(channelName) {
        return `${this.url}${this.urlVersion}/teams/${this.getTeamId()}/channels/name/${channelName}`;
    }

    getChannelNeededRoute(channelId) {
        return `${this.url}${this.urlVersion}/teams/${this.getTeamId()}/channels/${channelId}`;
    }

    getCommandsRoute() {
        return `${this.url}${this.urlVersion}/teams/${this.getTeamId()}/commands`;
    }

    getEmojiRoute() {
        return `${this.url}${this.urlVersion}/emoji`;
    }

    getHooksRoute() {
        return `${this.url}${this.urlVersion}/teams/${this.getTeamId()}/hooks`;
    }

    getPostsRoute(channelId) {
        return `${this.url}${this.urlVersion}/teams/${this.getTeamId()}/channels/${channelId}/posts`;
    }

    getUsersRoute() {
        return `${this.url}${this.urlVersion}/users`;
    }

    getFilesRoute() {
        return `${this.url}${this.urlVersion}/teams/${this.getTeamId()}/files`;
    }

    getOAuthRoute() {
        return `${this.url}${this.urlVersion}/oauth`;
    }

    getUserNeededRoute(userId) {
        return `${this.url}${this.urlVersion}/users/${userId}`;
    }

    enableLogErrorsToConsole(enabled) {
        this.logToConsole = enabled;
    }

    getOptions(options) {
        const headers = {
            [HEADER_REQUESTED_WITH]: 'XMLHttpRequest'
        };

        if (this.token) {
            headers[HEADER_AUTH] = `${HEADER_BEARER} ${this.token}`;
        }

        return {
            headers,
            ...options
        };
    }

    // General routes

    getClientConfig = (onSuccess, onFailure) => {
        return this.doFetch(
            `${this.getGeneralRoute()}/client_props`,
            {method: 'get'},
            onSuccess,
            onFailure
        );
    }

    getPing = (onSuccess, onFailure) => {
        return this.doFetch(
            `${this.getGeneralRoute()}/ping`,
            {method: 'get'},
            onSuccess,
            onFailure
        );
    }

    logClientError = (message, level, onSuccess, onFailure) => {
        const body = {
            message,
            level: level || 'ERROR'
        };

        return this.doFetch(
            `${this.getGeneralRoute()}/log_client`,
            {method: 'post', body},
            onSuccess,
            onFailure
        );
    }

    // User routes

    createUser = (user, onSuccess, onFailure) => {
        return this.doFetch(
            `${this.getUsersRoute()}/create`,
            {method: 'post', body: JSON.stringify(user)},
            onSuccess,
            onFailure
        );
    }

    login = (loginId, password, token, onSuccess, onFailure) => {
        const body = {
            login_id: loginId,
            password,
            token
        };

        return this.doFetch(
            `${this.getUsersRoute()}/login`,
            {method: 'post', body: JSON.stringify(body)},
            (data, response) => {
                if (response.headers.has(HEADER_TOKEN)) {
                    this.token = response.headers.get(HEADER_TOKEN);
                }

                onSuccess(data, response);
            },
            onFailure
        );
    }

    getInitialLoad = (onSuccess, onFailure) => {
        return this.doFetch(
            `${this.getUsersRoute()}/initial_load`,
            {method: 'get'},
            onSuccess,
            onFailure
        );
    }

    // Team routes

    createTeam = (team, onSuccess, onFailure) => {
        return this.doFetch(
            `${this.getTeamsRoute()}/create`,
            {method: 'post', body: JSON.stringify(team)},
            onSuccess,
            onFailure
        );
    }

    // Channel routes

    createChannel = (channel, onSuccess, onFailure) => {
        return this.doFetch(
            `${this.getChannelsRoute()}/create`,
            {method: 'post', body: JSON.stringify(channel)},
            onSuccess,
            onFailure
        );
    }

    // Post routes

    createPost = (post, onSuccess, onFailure) => {
        return this.doFetch(
            `${this.getPostsRoute(post.channel_id)}/create`,
            {method: 'post', body: JSON.stringify(post)},
            onSuccess,
            onFailure
        );
    }

    doFetch = async (url, options, onSuccess, onFailure) => {
        try {
            const response = await fetch(url, this.getOptions(options));
            const data = await response.json();
            return response.ok ? onSuccess(data, response) : Promise.reject(data);
        } catch (err) {
            if (this.logToConsole) {
                console.log(err); // eslint-disable-line no-console
            }
            return onFailure(err);
        }
    }
}
