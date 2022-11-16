// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import merge from 'deepmerge';
import {Appearance, DeviceEventEmitter, NativeModules, StatusBar, Platform, Alert} from 'react-native';
import {ImageResource, Navigation, Options, OptionsModalPresentationStyle, OptionsTopBarButton} from 'react-native-navigation';
import tinyColor from 'tinycolor2';

import CompassIcon from '@components/compass_icon';
import {Device, Events, Screens, Navigation as NavigationConstants, Launch} from '@constants';
import {NOT_READY} from '@constants/screens';
import {getDefaultThemeByAppearance} from '@context/theme';
import EphemeralStore from '@store/ephemeral_store';
import NavigationStore from '@store/navigation_store';
import {appearanceControlledScreens, mergeNavigationOptions} from '@utils/navigation';
import {changeOpacity, setNavigatorStyles} from '@utils/theme';

import type {LaunchProps} from '@typings/launch';
import type {NavButtons} from '@typings/screens/navigation';

const {MattermostManaged} = NativeModules;
const isRunningInSplitView = MattermostManaged.isRunningInSplitView;

const alpha = {
    from: 0,
    to: 1,
    duration: 150,
};

export const loginAnimationOptions = () => {
    const theme = getThemeFromState();
    return {
        layout: {
            backgroundColor: theme.centerChannelBg,
            componentBackgroundColor: theme.centerChannelBg,
        },
        topBar: {
            visible: true,
            drawBehind: true,
            translucid: true,
            noBorder: true,
            elevation: 0,
            background: {
                color: 'transparent',
            },
            backButton: {
                color: changeOpacity(theme.centerChannelColor, 0.56),
            },
            scrollEdgeAppearance: {
                active: true,
                noBorder: true,
                translucid: true,
            },
        },
        animations: {
            topBar: {
                alpha,
            },
            push: {
                waitForRender: false,
                content: {
                    alpha,
                },
            },
            pop: {
                content: {
                    alpha: {
                        from: 1,
                        to: 0,
                        duration: 100,
                    },
                },
            },
        },
    };
};

export const bottomSheetModalOptions = (theme: Theme, closeButtonId?: string): Options => {
    if (closeButtonId) {
        const closeButton = CompassIcon.getImageSourceSync('close', 24, theme.centerChannelColor);
        const closeButtonTestId = `${closeButtonId.replace('close-', 'close.').replace(/-/g, '_')}.button`;
        return {
            modalPresentationStyle: OptionsModalPresentationStyle.formSheet,
            topBar: {
                leftButtons: [{
                    id: closeButtonId,
                    icon: closeButton,
                    testID: closeButtonTestId,
                }],
                leftButtonColor: changeOpacity(theme.centerChannelColor, 0.56),
                background: {
                    color: theme.centerChannelBg,
                },
                title: {
                    color: theme.centerChannelColor,
                },
            },
        };
    }

    return {
        animations: {
            showModal: {
                enabled: false,
            },
            dismissModal: {
                enabled: false,
            },
        },
        modalPresentationStyle: Platform.select({
            ios: OptionsModalPresentationStyle.overFullScreen,
            default: OptionsModalPresentationStyle.overCurrentContext,
        }),
        statusBar: {
            backgroundColor: null,
            drawBehind: true,
            translucent: true,
        },
    };
};

// This locks phones to portrait for all screens while keeps
// all orientations available for Tablets.
Navigation.setDefaultOptions({
    layout: {
        orientation: Device.IS_TABLET ? undefined : ['portrait'],
    },
    topBar: {
        title: {
            fontFamily: 'Metropolis-SemiBold',
            fontSize: 18,
            fontWeight: '600',
        },
        backButton: {
            enableMenu: false,
        },
        subtitle: {
            fontFamily: 'OpenSans',
            fontSize: 12,
            fontWeight: '400',
        },
    },
});

Appearance.addChangeListener(() => {
    const theme = getThemeFromState();
    const screens = NavigationStore.getAllNavigationComponents();

    if (screens.includes(Screens.SERVER)) {
        for (const screen of screens) {
            if (appearanceControlledScreens.has(screen)) {
                Navigation.updateProps(screen, {theme});
                setNavigatorStyles(screen, theme, loginAnimationOptions(), theme.sidebarBg);
            }
        }
    }
});

export function getThemeFromState(): Theme {
    if (EphemeralStore.theme) {
        return EphemeralStore.theme;
    }

    return getDefaultThemeByAppearance();
}

// This is a temporary helper function to avoid
// crashes when trying to load a screen that does
// NOT exists, this should be removed for GA
function isScreenRegistered(screen: string) {
    const notImplemented = NOT_READY.includes(screen) || !Object.values(Screens).includes(screen);
    if (notImplemented) {
        Alert.alert(
            'Temporary error ' + screen,
            'The functionality you are trying to use has not been implemented yet',
        );
        return false;
    }

    return true;
}

