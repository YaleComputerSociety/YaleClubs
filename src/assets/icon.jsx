
import React from 'react';

const Rectangle = () => {
    return (
        <svg width="100%" height="40">
            <rect width="100%" height="40" rx="10" ry="10" fill="url(#userGradient)" />
        </svg>
    );
};

const IconSVG = () => {
    return (
        <svg width="100%" height="40" className="rounded-md">
            <defs>
                <linearGradient id="userGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: "#EFBFFF", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#5897FF", stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <Rectangle />
        </svg>
    );
}

export default IconSVG;
