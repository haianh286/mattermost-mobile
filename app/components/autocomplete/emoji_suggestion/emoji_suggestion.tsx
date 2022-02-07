// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Fuse from 'fuse.js';
import React, {useCallback, useEffect, useMemo} from 'react';
import {FlatList, Platform, Text, View} from 'react-native';

import {handleReactionToLatestPost} from '@actions/remote/reactions';
import Emoji from '@components/emoji';
import TouchableWithFeedback from '@components/touchable_with_feedback';
import {useServerUrl} from '@context/server';
import {useTheme} from '@context/theme';
import {EmojiIndicesByAlias, Emojis} from '@utils/emoji';
import {compareEmojis, getEmojiByName, getSkin} from '@utils/emoji/helpers';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';

import type CustomEmojiModel from '@typings/database/models/servers/custom_emoji';

const EMOJI_REGEX = /(^|\s|^\+|^-)(:([^:\s]*))$/i;
const EMOJI_REGEX_WITHOUT_PREFIX = /\B(:([^:\s]*))$/i;
const FUSE_OPTIONS = {
    findAllMatches: true,
    ignoreLocation: true,
    includeMatches: true,
    shouldSort: false,
    includeScore: true,
};

const getStyleFromTheme = makeStyleSheetFromTheme((theme) => {
    return {
        emoji: {
            marginRight: 5,
        },
        emojiName: {
            fontSize: 15,
            color: theme.centerChannelColor,
        },
        emojiText: {
            color: '#000',
            fontWeight: 'bold',
        },
        listView: {
            paddingTop: 16,
            backgroundColor: theme.centerChannelBg,
            borderRadius: 4,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            overflow: 'hidden',
            paddingBottom: 8,
            paddingHorizontal: 16,
            height: 40,
        },
    };
});

const keyExtractor = (item: string) => item;

type Props = {
    cursorPosition: number;
    customEmojis: CustomEmojiModel[];
    maxListHeight: number;
    updateValue: (v: string) => void;
    onShowingChange: (c: boolean) => void;
    rootId: string;
    value: string;
    nestedScrollEnabled: boolean;
    skinTone: string;
}
const EmojiSuggestion = ({
    cursorPosition,
    customEmojis = [],
    maxListHeight,
    updateValue,
    onShowingChange,
    rootId,
    value,
    nestedScrollEnabled,
    skinTone,
}: Props) => {
    const theme = useTheme();
    const style = getStyleFromTheme(theme);
    const serverUrl = useServerUrl();
    const flatListStyle = useMemo(() =>
        [style.listView, {maxHeight: maxListHeight}]
    , [style, maxListHeight]);

    const emojis = useMemo(() => {
        const emoticons = new Set<string>();
        for (const [key, index] of EmojiIndicesByAlias.entries()) {
            const skin = getSkin(Emojis[index]);
            if (!skin || skin === skinTone) {
                emoticons.add(key);
            }
        }

        for (const custom of customEmojis) {
            emoticons.add(custom.name);
        }

        return Array.from(emoticons);
    }, [skinTone, customEmojis]);

    const searchTerm = useMemo(() => {
        const match = value.substring(0, cursorPosition).match(EMOJI_REGEX);
        return match?.[3] || '';
    }, [value, cursorPosition]);

    const fuse = useMemo(() => {
        return new Fuse(emojis, FUSE_OPTIONS);
    }, [emojis]);

    const data = useMemo(() => {
        const searchTermLowerCase = searchTerm.toLowerCase();

        if (searchTerm.length < 3) {
            return [];
        }

        const sorter = (a: string, b: string) => {
            return compareEmojis(a, b, searchTermLowerCase);
        };

        const fuzz = fuse.search(searchTermLowerCase);

        if (fuzz) {
            const results = fuzz.reduce((values, r) => {
                const score = r?.score === undefined ? 1 : r.score;
                const v = r?.matches?.[0]?.value;
                if (score < 0.2 && v) {
                    values.push(v);
                }

                return values;
            }, [] as string[]);

            return results.sort(sorter);
        }

        return [];
    }, [fuse, searchTerm]);

    const showingElements = Boolean(data.length);

    const completeSuggestion = useCallback((emoji: string) => {
        const emojiPart = value.substring(0, cursorPosition);

        if (emojiPart.startsWith('+:')) {
            handleReactionToLatestPost(serverUrl, emoji, true, rootId);
            updateValue('');
            return;
        }
        if (emojiPart.startsWith('-:')) {
            handleReactionToLatestPost(serverUrl, emoji, false, rootId);
            updateValue('');
            return;
        }

        // We are going to set a double : on iOS to prevent the auto correct from taking over and replacing it
        // with the wrong value, this is a hack but I could not found another way to solve it
        let completedDraft: string;
        let prefix = ':';
        if (Platform.OS === 'ios') {
            prefix = '::';
        }

        const emojiData = getEmojiByName(emoji);
        if (emojiData?.image && emojiData.category !== 'custom') {
            const codeArray: string[] = emojiData.image.split('-');
            const code = codeArray.reduce((acc, c) => {
                return acc + String.fromCodePoint(parseInt(c, 16));
            }, '');
            completedDraft = emojiPart.replace(EMOJI_REGEX_WITHOUT_PREFIX, `${code} `);
        } else {
            completedDraft = emojiPart.replace(EMOJI_REGEX_WITHOUT_PREFIX, `${prefix}${emoji}: `);
        }

        if (value.length > cursorPosition) {
            completedDraft += value.substring(cursorPosition);
        }

        updateValue(completedDraft);

        if (Platform.OS === 'ios' && (!emojiData?.filename || emojiData.category !== 'custom')) {
            // This is the second part of the hack were we replace the double : with just one
            // after the auto correct vanished
            setTimeout(() => {
                updateValue(completedDraft.replace(`::${emoji}: `, `:${emoji}: `));
            });
        }
    }, [value, updateValue, rootId, cursorPosition]);

    const renderItem = useCallback(({item}: {item: string}) => {
        const completeItemSuggestion = () => completeSuggestion(item);
        return (
            <TouchableWithFeedback
                onPress={completeItemSuggestion}
                underlayColor={changeOpacity(theme.buttonBg, 0.08)}
                type={'native'}
            >
                <View style={style.row}>
                    <View style={style.emoji}>
                        <Emoji
                            emojiName={item}
                            textStyle={style.emojiText}
                            size={24}
                        />
                    </View>
                    <Text style={style.emojiName}>{`:${item}:`}</Text>
                </View>
            </TouchableWithFeedback>
        );
    }, [completeSuggestion, theme]);

    useEffect(() => {
        onShowingChange(showingElements);
    }, [showingElements]);

    return (
        <FlatList
            testID='emoji_suggestion.list'
            keyboardShouldPersistTaps='always'
            style={flatListStyle}
            data={data}
            keyExtractor={keyExtractor}
            removeClippedSubviews={true}
            renderItem={renderItem}
            nestedScrollEnabled={nestedScrollEnabled}
            contentContainerStyle={{paddingBottom: 12}}
        />
    );
};

export default EmojiSuggestion;
