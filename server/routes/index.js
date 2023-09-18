var express = require("express");
var router = express.Router();
var { Token } = require("../models/Token");
var { Group } = require("../models/Group");
const { Check } = require("../models/Check");
const allProviderParams = require("./utils.json")
const { addGroupConfig } = require("../reclaim/add-group-config");
const { reclaimprotocol } = require("@reclaimprotocol/reclaim-sdk");
const bodyParser = require("body-parser");
const reclaim = new reclaimprotocol.Reclaim();

const expiryTokenTime = 1000 * 60 * 10; // 10 minutes

router.get("/", (request, response) => {
  response.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});


// ------- Bot Creation APIs -------

// Generate new token for group configuration
router.get("/token/:messenger", async (request, response) => {
  console.log(request.params.messenger)
  const newToken = new Token();
  newToken.data = {
    createTime: Date.now(),
    verified: false,
    messenger: request.params.messenger,
  };
  await newToken.save();
  return response.status(200).json({
    token: newToken.token,
  });
});


// Check if token exists
router.get("/token-exists/:token", async (request, response) => {
  const token = await Token.findOne({ token: request.params.token });
  if (!token) {
    return response.status(401).json({ message: "Invalid Token, please check." });
  }
  else {
    return response.status(200).json({
      message: "Token Exists",
    });
  }
});


// Check if token is valid and not expired
router.get("/token-validity/:token", async (request, response) => {
  const token = await Token.findOne({ token: request.params.token });

  if (token?.data?.createTime !== undefined) {
    if ((Date.now() - token.data.createTime) <= expiryTokenTime) {
      return response.status(200).json({
        message: 'Token Valid.',
      });
    }
    else {
      return response.status(401).json({
        message: 'Token Expired.',
      });
    }
  }
  else {
    return response.status(401).json({
      message: 'Token Invalid.',
    });
  }
});


// Check if user has verified the token by running the \setup commmand
router.get("/token-verified/:token", async (request, response) => {
  const token = await Token.findOne({ token: request.params.token });
  if (token?.data?.verified === true) {
    return response.status(200).json({
      data: token.data,
    });
  }
  else {
    return response.status(401).json({
      message: "Token Not Verified",
    });
  }
});


// Send the token details to the user
router.get("/token-details/:token", async (request, response) => {
  const token = await Token.findOne({ token: request.params.token });
  if (!token) {
    return response.status(401).json({ message: "Invalid Token, please check." });
  }
  return response.status(200).json({
    data: token?.data,
  });
});


// Add group configuration after user has verified the token
router.post("/add-config", async (request, response) => {
  const request_data = request.body;
  const token = await Token.findOne({ token: request_data.token });
  if (!token)
    response.status(401).json({ message: "Token Not Found" });

  if (!token?.data?.verified) {
    response.status(401).json({ message: "Token Not Verified" });
  }

  if (!token?.data?.groupId) {
    response.status(401).json({ message: "Group Not Found" });
  }

  await addGroupConfig(request_data);
  return response.status(200).json({ message: "Configuration added successfully" });
});


// ------- Join Group APIs -------


// Get Reclaim URL based on Group Config

const createObj = async () => {
  try {
    const check = new Check();
    check.data = {};
    await check.save();
    return check.checkId;
  } catch (err) {
    console.log(`err: ${err}`);
  }
};

router.post("/reclaim-url", async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const groupConfig = await Group.findOne({ groupId: groupId });
    if (!groupConfig) {
      return res.status(401).json({ message: "Invalid Group Id, please check." });
    }
    const checkId = await createObj();
    const check = await Check.findOne({ checkId: checkId });
    check.data = { groupId: groupId };
    await check.save();
    const request = reclaim.requestProofs({
      title: "Reclaim Protocol",
      baseCallbackUrl: process.env.BASE_URL + "/update/proof",
      callbackId: checkId,
      requestedProofs: [
        new reclaim.CustomProvider({
          provider: groupConfig?.data.provider,
          payload: {},
        }),
      ],
    });
    const reclaimUrl = await request.getReclaimUrl();
    if (!reclaimUrl) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.status(201).json({ url: reclaimUrl, checkId: checkId });
    return reclaimUrl;
  } catch (err) {
    console.log(`error in getReclaimUrl: ${err}`);
  }
});

