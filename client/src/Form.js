import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

export const Form = () => {

    const apiUrl = process.env.REACT_APP_API_URL;
    let { token } = useParams();
    const navigate = useNavigate();
    const [messenger, setMessenger] = useState(null);
    const [verifiedToken, setVerifiedToken] = useState(false);
    const [selectProvider, setSelectProvider] = useState("google-login");
    const [selectOperator, setSelectOperator] = useState("EQ");
    const [selectValue, setSelectValue] = useState("");
    const [selectScheduler, setSelectScheduler] = useState("");
    const [selectKickScheduler, setSelectKickScheduler] = useState("");
    const [selectKick, setSelectKick] = useState(false);
    const [displayMessage, setDisplayMessage] = useState("");
    const [confidAdded, setConfigAdded] = useState(false);
    const [displayConfigMessage, setDisplayConfigMessage] = useState("");
    const [selectVerificationRole, setSelectVerificationRole] = useState("");

    const postData = async () => {
        try {
            if (token && selectProvider && selectOperator && selectValue && selectScheduler) {
                let url = `${apiUrl}/add-config`;

                let options = {
                    method: "POST",
                    headers: {
                        Accept: "*/*",
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Sec-Fetch-Mode": "cors",
                    },
                    body: JSON.stringify({
                        token: token,
                        provider: selectProvider,
                        operator: selectOperator,
                        value: selectValue,
                        schedulerTimer: parseInt(selectScheduler),
                        kickPeople: selectKick,
                        kickTimer: parseInt(selectKickScheduler),
                        verificationRole: selectVerificationRole,
                    }),
                };
                const res = await fetch(url, options);
                if (res.status === 200) {
                    toast.success("Configuration added successfully");
                    setConfigAdded(true);
                    const data = await res.json();
                    console.log(data);
                    setDisplayConfigMessage(data.message);
                }
                else {
                    toast.error("Error in adding configuration");
                }
            }
            else {
                toast.error("Please fill all the fields");
            }
        } catch (err) {
            console.log(err);
        }
    };


    const verifyToken = async (token) => {
        try {
            const res1 = await fetch(`${apiUrl}/token-exists/${token}`);
            const data1 = await res1.json();
            if (res1.status === 200) {
                const res2 = await fetch(`${apiUrl}/token-validity/${token}`);
                const data2 = await res2.json();
                if (res2.status === 200) {
                    const res3 = await fetch(`${apiUrl}/token-verified/${token}`);
                    const data3 = await res3.json();
                    if (res3.status === 200) {
                        setVerifiedToken(true);
                    }
                    else {
                        setVerifiedToken(false);
                        setDisplayMessage(data3.message);
                    }
                }
                else {
                    setVerifiedToken(false);
                    setDisplayMessage(data2.message);
                }
            }
            else {
                setVerifiedToken(false);
                setDisplayMessage(data1.message);
            }
        } catch (err) {
            console.log(err);
        }

    };

    const handleProviderChange = (event) => {
        setSelectProvider(event.target.value);
    };

    const handleOperatorChange = (event) => {
        setSelectOperator(event.target.value);
    };

    const handleValueChange = (event) => {
        setSelectValue(event.target.value);
    };

    const handleVerificationRoleChange = (event) => {
        setSelectVerificationRole(event.target.value);
    };

    const handleSchedulerChange = (event) => {
        setSelectScheduler(event.target.value);
    };

    const handleKickSchedulerChange = (event) => {
        setSelectKickScheduler(event.target.value);
    };

    const handleKickChange = () => {
        console.log(selectKick)
        setSelectKick(!selectKick);
    };

    const handleGoBack = () => {
        navigate(`/`);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
    };


    const fetchMessenger = async () => {
        try {
            const res = await fetch(`${apiUrl}/token-details/${token}`);
            const data = await res.json();
            setMessenger(data.data.messenger);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        verifyToken(token);
    }, []);

    useEffect(() => {
        if (verifiedToken === true) {
            fetchMessenger();
        }
    }, [verifiedToken]);


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

            <section class="text-gray-600 body-font">
                <div class="container px-5 py-24 mx-auto">
                    {(verifiedToken === false) && (confidAdded === false) && (
                        <>
                            <div class="flex flex-col text-center w-full mb-12">
                                <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
                                    {displayMessage}
                                </h1>
                            </div>
                            <div class="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 justify-center  sm:space-x-4 sm:space-y-0 space-y-2 sm:px-0 items-center sm:items-end my-6">
                                <button
                                    onClick={handleGoBack}
                                    class="text-black sm:h-[60px] bg-gray-100 border-0 py-2 px-8 focus:outline-none hover:bg-gray-200 rounded-lg text-xl mx-2"
                                >
                                    Home
                                </button>
                            </div>
                        </>
                    )}
                    {(verifiedToken === true) && (confidAdded === false) && (
                        <>
                            <div class="flex flex-col text-center w-full mb-12">
                                <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
                                    Setup your GateKeeper Bot for {messenger}
                                </h1>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div class="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 justify-center  sm:space-x-4 sm:space-y-0 space-y-2 sm:px-0 items-center sm:items-end">
                                    <div class="relative flex-grow w-full h-full my-2">
                                        <label for="provider" class="block mb-2 text-xl font-medium ">
                                            Select your provider
                                        </label>
                                        <select
                                            value={selectProvider}
                                            onChange={handleProviderChange}
                                            id="countries"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-xl py-3  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:h-[60px] p-2.5 "
                                        >
                                            <option value={"google-login"} selected>GMail</option>
                                            <option value={"outlook-login"}>Outlook</option>
                                            <option value={"uidai-dob"} selected>DOB Aadhaar</option>
                                            <option value={"uidai-state"}>State Aadhaar</option>
                                        </select>
                                    </div>
                                    <div class="relative flex-grow w-full h-full my-2">
                                        <label for="countries" class="block mb-2 text-xl font-medium ">
                                            Select your Operator
                                        </label>
                                        <select
                                            value={selectOperator}
                                            onChange={handleOperatorChange}
                                            id="countries"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-xl py-3  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:h-[60px] p-2.5 "
                                        >
                                            <option value={"EQ"} selected>Equals</option>
                                            <option value={"INC"}>Includes</option>
                                            <option value={"NINC"}>Not Includes</option>
                                            <option value={"GT"}>Greater Than</option>
                                            <option value={"LT"}>Less Than</option>
                                        </select>
                                    </div>
                                    <div class="relative flex-grow w-full h-full my-2">
                                        <label for="countries" class="block mb-2 text-xl font-medium ">
                                            Enter Value
                                        </label>
                                        <input type="text" required placeholder="Enter Value" value={selectValue} onChange={handleValueChange} class="bg-gray-50 border border-gray-300 text-gray-900 text-xl py-3  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:h-[60px] p-2.5 " />
                                    </div>
                                </div>
                                <div class="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 justify-center  sm:space-x-4 sm:space-y-0 space-y-2 sm:px-0 items-center sm:items-end">
                                    <div class="relative flex-grow w-full h-full my-2">
                                        <label for="provider" class="block mb-2 text-xl font-medium ">
                                            Enter Scheduler Timer
                                        </label>
                                        <input type="number" min="1" required placeholder="Enter Number of Days" value={selectScheduler} onChange={handleSchedulerChange} class="bg-gray-50 border border-gray-300 text-gray-900 text-xl py-3  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:h-[60px] p-2.5 " />
                                    </div>
                                </div>
                                {(messenger === "discord") && (
                                    <>
                                        <div class="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 justify-center  sm:space-x-4 sm:space-y-0 space-y-2 sm:px-0 items-center sm:items-end">
                                            <div class="relative flex-grow w-full h-full my-2">
                                                <label for="provider" class="block mb-2 text-xl font-medium ">
                                                    Enter Verification Role Name
                                                </label>
                                                <input type="text" required placeholder="Enter Role Name to give to verified users (Already a Role should exists of this name in the server)" value={selectVerificationRole} onChange={handleVerificationRoleChange} class="bg-gray-50 border border-gray-300 text-gray-900 text-xl py-3  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:h-[60px] p-2.5 " />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div class="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 justify-center  sm:space-x-4 sm:space-y-0 space-y-2 sm:px-0 items-center sm:items-end">
                                    <div class="relative flex-grow w-full h-full flex my-2">
                                        <label for="enableCheckbox" class="block my-2 mb-2 mr-2 text-xl font-medium">
                                            Enable Kicking Unverified Users
                                        </label>
                                        <input type="checkbox" checked={selectKick} onChange={handleKickChange} class="bg-gray-50 border border-gray-300 text-gray-900 text-xl rounded-lg focus:ring-blue-500 focus:border-blue-500 " />
                                    </div>
                                </div>
                                {(selectKick === true) && (
                                    <>
                                        <div class="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 justify-center  sm:space-x-4 sm:space-y-0 space-y-2 sm:px-0 items-center sm:items-end">
                                            <div class="relative flex-grow w-full h-full my-2">
                                                <label for="provider" class="block mb-2 text-xl font-medium ">
                                                    Enter Kick Scheduler Timer
                                                </label>
                                                <input type="number" min="1" required placeholder="Enter Number of Days" value={selectKickScheduler} onChange={handleKickSchedulerChange} class="bg-gray-50 border border-gray-300 text-gray-900 text-xl py-3  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:h-[60px] p-2.5 " />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div class="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 justify-center  sm:space-x-4 sm:space-y-0 space-y-2 sm:px-0 items-center sm:items-end my-6">
                                    <button
                                        onClick={handleGoBack}
                                        class="text-black sm:h-[60px] bg-gray-100 border-0 py-2 px-8 focus:outline-none hover:bg-gray-200 rounded-lg text-xl mx-2"
                                    >
                                        Home
                                    </button>
                                    <button
                                        onClick={postData}
                                        class="text-white sm:h-[60px] bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded-lg text-xl mx-2 my-2"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                            <div class="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 justify-center  sm:space-x-4 sm:space-y-0 space-y-4 sm:px-0 items-center sm:items-end">

                            </div>
                        </>
                    )}
                    {(confidAdded === true) && (
                        <>
                            <div class="flex flex-col text-center w-full mb-12">
                                <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
                                    {displayConfigMessage}
                                </h1>
                            </div>
                            <div class="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 justify-center  sm:space-x-4 sm:space-y-0 space-y-2 sm:px-0 items-center sm:items-end my-6">
                                <button
                                    onClick={handleGoBack}
                                    class="text-black sm:h-[60px] bg-gray-100 border-0 py-2 px-8 focus:outline-none hover:bg-gray-200 rounded-lg text-xl mx-2"
                                >
                                    Home
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </section >
        </div >
    );

}