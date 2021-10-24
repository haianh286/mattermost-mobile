// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {fireEvent, render} from '@testing-library/react-native';

import React from 'react';

import {Preferences} from '@mm-redux/constants';
import {OsColorSchemeName} from '@mm-redux/types/general';
import {shallowWithIntl} from '@test/intl-test-helper';
import {ReduxIntlProvider} from '@test/testing_library';

import Theme from './theme';

describe('Theme', () => {
    // https://github.com/callstack/react-native-testing-library/issues/329#issuecomment-737307473
    jest.mock('react-native/Libraries/Components/Switch/Switch', () => {
        const mockComponent = require('react-native/jest/mockComponent');
        return mockComponent('react-native/Libraries/Components/Switch/Switch');
    });

    const lightPremade = Preferences.THEMES.denim;
    const darkPremade = Preferences.THEMES.indigo;
    const lightCustom = {...Preferences.THEMES.denim, type: 'custom'};
    const darkCustom = {...Preferences.THEMES.indigo, type: 'custom'};

    const toSetLightPremade = Preferences.THEMES.sapphire;
    const toSetDarkPremade = Preferences.THEMES.onyx;
    const toSetLightCustom = {...Preferences.THEMES.sapphire, type: 'custom'};
    const toSetDarkCustom = {...Preferences.THEMES.onyx, type: 'custom'};

    const initialPremadeThemes = [lightPremade, darkPremade];
    const initialCustomThemes = [lightCustom, darkCustom];

    const userId = 'dummyUserId';
    const teamId = 'dummyTeamId';
    const savePreferences = jest.fn();
    const baseProps = {
        theme: Preferences.THEMES.denim,
        allowedThemes: Object.keys(Preferences.THEMES).map((key) => ({key, ...Preferences.THEMES[key]})),
        defaultLightTheme: Preferences.THEMES.denim,
        lightTheme: Preferences.THEMES.denim,
        darkTheme: Preferences.THEMES.indigo,
        userId,
        isThemeSyncWithOsAvailable: true,
        isThemeSyncEnabled: true,
        teamId,
        isLandscape: false,
        isTablet: false,
        allowCustomThemes: true,
        osColorScheme: 'light' as OsColorSchemeName,
        actions: {savePreferences},
    };

    test.each([
        {
            initialThemes: initialPremadeThemes,
            toSet: toSetLightPremade,
            expectedLight: toSetLightPremade,
        },
        {
            initialThemes: initialPremadeThemes,
            toSet: toSetLightCustom,
            expectedLight: toSetLightCustom,
        },
        {
            initialThemes: initialPremadeThemes,
            toSet: toSetDarkPremade,
            expectedLight: initialPremadeThemes[0],
            expectedDark: toSetDarkPremade,
        },
        {
            initialThemes: initialPremadeThemes,
            toSet: toSetDarkCustom,
            expectedLight: initialPremadeThemes[0],
            expectedDark: toSetDarkCustom,
        },
        {
            initialThemes: initialCustomThemes,
            toSet: toSetLightPremade,
            expectedLight: toSetLightPremade,
        },
        {
            initialThemes: initialCustomThemes,
            toSet: toSetLightCustom,
            expectedLight: toSetLightCustom,
        },
        {
            initialThemes: initialCustomThemes,
            toSet: toSetDarkPremade,
            expectedLight: initialCustomThemes[0],
            expectedDark: toSetDarkPremade,
        },
        {
            initialThemes: initialCustomThemes,
            toSet: toSetDarkCustom,
            expectedLight: initialCustomThemes[0],
            expectedDark: toSetDarkCustom,
        },
    ])(
        'saves proper preferences when toggling OS sync',
        ({initialThemes, toSet, expectedLight, expectedDark}) => {
            const {getByTestId, update} = render(
                <ReduxIntlProvider>
                    <Theme
                        {...baseProps}
                        lightTheme={initialThemes[0]}
                        darkTheme={initialThemes[1]}
                    />
                </ReduxIntlProvider>,
            );
            update(
                <ReduxIntlProvider>
                    <Theme
                        {...baseProps}
                        lightTheme={initialThemes[0]}
                        darkTheme={initialThemes[1]}
                        isThemeSyncEnabled={false}
                    />
                </ReduxIntlProvider>,
            );
            update(
                <ReduxIntlProvider>
                    <Theme
                        {...baseProps}
                        lightTheme={toSet}
                        darkTheme={initialThemes[1]}
                        isThemeSyncEnabled={false}
                    />
                </ReduxIntlProvider>,
            );

            fireEvent(getByTestId('os_sync.switch'), 'valueChange', true);
            const expectedPref = [
                {category: Preferences.CATEGORY_ENABLE_THEME_SYNC, name: teamId, user_id: userId, value: 'true'},
                {category: Preferences.CATEGORY_THEME, name: teamId, user_id: userId, value: JSON.stringify(expectedLight)},
            ];
            if (expectedDark) {
                expectedPref.push({category: Preferences.CATEGORY_THEME_DARK, name: teamId, user_id: userId, value: JSON.stringify(expectedDark)});
            }
            expect(savePreferences).toHaveBeenCalledWith(userId, expectedPref);
        },
    );

    test('Matches snapshot when OS sync on', () => {
        const wrapper = shallowWithIntl(<Theme {...baseProps}/>);
        expect(wrapper.getElement()).toMatchSnapshot();
    });

    test('Matches snapshot when OS sync off', () => {
        const wrapper = shallowWithIntl(
            <Theme
                {...baseProps}
                isThemeSyncEnabled={false}
            />,
        );
        expect(wrapper.getElement()).toMatchSnapshot();
    });
});
