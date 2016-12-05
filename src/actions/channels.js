// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Constants, ChannelTypes, UsersTypes} from 'constants';
import {forceLogoutIfNecessary} from './helpers';
import {batchActions} from 'redux-batched-actions';
import Client from 'client';

export function createChannel(channel, userId) {
    return async (dispatch, getState) => {
        try {
            dispatch(batchActions([
                {
                    type: ChannelTypes.CREATE_CHANNEL_REQUEST
                },
                {
                    type: ChannelTypes.CHANNEL_MEMBERS_REQUEST
                }
            ]), getState);

            const created = await Client.createChannel(channel);
            const member = {
                channel_id: created.id,
                user_id: userId,
                roles: `${Constants.CHANNEL_USER_ROLE} ${Constants.CHANNEL_ADMIN_ROLE}`,
                last_viewed_at: 0,
                msg_count: 0,
                mention_count: 0,
                notify_props: {desktop: 'default', mark_unread: 'all'},
                last_update_at: created.create_at
            };

            dispatch(batchActions([
                {
                    type: ChannelTypes.RECEIVED_CHANNEL,
                    data: created
                },
                {
                    type: ChannelTypes.CREATE_CHANNEL_SUCCESS
                },
                {
                    type: ChannelTypes.RECEIVED_MY_CHANNEL_MEMBER,
                    data: member
                },
                {
                    type: ChannelTypes.CHANNEL_MEMBERS_SUCCESS
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch(batchActions([
                {
                    type: ChannelTypes.CREATE_CHANNEL_FAILURE,
                    error
                },
                {
                    type: ChannelTypes.CHANNEL_MEMBERS_FAILURE,
                    error
                }
            ]), getState);
        }
    };
}

export function createDirectChannel(userId, otherUserId) {
    return async (dispatch, getState) => {
        try {
            dispatch(batchActions([
                {
                    type: ChannelTypes.CREATE_CHANNEL_REQUEST
                },
                {
                    type: ChannelTypes.CHANNEL_MEMBERS_REQUEST
                },
                {
                    type: UsersTypes.PROFILES_REQUEST
                }
            ]), getState);

            const created = await Client.createDirectChannel(otherUserId);
            const profile = await Client.getUser(otherUserId);
            const member = {
                channel_id: created.id,
                user_id: userId,
                roles: `${Constants.CHANNEL_USER_ROLE} ${Constants.CHANNEL_ADMIN_ROLE}`,
                last_viewed_at: 0,
                msg_count: 0,
                mention_count: 0,
                notify_props: {desktop: 'default', mark_unread: 'all'},
                last_update_at: created.create_at
            };

            dispatch(batchActions([
                {
                    type: ChannelTypes.RECEIVED_CHANNEL,
                    data: created
                },
                {
                    type: ChannelTypes.CREATE_CHANNEL_SUCCESS
                },
                {
                    type: ChannelTypes.RECEIVED_MY_CHANNEL_MEMBER,
                    data: member
                },
                {
                    type: ChannelTypes.CHANNEL_MEMBERS_SUCCESS
                },
                {
                    type: UsersTypes.RECEIVED_PROFILES,
                    data: {[profile.id]: profile}
                },
                {
                    type: UsersTypes.PROFILES_SUCCESS
                },
                {
                    type: UsersTypes.RECEIVED_PREFERENCE,
                    data: {category: Constants.CATEGORY_DIRECT_CHANNEL_SHOW, name: otherUserId, value: 'true'}
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch(batchActions([
                {
                    type: ChannelTypes.CREATE_CHANNEL_FAILURE,
                    error
                },
                {
                    type: ChannelTypes.CHANNEL_MEMBERS_FAILURE,
                    error
                },
                {
                    type: UsersTypes.PROFILES_FAILURE
                }
            ]), getState);
        }
    };
}

export function updateChannel(channel) {
    return async (dispatch, getState) => {
        try {
            dispatch({type: ChannelTypes.UPDATE_CHANNEL_REQUEST}, getState);

            const updated = await Client.updateChannel(channel);
            dispatch(batchActions([
                {
                    type: ChannelTypes.RECEIVED_CHANNEL,
                    data: updated
                },
                {
                    type: ChannelTypes.UPDATE_CHANNEL_SUCCESS
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch({type: ChannelTypes.UPDATE_CHANNEL_FAILURE, error}, getState);
        }
    };
}

export function updateChannelNotifyProps(userId, teamId, channelId, props) {
    return async (dispatch, getState) => {
        try {
            dispatch({type: ChannelTypes.NOTIFY_PROPS_REQUEST}, getState);

            const data = {
                user_id: userId,
                channel_id: channelId,
                ...props
            };

            const notifyProps = await Client.updateChannelNotifyProps(teamId, data);
            dispatch(batchActions([
                {
                    type: ChannelTypes.RECEIVED_CHANNEL_PROPS,
                    data: notifyProps,
                    channel_id: channelId
                },
                {
                    type: ChannelTypes.NOTIFY_PROPS_SUCCESS
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch({type: ChannelTypes.NOTIFY_PROPS_FAILURE, error}, getState);
        }
    };
}

export function getChannel(teamId, channelId) {
    return async (dispatch, getState) => {
        try {
            dispatch({type: ChannelTypes.CHANNEL_REQUEST}, getState);

            const data = await Client.getChannel(teamId, channelId);

            dispatch(batchActions([
                {
                    type: ChannelTypes.RECEIVED_CHANNEL,
                    data: data.channel
                },
                {
                    type: ChannelTypes.CHANNEL_SUCCESS
                },
                {
                    type: ChannelTypes.RECEIVED_MY_CHANNEL_MEMBER,
                    data: data.member
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch({type: ChannelTypes.CHANNELS_FAILURE, error}, getState);
        }
    };
}

export function fetchMyChannelsAndMembers(teamId) {
    return async (dispatch, getState) => {
        try {
            dispatch(batchActions([
                {
                    type: ChannelTypes.CHANNELS_REQUEST
                },
                {
                    type: ChannelTypes.CHANNEL_MEMBERS_REQUEST
                }
            ]), getState);

            const channels = Client.getChannels(teamId);
            const channelMembers = Client.getMyChannelMembers(teamId);

            dispatch(batchActions([
                {
                    type: ChannelTypes.RECEIVED_CHANNELS,
                    data: await channels
                },
                {
                    type: ChannelTypes.CHANNELS_SUCCESS
                },
                {
                    type: ChannelTypes.RECEIVED_MY_CHANNEL_MEMBERS,
                    data: await channelMembers
                },
                {
                    type: ChannelTypes.CHANNEL_MEMBERS_SUCCESS
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch(batchActions([
                {
                    type: ChannelTypes.CHANNELS_FAILURE,
                    error
                },
                {
                    type: ChannelTypes.CHANNEL_MEMBERS_FAILURE,
                    error
                }
            ]), getState);
        }
    };
}

export function leaveChannel(teamId, channelId) {
    return async (dispatch, getState) => {
        try {
            dispatch({type: ChannelTypes.LEAVE_CHANNEL_REQUEST}, getState);

            await Client.leaveChannel(teamId, channelId);
            dispatch(batchActions([
                {
                    type: ChannelTypes.LEAVE_CHANNEL,
                    channel_id: channelId
                },
                {
                    type: ChannelTypes.LEAVE_CHANNEL_SUCCESS
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch({type: ChannelTypes.LEAVE_CHANNEL_FAILURE, error}, getState);
        }
    };
}

export function joinChannel(userId, teamId, channelId, channelName) {
    return async (dispatch, getState) => {
        try {
            dispatch({type: ChannelTypes.JOIN_CHANNEL_REQUEST}, getState);

            let channel;
            if (channelId) {
                channel = await Client.joinChannel(teamId, channelId);
            } else if (channelName) {
                channel = await Client.joinChannelByName(teamId, channelName);
            }

            const channelMember = {
                channel_id: channel.id,
                user_id: userId,
                roles: `${Constants.CHANNEL_USER_ROLE}`,
                last_viewed_at: 0,
                msg_count: 0,
                mention_count: 0,
                notify_props: {desktop: 'default', mark_unread: 'all'},
                last_update_at: new Date().getTime()
            };

            dispatch(batchActions([
                {
                    type: ChannelTypes.RECEIVED_CHANNEL,
                    data: channel
                },
                {
                    type: ChannelTypes.RECEIVED_MY_CHANNEL_MEMBER,
                    data: channelMember
                },
                {
                    type: ChannelTypes.JOIN_CHANNEL_SUCCESS
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch({type: ChannelTypes.JOIN_CHANNEL_FAILURE, error}, getState);
        }
    };
}

export function deleteChannel(teamId, channelId) {
    return async (dispatch, getState) => {
        try {
            dispatch({type: ChannelTypes.DELETE_CHANNEL_REQUEST}, getState);

            await Client.deleteChannel(teamId, channelId);
            dispatch(batchActions([
                {
                    type: ChannelTypes.RECEIVED_CHANNEL_DELETED,
                    channel_id: channelId
                },
                {
                    type: ChannelTypes.DELETE_CHANNEL_SUCCESS
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch({type: ChannelTypes.DELETE_CHANNEL_FAILURE, error}, getState);
        }
    };
}

export function updateLastViewedAt(teamId, channelId, active) {
    return async (dispatch, getState) => {
        try {
            dispatch({type: ChannelTypes.UPDATE_LAST_VIEWED_REQUEST}, getState);

            // this API should return the timestamp that was set
            await Client.updateLastViewedAt(teamId, channelId, active);
            dispatch(batchActions([
                {
                    type: ChannelTypes.RECEIVED_LAST_VIEWED,
                    channel_id: channelId,
                    last_viewed_at: new Date().getTime()
                },
                {
                    type: ChannelTypes.UPDATE_LAST_VIEWED_SUCCESS
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch({type: ChannelTypes.UPDATE_LAST_VIEWED_FAILURE, error}, getState);
        }
    };
}

export function getMoreChannels(teamId, offset, limit = Constants.CHANNELS_CHUNK_SIZE) {
    return async (dispatch, getState) => {
        try {
            dispatch({type: ChannelTypes.MORE_CHANNELS_REQUEST}, getState);

            const channels = Client.getMoreChannels(teamId, offset, limit);

            dispatch(batchActions([
                {
                    type: ChannelTypes.RECEIVED_MORE_CHANNELS,
                    data: await channels
                },
                {
                    type: ChannelTypes.MORE_CHANNELS_SUCCESS
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch({type: ChannelTypes.MORE_CHANNELS_FAILURE, error}, getState);
        }
    };
}

export function getChannelStats(teamId, channelId) {
    return async (dispatch, getState) => {
        try {
            dispatch({type: ChannelTypes.CHANNEL_STATS_REQUEST}, getState);

            const stat = await Client.getChannelStats(teamId, channelId);
            dispatch(batchActions([
                {
                    type: ChannelTypes.RECEIVED_CHANNEL_STATS,
                    data: stat
                },
                {
                    type: ChannelTypes.CHANNEL_STATS_SUCCESS
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch({type: ChannelTypes.CHANNEL_STATS_FAILURE, error}, getState);
        }
    };
}

export function addChannelMember(teamId, channelId, userId) {
    return async (dispatch, getState) => {
        try {
            dispatch({type: ChannelTypes.ADD_CHANNEL_MEMBER_REQUEST}, getState);

            await Client.addChannelMember(teamId, channelId, userId);
            dispatch(batchActions([
                {
                    type: UsersTypes.RECEIVED_PROFILE_IN_CHANNEL,
                    user_id: userId
                },
                {
                    type: ChannelTypes.ADD_CHANNEL_MEMBER_SUCCESS
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch({type: ChannelTypes.ADD_CHANNEL_MEMBER_FAILURE, error}, getState);
        }
    };
}

export function removeChannelMember(teamId, channelId, userId) {
    return async (dispatch, getState) => {
        try {
            dispatch({type: ChannelTypes.REMOVE_CHANNEL_MEMBER_REQUEST}, getState);

            await Client.addChannelMember(teamId, channelId, userId);
            dispatch(batchActions([
                {
                    type: UsersTypes.RECEIVED_PROFILE_NOT_IN_CHANNEL,
                    user_id: userId
                },
                {
                    type: ChannelTypes.REMOVE_CHANNEL_MEMBER_SUCCESS
                }
            ]), getState);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch);
            dispatch({type: ChannelTypes.REMOVE_CHANNEL_MEMBER_FAILURE, error}, getState);
        }
    };
}

export default {
    createChannel,
    createDirectChannel,
    updateChannel,
    updateChannelNotifyProps,
    getChannel,
    fetchMyChannelsAndMembers,
    leaveChannel,
    joinChannel,
    deleteChannel,
    updateLastViewedAt,
    getMoreChannels,
    getChannelStats,
    addChannelMember,
    removeChannelMember
};
