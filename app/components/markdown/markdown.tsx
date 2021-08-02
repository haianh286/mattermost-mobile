// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Parser, Node} from 'commonmark';
import Renderer from 'commonmark-react-renderer';
import React, {PureComponent, ReactElement} from 'react';
import {GestureResponderEvent, Platform, Text, TextStyle, View} from 'react-native';

import AtMention from '@components/at_mention';
import ChannelLink from '@components/channel_link';
import FormattedText from '@components/formatted_text';
import Hashtag from '@components/markdown/hashtag';
import {withTheme} from '@context/theme';
import {blendColors, concatStyles, makeStyleSheetFromTheme} from '@utils/theme';
import {getScheme} from '@utils/url';

import MarkdownBlockQuote from './markdown_block_quote';
import MarkdownCodeBlock from './markdown_code_block';
import MarkdownLink from './markdown_link';
import MarkdownList from './markdown_list';
import MarkdownListItem from './markdown_list_item';
import MarkdownTable from './markdown_table';
import MarkdownTableImage from './markdown_table_image';
import MarkdownTableRow, {MarkdownTableRowProps} from './markdown_table_row';
import MarkdownTableCell, {MarkdownTableCellProps} from './markdown_table_cell';
import {addListItemIndices, combineTextNodes, highlightMentions, pullOutImages} from './transform';

import type ChannelModel from '@typings/database/models/servers/channel';

type MarkdownProps = {
    autolinkedUrlSchemes: string[];
    baseTextStyle: TextStyle;
    blockStyles: {
        adjacentParagraph: object;
        horizontalRule: object;
        quoteBlockIcon: object;
    };
    channelMentions: Record<string, ChannelModel>;
    disableAtChannelMentionHighlight: boolean;
    disableAtMentions: boolean;
    disableChannelLink: boolean;
    disableGallery: boolean;
    disableHashtags: boolean;
    imagesMetadata: Record<string, PostImage>;
    isEdited: boolean;
    isReplyPost: boolean;
    isSearchResult: boolean;
    mentionKeys: Array<{ key: string }>;
    minimumHashtagLength: number;
    onChannelLinkPress: (channel: ChannelModel) => void;
    onPostPress: (event: GestureResponderEvent) => void;
    postId: string;
    textStyles: TextStyle;
    theme: Theme;
    value: string | number;
}

class Markdown extends PureComponent<MarkdownProps, {}> {
    static defaultProps = {
        textStyles: {},
        blockStyles: {},
        disableHashtags: false,
        disableAtMentions: false,
        disableChannelLink: false,
        disableAtChannelMentionHighlight: false,
        disableGallery: false,
        value: '',
    };

    private parser: Parser;
    private renderer: Renderer.Renderer;

    constructor(props: MarkdownProps) {
        super(props);

        this.parser = this.createParser();
        this.renderer = this.createRenderer();
    }

    createParser = () => {
        return new Parser({
            urlFilter: this.urlFilter,
            minimumHashtagLength: this.props.minimumHashtagLength,
        });
    };

    urlFilter = (url: string) => {
        const scheme = getScheme(url);
        return !scheme || this.props.autolinkedUrlSchemes.indexOf(scheme) !== -1;
    };

    createRenderer = () => {
        return new Renderer({
            renderers: {
                text: this.renderText,

                emph: Renderer.forwardChildren,
                strong: Renderer.forwardChildren,
                del: Renderer.forwardChildren,
                code: this.renderCodeSpan,
                link: this.renderLink,
                image: this.renderImage,
                atMention: this.renderAtMention,
                channelLink: this.renderChannelLink,
                emoji: this.renderEmoji,
                hashtag: this.renderHashtag,

                paragraph: this.renderParagraph,
                heading: this.renderHeading,
                codeBlock: this.renderCodeBlock,
                blockQuote: this.renderBlockQuote,

                list: this.renderList,
                item: this.renderListItem,

                hardBreak: this.renderHardBreak,
                thematicBreak: this.renderThematicBreak,
                softBreak: this.renderSoftBreak,

                htmlBlock: this.renderHtml,
                htmlInline: this.renderHtml,

                table: this.renderTable,
                table_row: this.renderTableRow,
                table_cell: this.renderTableCell,

                mention_highlight: Renderer.forwardChildren,

                editedIndicator: this.renderEditedIndicator,
            },
            renderParagraphsInLists: true,
            getExtraPropsForNode: this.getExtraPropsForNode,
        });
    };

