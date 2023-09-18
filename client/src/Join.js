import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

export const Join = () => {

  const apiUrl = process.env.REACT_APP_API_URL;
  const { groupId } = useParams();
  const [claimUrl, setClaimUrl] = useState(null);
  const [checkId, setCheckId] = useState(null);
  const [verified, setVerified] = useState(false);
  const [gotProof, setGotProof] = useState(false);
  const navigate = useNavigate();
  const [joinLink, setJoinLink] = useState("");

  const getRecliamUrl = async () => {
    try {
      const response = await fetch(`${apiUrl}/reclaim-url`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Sec-Fetch-Mode": "cors",
        },
        body: JSON.stringify({ groupId: groupId }),
      });
      const data = await response.json();
      if (data?.url && data?.checkId) {
        setClaimUrl(data.url);
        setCheckId(data.checkId);
      } else {
        toast.error("Error in getting Reclaim URL");
      }
    } catch (err) {
      console.log(`error in getReclaimUrl: ${err}`);
    }
  };

  const fetchData = async () => {
    try {
      console.log(`verify status: ${verified}`)
      console.log(checkId, claimUrl)
      const response = await fetch(`${apiUrl}/fetch/${checkId}`);
      const data = await response.json();
      if (data.data?.proofParams) {
        setGotProof(true);
      }
      if (data.data?.isVerified) {
        setVerified(data.data?.isVerified);
      }
    } catch (err) {
      console.log(`error in fetchData: ${err}`);
    }
  };

  const fetchInviteLink = async () => {
    try {
      const response = await fetch(`${apiUrl}/invite-link`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Sec-Fetch-Mode": "cors",
        },
        body: JSON.stringify({ groupId: groupId }),
      });
      const data = await response.json();
      if (response.status === 201) {
        setJoinLink(data.link);
      }
      else {
        toast.error("Error in getting Invite Link");
      }
    } catch (err) {
      console.log(`error in fetchInviteLink: ${err}`);
    }
  };

  const handleCopyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleGoBack = () => {
    navigate(`/`);
  }


  useEffect(() => {
    getRecliamUrl();
  }, []);

  useEffect(() => {
    if (checkId) {
      setInterval(fetchData, 7000);
    }
  }, [checkId]);

  useEffect(() => {
    if (verified) {
      fetchInviteLink();
    }
  }, [verified]);




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
          {gotProof === false && verified === false && (
            <>
              <div class="flex flex-col text-center w-full mb-12">
                <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
                  Prove Identity & Verify yourself
                </h1>
              </div>
              {claimUrl !== null && (
                <>
                  <div className="flex flex-col justify-center items-center gap-4 text-center w-full mt-12">
                    <p class="sm:text-3xl hidden md:block text-2xl font-medium title-font mb-4 text-gray-900">
                      Scan in Reclaim App
                    </p>

                    <QRCodeSVG className="hidden md:block" height={200} width={200} value={claimUrl} />
                    <div className="flex-row p-5 rounded-lg  gap-4">
                      <a target="_blank" href={claimUrl}>
                        <button class="  text-white w-full bg-indigo-500 border-0 py-2 px-6 focus:outline-none m-2 hover:bg-indigo-600 rounded-xl text-lg">
                          Open Magic Link ✨{" "}
                        </button>
                      </a>
                      <button
                        onClick={() => handleCopyLink(claimUrl)}
                        class=" text-gray-700 w-full bg-gray-100 border-0 py-2 px-6 focus:outline-none m-2 hover:bg-gray-200 rounded-xl text-lg"
                      >
                        Copy Reclaim Magic Link ✨
                      </button>
                      <button
                        onClick={handleGoBack}
                        class="text-gray-700  w-full bg-gray-100 border-0 py-2 px-6 focus:outline-none m-2 hover:bg-gray-200 rounded-lg text-xl text-lg"
                      >
                        Home
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          {gotProof === true && verified === true && (
            <>
              <div class="flex flex-col text-center w-full mb-12">
                <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
                  You are successfully verified! Here is the Invite Link to join the Group.
                </h1>
              </div>
              <div className="flex flex-col justify-center items-center gap-4 text-center w-full mt-12">
                <p class="sm:text-3xl hidden md:block text-2xl font-medium title-font mb-4 text-gray-900">
                  Group Link
                </p>
                <QRCodeSVG className="hidden md:block" height={200} width={200} value={joinLink} />
                <div className="flex-row p-5 rounded-lg  gap-4">
                  <a target="_blank" href={joinLink}>
                    <button class="  text-white w-full bg-indigo-500 border-0 py-2 px-6 focus:outline-none m-2 hover:bg-indigo-600 rounded-xl text-lg">
                      Open Link
                    </button>
                  </a>
                  <button
                    onClick={handleGoBack}
                    class="text-gray-700  w-full bg-gray-100 border-0 py-2 px-6 focus:outline-none m-2 hover:bg-gray-200 rounded-lg text-xl text-lg"
                  >
                    Home
                  </button>
                </div>
              </div>
            </>
          )}
          {gotProof === true && verified === false && (
            <>
              <div class="flex flex-col text-center w-full mb-12">
                <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
                  You Failed to match the verification criteria to join this Group.
                  <br />
                  Please try again with different credentials.
                </h1>
              </div>
              <div className="flex flex-col justify-center items-center gap-4 text-center w-full mt-12">
                <div className="flex-row p-5 rounded-lg  gap-4">
                  <button
                    onClick={handleGoBack}
                    class="text-gray-700 w-half bg-gray-100 border-0 py-2 px-6 focus:outline-none m-2 hover:bg-gray-200 rounded-lg text-xl text-lg"
                  >
                    Home
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section >
    </div >
  );

}