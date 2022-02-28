// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {debounce} from 'lodash';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Platform, SectionList, SectionListData} from 'react-native';

import {searchChannels} from '@actions/remote/channel';
import AutocompleteSectionHeader from '@components/autocomplete/autocomplete_section_header';
import ChannelMentionItem from '@components/autocomplete/channel_mention_item';
import {General} from '@constants';
import {CHANNEL_MENTION_REGEX, CHANNEL_MENTION_SEARCH_REGEX} from '@constants/autocomplete';
import {useServerUrl} from '@context/server';
import {useTheme} from '@context/theme';
import useDidUpdate from '@hooks/did_update';
import {t} from '@i18n';
import {makeStyleSheetFromTheme} from '@utils/theme';

import type MyChannelModel from '@typings/database/models/servers/my_channel';

const keyExtractor = (item: Channel) => {
    return item.id;
};

const getMatchTermForChannelMention = (() => {
    let lastMatchTerm: string | null = null;
    let lastValue: string;
    let lastIsSearch: boolean;
    return (value: string, isSearch: boolean) => {
        if (value !== lastValue || isSearch !== lastIsSearch) {
            const regex = isSearch ? CHANNEL_MENTION_SEARCH_REGEX : CHANNEL_MENTION_REGEX;
            const match = value.match(regex);
            lastValue = value;
            lastIsSearch = isSearch;
            if (match) {
                if (isSearch) {
                    lastMatchTerm = match[1].toLowerCase();
                } else if (match.index && match.index > 0 && value[match.index - 1] === '~') {
                    lastMatchTerm = null;
                } else {
                    lastMatchTerm = match[2].toLowerCase();
                }
            } else {
                lastMatchTerm = null;
            }
        }
        return lastMatchTerm;
    };
})();

const reduceChannelsForSearch = (channels: Channel[], members: MyChannelModel[]) => {
    return channels.reduce<Channel[][]>(([pubC, priC, dms], c) => {
        switch (c.type) {
            case General.OPEN_CHANNEL:
                if (members.find((m) => c.id === m.id)) {
                    pubC.push(c);
                }
                break;
            case General.PRIVATE_CHANNEL:
                priC.push(c);
                break;
            case General.DM_CHANNEL:
            case General.GM_CHANNEL:
                dms.push(c);
        }
        return [pubC, priC, dms];
    }, [[], [], []]);
};

const reduceChannelsForAutocomplete = (channels: Channel[], members: MyChannelModel[]) => {
    return channels.reduce<Channel[][]>(([myC, otherC], c) => {
        if (members.find((m) => c.id === m.id)) {
            myC.push(c);
        } else {
            otherC.push(c);
        }
        return [myC, otherC];
    }, [[], []]);
};
type Props = {
    cursorPosition: number;
    isSearch: boolean;
    maxListHeight: number;
    myMembers: MyChannelModel[];
    updateValue: (v: string) => void;
    onShowingChange: (c: boolean) => void;
    value: string;
    nestedScrollEnabled: boolean;
}

const getStyleFromTheme = makeStyleSheetFromTheme((theme) => {
    return {
        listView: {
            backgroundColor: theme.centerChannelBg,
            borderRadius: 4,
        },
    };
});

