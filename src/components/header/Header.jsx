
// import React, { useRef, useState } from "react";
import Link from "next/link";

import Menu from "./Menu";
import LogoSVG from "../../assets/logo";


const Header = () => {
    // const [openMenu, setOpenMenu] = useState(false);
    // const menuHeight = useRef(new Animated.Value(0)).current;

    // const toggleMenu = () => {
    //     const toValue = openMenu ? 0 : 1;

    //     if (!openMenu) {
    //         setOpenMenu(!openMenu);
    //     }

    //     const duration = openMenu ? 300 : 200;

    //     Animated.timing(menuHeight, {
    //         toValue,
    //         duration,
    //         useNativeDriver: false,
    //     }).start(() => {
    //         if (openMenu) {
    //             setOpenMenu(!openMenu);
    //         }
    //     });
    // };

    // const heightTransform = menuHeight.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: [0, 200]
    // });


    return (    
        <div className="w-full flex flex-row fixed z-10 justify-between py-5 ph:px-5 xl:px-[110px]">
            <Link href="/" className="flex flex-row items-center">
                <LogoSVG/>
                <div className="ml-5 font-semibold text-[16px]">YaleClubs</div>
            </Link>

            <div className="flex flex-row items-center">
                <div className="ph:hidden sm:flex mr-10 flex-row items-center gap-x-11">
                    <Link href="/">
                        <div className="text-[15px]">Catalog</div>
                    </Link>
                    <Link href="/worksheet">
                        <div className="text-[15px]">Worksheet</div>
                    </Link>

                    {/*Hide dark mode too*/}
                    {/*<button onPress={() => null}>*/}
                    {/*    <ModesSVG/>*/}
                    {/*</button>*/}
                </div>
                <div>
                    <div className={`group-isolate w-[40px] rounded-[9px]`}>
                        <button onClick={() => toggleMenu()}>
                            {/* <IconSVG /> */}
                        </button>

                        <div
                            className="overflow-hidden absolute top-14 w-[120] right-0"
                            style={{
                                // height: heightTransform,
                                height: 200,
                            }}
                        >
                            {false && <Menu />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Header;