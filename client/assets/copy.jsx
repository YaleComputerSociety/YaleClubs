import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const CopySVG = () => {
    return (
        <Svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Rect x="2.80762" y="0.5" width="6.69231" height="9.76923" rx="1.5" stroke="#BDBDBD"/>
            <Path fillRule="evenodd" clipRule="evenodd" d="M1.53846 3.07691C1.53846 2.71152 1.18947 2.44259 0.886157 2.64634C0.351696 3.00537 0 3.61547 0 4.30772V11.0769C0 12.1815 0.895431 13.0769 2 13.0769H5.69231C6.38455 13.0769 6.99466 12.7253 7.35369 12.1908C7.55744 11.8875 7.28851 11.5385 6.92312 11.5385V11.5385C6.71204 11.5385 6.52702 11.6666 6.37228 11.8102C6.19385 11.9757 5.9549 12.0769 5.69231 12.0769H2C1.44772 12.0769 1 11.6292 1 11.0769V4.30772C1 4.04512 1.10122 3.80617 1.26676 3.62774C1.41032 3.473 1.53846 3.28799 1.53846 3.07691V3.07691Z" fill="#BDBDBD"/>
        </Svg>
    );
}

export default CopySVG;