export function resetToHome(passProps: LaunchProps = {launchType: Launch.Normal}) {
    const theme = getThemeFromState();
    const isDark = tinyColor(theme.sidebarBg).isDark();
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');

    if (passProps.launchType === Launch.AddServer) {
        dismissModal({componentId: Screens.SERVER});
        dismissModal({componentId: Screens.LOGIN});
        dismissModal({componentId: Screens.SSO});
        dismissModal({componentId: Screens.BOTTOM_SHEET});
        DeviceEventEmitter.emit(Events.FETCHING_POSTS, false);
        return '';
    }

    NavigationStore.clearNavigationComponents();

    const stack = {
        children: [{
            component: {
                id: Screens.HOME,
                name: Screens.HOME,
                passProps,
                options: {
                    layout: {
                        componentBackgroundColor: theme.centerChannelBg,
                    },
                    statusBar: {
                        visible: true,
                        backgroundColor: theme.sidebarBg,
                    },
                    topBar: {
                        visible: false,
                        height: 0,
                        background: {
                            color: theme.sidebarBg,
                        },
                        backButton: {
                            visible: false,
                            color: theme.sidebarHeaderTextColor,
                        },
                    },
                },
            },
        }],
    };

    return Navigation.setRoot({
        root: {stack},
    });
}

export function resetToSelectServer(passProps: LaunchProps) {
    const theme = getDefaultThemeByAppearance();
    const isDark = tinyColor(theme.sidebarBg).isDark();
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');

    NavigationStore.clearNavigationComponents();

    const children = [{
        component: {
            id: Screens.SERVER,
            name: Screens.SERVER,
            passProps: {
                ...passProps,
                theme,
            },
            options: {
                layout: {
                    backgroundColor: theme.centerChannelBg,
                    componentBackgroundColor: theme.centerChannelBg,
                },
                statusBar: {
                    visible: true,
                    backgroundColor: theme.sidebarBg,
                },
                topBar: {
                    backButton: {
                        color: theme.sidebarHeaderTextColor,
                        title: '',
                    },
                    background: {
                        color: theme.sidebarBg,
                    },
                    visible: false,
                    height: 0,
                },
            },
        },
    }];

    return Navigation.setRoot({
        root: {
            stack: {
                children,
            },
        },
    });
}

export function resetToTeams() {
    const theme = getThemeFromState();
    const isDark = tinyColor(theme.sidebarBg).isDark();
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');

    NavigationStore.clearNavigationComponents();

    return Navigation.setRoot({
        root: {
            stack: {
                children: [{
                    component: {
                        id: Screens.SELECT_TEAM,
                        name: Screens.SELECT_TEAM,
                        options: {
                            layout: {
                                componentBackgroundColor: theme.centerChannelBg,
                            },
                            statusBar: {
                                visible: true,
                                backgroundColor: theme.sidebarBg,
                            },
                            topBar: {
                                visible: false,
                                height: 0,
                                background: {
                                    color: theme.sidebarBg,
                                },
                                backButton: {
                                    visible: false,
                                    color: theme.sidebarHeaderTextColor,
                                },
                            },
                        },
                    },
                }],
            },
        },
    });
}

export function goToScreen(name: string, title: string, passProps = {}, options = {}) {
    if (!isScreenRegistered(name)) {
        return '';
    }

    const theme = getThemeFromState();
    const isDark = tinyColor(theme.sidebarBg).isDark();
    const componentId = NavigationStore.getNavigationTopComponentId();
    DeviceEventEmitter.emit(Events.TAB_BAR_VISIBLE, false);
    const defaultOptions: Options = {
        layout: {
            componentBackgroundColor: theme.centerChannelBg,
        },
        popGesture: true,
        sideMenu: {
            left: {enabled: false},
            right: {enabled: false},
        },
        statusBar: {
            style: isDark ? 'light' : 'dark',
        },
        topBar: {
            animate: true,
            visible: true,
            backButton: {
                color: theme.sidebarHeaderTextColor,
                title: '',
                testID: 'screen.back.button',
            },
            background: {
                color: theme.sidebarBg,
            },
            title: {
                color: theme.sidebarHeaderTextColor,
                text: title,
            },
        },
    };

    return Navigation.push(componentId, {
        component: {
            id: name,
            name,
            passProps,
            options: merge(defaultOptions, options),
        },
    });
}

export function popTopScreen(screenId?: string) {
    if (screenId) {
        Navigation.pop(screenId);
    } else {
        const componentId = NavigationStore.getNavigationTopComponentId();
        Navigation.pop(componentId);
    }
}

