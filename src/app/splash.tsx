import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { checkAuthenticated } from "./login/store";


export default function SplashScreen() {
    const dispatch = useDispatch();
    useEffect(() => {
        setTimeout(() => {
            dispatch(checkAuthenticated());
        }, 2000);
    }
    , [dispatch]);

    return (
    <div className="h-100 d-flex align-items-center justify-content-center">
        <Image
            src="/images/splash.png"
            alt="Loading"
            width={250} // Or whatever the original image dimensions are
            height={250} // Or whatever the original image dimensions are
            className="w-40 h-40 md:w-48 md:h-48 scale-pulse"
        />
    </div>
    );
}