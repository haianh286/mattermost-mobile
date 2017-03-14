// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React, {PropTypes, PureComponent} from 'react';
import {Linking, TouchableHighlight, View} from 'react-native';

import CustomPropTypes from 'app/constants/custom_prop_types';

export default class MarkdownLink extends PureComponent {
    static propTypes = {
        children: CustomPropTypes.Children.isRequired,
        href: PropTypes.string.isRequired
    };

    handlePress = () => {
        const url = this.props.href;

        Linking.canOpenURL(url).then((supported) => {
            if (supported) {
                Linking.openURL(url);
            }
        });
    };

    render() {
        return (
            <TouchableHighlight onPress={this.handlePress}>
                <View style={{flexWrap: 'wrap', flexDirection: 'row'}}>
                    {this.props.children}
                </View>
            </TouchableHighlight>
        );
    }
}
