'use client';

import React from 'react';
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import MasterLayout from '@/components/master';
import { Breadcrumb } from 'react-bootstrap';
import SplashScreen from './splash';
import SignInLayer from './login/page';

const Auth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const user = useSelector((state: RootState) => state.user);

    if (user.status === "LOADING") {
        return <SplashScreen />
    }
    if (user.status === "LOGGED_OUT") {
        return <SignInLayer />
    }
    return (
    <>
        <MasterLayout>
            {/* Breadcrumb */}
            <Breadcrumb />
            {children}
        </MasterLayout>
        </>
    )
};

export default Auth;
