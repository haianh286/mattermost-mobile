// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    Animated,
    InteractionManager,
    Keyboard,
    TouchableWithoutFeedback,
    StyleSheet,
    View,
    Platform,
} from 'react-native';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';

import {SearchBar} from 'react-native-elements';

import CustomPropTypes from 'app/constants/custom_prop_types';

const AnimatedIonIcon = Animated.createAnimatedComponent(IonIcon);
const containerHeight = 40;
const middleHeight = 20;

export default class Search extends PureComponent {
    static propTypes = {
        onBlur: PropTypes.func,
        onFocus: PropTypes.func,
        onSearchButtonPress: PropTypes.func,
        onChangeText: PropTypes.func,
        onCancelButtonPress: PropTypes.func,
        onSelectionChange: PropTypes.func,
        backgroundColor: PropTypes.string,
        placeholderTextColor: PropTypes.string,
        titleCancelColor: PropTypes.string,
        tintColorSearch: PropTypes.string,
        tintColorDelete: PropTypes.string,
        selectionColor: PropTypes.string,
        inputStyle: CustomPropTypes.Style,
        cancelButtonStyle: CustomPropTypes.Style,
        autoFocus: PropTypes.bool,
        placeholder: PropTypes.string,
        cancelTitle: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
        ]),
        returnKeyType: PropTypes.string,
        keyboardType: PropTypes.string,
        autoCapitalize: PropTypes.string,
        inputHeight: PropTypes.number,
        inputBorderRadius: PropTypes.number,
        editable: PropTypes.bool,
        blurOnSubmit: PropTypes.bool,
        keyboardShouldPersist: PropTypes.bool,
        value: PropTypes.string,
        positionRightDelete: PropTypes.number,
        keyboardAppearance: PropTypes.string,
        showArrow: PropTypes.bool,
        leftComponent: PropTypes.element,
        leftComponentWidth: PropTypes.number,
        searchIconSize: PropTypes.number,
        backArrowSize: PropTypes.number,
        deleteIconSize: PropTypes.number,
    };

    static defaultProps = {
        onSelectionChange: () => true,
        onBlur: () => true,
        editable: true,
        blurOnSubmit: false,
        keyboardShouldPersist: false,
        placeholderTextColor: 'grey',
        value: '',
        showArrow: false,
        searchIconSize: 24,
        backArrowSize: 24,
        deleteIconSize: 20,
        leftComponentWidth: 56,
        inputBorderRadius: 6,
    };

    constructor(props) {
        super(props);

        this.iconDeleteAnimated = new Animated.Value(0);
        this.leftComponentAnimated = new Animated.Value(0);
        this.searchContainerAnimated = new Animated.Value(0);

        this.placeholder = this.props.placeholder || 'Search';
        this.cancelTitle = this.props.cancelTitle || 'Cancel';
    }

    setSearchContainerRef = (ref) => {
        this.searchContainerRef = ref;
    }

    setInputKeywordRef = (ref) => {
        this.inputKeywordRef = ref;
    }

    blur = () => {
        this.inputKeywordRef.blur();
    };

    focus = () => {
        this.inputKeywordRef.focus();

        if (this.props.leftComponent) {
            Animated.parallel([
                Animated.timing(
                    this.leftComponentAnimated,
                    {
                        toValue: 100,
                        duration: 200,
                    },
                ),
            ]);
        }
    };

    onBlur = () => {
        this.props.onBlur();
    };

    onSearch = async () => {
        if (this.props.keyboardShouldPersist === false) {
            await Keyboard.dismiss();
        }

        this.props.onSearchButtonPress(this.props.value);
    };

    onChangeText = (text) => {
        Animated.timing(
            this.iconDeleteAnimated,
            {
                toValue: (text.length > 0) ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            },
        ).start();

        if (this.props.onChangeText) {
            this.props.onChangeText(text);
        }
    };

    onFocus = () => {
        InteractionManager.runAfterInteractions(() => {
            if (this.props.onFocus) {
                this.props.onFocus();
            }
        });
    };

    onDelete = () => {
        Animated.timing(
            this.iconDeleteAnimated,
            {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            },
        ).start();
        this.focus();

        this.props.onChangeText('', true);
    };

    onCancel = () => {
        Keyboard.dismiss();
        InteractionManager.runAfterInteractions(() => {
            if (this.props.onCancelButtonPress) {
                this.props.onCancelButtonPress();
            }
        });
    };

    onSelectionChange = (event) => {
        this.props.onSelectionChange(event);
    };

    render() {
        const {backgroundColor, ...restOfInputPropStyles} = this.props.inputStyle;

        let clearIcon = null;
        let searchIcon = null;
        let cancelIcon = null;

        if (Platform.OS === 'ios') {
            clearIcon = (
                <TouchableWithoutFeedback
                    onPress={this.onDelete}
                >
                    <View style={[styles.iconDelete, this.props.inputHeight && {height: this.props.inputHeight}]}>
                        <AnimatedIonIcon
                            name='ios-close-circle'
                            size={17}
                            style={[
                                styles.iconDeleteDefault,
                                this.props.tintColorDelete && {color: this.props.tintColorDelete},
                                this.props.positionRightDelete && {right: this.props.positionRightDelete},
                                {
                                    opacity: this.iconDeleteAnimated,
                                },
                            ]}
                        />
                    </View>
                </TouchableWithoutFeedback>
            );

            searchIcon = (
                <EvilIcon
                    name='search'
                    size={24}
                    style={[
                        styles.iconSearch,
                        this.props.tintColorSearch && {color: this.props.tintColorSearch},
                        {
                            top: middleHeight - 10,
                        },
                    ]}
                />
            );
        } else {
            searchIcon = this.props.showArrow ?
                (
                    <TouchableWithoutFeedback onPress={this.onCancel}>
                        <MaterialIcon
                            name='arrow-back'
                            size={this.props.backArrowSize}
                            color={this.props.titleCancelColor || this.props.placeholderTextColor}
                        />
                    </TouchableWithoutFeedback>
                ) :
                (
                    <MaterialIcon
                        name='search'
                        size={this.props.searchIconSize}
                        color={this.props.tintColorSearch || this.props.placeholderTextColor}
                    />
                );

            // Making sure the icon won't change depending on whether the input is in focus on Android devices
            cancelIcon = searchIcon;

            clearIcon = this.props.value.length > 0 ? (
                <TouchableWithoutFeedback onPress={this.onDelete}>
                    <MaterialIcon
                        style={[{paddingRight: 7}]}
                        name='close'
                        size={this.props.deleteIconSize}
                        color={this.props.titleCancelColor || this.props.placeholderTextColor}
                    />
                </TouchableWithoutFeedback>
            ) : null;
        }

        return (
            <View style={styles.container}>
                {((this.props.leftComponent) ?
                    <View
                        style={[
                            styles.leftContainer,
                            {
                                width: this.props.leftComponentWidth,
                            },
                        ]}
                    >
                        {this.props.leftComponent}
                    </View> :
                    null
                )}
                <SearchBar
                    ref={this.setInputKeywordRef}
                    containerStyle={{
                        ...styles.searchContainer,
                        backgroundColor: this.props.backgroundColor,
                        marginLeft: 0,
                        height: Platform.select({
                            ios: containerHeight - 10,
                            android: this.props.inputHeight,
                        }),
                    }}
                    inputContainerStyle={{
                        backgroundColor,
                        height: this.props.inputHeight,
                        borderRadius: this.props.inputBorderRadius,
                        marginLeft: 5,
                    }}
                    inputStyle={{
                        ...styles.text,
                        ...restOfInputPropStyles,
                        color: this.props.placeholderTextColor,
                        height: this.props.inputHeight,
                        marginLeft: 10,
                    }}
                    placeholder={this.placeholder}
                    placeholderTextColor={this.props.placeholderTextColor}
                    selectionColor={this.props.selectionColor}
                    autoCorrect={false}
                    blurOnSubmit={this.props.blurOnSubmit}
                    editable={this.props.editable}
                    cancelButtonTitle={this.cancelTitle}
                    cancelButtonProps={{
                        buttonStyle: {
                            minWidth: 75,
                        },
                        buttonTextStyle: {
                            ...styles.text,
                            ...this.props.cancelButtonStyle,
                            color: this.props.titleCancelColor,
                        },
                    }}
                    onChangeText={this.onChangeText}
                    onSubmitEditing={this.onSearch}
                    returnKeyType={this.props.returnKeyType || 'search'}
                    keyboardType={this.props.keyboardType || 'default'}
                    autoCapitalize={this.props.autoCapitalize}
                    onBlur={this.onBlur}
                    onFocus={this.onFocus}
                    onCancel={this.onCancel}
                    onSelectionChange={this.onSelectionChange}
                    underlineColorAndroid='transparent'
                    enablesReturnKeyAutomatically={true}
                    keyboardAppearance={this.props.keyboardAppearance}
                    autoFocus={this.props.autoFocus}
                    showCancel={true}
                    value={this.props.value}
                    platform={Platform.OS === 'ios' ? 'ios' : 'android'}
                    clearIcon={clearIcon}
                    searchIcon={searchIcon}
                    cancelIcon={cancelIcon}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: containerHeight,
    },
    iconSearch: {
        flex: 1,
    },
    iconSearchDefault: {
        color: 'grey',
    },
    iconDelete: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
        top: containerHeight - 39,
    },
    iconDeleteDefault: {
        color: 'grey',
    },
    leftContainer: {
        right: 100,
    },
    searchContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 0,
        paddingBottom: 0,
        marginLeft: 0,
    },
    text: {
        fontSize: Platform.select({
            ios: 14,
            android: 15,
        }),
        color: '#fff',
    },
});