// Verify Proof based on Group Config

const verifyMember = async (check) => {
  try {
    console.log(check.data.proofParams)
    const proofParam = check.data.proofParams.param;
    const guildConfig = await Group.findOne({ groupId: check.data.groupId });

    let isMemberVerified = false;
    if (guildConfig.data.condition === 'EQ') {
      proofParam === guildConfig.data.value ? isMemberVerified = true : isMemberVerified = false;
    }
    else if (guildConfig.data.condition === 'INC') {
      proofParam.includes(guildConfig.data.value) ? isMemberVerified = true : isMemberVerified = false;
    }
    else if (guildConfig.data.condition === 'NINC') {
      proofParam.includes(guildConfig.data.value) ? isMemberVerified = false : isMemberVerified = true;
    }
    else if (guildConfig.data.condition === 'GT') {
      if (isInteger(proofParam)) {
        getIntegerValue(proofParam) > getIntegerValue(guildConfig.data.value) ? isMemberVerified = true : isMemberVerified = false;
      }
      else {
        isMemberVerified = false;
      }
    }
    else if (guildConfig.data.condition === 'LT') {
      if (isInteger(proofParam)) {
        getIntegerValue(proofParam) < getIntegerValue(guildConfig.data.value) ? isMemberVerified = true : isMemberVerified = false;
      }
      else {
        isMemberVerified = false;
      }
    }
    else if (guildConfig.data.condition === 'GTE') {
      if (isInteger(proofParam)) {
        getIntegerValue(proofParam) >= getIntegerValue(guildConfig.data.value) ? isMemberVerified = true : isMemberVerified = false;
      }
      else {
        isMemberVerified = false;
      }
    }
    else if (guildConfig.data.condition === 'LTE') {
      if (isInteger(proofParam)) {
        getIntegerValue(proofParam) <= getIntegerValue(guildConfig.data.value) ? isMemberVerified = true : isMemberVerified = false;
      }
      else {
        isMemberVerified = false;
      }
    }
    return isMemberVerified;
  } catch (error) {
    console.error(error);
  }
}

router.post("/update/proof", async (req, res) => {
  try {
    const check = await Check.findOne({ checkId: req.query.id });
    if (!check) return res.status(401).send("<h1>Unable to update Proof</h1>");
    check.data = {
      ...check.data,
      proofs: JSON.parse(Object.keys(req.body)[0]).proofs,
    };
    check.data = {
      ...check.data,
      proofParams: check.data.proofs.map((proof) => {
        if (allProviderParams.hasOwnProperty(proof.provider)) {
          const paramaters = JSON.parse(proof.parameters);
          let obj = {};
          obj["param"] = paramaters[allProviderParams[proof.provider]['param1']];
          return obj;
        }
        else {
          return JSON.parse(proof.parameters);
        }
      }),
    };
    check.data.proofParams = check.data.proofParams.reduce((result, currentObject) => {
      return { ...result, ...currentObject };
    }, {});
    await check.save();
    const verifyStatus = await verifyMember(check);
    if (verifyStatus) {
      res.status(201).send("<h1>Proofs has been shared with the Requestor. \n You can exit the screen</h1>");
    }
    else {
      res.status(401).send("<h1>Unable to verify the member</h1>");
    }

    check.data = {
      ...check.data,
      isVerified: verifyStatus,
    };
    await check.save();
  } catch (err) {
    console.log(err);
  }
});

// Get Invite link based on Group Config
router.post("/invite-link", async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const inviteLink = await fetch(process.env.TELEGRAM_SERVER_URL + '/invite', {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Sec-Fetch-Mode": "cors",
      },
      body: JSON.stringify({ chatId: groupId }),
    });
    const data = await inviteLink.json();
    console.log(data);
    if (data.success) {
      res.status(201).json({ link: data.inviteLink });
    }
    else {
      res.status(401).json({ message: "Unable to get invite link" });
    }
  }
  catch (err) {
    console.log(err);
  }
});

// Polling API to check if the member has been verified or not

router.get("/fetch/:checkId", async (req, res) => {
  const check = await Check.findOne({ checkId: req.params.checkId });
  if (!check)
    return res.status(401).json({ message: "Invalid URL, please check." });
  res.status(200).json({
    data: check.data,
  });
});


module.exports = router;