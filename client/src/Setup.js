import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const Setup = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    let { messenger } = useParams();
    const [token, setToken] = useState(null);
    const navigate = useNavigate();
    const [verifiedToken, setVerifiedToken] = useState(false);

    const getToken = async () => {
        try {
            console.log(messenger);
            const res = await fetch(`${apiUrl}/token/${messenger}`);
            const data = await res.json();
            setToken(data.token);
        } catch (err) {
            console.log(err);
        }
    }

    const goHome = () => {
        navigate(`/`);
    };

    const verifyToken = async (token) => {
        try {
            console.log(token);
            const res = await fetch(`${apiUrl}/token-details/${token}`);
            const data = await res.json();
            if (res.status === 300) {
                toast.error("Token Expired. Try Again with new Token");
            }
            else if (res.status === 200) {
                console.log(data);
                if (data?.data?.verified) {
                    setVerifiedToken(true);
                }
                else {
                    toast.error("Token Not Verified. Please follow the given steps to verify the token");
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleShare = async (token) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Share token",
                    text: "token",
                    url: `${token}`,
                });
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(token);
                toast.success("Token copied to clipboard!");
            } catch (error) {
                console.error("Failed to copy token:", error);
            }
        }
    };

    useEffect(() => {
        if (verifiedToken) {
            navigate(`/form/${token}`)
        }
    }, [verifiedToken])



    return (
        <div className="">
            <Toaster />
            <header class="text-gray-600 body-font border ">
                <div class="container mx-auto flex flex-wrap justify-between p-5 flex-col md:flex-row items-center">
                    <a class="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
                        <img
                            src="https://assets.website-files.com/63f580596efa74629ceecdf5/646cd0d4bff811689094709c_Reclaim-Logo-Asterisk.jpg"
                            class="w-10 h-10 rounded-full"
                        />

                        <span class="ml-3 font-bold text-xl">ScamCheck Bot</span>
                    </a>
                    <a href="https://www.reclaimprotocol.org/">
                        <button class="inline-flex cursor-pointer items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">
                            🔗 Reclaim Protocol
                        </button>
                    </a>
                </div>
            </header>

            <div className="flex my-14">

                <section class="mt-4 text-gray-600 p-3 h-full md:flex flex-row gap-4 w-full body-font ">
                    <div class="container mx-auto   rounded-lg flex h-full p-3 items-center justify-center flex-col">
                        <div class="text-center s lg:w-2/3 w-full">
                            {!token && (
                                <><div class="flex justify-center my-2">
                                    <button
                                        onClick={() => getToken()}
                                        class="inline-flex text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 rounded text-lg"
                                    >
                                        Generate Token ✨
                                    </button>
                                </div>
                                    <div className="flex-row p-5 rounded-lg  gap-4">
                                        <button
                                            onClick={() => goHome()}
                                            class="inline-flex text-black bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg"
                                        >
                                            Home
                                        </button>
                                    </div></>
                            )}
                            {token && (
                                <>
                                    <p class="mb-8 hover:underline text-blue-700 text-xl leading-relaxed truncate">
                                        {token}
                                    </p>
                                    {/* <div class="flex justify-center my-2">
                                        <button
                                            onClick={() => handleShare(token)}
                                            class="inline-flex text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 rounded text-lg"
                                        >
                                            Copy Token
                                        </button>
                                    </div> */}
                                    <div class="flex justify-center my-2">
                                        <button
                                            onClick={() => getToken()}
                                            class="inline-flex text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 rounded text-lg"
                                        >
                                            Generate New Token ✨
                                        </button>
                                    </div>
                                    <div class="flex justify-center my-2">
                                        <button
                                            onClick={() => verifyToken(token)}
                                            class="inline-flex text-white bg-green-500 border-0 py-2 px-6 focus:outline-none hover:bg-green-600 rounded text-lg"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="flex-row p-5 rounded-lg  gap-2">
                                        <button
                                            onClick={() => goHome()}
                                            class="inline-flex text-black bg-grey-900 border-0 py-2 px-6 focus:outline-none hover:bg-grey-600 rounded text-lg"
                                        >
                                            Home
                                        </button>
                                    </div>
                                </>)}
                        </div>
                    </div>

                    <div class="container  px-5 py-10 mx-auto">
                        {(messenger === "discord") && (
                            <>
                                <div class="flex flex-col text-center w-full">
                                    <h1 class="sm:text-4xl text-3xl font-medium title-font mb-2 text-gray-900">
                                        How to add Bot in Discord
                                    </h1>
                                    <p class="lg:w-2/3 mx-auto  ">
                                        - Search for @ScamCheckAuthBot to Add Bot as Member of the group
                                    </p>
                                    <p class="lg:w-2/3 mx-auto  ">
                                        - Make Bot Admin of the Group
                                    </p>
                                    <p class="lg:w-2/3 mx-auto  ">
                                        - Run "/setup token_value" command in the group to proceed to next step (Only Group Admins can run this command)
                                    </p>
                                </div>
                            </>
                        )}
                        {(messenger === "telegram") && (
                            <>
                                <div class="flex flex-col text-center w-full">
                                    <h1 class="sm:text-4xl text-3xl font-medium title-font mb-2 text-gray-900">
                                        How to add Bot in Telegram
                                    </h1>
                                    <p class="lg:w-2/3 mx-auto  ">
                                        - Search for @ScamCheckAuthBot to Add Bot as Member of the group
                                    </p>
                                    <p class="lg:w-2/3 mx-auto  ">
                                        - Make Bot Admin of the Group
                                    </p>
                                    <p class="lg:w-2/3 mx-auto  ">
                                        - Run "/setup token_value" command in the group to proceed to next step (Only Group Admins can run this command)
                                    </p>

                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>

            <footer class="text-gray-600 fixed w-full m-auto hidden md:block  bottom-0  body-font">
                <div class="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
                    <a class="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
                        <img
                            class="w-10 h-10 rounded-full"
                            src="https://assets.website-files.com/63f580596efa74629ceecdf5/646cd0d4bff811689094709c_Reclaim-Logo-Asterisk.jpg"
                        />
                        <span class="ml-3 text-xl">Powered by Reclaim</span>
                    </a>
                    <p class="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">
                        WhyTrustYou
                    </p>
                    <span class="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
                        <a
                            href="https://twitter.com/protocolreclaim"
                            class="ml-3 text-gray-500"
                        >
                            <svg
                                fill="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                class="w-5 h-5"
                                viewBox="0 0 24 24"
                            >
                                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                            </svg>
                        </a>
                    </span>
                </div>
            </footer>
        </div>
    );
};