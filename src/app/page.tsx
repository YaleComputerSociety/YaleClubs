'use client';

import { useEffect } from "react";
import axios, { AxiosResponse } from 'axios';


import AuthWrapper from '../components/AuthWrapper';
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
// import Catalog from "../components/catalog/Catalog";

export default function Home() {
    // const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchApiMessage = async () => {
            try {
                const response: AxiosResponse = await axios.get('/api/clubs');
                console.log('API message:', response.data);
            } catch (error) {
                console.error('Error fetching API message:', error);
            }
        };
        fetchApiMessage();
    }, []);

    // Handle On Login
    // useEffect(() => {
    //     const fetchUserId = async () => {
    //         try {
    //             const userid = localStorage.getItem('userid');
    //             if (!userid) {
    //                 const response = await axios.get('/api/auth/userid');
    //                 if (response.data) {
    //                     localStorage.setItem('userid', response.data.netID);
    //                 }
    //             }
    //         } catch (error) {
    //             console.error('Error fetching/saving userid:', error);
    //         }
    //     };
    //     fetchUserId();
    // }, []);

    // const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    //     // const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    //     // const isReachingEnd = scrollTop + clientHeight >= scrollHeight - 200;
    //     // if (isReachingEnd) {
    //     //     setPage((prevPage) => prevPage + 1);
    //     // }
    // };

    return (
        <AuthWrapper>
            <main className="w-full">
                <section 
                    // onScroll={handleScroll} 
                    className="h-screen overflow-y-scroll"
                    style={{ maxHeight: '100vh' }}
                >
                    <div className="flex flex-col w-full min-h-screen">
                        <Header />
                        {/* <Catalog page={page} setPage={setPage} />*/}
                        <Footer />
                    </div>
                </section>
            </main>
        </AuthWrapper>
    );
}