const ChannelMention = ({
    cursorPosition,
    isSearch,
    maxListHeight,
    myMembers,
    updateValue,
    onShowingChange,
    value,
    nestedScrollEnabled,
}: Props) => {
    const serverUrl = useServerUrl();
    const theme = useTheme();
    const style = getStyleFromTheme(theme);
    const [sections, setSections] = useState<Array<SectionListData<Channel>>>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(false);
    const [noResultsTerm, setNoResultsTerm] = useState<string|null>(null);

    const listStyle = useMemo(() =>
        [style.listView, {maxHeight: maxListHeight}]
    , [style, maxListHeight]);

    const runSearch = useMemo(() => debounce(async (sUrl: string, term: string) => {
        setLoading(true);
        const {channels: receivedChannels, error} = await searchChannels(sUrl, term);
        if (!error) {
            setChannels(receivedChannels!);
        }
        setLoading(false);
    }, 200), []);

    const matchTerm = getMatchTermForChannelMention(value.substring(0, cursorPosition), isSearch);

    const resetState = () => {
        setSections([]);
        setNoResultsTerm(null);
    };

    const completeMention = useCallback((mention: string) => {
        const mentionPart = value.substring(0, cursorPosition);

        let completedDraft: string;
        if (isSearch) {
            const channelOrIn = mentionPart.includes('in:') ? 'in:' : 'channel:';
            completedDraft = mentionPart.replace(CHANNEL_MENTION_SEARCH_REGEX, `${channelOrIn} ${mention} `);
        } else if (Platform.OS === 'ios') {
            // We are going to set a double ~ on iOS to prevent the auto correct from taking over and replacing it
            // with the wrong value, this is a hack but I could not found another way to solve it
            completedDraft = mentionPart.replace(CHANNEL_MENTION_REGEX, `~~${mention} `);
        } else {
            completedDraft = mentionPart.replace(CHANNEL_MENTION_REGEX, `~${mention} `);
        }

        if (value.length > cursorPosition) {
            completedDraft += value.substring(cursorPosition);
        }

        updateValue(completedDraft);

        if (Platform.OS === 'ios') {
            // This is the second part of the hack were we replace the double ~ with just one
            // after the auto correct vanished
            setTimeout(() => {
                updateValue(completedDraft.replace(`~~${mention} `, `~${mention} `));
            });
        }

        onShowingChange(false);
        setNoResultsTerm(mention);
    }, [value, cursorPosition, isSearch]);

    const renderItem = useCallback(({item}) => {
        return (
            <ChannelMentionItem
                channel={item}
                onPress={completeMention}
                testID={`autocomplete.channel_mention.item.${item}`}
            />
        );
    }, [completeMention]);

    const renderSectionHeader = useCallback(({section}) => {
        const isFirstSection = section.id === sections[0].id;
        return (
            <AutocompleteSectionHeader
                id={section.id}
                defaultMessage={section.defaultMessage}
                loading={!section.hideLoadingIndicator && loading}
                isFirstSection={isFirstSection}
            />
        );
    }, [sections[0]?.id, loading]);

    useEffect(() => {
        if (matchTerm === null) {
            resetState();
            onShowingChange(false);
            return;
        }

        if (noResultsTerm != null && matchTerm.startsWith(noResultsTerm)) {
            return;
        }

        setNoResultsTerm(null);
        runSearch(serverUrl, matchTerm);
    }, [matchTerm]);

    useDidUpdate(() => {
        const newSections = [];
        if (isSearch) {
            const [publicChannels, privateChannels, directAndGroupMessages] = reduceChannelsForSearch(channels, myMembers);
            if (publicChannels.length) {
                newSections.push({
                    id: t('suggestion.search.public'),
                    defaultMessage: 'Public Channels',
                    data: publicChannels,
                    key: 'publicChannels',
                    hideLoadingIndicator: true,
                });
            }

            if (privateChannels.length) {
                newSections.push({
                    id: t('suggestion.search.private'),
                    defaultMessage: 'Private Channels',
                    data: privateChannels,
                    key: 'privateChannels',
                    hideLoadingIndicator: true,
                });
            }

            if (directAndGroupMessages.length) {
                newSections.push({
                    id: t('suggestion.search.direct'),
                    defaultMessage: 'Direct Messages',
                    data: directAndGroupMessages,
                    key: 'directAndGroupMessages',
                    hideLoadingIndicator: true,
                });
            }
        } else {
            const [myChannels, otherChannels] = reduceChannelsForAutocomplete(channels, myMembers);
            if (myChannels.length) {
                newSections.push({
                    id: t('suggestion.mention.channels'),
                    defaultMessage: 'My Channels',
                    data: myChannels,
                    key: 'myChannels',
                    hideLoadingIndicator: true,
                });
            }

            if (otherChannels.length) {
                newSections.push({
                    id: t('suggestion.mention.morechannels'),
                    defaultMessage: 'Other Channels',
                    data: otherChannels,
                    key: 'otherChannels',
                    hideLoadingIndicator: true,
                });
            }
        }

        const nSections = newSections.length;
        if (nSections) {
            newSections[nSections - 1].hideLoadingIndicator = false;
        }

        if (!loading && !nSections && noResultsTerm == null) {
            setNoResultsTerm(matchTerm);
        }
        setSections(newSections);
        onShowingChange(Boolean(nSections));
    }, [channels, myMembers, loading]);

    if (sections.length === 0 || noResultsTerm != null) {
        // If we are not in an active state or the mention has been completed return null so nothing is rendered
        // other components are not blocked.
        return null;
    }

    return (
        <SectionList
            keyboardShouldPersistTaps='always'
            keyExtractor={keyExtractor}
            initialNumToRender={10}
            nestedScrollEnabled={nestedScrollEnabled}
            removeClippedSubviews={Platform.OS === 'android'}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            style={listStyle}
            sections={sections}
            testID='channel_mention_suggestion.list'
        />
    );
};

export default ChannelMention;
