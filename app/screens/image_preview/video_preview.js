// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    Alert,
    StyleSheet,
    View
} from 'react-native';
import Video from 'react-native-video';
import RNFetchBlob from 'react-native-fetch-blob';
import {intlShape} from 'react-intl';

import EventEmitter from 'mattermost-redux/utils/event_emitter';

import VideoControls, {PLAYER_STATE} from 'app/components/video_controls';
import {DeviceTypes} from 'app/constants/';

import Downloader from './downloader.ios';

const {VIDEOS_PATH} = DeviceTypes;

export default class VideoPreview extends PureComponent {
    static propTypes = {
        deviceHeight: PropTypes.number,
        deviceWidth: PropTypes.number,
        file: PropTypes.object,
        onFullScreen: PropTypes.func,
        onSeeking: PropTypes.func,
        theme: PropTypes.object
    };

    static contextTypes = {
        intl: intlShape
    };

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isFullScreen: false,
            playerState: PLAYER_STATE.PAUSED,
            paused: true,
            currentTime: 0,
            duration: 0,
            path: null,
            showDownloader: true
        };
    }

    componentWillMount() {
        EventEmitter.on('stop-video-playback', this.stopPlayback);
        this.initializeComponent();
    }

    componentWillUnmount() {
        EventEmitter.off('stop-video-playback', this.stopPlayback);
    }

    async initializeComponent() {
        const {file} = this.props;
        const path = `${VIDEOS_PATH}/${file.id}.${file.extension}`;
        const exist = await RNFetchBlob.fs.exists(path);

        if (exist) {
            this.setState({path});
        }
    }

    exitFullScreen = () => {
        this.setState({isFullScreen: false});
        this.props.onFullScreen();
    };

    enterFullScreen = () => {
        this.setState({isFullScreen: true});
        this.props.onFullScreen();
    };

    onDownloadSuccess = () => {
        const {file} = this.props;
        const path = `${VIDEOS_PATH}/${file.id}.${file.extension}`;

        this.setState({showDownloader: false, path});
    };

    onEnd = () => {
        if (this.state.isFullScreen) {
            this.props.onFullScreen();
        }

        this.setState({playerState: PLAYER_STATE.ENDED, isFullScreen: false, paused: true});
    };

    onError = () => {
        const {intl} = this.context;

        Alert.alert(
            intl.formatMessage({
                id: 'mobile.video_playback.failed_title',
                defaultMessage: 'Video playback failed'
            }),
            intl.formatMessage({
                id: 'mobile.video_playback.failed_description',
                defaultMessage: 'An error occurred while trying to play the video.\n'
            }),
            [{
                text: intl.formatMessage({
                    id: 'mobile.server_upgrade.button',
                    defaultMessage: 'OK'
                })
            }]
        );
    };

    onFullScreen = () => {
        if (this.state.isFullScreen) {
            this.exitFullScreen();
        } else {
            this.enterFullScreen();
        }
    };

    onLoad = (data) => {
        this.setState({duration: data.duration, isLoading: false});
    };

    onLoadStart = () => {
        this.setState({isLoading: true});
    };

    onPaused = () => {
        this.setState({
            paused: !this.state.paused,
            playerState: this.state.paused ? PLAYER_STATE.PLAYING : PLAYER_STATE.PAUSED
        });
    };

    onProgress = (data) => {
        if (this.state.isLoading || this.state.playerState !== PLAYER_STATE.PLAYING) {
            return;
        }
        this.setState({currentTime: data.currentTime});
    };

    onReplay = () => {
        if (this.refs.videoPlayer) {
            this.setState({playerState: PLAYER_STATE.PLAYING, paused: false});
            this.refs.videoPlayer.seek(0);
        }
    };

    onSeek = (seek) => {
        if (this.refs.videoPlayer) {
            this.refs.videoPlayer.seek(seek);
        }
    };

    stopPlayback = () => {
        if (!this.state.paused) {
            this.onPaused();
        }
    };

    render() {
        const {
            deviceHeight,
            deviceWidth,
            file,
            onSeeking,
            theme
        } = this.props;

        const {currentTime, duration, isFullScreen, isLoading, path, paused, playerState, showDownloader} = this.state;

        if (!path) {
            return (
                <Downloader
                    show={showDownloader}
                    file={file}
                    deviceHeight={deviceHeight}
                    deviceWidth={deviceWidth}
                    downloadPath={VIDEOS_PATH}
                    prompt={true}
                    saveToCameraRoll={false}
                    onDownloadSuccess={this.onDownloadSuccess}
                />
            );
        }

        return (
            <View style={[styles.container, {height: deviceHeight, width: deviceWidth}]}>
                <Video
                    ref='videoPlayer'
                    style={[styles.mediaPlayer, {width: deviceWidth}]}
                    resizeMode='contain'
                    source={{uri: path}}
                    volume={1.0}
                    paused={paused}
                    onEnd={this.onEnd}
                    onLoad={this.onLoad}
                    onLoadStart={this.onLoadStart}
                    onProgress={this.onProgress}
                    onError={this.onError}
                />
                <VideoControls
                    ref='controls'
                    mainColor={theme.linkColor}
                    playerState={playerState}
                    isFullScreen={isFullScreen}
                    isLoading={isLoading}
                    progress={currentTime}
                    duration={duration}
                    onPaused={this.onPaused}
                    onSeek={this.onSeek}
                    onSeeking={onSeeking}
                    onReplay={this.onReplay}
                    onFullScreen={this.onFullScreen}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    mediaPlayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'black'
    }
});
