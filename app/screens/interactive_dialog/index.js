// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {submitInteractiveDialog} from 'mattermost-redux/actions/integrations';

import {dismissModal} from 'app/actions/navigation';
import {isLandscape} from 'app/selectors/device';

import InteractiveDialog from './interactive_dialog';

function mapStateToProps(state) {
    const data = state.entities.integrations.dialog || {dialog: {}};

    return {
        url: data.url,
        callbackId: data.dialog.callback_id,
        elements: data.dialog.elements,
        title: data.dialog.title,
        iconUrl: data.dialog.icon_url,
        isLandscape: isLandscape(state),
        submitLabel: data.dialog.submit_label,
        notifyOnCancel: data.dialog.notify_on_cancel,
        state: data.dialog.state,
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            submitInteractiveDialog,
            dismissModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InteractiveDialog);
