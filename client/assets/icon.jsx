
import { NativeWindStyleSheet } from 'nativewind';
import React from 'react';
import Svg, { Defs, Path, LinearGradient, Stop, Rect, G } from 'react-native-svg';

const IconSVG = () => {
  // Native Wind
  NativeWindStyleSheet.setOutput({
    default: 'native',
  });

  return (
    <Svg width="100%" height="40" className="rounded-md">
      {/* BG Icon */}
      <Defs>
        <LinearGradient id="userGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" style={{ stopColor: '#EFBFFF', stopOpacity: 1 }} />
          <Stop offset="100%" style={{ stopColor: '#5897FF', stopOpacity: 1 }} />
        </LinearGradient>
      </Defs>

      <Rect width="100%" height="40" rx="10" ry="10" fill="url(#userGradient)" />
      
      {/* User Icon */}
      <G transform="translate(5, 5) scale(0.3)">
        <Path
          fill="white" 
          strokeWidth="1"
          d="M50.4 54.5c10.1 0 18.2-8.2 18.2-18.2S60.5 18 50.4 18s-18.2 8.2-18.2 18.2 8.1 18.3 18.2 18.3zm0-31.7c7.4 0 13.4 6 13.4 13.4s-6 13.4-13.4 13.4S37 43.7 37 36.3s6-13.5 13.4-13.5zM18.8 83h63.4c1.3 0 2.4-1.1 2.4-2.4 0-12.6-10.3-22.9-22.9-22.9H39.3c-12.6 0-22.9 10.3-22.9 22.9 0 1.3 1.1 2.4 2.4 2.4zm20.5-20.5h22.4c9.2 0 16.7 6.8 17.9 15.7H21.4c1.2-8.9 8.7-15.7 17.9-15.7z"
        />
      </G>
    </Svg>
  );
};

export default IconSVG;