// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Database} from '@nozbe/watermelondb';
import Model from '@nozbe/watermelondb/Model';
import {Clause} from '@nozbe/watermelondb/QueryDescription';
import {Class} from '@nozbe/watermelondb/utils/common';

import {DatabaseType, IsolatedEntities} from './enums';

export type MigrationEvents = {
  onSuccess: () => void;
  onStarted: () => void;
  onFailure: (error: string) => void;
};

export type DatabaseConfigs = {
  actionsEnabled?: boolean;
  dbName: string;
  dbType?: DatabaseType.DEFAULT | DatabaseType.SERVER;
  serverUrl?: string;
};

export type DefaultNewServerArgs = {
  databaseFilePath: string;
  displayName: string;
  serverUrl: string;
};

// A database connection is of type 'Database'; unless it fails to be initialize and in which case it becomes 'undefined'
export type DatabaseInstance = Database | undefined;

export type RawApp = {
  buildNumber: string;
  createdAt: number;
  id: string;
  versionNumber: string;
};

export type RawGlobal = {
  id: string;
  name: string;
  value: string;
};

export type RawServers = {
  dbPath: string;
  displayName: string;
  id: string;
  mentionCount: number;
  unreadCount: number;
  url: string;
};

export type RawCustomEmoji = {
  id: string;
  name: string;
  create_at?: number;
  update_at?: number;
  delete_at?: number;
  creator_id: string;
};

export type RawRole = {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  permissions: string[];
  scheme_managed?: boolean;
};

export type RawSystem = {
  id: string;
  name: string;
  value: string;
};

export type RawTermsOfService = {
  id: string;
  acceptedAt: number;
  create_at: number;
  user_id: string;
  text: string;
};

export type RawDraft = {
  channel_id: string;
  files?: FileInfo[];
  message?: string;
  root_id: string;
};

export type RawEmbed = { data: {}; type: string; url: string };

export type RawPostMetadata = {
  data: any;
  type: string;
  postId: string;
};

interface PostMetadataTypes {
  embeds: PostEmbed;
  images: Dictionary<PostImage>;
}

export type RawFile = {
  create_at: number;
  delete_at: number;
  extension: string;
  has_preview_image?: boolean;
  height: number;
  id?: string;
  localPath?: string;
  mime_type?: string;
  mini_preview?: string; // thumbnail
  name: string;
  post_id: string;
  size: number;
  update_at: number;
  user_id: string;
  width?: number;
};

export type RawReaction = {
  create_at: number;
  delete_at: number;
  emoji_name: string;
  post_id: string;
  update_at: number;
  user_id: string;
};

export type RawPostsInChannel = {
  channel_id: string;
  earliest: number;
  latest: number;
};

interface PostEmbed {
  type: PostEmbedType;
  url: string;
  data: Record<string, any>;
}

interface PostImage {
  height: number;
  width: number;
  format?: string;
  frame_count?: number;
}

interface PostImageMetadata extends PostImage {
  url: string;
}

export type PostMetadataData = Record<string, any> | PostImageMetadata;

export type PostMetadataType = 'images' | 'embeds';

// The RawPost describes the shape of the object received from a getPosts request
export type RawPost = {
  channel_id: string;
  create_at: number;
  delete_at: number;
  edit_at: number;
  file_ids?: string[];
  filenames?: string[];
  hashtags: string;
  id: string;
  is_pinned?: boolean;
  last_reply_at?: number;
  message: string;
  original_id: string;
  parent_id: string;
  participants?: null;
  pending_post_id: string;
  prev_post_id?: string; // taken from getPosts API call; outside of post object
  props: object;
  reply_count?: number;
  root_id: string;
  type: string;
  update_at: number;
  user_id: string;
  metadata?: {
    embeds?: RawEmbed[];
    emojis?: RawCustomEmoji[];
    files?: RawFile[];
    images?: Dictionary<PostImage>;
    reactions?: RawReaction[];
  };
};

