
import axios from 'axios';

import Link from 'next/link';
import { useRouter } from 'next/router';


const Menu = () => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await axios.get('/api/logout');
            router.push('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div
            className="
                border-[1px]
                border-gray-100
                bg-white
                rounded-md
                px-4
                py-4
            "
        >
            <div className='flex-col gap-y-3 items-start'>
                <Link href="/" className='ph:flex md:hidden'>
                    <div className="text-[15px]">Catalog</div>
                </Link>
                <Link href="/worksheet" className='ph:flex md:hidden'>
                    <div className="text-[15px]">Worksheet</div>
                </Link>
                {/* <button
                    className="flex-row justify-end"
                    onPress={() => navigation.push("/about")}
                >
                    <div>About</div>
                </button> */}
                <Link
                    className="flex-row justify-end"
                    href="/faq"
                >
                    <div>FAQ</div>
                </Link>
                {/* <button
                    className="flex-row justify-end"
                    onPress={() => navigation.push("/feedback")}
                >
                    <div >Feedback</div>
                </button> */}
                <Link
                    href="/"
                    className="flex-row justify-end"
                    onClick={handleLogout}
                >
                    <div>Log Out</div>
                </Link>
            </div>
        </div>
    );

};

export default Menu;
