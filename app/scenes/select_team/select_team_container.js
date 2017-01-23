// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {goBack} from 'app/actions/navigation';
import {saveStorage} from 'app/actions/storage';

import {selectTeam} from 'service/actions/teams';
import {getCurrentTeam} from 'service/selectors/entities/teams';

import SelectTeam from './select_team.js';

function mapStateToProps(state) {
    return {
        config: state.entities.general.config,
        teamsRequest: state.requests.teams.allTeams,
        teams: state.entities.teams.teams,
        currentTeam: getCurrentTeam(state),
        myMembers: state.entities.teams.myMembers
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            goBackToChannelView: goBack,
            saveStorage,
            selectTeam
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectTeam);