    getExtraPropsForNode = (node) => {
        const extraProps = {
            continue: node.continue,
            index: node.index,
        };

        if (node.type === 'image') {
            extraProps.reactChildren = node.react.children;
            extraProps.linkDestination = node.linkDestination;
        }

        return extraProps;
    };

    computeTextStyle = (baseStyle, context) => {
        const contextStyles = context.map((type) => this.props.textStyles[type]).filter((f) => f !== undefined);
        return contextStyles.length ? concatStyles(baseStyle, contextStyles) : baseStyle;
    };

    renderText = ({context, literal}) => {
        if (context.indexOf('image') !== -1) {
            // If this text is displayed, it will be styled by the image component
            return (
                <Text testID='markdown_text'>
                    {literal}
                </Text>
            );
        }

        // Construct the text style based off of the parents of this node since RN's inheritance is limited
        const style = this.computeTextStyle(this.props.baseTextStyle, context);

        return (
            <Text
                testID='markdown_text'
                style={style}
            >
                {literal}
            </Text>
        );
    };

    renderCodeSpan = ({context, literal}) => {
        return <Text style={this.computeTextStyle([this.props.baseTextStyle, this.props.textStyles.code], context)}>{literal}</Text>;
    };

    renderImage = ({linkDestination, reactChildren, context, src}) => {
        if (!this.props.imagesMetadata) {
            return null;
        }

        if (context.indexOf('table') !== -1) {
            // We have enough problems rendering images as is, so just render a link inside of a table
            return (
                <MarkdownTableImage
                    disable={this.props.disableGallery}
                    imagesMetadata={this.props.imagesMetadata}
                    postId={this.props.postId}
                    source={src}
                >
                    {reactChildren}
                </MarkdownTableImage>
            );
        }

        return (
            <MarkdownImage
                disable={this.props.disableGallery}
                errorTextStyle={[this.computeTextStyle(this.props.baseTextStyle, context), this.props.textStyles.error]}
                linkDestination={linkDestination}
                imagesMetadata={this.props.imagesMetadata}
                isReplyPost={this.props.isReplyPost}
                postId={this.props.postId}
                source={src}
            >
                {reactChildren}
            </MarkdownImage>
        );
    };

    renderAtMention = ({context, mentionName}) => {
        if (this.props.disableAtMentions) {
            return this.renderText({context, literal: `@${mentionName}`});
        }

        const style = getStyleSheet(this.props.theme);

        return (
            <AtMention
                mentionStyle={this.props.textStyles.mention}
                textStyle={[this.computeTextStyle(this.props.baseTextStyle, context), style.atMentionOpacity]}
                isSearchResult={this.props.isSearchResult}
                mentionName={mentionName}
                onPostPress={this.props.onPostPress}
                mentionKeys={this.props.mentionKeys}
            />
        );
    };

    renderChannelLink = ({context, channelName}) => {
        if (this.props.disableChannelLink) {
            return this.renderText({context, literal: `~${channelName}`});
        }

        return (
            <ChannelLink
                linkStyle={this.props.textStyles.link}
                textStyle={this.computeTextStyle(this.props.baseTextStyle, context)}
                onChannelLinkPress={this.props.onChannelLinkPress}
                channelName={channelName}
                channelMentions={this.props.channelMentions}
            />
        );
    };

    renderEmoji = ({context, emojiName, literal}) => {
        return (
            <Emoji
                emojiName={emojiName}
                literal={literal}
                testID='markdown_emoji'
                textStyle={this.computeTextStyle(this.props.baseTextStyle, context)}
            />
        );
    };

    renderHashtag = ({context, hashtag}) => {
        if (this.props.disableHashtags) {
            return this.renderText({context, literal: `#${hashtag}`});
        }

        return (
            <Hashtag
                hashtag={hashtag}
                linkStyle={this.props.textStyles.link}
            />
        );
    };

    renderParagraph = ({children, first}) => {
        if (!children || children.length === 0) {
            return null;
        }

        const style = getStyleSheet(this.props.theme);
        const blockStyle = [style.block];
        if (!first) {
            blockStyle.push(this.props.blockStyles.adjacentParagraph);
        }

        return (
            <View style={blockStyle}>
                <Text>
                    {children}
                </Text>
            </View>
        );
    };

