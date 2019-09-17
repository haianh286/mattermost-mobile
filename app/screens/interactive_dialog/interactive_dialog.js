// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Dimensions, ScrollView, View} from 'react-native';
import {Navigation} from 'react-native-navigation';

import {checkDialogElementForError, checkIfErrorsMatchElements} from 'mattermost-redux/utils/integration_utils';

import {changeOpacity, makeStyleSheetFromTheme} from 'app/utils/theme';

import ErrorText from 'app/components/error_text';
import StatusBar from 'app/components/status_bar';
import FormattedText from 'app/components/formatted_text';

import DialogElement from './dialog_element.js';
import DialogIntroductionText from './dialog_introduction_text.js';

export default class InteractiveDialog extends PureComponent {
    static propTypes = {
        url: PropTypes.string.isRequired,
        callbackId: PropTypes.string,
        introductionText: PropTypes.string,
        elements: PropTypes.arrayOf(PropTypes.object),
        notifyOnCancel: PropTypes.bool,
        state: PropTypes.string,
        theme: PropTypes.object,
        actions: PropTypes.shape({
            submitInteractiveDialog: PropTypes.func.isRequired,
            dismissModal: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        url: '',
        elements: [],
    };

    constructor(props) {
        super(props);

        const values = {};
        if (props.elements != null) {
            props.elements.forEach((e) => {
                values[e.name] = e.default || null;
            });
        }

        this.state = {
            values,
            error: null,
            errors: {},
            isLandscape: this.isLandscape(),
            submitting: false,
        };

        this.scrollView = React.createRef();
    }

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this);
        Dimensions.addEventListener('change', this.orientationDidChange);
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.orientationDidChange);
    }

    orientationDidChange = () => {
        this.setState({isLandscape: this.isLandscape()});
    }

    isLandscape = () => {
        const {height, width} = Dimensions.get('window');
        return width > height;
    }

    navigationButtonPressed({buttonId}) {
        switch (buttonId) {
        case 'submit-dialog':
            this.handleSubmit();
            break;
        case 'close-dialog':
            this.notifyOnCancelIfNeeded();
            this.handleHide();
            break;
        }
    }

    handleSubmit = async () => {
        const {elements} = this.props;
        const values = this.state.values;
        const errors = {};

        if (elements) {
            elements.forEach((elem) => {
                const error = checkDialogElementForError(elem, values[elem.name]);
                if (error) {
                    errors[elem.name] = (
                        <FormattedText
                            id={error.id}
                            defaultMessage={error.defaultMessage}
                            values={error.values}
                        />
                    );
                }
            });
        }

        this.setState({errors});

        if (Object.keys(errors).length !== 0) {
            return;
        }

        const {url, callbackId, state} = this.props;

        const dialog = {
            url,
            callback_id: callbackId,
            state,
            submission: values,
        };

        const {data} = await this.props.actions.submitInteractiveDialog(dialog);

        this.submitted = true;

        let hasErrors = false;

        if (data) {
            if (data.errors &&
                Object.keys(data.errors).length >= 0 &&
                checkIfErrorsMatchElements(data.errors, elements)
            ) {
                hasErrors = true;
                this.setState({errors: data.errors});
            }

            if (data.error) {
                hasErrors = true;
                this.setState({error: data.error});
                this.scrollView.current?.scrollTo({x: 0, y: 0});
            }
        }

        if (!hasErrors) {
            this.handleHide();
        }
    }

    notifyOnCancelIfNeeded = () => {
        if (this.submitted) {
            return;
        }

        const {url, callbackId, state, notifyOnCancel} = this.props;

        if (!notifyOnCancel) {
            return;
        }

        const dialog = {
            url,
            callback_id: callbackId,
            state,
            cancelled: true,
        };

        this.props.actions.submitInteractiveDialog(dialog);
    }

    handleHide = () => {
        this.props.actions.dismissModal();
    }

    onChange = (name, value) => {
        const values = {...this.state.values, [name]: value};
        this.setState({values});
    }

    render() {
        const {introductionText, elements, theme} = this.props;
        const {errors, isLandscape, values} = this.state;
        const style = getStyleFromTheme(theme);

        return (
            <View style={style.container}>
                <ScrollView
                    ref={this.scrollView}
                    style={style.scrollView}
                >
                    <StatusBar/>
                    {this.state.error && (
                        <ErrorText
                            textStyle={style.errorContainer}
                            error={this.state.error}
                        />
                    )}
                    {Boolean(introductionText) &&
                        <DialogIntroductionText
                            value={introductionText}
                            theme={theme}
                        />
                    }
                    {elements && elements.map((e) => {
                        return (
                            <DialogElement
                                key={'dialogelement' + e.name}
                                displayName={e.display_name}
                                name={e.name}
                                type={e.type}
                                subtype={e.subtype}
                                helpText={e.help_text}
                                errorText={errors[e.name]}
                                placeholder={e.placeholder}
                                minLength={e.min_length}
                                maxLength={e.max_length}
                                dataSource={e.data_source}
                                optional={e.optional}
                                options={e.options}
                                value={values[e.name]}
                                onChange={this.onChange}
                                theme={theme}
                                isLandscape={isLandscape}
                            />
                        );
                    })}
                </ScrollView>
            </View>
        );
    }
}

const getStyleFromTheme = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.03),
        },
        errorContainer: {
            marginTop: 15,
            marginLeft: 15,
            fontSize: 14,
            fontWeight: 'bold',
        },
        scrollView: {
            marginBottom: 20,
            marginTop: 10,
        },
    };
});
