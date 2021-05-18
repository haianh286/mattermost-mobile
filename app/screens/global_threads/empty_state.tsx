// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Text, View} from 'react-native';
import Svg, {
    Ellipse,
    G,
    Path,
    Defs,
    ClipPath,
    Rect,
} from 'react-native-svg';
import {useSelector} from 'react-redux';

import {makeStyleSheetFromTheme} from 'app/utils/theme';
import {getTheme} from '@mm-redux/selectors/entities/preferences';
import type {Theme} from '@mm-redux/types/preferences';
import type {GlobalState} from '@mm-redux/types/store';

type Props = {
    isUnreads: boolean;
}

function EmptyState({isUnreads}: Props) {
    const theme = useSelector((state: GlobalState) => getTheme(state));
    const style = getStyleSheet(theme);
    let title;
    let subTitle;
    if (isUnreads) {
        title = 'No unread threads';
        subTitle = "Looks like you're all caught up.";
    } else {
        title = 'No followed threads yet';
        subTitle = 'Any threads you are mentioned in or have participated in will show here along with any threads you have followed.';
    }
    return (
        <View style={style.container}>
            <Svg
                width='234'
                height='156'
                viewBox='0 0 234 156'
                fill='none'
            >
                <G clipPath='url(#clip0)'>
                    <Ellipse
                        cx='117'
                        cy='149.878'
                        rx='117'
                        ry='4.03395'
                        fill={theme.centerChannelColor}
                        fillOpacity='0.08'
                    />
                    <Path
                        d='M129.797 150.773C139.288 150.773 146.981 149.998 146.981 149.042C146.981 148.086 139.288 147.311 129.797 147.311C120.306 147.311 112.613 148.086 112.613 149.042C112.613 149.998 120.306 150.773 129.797 150.773Z'
                        fill={theme.centerChannelColor}
                        fillOpacity='0.16'
                    />
                    <Path
                        d='M100.181 150.978C115.528 150.978 127.969 150.157 127.969 149.144C127.969 148.131 115.528 147.311 100.181 147.311C84.8347 147.311 72.3938 148.131 72.3938 149.144C72.3938 150.157 84.8347 150.978 100.181 150.978Z'
                        fill={theme.centerChannelColor}
                        fillOpacity='0.16'
                    />
                    <Path
                        fillRule='evenodd'
                        clipRule='evenodd'
                        d='M119.084 132.652L117.389 134.816L119.248 133.584C119.327 134.03 119.391 134.478 119.441 134.928C122.973 132.109 127.104 130.578 127.104 130.578C127.104 130.578 126.988 131.683 126.67 133.319L125.407 133.774L126.579 133.775C126.31 135.095 125.974 136.398 125.572 137.676L123.106 138.564L125.275 138.567C124.664 140.406 123.8 142.13 122.714 143.681C119.199 148.463 114.931 151.075 113.182 149.515C113.045 149.393 112.928 149.25 112.83 149.086C111.408 147.383 110.77 143.068 111.382 138.19C111.46 137.585 111.572 136.987 111.718 136.398L113.48 138.465L112.072 135.142C113.653 130.138 117.064 125.704 117.064 125.704C117.064 125.704 117.484 126.716 117.979 128.297L117.112 129.405L118.115 128.74C118.505 130.023 118.828 131.329 119.084 132.652Z'
                        fill='white'
                    />
                    <Path
                        fillRule='evenodd'
                        clipRule='evenodd'
                        d='M119.084 132.652L117.389 134.816L119.248 133.584C119.327 134.03 119.391 134.478 119.441 134.928C122.973 132.109 127.104 130.578 127.104 130.578C127.104 130.578 126.988 131.683 126.67 133.319L125.407 133.774L126.579 133.775C126.31 135.095 125.974 136.398 125.572 137.676L123.106 138.564L125.275 138.567C124.664 140.406 123.8 142.13 122.714 143.681C119.199 148.463 114.931 151.075 113.182 149.515C113.045 149.393 112.928 149.25 112.83 149.086C111.408 147.383 110.77 143.068 111.382 138.19C111.46 137.585 111.572 136.987 111.718 136.398L113.48 138.465L112.072 135.142C113.653 130.138 117.064 125.704 117.064 125.704C117.064 125.704 117.484 126.716 117.979 128.297L117.112 129.405L118.115 128.74C118.505 130.023 118.828 131.329 119.084 132.652Z'
                        fill={theme.centerChannelColor}
                        fillOpacity='0.32'
                    />
                    <Path
                        d='M154.294 150.244C158.736 150.244 162.338 149.752 162.338 149.144C162.338 148.537 158.736 148.044 154.294 148.044C149.851 148.044 146.25 148.537 146.25 149.144C146.25 149.752 149.851 150.244 154.294 150.244Z'
                        fill={theme.centerChannelColor}
                        fillOpacity='0.16'
                    />
                    <Path
                        fillRule='evenodd'
                        clipRule='evenodd'
                        d='M144.336 140.849L144.001 142.065L144.555 141.195C145.007 141.908 145.357 142.693 145.593 143.522C146.125 142.017 146.87 140.613 147.8 139.363C147.8 139.363 147.986 139.814 148.207 140.517L147.821 141.01L148.267 140.714C148.44 141.284 148.584 141.865 148.698 142.453L147.944 143.416L148.771 142.868C148.807 143.071 148.836 143.276 148.858 143.481C149.906 142.661 151.052 142.005 152.264 141.531C152.264 141.531 152.213 142.023 152.072 142.75L151.51 142.952L152.031 142.953C151.912 143.54 151.762 144.119 151.583 144.688L150.486 145.083L151.451 145.084C151.179 145.902 150.795 146.669 150.312 147.359C148.749 149.486 146.851 150.647 146.073 149.953C146.012 149.899 145.959 149.835 145.916 149.762C145.704 149.508 145.532 149.125 145.406 148.646C145.312 148.738 145.208 148.805 145.092 148.841C145.017 148.865 144.94 148.875 144.86 148.873C143.934 149.009 142.344 148.164 140.887 146.674C140.707 146.489 140.538 146.291 140.38 146.083L141.514 145.903L140.055 145.62C139.23 144.268 138.606 142.779 138.206 141.21C138.206 141.21 138.648 141.299 139.298 141.504L139.443 142.135L139.479 141.562C140.002 141.733 140.517 141.936 141.02 142.171L141.303 143.403L141.37 142.343C141.542 142.427 141.71 142.518 141.876 142.616C141.867 141.201 142.036 139.79 142.379 138.424C142.379 138.424 142.715 138.752 143.175 139.297L143.004 139.92L143.303 139.45C143.671 139.894 144.016 140.362 144.336 140.849ZM145.825 144.593C145.775 144.301 145.712 144.002 145.637 143.699L146.206 145.039L145.825 144.593Z'
                        fill='white'
                    />
                    <Path
                        fillRule='evenodd'
                        clipRule='evenodd'
                        d='M144.336 140.849L144.001 142.065L144.555 141.195C145.007 141.908 145.357 142.693 145.593 143.522C146.125 142.017 146.87 140.613 147.8 139.363C147.8 139.363 147.986 139.814 148.207 140.517L147.821 141.01L148.267 140.714C148.44 141.284 148.584 141.865 148.698 142.453L147.944 143.416L148.771 142.868C148.807 143.071 148.836 143.276 148.858 143.481C149.906 142.661 151.052 142.005 152.264 141.531C152.264 141.531 152.213 142.023 152.072 142.75L151.51 142.952L152.031 142.953C151.912 143.54 151.762 144.119 151.583 144.688L150.486 145.083L151.451 145.084C151.179 145.902 150.795 146.669 150.312 147.359C148.749 149.486 146.851 150.647 146.073 149.953C146.012 149.899 145.959 149.835 145.916 149.762C145.704 149.508 145.532 149.125 145.406 148.646C145.312 148.738 145.208 148.805 145.092 148.841C145.017 148.865 144.94 148.875 144.86 148.873C143.934 149.009 142.344 148.164 140.887 146.674C140.707 146.489 140.538 146.291 140.38 146.083L141.514 145.903L140.055 145.62C139.23 144.268 138.606 142.779 138.206 141.21C138.206 141.21 138.648 141.299 139.298 141.504L139.443 142.135L139.479 141.562C140.002 141.733 140.517 141.936 141.02 142.171L141.303 143.403L141.37 142.343C141.542 142.427 141.71 142.518 141.876 142.616C141.867 141.201 142.036 139.79 142.379 138.424C142.379 138.424 142.715 138.752 143.175 139.297L143.004 139.92L143.303 139.45C143.671 139.894 144.016 140.362 144.336 140.849ZM145.825 144.593C145.775 144.301 145.712 144.002 145.637 143.699L146.206 145.039L145.825 144.593Z'
                        fill={theme.centerChannelColor}
                        fillOpacity='0.32'
                    />
                    <Path
                        d='M148.444 3.62159C148.444 1.96473 147.101 0.621582 145.444 0.621582H49.8C48.1432 0.621582 46.8 1.96473 46.8 3.62158V59.7488C46.8 61.4057 48.1432 62.7488 49.8 62.7488H59.7108V79.8337L73.6195 62.7488H145.444C147.101 62.7488 148.444 61.4057 148.444 59.7488V3.62159Z'
                        fill='white'
                    />
                    <Path
                        opacity='0.24'
                        d='M148.444 3.62159C148.444 1.96473 147.101 0.621582 145.444 0.621582H49.8C48.1432 0.621582 46.8 1.96473 46.8 3.62158V59.7488C46.8 61.4057 48.1432 62.7488 49.8 62.7488H59.7108V79.8337L73.6195 62.7488H145.444C147.101 62.7488 148.444 61.4057 148.444 59.7488V3.62159Z'
                        fill={theme.buttonBg}
                    />
                    <Path
                        d='M130.095 18.8716H65.1496C64.2204 18.8716 63.467 19.6249 63.467 20.5542C63.467 21.4835 64.2204 22.2368 65.1496 22.2368H130.095C131.024 22.2368 131.777 21.4835 131.777 20.5542C131.777 19.6249 131.024 18.8716 130.095 18.8716Z'
                        fill='white'
                    />
                    <Path
                        d='M130.095 30.0029H65.1496C64.2204 30.0029 63.467 30.7563 63.467 31.6855C63.467 32.6148 64.2204 33.3681 65.1496 33.3681H130.095C131.024 33.3681 131.777 32.6148 131.777 31.6855C131.777 30.7563 131.024 30.0029 130.095 30.0029Z'
                        fill='white'
                    />
                    <Path
                        d='M130.095 41.1338H65.1496C64.2204 41.1338 63.467 41.8871 63.467 42.8164C63.467 43.7457 64.2204 44.499 65.1496 44.499H130.095C131.024 44.499 131.777 43.7457 131.777 42.8164C131.777 41.8871 131.024 41.1338 130.095 41.1338Z'
                        fill='white'
                    />
                    <Path
                        d='M108.956 56.4297C108.956 54.7728 110.299 53.4297 111.956 53.4297H187.856C189.513 53.4297 190.856 54.7728 190.856 56.4297V100.477C190.856 102.134 189.513 103.477 187.856 103.477H180.453V117.239L169.246 103.477H111.956C110.299 103.477 108.956 102.134 108.956 100.477V56.4297Z'
                        fill='white'
                    />
                    <Path
                        opacity='0.48'
                        d='M108.956 56.4297C108.956 54.7728 110.299 53.4297 111.956 53.4297H187.856C189.513 53.4297 190.856 54.7728 190.856 56.4297V100.477C190.856 102.134 189.513 103.477 187.856 103.477H180.453V117.239L169.246 103.477H111.956C110.299 103.477 108.956 102.134 108.956 100.477V56.4297Z'
                        fill={theme.buttonBg}
                    />
                    <Path
                        d='M123.741 68.1309H176.071C176.82 68.1309 177.427 68.7377 177.427 69.4863C177.427 70.2349 176.82 70.8417 176.071 70.8417H123.741C122.992 70.8417 122.385 70.2349 122.385 69.4863C122.385 68.7377 122.992 68.1309 123.741 68.1309Z'
                        fill='white'
                    />
                    <Path
                        d='M123.741 77.0977H176.071C176.82 77.0977 177.427 77.7045 177.427 78.4531C177.427 79.2017 176.82 79.8085 176.071 79.8085H123.741C122.992 79.8085 122.385 79.2017 122.385 78.4531C122.385 77.7045 122.992 77.0977 123.741 77.0977Z'
                        fill='white'
                    />
                    <Path
                        d='M123.741 86.0645H176.071C176.82 86.0645 177.427 86.6713 177.427 87.4199C177.427 88.1685 176.82 88.7753 176.071 88.7753H123.741C122.992 88.7753 122.385 88.1685 122.385 87.4199C122.385 86.6713 122.992 86.0645 123.741 86.0645Z'
                        fill='white'
                    />
                    <Path
                        d='M87.7324 149.412C88.8312 149.412 89.7221 148.238 89.7221 146.79C89.7221 145.341 88.8312 144.167 87.7324 144.167C86.6335 144.167 85.7427 145.341 85.7427 146.79C85.7427 148.238 86.6335 149.412 87.7324 149.412Z'
                        fill={theme.centerChannelColor}
                    />
                    <Path
                        d='M87.7324 146.208C88.8312 146.208 89.7221 145.034 89.7221 143.586C89.7221 142.138 88.8312 140.963 87.7324 140.963C86.6335 140.963 85.7427 142.138 85.7427 143.586C85.7427 145.034 86.6335 146.208 87.7324 146.208Z'
                        fill={theme.centerChannelColor}
                    />
                    <Path
                        d='M87.7324 143C88.8312 143 89.7221 141.826 89.7221 140.377C89.7221 138.929 88.8312 137.755 87.7324 137.755C86.6335 137.755 85.7427 138.929 85.7427 140.377C85.7427 141.826 86.6335 143 87.7324 143Z'
                        fill={theme.centerChannelColor}
                    />
                    <Path
                        d='M87.7324 139.796C88.8312 139.796 89.7221 138.622 89.7221 137.173C89.7221 135.725 88.8312 134.551 87.7324 134.551C86.6335 134.551 85.7427 135.725 85.7427 137.173C85.7427 138.622 86.6335 139.796 87.7324 139.796Z'
                        fill={theme.centerChannelColor}
                    />
                    <Path
                        d='M87.7324 136.587C88.8312 136.587 89.7221 135.413 89.7221 133.965C89.7221 132.516 88.8312 131.342 87.7324 131.342C86.6335 131.342 85.7427 132.516 85.7427 133.965C85.7427 135.413 86.6335 136.587 87.7324 136.587Z'
                        fill={theme.centerChannelColor}
                    />
                    <Path
                        d='M87.7324 133.384C88.8312 133.384 89.7221 132.21 89.7221 130.761C89.7221 129.313 88.8312 128.139 87.7324 128.139C86.6335 128.139 85.7427 129.313 85.7427 130.761C85.7427 132.21 86.6335 133.384 87.7324 133.384Z'
                        fill={theme.centerChannelColor}
                    />
                    <Path
                        d='M87.7324 130.175C88.8312 130.175 89.7221 129.001 89.7221 127.552C89.7221 126.104 88.8312 124.93 87.7324 124.93C86.6335 124.93 85.7427 126.104 85.7427 127.552C85.7427 129.001 86.6335 130.175 87.7324 130.175Z'
                        fill={theme.centerChannelColor}
                    />
                    <Path
                        d='M95.1779 105.612C95.4495 105.264 95.6971 104.897 95.9188 104.514L90.6906 103.651L96.3421 103.693C96.8845 102.505 97.1806 101.217 97.2125 99.9093C97.2443 98.6015 97.0112 97.3009 96.5273 96.0868L88.939 100.053L95.9347 94.8715C95.2779 93.7345 94.396 92.7457 93.3439 91.9664C92.2917 91.1872 91.0917 90.6343 89.8184 90.3419C88.5451 90.0496 87.2258 90.0242 85.9423 90.2672C84.6589 90.5101 83.4387 91.0164 82.3577 91.7544C81.2766 92.4925 80.3578 93.4465 79.6583 94.5574C78.9588 95.6682 78.4935 96.9121 78.2913 98.2117C78.0892 99.5113 78.1545 100.839 78.4833 102.112C78.812 103.385 79.3971 104.577 80.2023 105.612C79.7784 106.156 79.413 106.744 79.1122 107.366L85.9015 110.916L78.6624 108.469C78.3303 109.462 78.1605 110.503 78.1597 111.55C78.1557 113.704 78.8757 115.795 80.2023 117.483C79.0984 118.899 78.4121 120.598 78.2218 122.388C78.0315 124.178 78.3448 125.986 79.1261 127.605C79.9074 129.224 81.125 130.589 82.6399 131.544C84.1547 132.498 85.9057 133.005 87.6928 133.005C89.4798 133.005 91.2308 132.498 92.7456 131.544C94.2605 130.589 95.4781 129.224 96.2594 127.605C97.0407 125.986 97.354 124.178 97.1637 122.388C96.9734 120.598 96.2872 118.899 95.1832 117.483C96.5048 115.791 97.2228 113.7 97.2219 111.547C97.2209 109.394 96.501 107.303 95.1779 105.612Z'
                        fill={theme.onlineIndicator}
                    />
                    <Path
                        opacity='0.1'
                        d='M78.1597 111.545C78.1557 113.698 78.8757 115.789 80.2023 117.478C79.0984 118.893 78.4121 120.593 78.2218 122.383C78.0315 124.173 78.3448 125.981 79.1261 127.6C79.9074 129.218 81.125 130.583 82.6399 131.538C84.1547 132.493 85.9057 133 87.6928 133C89.4798 133 91.2308 132.493 92.7456 131.538C94.2605 130.583 95.4781 129.218 96.2594 127.6C97.0407 125.981 97.3541 124.173 97.1638 122.383C96.9735 120.593 96.2872 118.893 95.1833 117.478C96.4586 115.847 78.1597 110.468 78.1597 111.545Z'
                        fill={theme.centerChannelColor}
                    />
                    <Path
                        fillRule='evenodd'
                        clipRule='evenodd'
                        d='M71.396 133.35L70.7304 135.764L71.8302 134.038C72.728 135.455 73.4232 137.016 73.8916 138.665C75.2513 143.886 74.8056 148.607 72.8962 149.21C72.7469 149.257 72.593 149.278 72.4356 149.273C70.5978 149.543 67.443 147.867 64.5515 144.91C64.1942 144.543 63.8582 144.15 63.5456 143.736L65.7943 143.379L62.8998 142.819C60.4156 139.026 59.2312 134.066 59.2312 134.066C59.2312 134.066 60.108 134.244 61.3969 134.65L61.6851 135.902L61.7561 134.765C62.7954 135.104 63.8165 135.508 64.8145 135.974L65.3774 138.419L65.5089 136.315C65.8415 136.478 66.1683 136.654 66.4888 136.842C66.4265 132.602 67.5119 128.538 67.5119 128.538C67.5119 128.538 68.1787 129.19 69.0918 130.271L68.751 131.506L69.3451 130.574C70.0756 131.456 70.7603 132.383 71.396 133.35Z'
                        fill='white'
                    />
                    <Path
                        fillRule='evenodd'
                        clipRule='evenodd'
                        d='M71.396 133.35L70.7304 135.764L71.8302 134.038C72.728 135.455 73.4232 137.016 73.8916 138.665C75.2513 143.886 74.8056 148.607 72.8962 149.21C72.7469 149.257 72.593 149.278 72.4356 149.273C70.5978 149.543 67.443 147.867 64.5515 144.91C64.1942 144.543 63.8582 144.15 63.5456 143.736L65.7943 143.379L62.8998 142.819C60.4156 139.026 59.2312 134.066 59.2312 134.066C59.2312 134.066 60.108 134.244 61.3969 134.65L61.6851 135.902L61.7561 134.765C62.7954 135.104 63.8165 135.508 64.8145 135.974L65.3774 138.419L65.5089 136.315C65.8415 136.478 66.1683 136.654 66.4888 136.842C66.4265 132.602 67.5119 128.538 67.5119 128.538C67.5119 128.538 68.1787 129.19 69.0918 130.271L68.751 131.506L69.3451 130.574C70.0756 131.456 70.7603 132.383 71.396 133.35Z'
                        fill={theme.centerChannelColor}
                        fillOpacity='0.32'
                    />
                </G>
                <Defs>
                    <ClipPath id='clip0'>
                        <Rect
                            width='234'
                            height='154.757'
                            fill='white'
                            transform='translate(0 0.621582)'
                        />
                    </ClipPath>
                </Defs>
            </Svg>
            <View style={style.textContainer}>
                <Text style={style.title}>
                    {title}
                </Text>
                <Text style={style.subTitle}>
                    {subTitle}
                </Text>
            </View>
        </View>
    );
}

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => {
    return {
        container: {
            alignItems: 'center',
            flexGrow: 1,
            justifyContent: 'center',
        },
        textContainer: {
            padding: 32,
        },
        title: {
            color: theme.centerChannelColor,
            fontSize: 20,
            fontWeight: '600',
            textAlign: 'center',
        },
        subTitle: {
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 24,
            marginTop: 16,
            textAlign: 'center',
        },
    };
});

export default EmptyState;