export type ChannelType = 'D' | 'O' | 'G' | 'P';

export type RawUser = {
  id: string;
  auth_service: string;
  create_at: number;
  delete_at: number;
  email: string;
  email_verified: boolean;
  failed_attempts?: number;
  first_name: string;
  is_bot: boolean;
  last_name: string;
  last_password_update: number;
  last_picture_update: number;
  locale: string;
  mfa_active?: boolean;
  nickname: string;
  notify_props: {
    channel: boolean;
    desktop: string;
    desktop_sound: boolean;
    email: boolean;
    first_name: boolean;
    mention_keys: string;
    push: string;
    auto_responder_active: boolean;
    auto_responder_message: string;
    desktop_notification_sound: string; // Not in use by the mobile app
    push_status: string;
    comments: string;
  };
  position?: string;
  props: UserProps;
  roles: string;
  timezone: {
    useAutomaticTimezone: boolean;
    manualTimezone: string;
    automaticTimezone: string;
  };
  terms_of_service_create_at?: number;
  terms_of_service_id?: string;
  update_at: number;
  username: string;
};

export type RawPreference = {
  category: string;
  name: string;
  user_id: string;
  value: string;
};

export type RawTeamMembership = {
  delete_at: number;
  explicit_roles: string;
  roles: string;
  scheme_admin: boolean;
  scheme_guest: boolean;
  scheme_user: boolean;
  team_id: string;
  user_id: string;
};

export type RawGroupMembership = {
  user_id: string;
  group_id: string;
};

export type RawChannelMembership = {
  channel_id: string;
  user_id: string;
  roles: string;
  last_viewed_at: number;
  msg_count: number;
  mention_count: number;
  notify_props: {
    desktop: string;
    email: string;
    ignore_channel_mentions: string;
    mark_unread: string;
    push: string;
  };
  last_update_at: number;
  scheme_guest: boolean;
  scheme_user: boolean;
  scheme_admin: boolean;
  explicit_roles: string;
};

export type RawChannelMembers = {
  channel_id: string;
  explicit_roles: string;
  last_update_at: number;
  last_viewed_at: number;
  mention_count: number;
  msg_count: number;
  notify_props: NotifyProps;
  roles: string;
  scheme_admin: boolean;
  scheme_guest: boolean;
  scheme_user: boolean;
  user_id: string;
};

export type RawChannel = {
  create_at: number;
  creator_id: string;
  delete_at: number;
  display_name: string;
  extra_update_at: number;
  group_constrained: boolean | null;
  header: string;
  id: string;
  last_post_at: number;
  name: string;
  props: null;
  purpose: string;
  scheme_id: null;
  shared: null;
  team_id: string;
  total_msg_count: number;
  type: ChannelType;
  update_at: number;
};

export type RawPostsInThread = {
  earliest: number;
  latest?: number;
  post_id: string;
};

export type RawGroup = {
  create_at: number;
  delete_at: number;
  description: string;
  display_name: string;
  has_syncables: boolean;
  id: string;
  name: string;
  remote_id: string;
  source: string;
  update_at: number;
};

export type RawGroupsInTeam = {
  auto_add: boolean;
  create_at: number;
  delete_at: number;
  group_id: string;
  team_display_name: string;
  team_id: string;
  team_type: string;
  update_at: number;
};

export type RawGroupsInChannel = {
  auto_add: boolean;
  channel_display_name: string;
  channel_id: string;
  channel_type: string;
  create_at: number;
  delete_at: number;
  group_id: string;
  team_display_name: string;
  team_id: string;
  team_type: string;
  update_at: number;
};

export type RawTeam = {
  id: string;
  allow_open_invite: boolean;
  allowed_domains: string;
  create_at: number;
  delete_at: number;
  description: string;
  display_name: string;
  email: string;
  invite_id: string;
  name: string;
  type: string;
  update_at: number;
};

