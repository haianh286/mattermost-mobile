// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChannelListScreen} from '@support/ui/screen';
import {timeouts} from '@support/utils';
import {expect} from 'detox';

class BrowseChannelsScreen {
    testID = {
        browseChannelsScreen: 'browse_channels.screen',
        closeButton: 'close.browse_channels.button',
        createButton: 'browse_channels.create.button',
        searchInput: 'browse_channels.search_bar.search.input',
        searchClearButton: 'browse_channels.search_bar.search.clear.button',
        searchCancelButton: 'browse_channels.search_bar.search.cancel.button',
        channelDropdown: 'browse_channels.channel_dropdown',
        channelDropdownTextPublic: 'browse_channels.channel_dropdown.text.public',
        channelDropdownTextArchived: 'browse_channels.channel_dropdown.text.archived',
        channelDropdownTextShared: 'browse_channels.channel_dropdown.text.shared',
        flatChannelList: 'browse_channels.channel_list.flat_list',
    };

    browseChannelsScreen = element(by.id(this.testID.browseChannelsScreen));
    closeButton = element(by.id(this.testID.closeButton));
    createButton = element(by.id(this.testID.createButton));
    searchInput = element(by.id(this.testID.searchInput));
    searchClearButton = element(by.id(this.testID.searchClearButton));
    searchCancelButton = element(by.id(this.testID.searchCancelButton));
    channelDropdown = element(by.id(this.testID.channelDropdown));
    channelDropdownTextPublic = element(by.id(this.testID.channelDropdownTextPublic));
    channelDropdownTextArchived = element(by.id(this.testID.channelDropdownTextArchived));
    channelDropdownTextShared = element(by.id(this.testID.channelDropdownTextShared));
    flatChannelList = element(by.id(this.testID.flatChannelList));

    getChannelItem = (channelName: string) => {
        return element(by.id(`browse_channels.custom_list.channel_item.${channelName}`));
    };

    getChannelItemDisplayName = (channelName: string) => {
        return element(by.id(`browse_channels.custom_list.channel_item.${channelName}.display_name`));
    };

    toBeVisible = async () => {
        await waitFor(this.browseChannelsScreen).toExist().withTimeout(timeouts.TEN_SEC);

        return this.browseChannelsScreen;
    };

    open = async () => {
        // # Open browse channels screen
        await ChannelListScreen.headerPlusButton.tap();
        await ChannelListScreen.browseChannelsItem.tap();

        return this.toBeVisible();
    };

    close = async () => {
        await this.closeButton.tap();
        await expect(this.browseChannelsScreen).not.toBeVisible();
    };
}

const browseChannelsScreen = new BrowseChannelsScreen();
export default browseChannelsScreen;