export async function popToRoot() {
    const componentId = NavigationStore.getNavigationTopComponentId();

    try {
        await Navigation.popToRoot(componentId);
    } catch (error) {
        // RNN returns a promise rejection if there are no screens
        // atop the root screen to pop. We'll do nothing in this case.
    }
}

export async function dismissAllModalsAndPopToRoot() {
    await dismissAllModals();
    await popToRoot();

    DeviceEventEmitter.emit(NavigationConstants.NAVIGATION_DISMISS_AND_POP_TO_ROOT);
}

/**
 * Dismisses All modals in the stack and pops the stack to the desired screen
 * (if the screen is not in the stack, it will push a new one)
 * @param screenId Screen to pop or display
 * @param title Title to be shown in the top bar
 * @param passProps Props to pass to the screen
 * @param options Navigation options
 */
export async function dismissAllModalsAndPopToScreen(screenId: string, title: string, passProps = {}, options = {}) {
    await dismissAllModals();
    if (NavigationStore.getNavigationComponents().includes(screenId)) {
        let mergeOptions = options;
        if (title) {
            mergeOptions = merge(mergeOptions, {
                topBar: {
                    title: {
                        text: title,
                    },
                },
            });
        }
        try {
            await Navigation.popTo(screenId, mergeOptions);
            if (Object.keys(passProps).length > 0) {
                await Navigation.updateProps(screenId, passProps);
            }
        } catch {
            // catch in case there is nothing to pop
        }
    } else {
        goToScreen(screenId, title, passProps, options);
    }
}

export function showModal(name: string, title: string, passProps = {}, options: Options = {}) {
    if (!isScreenRegistered(name)) {
        return;
    }

    const theme = getThemeFromState();
    const modalPresentationStyle: OptionsModalPresentationStyle = Platform.OS === 'ios' ? OptionsModalPresentationStyle.pageSheet : OptionsModalPresentationStyle.none;
    const defaultOptions: Options = {
        modalPresentationStyle,
        layout: {
            componentBackgroundColor: theme.centerChannelBg,
        },
        statusBar: {
            visible: true,
        },
        topBar: {
            animate: true,
            visible: true,
            backButton: {
                color: theme.sidebarHeaderTextColor,
                title: '',
            },
            background: {
                color: theme.sidebarBg,
            },
            title: {
                color: theme.sidebarHeaderTextColor,
                text: title,
            },
            leftButtonColor: theme.sidebarHeaderTextColor,
            rightButtonColor: theme.sidebarHeaderTextColor,
        },
        modal: {swipeToDismiss: false},
    };

    NavigationStore.addNavigationModal(name);
    Navigation.showModal({
        stack: {
            children: [{
                component: {
                    id: name,
                    name,
                    passProps: {
                        ...passProps,
                        isModal: true,
                    },
                    options: merge(defaultOptions, options),
                },
            }],
        },
    });
}

export function showModalOverCurrentContext(name: string, passProps = {}, options: Options = {}) {
    const title = '';
    let animations;
    switch (Platform.OS) {
        case 'android':
            animations = {
                showModal: {
                    waitForRender: false,
                    alpha: {
                        from: 0,
                        to: 1,
                        duration: 250,
                    },
                },
                dismissModal: {
                    alpha: {
                        from: 1,
                        to: 0,
                        duration: 250,
                    },
                },
            };
            break;
        default:
            animations = {
                showModal: {
                    alpha: {
                        from: 0,
                        to: 1,
                        duration: 250,
                    },
                },
                dismissModal: {
                    enter: {
                        enabled: false,
                    },
                    exit: {
                        enabled: false,
                    },
                },
            };
            break;
    }
    const defaultOptions = {
        modalPresentationStyle: OptionsModalPresentationStyle.overCurrentContext,
        layout: {
            backgroundColor: 'transparent',
            componentBackgroundColor: 'transparent',
        },
        topBar: {
            visible: false,
            height: 0,
        },
        animations,
    };
    const mergeOptions = merge(defaultOptions, options);
    showModal(name, title, passProps, mergeOptions);
}

export async function dismissModal(options?: Options & { componentId: string}) {
    if (!NavigationStore.hasModalsOpened()) {
        return;
    }

    const componentId = options?.componentId || NavigationStore.getNavigationTopModalId();
    if (componentId) {
        try {
            await Navigation.dismissModal(componentId, options);
            NavigationStore.removeNavigationModal(componentId);
        } catch (error) {
            // RNN returns a promise rejection if there is no modal to
            // dismiss. We'll do nothing in this case.
        }
    }
}