export type RawSlashCommand = {
  id: string;
  auto_complete: boolean;
  auto_complete_desc: string;
  auto_complete_hint: string;
  create_at: number;
  creator_id: string;
  delete_at: number;
  description: string;
  display_name: string;
  icon_url: string;
  method: string;
  team_id: string;
  token: string;
  trigger: string;
  update_at: number;
  url: string;
  username: string;
};

export type RawValue =
  | RawApp
  | RawChannelMembership
  | RawCustomEmoji
  | RawDraft
  | RawFile
  | RawGlobal
  | RawGroup
  | RawGroupMembership
  | RawGroupsInChannel
  | RawGroupsInTeam
  | RawPost
  | RawPostMetadata
  | RawPostsInChannel
  | RawPostsInThread
  | RawPreference
  | RawReaction
  | RawRole
  | RawServers
  | RawSystem
  | RawTeam
  | RawTeamMembership
  | RawTermsOfService
  | RawUser;

export type MatchExistingRecord = { record?: Model; raw: RawValue };

export type DataFactoryArgs = {
  action: string;
  database: Database;
  generator?: (model: Model) => void;
  tableName?: string;
  value: MatchExistingRecord;
};

export type PrepareForDatabaseArgs = {
  tableName: string;
  createRaws?: MatchExistingRecord[];
  updateRaws?: MatchExistingRecord[];
  recordOperator: (DataFactoryArgs) => void;
};

export type PrepareRecordsArgs = PrepareForDatabaseArgs & {
  database: Database;
};

export type BatchOperationsArgs = { database: Database; models: Model[] };

export type HandleIsolatedEntityArgs = {
  tableName: IsolatedEntities;
  values: RawValue[];
};

export type Models = Class<Model>[];

// The elements needed to create a new connection
export type DatabaseConnectionArgs = {
  configs: DatabaseConfigs;
  shouldAddToDefaultDatabase: boolean;
};

// The elements required to switch to another active server database
export type ActiveServerDatabaseArgs = {
  displayName: string;
  serverUrl: string;
};

export type HandleReactionsArgs = {
  prepareRowsOnly: boolean;
  reactions: RawReaction[];
};

export type HandleFilesArgs = {
  files: RawFile[];
  prepareRowsOnly: boolean;
};

export type HandlePostMetadataArgs = {
  embeds?: { embed: RawEmbed[]; postId: string }[];
  images?: { images: Dictionary<PostImage>; postId: string }[];
  prepareRowsOnly: boolean;
};

export type HandlePostsArgs = {
  orders: string[];
  previousPostId?: string;
  values: RawPost[];
};

export type SanitizeReactionsArgs = {
  database: Database;
  post_id: string;
  rawReactions: RawReaction[];
};

export type ChainPostsArgs = {
  orders: string[];
  previousPostId: string;
  rawPosts: RawPost[];
};

export type SanitizePostsArgs = {
  orders: string[];
  posts: RawPost[];
};

export type IdenticalRecordArgs = {
  existingRecord: Model;
  newValue: RawValue;
  tableName: string;
};

export type RetrieveRecordsArgs = {
  database: Database;
  tableName: string;
  condition: Clause;
};

export type ProcessInputsArgs = {
  rawValues: RawValue[];
  tableName: string;
  fieldName: string;
  findMatchingRecordBy: (existing: Model, newElement: RawValue) => boolean;
};

export type HandleEntityRecordsArgs = {
  findMatchingRecordBy: (existing: Model, newElement: RawValue) => boolean;
  fieldName: string;
  operator: (DataFactoryArgs) => Promise<Model | null>;
  rawValues: RawValue[];
  tableName: string;
};

export type DatabaseInstances = {
  dbInstance: DatabaseInstance;
  url: string;
};

export type RangeOfValueArgs = {
  raws: RawValue[];
  fieldName: string;
};

export type RecordPair = {
  record?: Model;
  raw: RawValue;
};
