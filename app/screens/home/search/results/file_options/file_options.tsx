// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import {View, Text} from 'react-native';

import {fetchPostById} from '@actions/remote/post';
import {fetchAndSwitchToThread} from '@actions/remote/thread';
import FileIcon from '@components/files/file_icon';
import ImageFile from '@components/files/image_file';
import VideoFile from '@components/files/video_file';
import FormattedDate from '@components/formatted_date';
import OptionItem from '@components/option_item';
import {useServerUrl} from '@context/server';
import {useTheme} from '@context/theme';
import CopyPublicLink from '@screens/gallery/footer/copy_public_link';
import DownloadWithAction from '@screens/gallery/footer/download_with_action';
import {getFormattedFileSize, isImage, isVideo} from '@utils/file';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {typography} from '@utils/typography';

const format = 'MMM DD YYYY HH:MM A';

export const TOAST_MARGIN_BOTTOM = 40;

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            marginTop: -20,
        },
        headerContainer: {
            float: 'left',
            marginTop: 20,
            marginBottom: 8,
        },
        fileIconContainer: {
            marginLeft: -10,
            marginBottom: 8,
            alignSelf: 'flex-start',
        },
        nameText: {
            color: theme.centerChannelColor,
            ...typography('Heading', 400, 'SemiBold'),
        },
        imageVideo: {
            marginLeft: 10,
            height: 72,
            width: 72,
        },
        infoContainer: {
            marginVertical: 8,
            alignItems: 'center',
            flexDirection: 'row',
        },
        infoText: {
            flexDirection: 'row',
            color: changeOpacity(theme.centerChannelColor, 0.64),
            ...typography('Body', 200, 'Regular'),
        },
        date: {
            color: changeOpacity(theme.centerChannelColor, 0.64),
            ...typography('Body', 200, 'Regular'),
        },
        toast: {
            marginTop: 100,
            alignItems: 'center',
        },
    };
});

type Props = {
    canDownloadFiles: boolean;
    enablePublicLink: boolean;
    fileInfo: FileInfo;
    toastMarginBottom: number;
}
const FileOptions = ({fileInfo, canDownloadFiles, enablePublicLink, toastMarginBottom}: Props) => {
    const theme = useTheme();
    const style = getStyleSheet(theme);
    const intl = useIntl();
    const ref = useRef<any>();
    const serverUrl = useServerUrl();
    const [action, setAction] = useState<GalleryAction>('none');

    const galleryItem = {...fileInfo, type: 'image'} as GalleryItemType;

    const handleDownload = useCallback(async () => {
        setAction('downloading');
    }, []);

    const handleCopyLink = useCallback(async () => {
        setAction('copying');
    }, []);

    const handleGotoChannel = useCallback(async () => {
        const fetchedPost = await fetchPostById(serverUrl, fileInfo.post_id, true);
        const post = fetchedPost.post;
        const rootId = post?.root_id || post?.id;
        if (rootId) {
            fetchAndSwitchToThread(serverUrl, rootId);
        } else {
            // what to do?
        }
    }, [fileInfo]);

    const icon = useMemo(() => {
        if (isImage(fileInfo)) {
            return (
                <View style={style.imageVideo}>
                    <ImageFile
                        file={fileInfo}
                        forwardRef={ref}
                        inViewPort={true}
                        resizeMode={'cover'}
                    />
                </View>
            );
        }
        if (isVideo(fileInfo)) {
            return (
                <View style={style.imageVideo}>
                    <VideoFile
                        file={fileInfo}
                        forwardRef={ref}
                        resizeMode={'cover'}
                        inViewPort={true}
                        index={0}
                        wrapperWidth={78}
                    />
                </View>
            );
        }
        return (
            <FileIcon
                file={fileInfo}
                iconSize={72}
            />
        );
    }, [fileInfo]);

    const header = useMemo(() => {
        const size = getFormattedFileSize(fileInfo.size);
        return (
            <View style={style.headerContainer}>
                <View style={style.fileIconContainer}>
                    {icon}
                </View>
                <Text
                    style={style.nameText}
                    numberOfLines={2}
                    ellipsizeMode={'tail'}
                >
                    {fileInfo.name}
                </Text>
                <View style={style.infoContainer}>
                    <Text style={style.infoText}>{`${size} • `}</Text>
                    <FormattedDate
                        style={style.date}
                        format={format}
                        value={fileInfo.create_at as number}
                    />
                </View>
            </View>
        );
    }, [fileInfo, icon]);

    return (
        <View style={style.container}>
            {header}
            {canDownloadFiles &&
                <OptionItem
                    action={handleDownload}
                    label={intl.formatMessage({id: 'screen.search.results.file_options.download', defaultMessage: 'Download'})}
                    icon={'download-outline'}
                    type='default'
                />
            }
            <OptionItem
                action={handleGotoChannel}
                label={intl.formatMessage({id: 'screen.search.results.file_options.open_in_channel', defaultMessage: 'Open in channel'})}
                icon={'globe'}
                type='default'
            />
            {enablePublicLink &&
                <OptionItem
                    action={handleCopyLink}
                    label={intl.formatMessage({id: 'screen.search.results.file_options.copy_link', defaultMessage: 'Copy link'})}
                    icon={'link-variant'}
                    type='default'
                />
            }
            <View style={[style.toast, {marginBottom: toastMarginBottom}]} >
                {action === 'downloading' &&
                <DownloadWithAction
                    action={action}
                    item={galleryItem}
                    setAction={setAction}
                />
                }
                {action === 'copying' &&
                <CopyPublicLink
                    item={galleryItem}
                    setAction={setAction}
                />
                }
            </View>
        </View>
    );
};

export default FileOptions;