export async function dismissAllModals() {
    if (!NavigationStore.hasModalsOpened()) {
        return;
    }

    try {
        const modals = [...NavigationStore.getAllNavigationModals()];
        for await (const modal of modals) {
            NavigationStore.removeNavigationModal(modal);
            await Navigation.dismissModal(modal, {animations: {dismissModal: {enabled: false}}});
        }
    } catch (error) {
        // RNN returns a promise rejection if there are no modals to
        // dismiss. We'll do nothing in this case.
    }
}

export const buildNavigationButton = (id: string, testID: string, icon?: ImageResource, text?: string): OptionsTopBarButton => ({
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    id,
    icon,
    showAsAction: 'always',
    testID,
    text,
});

export function setButtons(componentId: string, buttons: NavButtons = {leftButtons: [], rightButtons: []}) {
    const options = {
        topBar: {
            ...buttons,
        },
    };

    mergeNavigationOptions(componentId, options);
}

export function showOverlay(name: string, passProps = {}, options: Options = {}) {
    if (!isScreenRegistered(name)) {
        return;
    }

    const defaultOptions = {
        layout: {
            backgroundColor: 'transparent',
            componentBackgroundColor: 'transparent',
        },
        overlay: {
            interceptTouchOutside: false,
        },
    };

    Navigation.showOverlay({
        component: {
            id: name,
            name,
            passProps,
            options: merge(defaultOptions, options),
        },
    });
}

export async function dismissOverlay(componentId: string) {
    try {
        await Navigation.dismissOverlay(componentId);
    } catch (error) {
        // RNN returns a promise rejection if there is no modal with
        // this componentId to dismiss. We'll do nothing in this case.
    }
}

type BottomSheetArgs = {
    closeButtonId: string;
    initialSnapIndex?: number;
    renderContent: () => JSX.Element;
    snapPoints: Array<number | string>;
    theme: Theme;
    title: string;
}

export async function bottomSheet({title, renderContent, snapPoints, initialSnapIndex = 0, theme, closeButtonId}: BottomSheetArgs) {
    const {isSplitView} = await isRunningInSplitView();
    const isTablet = Device.IS_TABLET && !isSplitView;

    if (isTablet) {
        showModal(Screens.BOTTOM_SHEET, title, {
            closeButtonId,
            initialSnapIndex,
            renderContent,
            snapPoints,
        }, bottomSheetModalOptions(theme, closeButtonId));
    } else {
        showModalOverCurrentContext(Screens.BOTTOM_SHEET, {
            initialSnapIndex,
            renderContent,
            snapPoints,
        }, bottomSheetModalOptions(theme));
    }
}

export async function dismissBottomSheet(alternativeScreen = Screens.BOTTOM_SHEET) {
    DeviceEventEmitter.emit(Events.CLOSE_BOTTOM_SHEET);
    await NavigationStore.waitUntilScreensIsRemoved(alternativeScreen);
}

type AsBottomSheetArgs = {
    closeButtonId: string;
    props?: Record<string, any>;
    screen: typeof Screens[keyof typeof Screens];
    theme: Theme;
    title: string;
}

export async function openAsBottomSheet({closeButtonId, screen, theme, title, props}: AsBottomSheetArgs) {
    const {isSplitView} = await isRunningInSplitView();
    const isTablet = Device.IS_TABLET && !isSplitView;

    if (isTablet) {
        showModal(screen, title, {
            closeButtonId,
            ...props,
        }, bottomSheetModalOptions(theme, closeButtonId));
    } else {
        showModalOverCurrentContext(screen, props, bottomSheetModalOptions(theme));
    }
}

export const showAppForm = async (form: AppForm) => {
    const passProps = {form};
    showModal(Screens.APPS_FORM, form.title || '', passProps);
};

export const showReviewModal = (hasAskedBefore: boolean) => {
    showOverlay(
        Screens.REVIEW_APP,
        {hasAskedBefore},
        {overlay: {interceptTouchOutside: true}},
    );
};

export const showShareFeedbackModal = () => {
    showOverlay(
        Screens.SHARE_FEEDBACK,
        {},
        {overlay: {interceptTouchOutside: true}},
    );
};

export async function findChannels(title: string, theme: Theme) {
    const options: Options = {};
    const closeButtonId = 'close-find-channels';
    const closeButton = CompassIcon.getImageSourceSync('close', 24, theme.sidebarHeaderTextColor);
    options.topBar = {
        leftButtons: [{
            id: closeButtonId,
            icon: closeButton,
            testID: 'close.find_channels.button',
        }],
    };

    DeviceEventEmitter.emit(Events.PAUSE_KEYBOARD_TRACKING_VIEW, true);
    showModal(
        Screens.FIND_CHANNELS,
        title,
        {closeButtonId},
        options,
    );
}