    renderHeading = ({children, level}) => {
        const containerStyle = [
            getStyleSheet(this.props.theme).block,
            this.props.blockStyles[`heading${level}`],
        ];
        const textStyle = this.props.blockStyles[`heading${level}Text`];
        return (
            <View style={containerStyle}>
                <Text style={textStyle}>
                    {children}
                </Text>
            </View>
        );
    };

    renderCodeBlock = (props) => {
        // These sometimes include a trailing newline
        const content = props.literal.replace(/\n$/, '');

        return (
            <MarkdownCodeBlock
                content={content}
                language={props.language}
                textStyle={this.props.textStyles.codeBlock}
            />
        );
    };

    renderBlockQuote = ({children, ...otherProps}) => {
        return (
            <MarkdownBlockQuote
                iconStyle={this.props.blockStyles.quoteBlockIcon}
                {...otherProps}
            >
                {children}
            </MarkdownBlockQuote>
        );
    };

    renderList = ({children, start, tight, type}) => {
        return (
            <MarkdownList
                ordered={type !== 'bullet'}
                start={start}
                tight={tight}
            >
                {children}
            </MarkdownList>
        );
    };

    renderListItem = ({children, context, ...otherProps}) => {
        const level = context.filter((type) => type === 'list').length;

        return (
            <MarkdownListItem
                bulletStyle={this.props.baseTextStyle}
                level={level}
                {...otherProps}
            >
                {children}
            </MarkdownListItem>
        );
    };

    renderHardBreak = () => {
        return <Text>{'\n'}</Text>;
    };

    renderThematicBreak = () => {
        return (
            <View
                style={this.props.blockStyles.horizontalRule}
                testID='markdown_thematic_break'
            />
        );
    };

    renderSoftBreak = () => {
        return <Text>{'\n'}</Text>;
    };

    renderHtml = (props) => {
        let rendered = this.renderText(props);

        if (props.isBlock) {
            const style = getStyleSheet(this.props.theme);

            rendered = (
                <View style={style.block}>
                    {rendered}
                </View>
            );
        }

        return rendered;
    };

    renderTable = ({children, numColumns}: {children: ReactElement; numColumns: number}) => {
        return (
            <MarkdownTable
                numColumns={numColumns}
            >
                {children}
            </MarkdownTable>
        );
    };

    renderTableRow = (args: MarkdownTableRowProps) => {
        return <MarkdownTableRow {...args}/>;
    };

    renderTableCell = (args: MarkdownTableCellProps) => {
        return <MarkdownTableCell {...args}/>;
    };

    renderLink = ({children, href}: {children: ReactElement; href: string}) => {
        return (
            <MarkdownLink href={href}>
                {children}
            </MarkdownLink>
        );
    };

    renderEditedIndicator = ({context}) => {
        let spacer = '';
        if (context[0] === 'paragraph') {
            spacer = ' ';
        }

        const style = getStyleSheet(this.props.theme);
        const styles = [
            this.props.baseTextStyle,
            style.editedIndicatorText,
        ];

        return (
            <Text
                style={styles}
            >
                {spacer}
                <FormattedText
                    id='post_message_view.edited'
                    defaultMessage='(edited)'
                />
            </Text>
        );
    };

    render() {
        let ast = this.parser.parse(this.props.value.toString());

        ast = combineTextNodes(ast);
        ast = addListItemIndices(ast);
        ast = pullOutImages(ast);
        ast = highlightMentions(ast, this.props.mentionKeys);

        if (this.props.isEdited) {
            const editIndicatorNode = new Node('edited_indicator');
            if (ast.lastChild && ['heading', 'paragraph'].includes(ast.lastChild.type)) {
                ast.lastChild.appendChild(editIndicatorNode);
            } else {
                const node = new Node('paragraph');
                node.appendChild(editIndicatorNode);

                ast.appendChild(node);
            }
        }

        return this.renderer.render(ast);
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    // Android has trouble giving text transparency depending on how it's nested,
    // so we calculate the resulting colour manually
    const editedOpacity = Platform.select({
        ios: 0.3,
        android: 1.0,
    });
    const editedColor = Platform.select({
        ios: theme.centerChannelColor,
        android: blendColors(theme.centerChannelBg, theme.centerChannelColor, 0.3),
    });

    return {
        block: {
            alignItems: 'flex-start',
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        editedIndicatorText: {
            color: editedColor,
            opacity: editedOpacity,
        },
        atMentionOpacity: {
            opacity: 1,
        },
    };
});

export default withTheme(Markdown);
