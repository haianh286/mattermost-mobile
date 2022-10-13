// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as React from 'react';
import Svg, {
    G,
    Path,
    Ellipse,
    Mask,
    Defs,
    Pattern,
    Use,
    Image,
    LinearGradient,
    Stop,
    ClipPath,
} from 'react-native-svg';

type Props = {
    theme: Theme;
};

const PrivateChannelIllustration = ({theme}: Props) => (
    <Svg
        width={152}
        height={149}
        viewBox='0 0 152 149'
    >
        <G clipPath='url(#clip0_640_9311)'>
            <Path
                d='M137.148 83.662a48.276 48.276 0 0010.909-15.674 47.842 47.842 0 003.941-18.626 47.85 47.85 0 00-3.638-18.687 48.267 48.267 0 00-10.654-15.844 48.861 48.861 0 00-16.014-10.543A49.277 49.277 0 00102.804.685a49.267 49.267 0 00-18.829 3.896A48.833 48.833 0 0068.13 15.37l-90.93 89.943 69.03 68.292 90.918-89.944z'
                fill='url(#paint0_linear_640_9311)'
                fillOpacity={0.12}
            />
            <Ellipse
                cx={62.2852}
                cy={146.659}
                rx={26.0357}
                ry={1.30081}
                fill='#000'
                fillOpacity={0.12}
            />
            <Path
                d='M53.857 35.785l.276-8.181-.628-3.24c1.15-2.946 2.84-2.74 3.876-2.833 2.362-.213 3.94-1.501 5.026-.363.59.682 1.257 3.465 1.363 5.629.076 1.145.478 2.12-.377 2.696-.589.32-1.205.587-1.84.8l.314 6.123-8.01-.631z'
                fill='#AD831F'
            />
            <Path
                d='M63.041 24.208a11.92 11.92 0 012.13 1.876c.195.857-2.173 1.295-2.173 1.295l.044-3.171z'
                fill='#AD831F'
            />
            <Path
                d='M59.04 30.619a5.438 5.438 0 002.475-.307c.295-.119-.547.413-.848.52a2.44 2.44 0 01-1.257.262c-.301-.05-.69-.5-.37-.476z'
                fill='#CC8F00'
            />
            <Path
                d='M65.592 20.192a1.077 1.077 0 00-1.3-.625c-2.23.369-1.81-1.564-5.095-1.014-2.287.382-4.7 0-6.723 1.158a4.307 4.307 0 00-1.985 1.963 2.018 2.018 0 00.679 2.502c.138.082.301.15.37.294.045.15.031.31-.037.45-.283.845-.534 1.877.1 2.502.352.35.943.513 1.08.989.076.262 0 .544.032.819.132.726 1.257.844 1.79.331.474-.582.721-1.314.698-2.064.056-.656.075-1.413-.415-1.876-.226-.212-.546-.338-.666-.625a.847.847 0 01.358-.938 1.745 1.745 0 012.551.625c.182.413.239.957.628 1.157.51.25 1.087-.313 1.156-.87a9.546 9.546 0 00-.17-1.675c0-.564.29-1.252.855-1.252.187.01.371.048.547.113a6.94 6.94 0 003.405.088 3.502 3.502 0 001.545-.626 1.496 1.496 0 00.597-1.426z'
                fill='#4A2407'
            />
            <Path
                d='M61.282 23.682l.032-.062c-1.678-.15-3.77-.282-5.202-.263-1.432.019-2.092.219-2.84 1.501-.125.219.239.375.371.157a2.052 2.052 0 011.765-1.251c.73-.057 1.483 0 2.206 0 .923 0 2.355.13 3.549.244.038-.113.075-.22.12-.326z'
                fill={theme.centerChannelColor}
            />
            <Path
                d='M61.502 24.902a1.207 1.207 0 01-.47-1.207c.087-.657.577-1.132 1.086-1.064.273.078.506.259.648.504.142.245.182.536.112.81-.088.625-.578 1.132-1.087 1.063a.704.704 0 01-.289-.106zm.754-1.877a.371.371 0 00-.176-.062c-.345-.05-.678.306-.747.794-.07.488.157.926.502.976.346.05.672-.313.742-.8a.904.904 0 00-.32-.933v.026z'
                fill={theme.centerChannelColor}
            />
            <Path
                d='M58.411 35.253c16.335.125 16.29-1.4 17.93 17.782 1.64 19.183 1.665 19.877-14.487 20.934-10.768.707-17.126 5.004-17.685-.888-.566-6.005-.924-5.83-1.885-16.03-2.18-22.573-1.81-21.935 16.127-21.798z'
                fill='#AD831F'
            />
            <Path
                d='M65.75 49.432c4.66 5.267 15.19 9.338 23.326 9.338 1.162.008 2.32-.14 3.443-.438a11.52 11.52 0 002.004-.744c6.697-3.258 8.689-13.316 10.146-16.768 1.797-4.247-.069-1.608 1.143-4.034.434-.87 1.502-1.433 1.848-1.877.496-.625-.453-1.47-4.034.945-5.654 3.752-5.026 11.314-10.592 12.108a8.412 8.412 0 01-2.105 0 13.413 13.413 0 01-1.853-.331c-9.932-2.44-10.774-11.784-20.55-12.165 0-.025-7.445 8.662-2.777 13.966zM14.68 42.408c-.19.526.627 3.128.847 5.51.54 5.742 2.312 14.555 10.542 17.92a9.759 9.759 0 003.273.688c.714.032 1.429-.002 2.136-.1 5.026-.626 10.549-4.272 13.288-9.957 3.77-7.85 5.302-21.166 5.302-21.166-3.631 0-12.565-.694-15.813 13.591a7.657 7.657 0 01-1.313 3.092 7.698 7.698 0 01-2.513 2.237c-.622.327-1.3.54-1.998.626a5.324 5.324 0 01-2.79-.396 5.299 5.299 0 01-2.191-1.762c-4.876-6.499-5.479-13.491-8.99-14.18-3.513-.687 1.136 1.34.22 3.897z'
                fill='#AD831F'
            />
            <Path
                d='M68.526 35.44c9.776.382 10.617 9.727 20.55 12.166 1.037.274 2.106.404 3.179.388.459 3.333.791 6.686 1.112 10.044-1.38.479-2.83.718-4.291.707-8.136 0-18.665-4.071-23.327-9.344-4.661-5.273 2.777-13.96 2.777-13.96zM29.587 54.58c2.099-.707 3.984-2.633 4.668-5.686 3.223-14.285 12.182-13.597 15.807-13.59 0 0-1.514 13.315-5.296 21.165-3.053 6.33-9.524 10.1-14.99 10.063.528-3.971.464-7.999-.189-11.952z'
                fill='#1E325C'
            />
            <Path
                d='M77.07 64.206C86.594 92 87.172 103.415 86.287 112.99c-.886 9.576-7.904 19.427-17.057 26.638-1.929 1.364-4.341 2.327-2.815 6.042 2.218 5.404-3.619-1.695-5.076-5.229-1.458-3.534 13.997-9.682 10.429-28.552-3.569-18.87-13.143-26.588-19.13-39.941-5.987-13.354 24.432-7.743 24.432-7.743z'
                fill={theme.buttonBg}
            />
            <Path
                d='M77.07 64.206C86.594 92 87.172 103.415 86.287 112.99c-.886 9.576-7.904 19.427-17.057 26.638-1.929 1.364-4.341 2.327-2.815 6.042 2.218 5.404-3.619-1.695-5.076-5.229-1.458-3.534 13.997-9.682 10.429-28.552-3.569-18.87-13.143-26.588-19.13-39.941-5.987-13.354 24.432-7.743 24.432-7.743z'
                fill='#000'
                fillOpacity={0.16}
            />
            <Mask
                id='a'

                // @ts-expect-error style not intrinsic
                style={{
                    maskType: 'alpha',
                }}
                maskUnits='userSpaceOnUse'
                x={51}
                y={63}
                width={36}
                height={85}
            >
                <Path
                    d='M77.07 64.206C86.594 92 87.172 103.415 86.286 112.99c-.886 9.576-7.903 19.427-17.056 26.638-1.93 1.364-4.342 2.327-2.815 6.042 2.218 5.404-3.619-1.695-5.076-5.229-1.458-3.534 13.997-9.682 10.429-28.552-3.569-18.87-13.143-26.588-19.13-39.941-5.988-13.354 24.432-7.743 24.432-7.743z'
                    fill='#1452BD'
                />
            </Mask>
            <G mask='url(#a)'>
                <Path
                    fill='url(#pattern0)'
                    d='M47.9453 58.271H73.13900000000001V128.1542H47.9453z'
                />
            </G>
            <Path
                d='M64.826 86.678c.842 1.595 1.81 3.303 2.827 5.066l-.346.282c-1.061-1.877-2.073-3.665-2.846-5.135-.125-.238.233-.45.365-.213zM70.015 131.911c-.628.694-1.257 1.382-1.853 2.07l-.264-.287c.628-.67 1.219-1.345 1.815-2.027l.302.244z'
                fill='#1E325C'
            />
            <Path
                d='M65.95 66.057c1.156 31.148-1.84 45.477-15.392 55.553-13.55 10.076-24.055 10.439-24.463 15.517-.409 5.079-1.634 3.916-2.111-1.294-.629-7.074-3.594-1.82 12.156-13.917 15.75-12.096 8.312-43.97 7.54-53.414-.774-9.444 22.27-2.445 22.27-2.445z'
                fill={theme.buttonBg}
            />
            <Path
                d='M25.9 131.942c7.903-3.878 16.12-8.199 19.79-16.668 4.083-9.426 2.343-20.015 2.085-29.91-.15-5.966 0-11.94.39-17.894 0-.269.44-.269.42 0-.333 5.473-.508 10.952-.414 16.437.094 5.486.628 10.97.628 16.469-.031 4.759-.553 9.588-2.28 14.06a24.803 24.803 0 01-7.652 10.37c-3.839 3.127-8.306 5.335-12.722 7.505-.277.113-.49-.25-.245-.369zM72.672 128.684c-.263.35-.534.694-.81 1.038-.402.5-.817.988-1.256 1.476l-.302-.238a46.076 46.076 0 001.979-2.445l.39.169zM74.746 125.506a28.045 28.045 0 01-1.527 2.402l-.364-.162a28.917 28.917 0 001.495-2.358l.396.118zM75.92 121.873l.409.1c-.3.921-.672 1.819-1.112 2.683l-.402-.119a19.34 19.34 0 00.722-1.595c.145-.331.264-.713.383-1.069zM77.083 113.91c.083.832.123 1.667.12 2.502l-.416-.043c.002-.821-.04-1.642-.125-2.459h.42zM76.253 109.476c.088.325.17.625.245.957.201.844.358 1.707.478 2.571h-.427a29.2 29.2 0 00-.71-3.403l.414-.125zM75.167 106.211c.301.782.584 1.564.823 2.333l-.415.144a37.785 37.785 0 00-.798-2.333l.39-.144zM73.584 102.596c.44.919.854 1.839 1.256 2.752l-.377.144a42.354 42.354 0 00-1.225-2.765l.346-.131zM69.632 95.178c.59 1.026 1.174 2.068 1.752 3.127l-.351.257c-.553-.989-1.15-2.04-1.766-3.127l.365-.257zM68.13 92.589c.34.588.685 1.182 1.03 1.788l-.358.27c-.339-.589-.684-1.189-1.017-1.777l.345-.281zM71.83 99.137a80.24 80.24 0 011.339 2.596l-.37.131c-.19-.375-.378-.75-.573-1.113-.194-.363-.477-.888-.734-1.364l.339-.25zM77.164 117.369a18.48 18.48 0 01-.571 3.697l-.409-.094c.312-1.193.501-2.415.566-3.647l.414.044zM67.533 134.688c-.477.538-.954 1.07-1.42 1.62-.094-.1-.188-.2-.288-.294.47-.544.954-1.082 1.438-1.614.088.094.182.188.27.288zM65.209 136.733l.295.301c-.521.625-1.03 1.25-1.52 1.907-.157.213-.522 0-.364-.212.508-.682 1.074-1.339 1.589-1.996z'
                fill='#1E325C'
            />
            <Path
                d='M53.888 35.222a3.476 3.476 0 001.715 1.445c2.582 1.057 5.868 1.057 7.313-1.401 11.874 0 11.98.525 13.45 17.769.742 8.669 1.15 13.56-.106 16.418-6.553 2.82-14.086 3.753-20.952 5.079a191.57 191.57 0 01-9.003 1.495c-1.219-.294-1.941-1.139-2.11-2.946-.566-6.005-.924-5.83-1.886-16.03-2.004-20.478-1.884-21.854 11.579-21.83z'
                fill={theme.centerChannelBg}
            />
            <Path
                d='M53.888 35.222a3.476 3.476 0 001.715 1.445c2.582 1.057 5.868 1.057 7.313-1.401 11.874 0 11.98.525 13.45 17.769.742 8.669 1.15 13.56-.106 16.418-6.553 2.82-14.086 3.753-20.952 5.079a191.57 191.57 0 01-9.003 1.495c-1.219-.294-1.941-1.139-2.11-2.946-.566-6.005-.924-5.83-1.886-16.03-2.004-20.478-1.884-21.854 11.579-21.83z'
                fill={theme.centerChannelColor}
                fillOpacity={0.08}
            />
            <Mask
                id='b'

                // @ts-expect-error style not intrinsic
                style={{
                    maskType: 'alpha',
                }}
                maskUnits='userSpaceOnUse'
                x={41}
                y={35}
                width={37}
                height={42}
            >
                <Path
                    d='M53.888 35.222a3.476 3.476 0 001.715 1.445c2.582 1.057 5.868 1.057 7.313-1.401 11.874 0 11.98.525 13.45 17.769.742 8.669 1.15 13.56-.106 16.418-6.553 2.82-14.086 3.753-20.952 5.079a191.57 191.57 0 01-9.003 1.495c-1.219-.294-1.941-1.139-2.11-2.946-.566-6.005-.924-5.83-1.886-16.03-2.004-20.478-1.884-21.854 11.579-21.83z'
                    fill={theme.centerChannelColor}
                />
            </Mask>
            <G mask='url(#b)'>
                <Path
                    opacity={0.7}
                    fill='url(#pattern1)'
                    d='M40.5857 39.9549H72.007V76.869H40.5857z'
                />
            </G>
            <Path
                d='M69.852 68.09a46.789 46.789 0 01-4.203-10.433 125.674 125.674 0 01-3.43-22.398c12.565 0 13.821-.456 15.348 17.12.075.85-.918 2.376-.629 3.245 2.432 6.793 11.14 13.76 10.423 15.324-.999 2.24-4.812 4.628-9.612 6.505a41.566 41.566 0 01-3.832.775 60.478 60.478 0 00-4.065-10.138zM42.184 69.66c-.358 4.159-.83 7.718-.534 10.901 2.758-.456 5.528-.744 8.311-.938a58.17 58.17 0 005.39-20.12c.365-4.16 1.49-20.134 1.213-22.517-.176-1.601-2.18-.25-2.588-1.777-13.545 0-14.996 1.001-13.011 21.522.094 1.026 1.482 2.327 1.526 3.297.114 3.213.01 6.431-.307 9.631z'
                fill='#1E325C'
            />
            <Path
                d='M63.086 34.459c.93.744.76.538.125 1.707-.634 1.17-.955 2.227-1.476.807-.522-1.42-.59-1.194.088-2.039.678-.844.791-.857 1.263-.475zM55.308 34.697c2.104.919 1.332.706 1.734 2.088.873 2.972-.346 1.395-3.33-.318-2.03-1.17-1.79-1.352-1.08-2.064.71-.713.496-.682 2.563.294 2.067.975-1.998-.901.113 0zM28.457 54.974a30.99 30.99 0 01.886 11.552c.713.032 1.428-.002 2.136-.1.402-4.03.07-8.097-.98-12.009a.716.716 0 00-.07-.194c-.622.327-1.299.54-1.997.626a.952.952 0 00.025.125zM90.93 47.937c.385 3.482.915 6.939 1.589 10.37.69-.185 1.36-.434 2.004-.744a118.853 118.853 0 01-1.489-9.632 8.413 8.413 0 01-2.105.006z'
                fill={theme.buttonBg}
            />
            <Path
                d='M66.616 141.624c-.722.889-.999 2.077-.2 4.016 2.217 5.404-3.62-1.695-5.077-5.229-.358-.876.314-1.908 1.476-3.252 1.3 1.463 2.557 2.964 3.801 4.465zM25.805 129.334c.088.213.176.419.258.626.628 1.413 1.194 2.827 1.822 4.228a4.09 4.09 0 00-1.816 2.939c-.402 5.073-1.633 3.916-2.11-1.294-.434-4.71-1.88-3.959 1.846-6.499z'
                fill='#1E325C'
            />
            <G clipPath='url(#clip1_640_9311)'>
                <Path
                    d='M3.828 9.976h26.88c.493-.002.98.092 1.437.277.455.185.87.456 1.22.799a3.662 3.662 0 011.108 2.615V30.53c-.003.486-.101.968-.291 1.416-.19.449-.468.856-.818 1.199-.35.343-.764.614-1.22.799a3.794 3.794 0 01-1.436.277h-3.967v6.313l-5.95-6.313H3.837a3.794 3.794 0 01-1.436-.277 3.756 3.756 0 01-1.22-.799 3.701 3.701 0 01-.817-1.199 3.662 3.662 0 01-.29-1.416V13.667c.003-.98.4-1.92 1.104-2.612a3.776 3.776 0 012.65-1.079z'
                    fill={theme.buttonBg}
                />
                <Path
                    d='M20.79 34.222H3.839a3.794 3.794 0 01-1.437-.277 3.756 3.756 0 01-1.22-.799 3.701 3.701 0 01-.817-1.199 3.663 3.663 0 01-.29-1.416V20.293s1.183 9.468 1.396 10.3c.213.834.635 2.081 2.634 2.288 2 .207 16.687 1.34 16.687 1.34z'
                    fill='#000'
                    fillOpacity={0.16}
                />
                <Path
                    d='M26.45 19.688c-.48 0-.948.14-1.346.403a2.397 2.397 0 00-.892 1.073 2.361 2.361 0 00.525 2.605 2.45 2.45 0 002.639.518c.442-.181.82-.487 1.087-.88a2.368 2.368 0 00-.3-3.02 2.42 2.42 0 00-1.714-.699zM17.268 19.688c-.479 0-.947.14-1.345.403a2.398 2.398 0 00-.892 1.073 2.362 2.362 0 00.525 2.605 2.45 2.45 0 002.639.518c.442-.181.82-.487 1.086-.88a2.368 2.368 0 00-.3-3.02 2.42 2.42 0 00-1.713-.699zM8.097 19.688c-.48 0-.948.14-1.347.401-.398.263-.71.636-.893 1.073a2.362 2.362 0 00.523 2.606 2.45 2.45 0 002.64.52c.442-.182.82-.488 1.087-.881a2.369 2.369 0 00-.3-3.019 2.42 2.42 0 00-1.71-.7z'
                    fill={theme.centerChannelBg}
                />
                <Path
                    d='M31.683 17.038a7.486 7.486 0 00-1.359-2.624 7.59 7.59 0 00-2.275-1.906.262.262 0 01-.139-.288.26.26 0 01.247-.204c1.694-.1 5.115.257 4.043 4.997a.268.268 0 01-.517.025z'
                    fill='#fff'
                    fillOpacity={0.16}
                />
            </G>
            <G clipPath='url(#clip2_640_9311)'>
                <Path
                    d='M101.489 48.151h38.827a5.531 5.531 0 012.075.397 5.42 5.42 0 011.761 1.142c.505.49.906 1.073 1.181 1.715a5.18 5.18 0 01.419 2.026v24.126a5.18 5.18 0 01-.419 2.025 5.3 5.3 0 01-1.181 1.715 5.42 5.42 0 01-1.761 1.143 5.53 5.53 0 01-2.075.396h-5.73v9.031l-8.595-9.03h-24.488a5.526 5.526 0 01-2.075-.397 5.429 5.429 0 01-1.762-1.143 5.294 5.294 0 01-1.18-1.715 5.196 5.196 0 01-.42-2.025V53.43a5.239 5.239 0 011.595-3.736 5.482 5.482 0 013.828-1.544z'
                    fill='#FFBC1F'
                />
                <Path
                    d='M125.99 82.836h-24.488a5.527 5.527 0 01-2.075-.396 5.43 5.43 0 01-1.761-1.143 5.294 5.294 0 01-1.18-1.715 5.196 5.196 0 01-.42-2.025V62.91s1.71 13.544 2.017 14.736c.307 1.192.917 2.976 3.805 3.272 2.887.296 24.102 1.918 24.102 1.918z'
                    fill='#CC8F00'
                />
                <Path
                    d='M134.164 62.045c-.692 0-1.368.2-1.943.576a3.433 3.433 0 00-1.288 1.535 3.346 3.346 0 00-.199 1.976c.135.663.468 1.272.957 1.75a3.52 3.52 0 001.791.936 3.573 3.573 0 002.021-.194 3.48 3.48 0 001.569-1.26 3.361 3.361 0 00-.433-4.319 3.5 3.5 0 00-1.136-.741 3.556 3.556 0 00-1.339-.26zM120.902 62.045c-.692 0-1.368.2-1.943.576a3.433 3.433 0 00-1.288 1.535 3.346 3.346 0 00-.199 1.976c.135.663.468 1.272.957 1.75a3.52 3.52 0 001.791.936 3.573 3.573 0 002.021-.194 3.48 3.48 0 001.569-1.26 3.361 3.361 0 00-.433-4.319 3.5 3.5 0 00-1.136-.741 3.556 3.556 0 00-1.339-.26zM107.655 62.045c-.692-.001-1.369.199-1.945.574a3.433 3.433 0 00-1.29 1.534 3.348 3.348 0 00-.201 1.976c.134.663.467 1.273.956 1.752a3.522 3.522 0 001.791.937 3.57 3.57 0 002.021-.194 3.482 3.482 0 001.571-1.26 3.37 3.37 0 00.325-3.208 3.399 3.399 0 00-.757-1.11 3.496 3.496 0 00-1.134-.74 3.558 3.558 0 00-1.337-.261z'
                    fill={theme.centerChannelBg}
                />
                <Path
                    d='M141.723 58.253a10.674 10.674 0 00-1.962-3.753 10.942 10.942 0 00-3.287-2.727.364.364 0 01-.073-.617.384.384 0 01.229-.087c2.448-.143 7.39.367 5.84 7.148a.369.369 0 01-.126.214.389.389 0 01-.621-.178z'
                    fill='#FFD470'
                />
            </G>
        </G>
        <Defs>
            <Pattern
                id='pattern0'
                patternContentUnits='objectBoundingBox'
                width={1}
                height={1}
            >
                <Use
                    xlinkHref='#image0_640_9311'
                    transform='scale(.01124 .00403)'
                />
            </Pattern>
            <Pattern
                id='pattern1'
                patternContentUnits='objectBoundingBox'
                width={1}
                height={1}
            >
                <Use
                    xlinkHref='#image1_640_9311'
                    transform='scale(.009 .00763)'
                />
            </Pattern>
            <LinearGradient
                id='paint0_linear_640_9311'
                x1={64.5999}
                y1={0.683517}
                x2={-44.8859}
                y2={111.358}
                gradientUnits='userSpaceOnUse'
            >
                <Stop
                    offset={0.0104167}
                    stopColor={theme.buttonBg}
                />
                <Stop
                    offset={0.765625}
                    stopColor={theme.buttonBg}
                    stopOpacity={0}
                />
            </LinearGradient>
            <ClipPath id='clip0_640_9311'>
                <Path
                    fill={theme.centerChannelColor}
                    d='M0 0H152V149H0z'
                />
            </ClipPath>
            <ClipPath id='clip1_640_9311'>
                <Path
                    fill={theme.centerChannelColor}
                    transform='matrix(-1 0 0 1 42.145 .683)'
                    d='M0 0H49.7455V49.211H0z'
                />
            </ClipPath>
            <ClipPath id='clip2_640_9311'>
                <Path
                    fill={theme.centerChannelColor}
                    transform='matrix(-1 0 0 1 156.836 34.858)'
                    d='M0 0H71.8545V70.3991H0z'
                />
            </ClipPath>
            <Image
                id='image0_640_9311'
                width={89}
                height={248}

                // @ts-expect-error string source
                xlinkHref='data:image/png;base64,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'
            />
            <Image
                id='image1_640_9311'
                width={111}
                height={131}

                // @ts-expect-error string source
                xlinkHref='data:image/png;base64,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'
            />
        </Defs>
    </Svg>
);

export default PrivateChannelIllustration;
