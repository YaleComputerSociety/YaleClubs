
import { NativeWindStyleSheet } from 'nativewind';

import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const IconSVG = () => {
    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    return (
        <Svg width="100%" height="40" className="rounded-md">
            <Defs>
                <LinearGradient id="userGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <Stop offset="0%" style={{ stopColor: "#EFBFFF", stopOpacity: 1 }} />
                    <Stop offset="100%" style={{ stopColor: "#5897FF", stopOpacity: 1 }} />
                </LinearGradient>
            </Defs>
            <Rect width="100%" height="40" rx="10" ry="10" fill="url(#userGradient)" />
        </Svg>
    );
}

export default IconSVG;
