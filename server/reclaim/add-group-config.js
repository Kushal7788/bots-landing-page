const { Token } = require("../models/Token");
const { Group } = require("../models/Group");

const addKickConfig = async (request_data) => {
    try {
        const token = await Token.findOne({ token: request_data.token });
        const groupConfig = await Group.findOne({ groupId: token?.data.groupId });
        if (groupConfig) {
            groupConfig.data = {
                ...groupConfig.data,
                kickTimer: request_data.kickTimer * 60 * 60 * 1000 * 24,
                kickStartTime: Date.now(),
            }
            await groupConfig.save();
        }
    } catch (err) {
        console.log(err)
    }
};

const addDiscordConfig = async (request_data) => {
    try {
        const token = await Token.findOne({ token: request_data.token });
        const groupConfig = await Group.findOne({ groupId: token?.data.groupId });
        if (groupConfig) {
            groupConfig.data = {
                ...groupConfig.data,
                verificationRole: request_data.verificationRole,
                exemptRole: token.data.exemptRole,
            }
            await groupConfig.save();
        }
    } catch (err) {
        console.log(err)
    }
};


const createGroup = async (request_data) => {
    try {
        const token = await Token.findOne({ token: request_data.token });
        const newGroup = new Group();
        newGroup.groupId = token?.data.groupId;
        newGroup.data = {
            groupTitle: token?.data.groupTitle,
            messenger: token?.data.messenger,
            scheduledStartTime: Date.now(),
            provider: request_data.provider,
            condition: request_data.operator,
            value: request_data.value,
            scheduledTimer: request_data.schedulerTimer * 60 * 60 * 1000 * 24,
            kickPeople: request_data.kickPeople,
        };
        await newGroup.save();
        if (request_data.kickPeople) {
            await addKickConfig(request_data);
        }
        if (token?.data.messenger === "discord") {
            await addDiscordConfig(request_data);
        }
    }
    catch (err) {
        console.log(err)
    }
};

const addGroupConfig = async (request_data) => {
    try {
        const token = await Token.findOne({ token: request_data.token });

        const group = await Group.findOne({ groupId: token?.data.groupId });
        if (!group) {
            await createGroup(request_data);
        } else {
            group.data = {
                ...group.data,
                groupTitle: token?.data.groupTitle,
                messenger: token?.data.messenger,
                scheduledStartTime: Date.now(),
                provider: request_data.provider,
                condition: request_data.operator,
                value: request_data.value,
                scheduledTimer: request_data.schedulerTimer * 60 * 60 * 1000 * 24,
                kickPeople: request_data.kickPeople,
            };
            await group.save();
            if (request_data.kickPeople) {
                await addKickConfig(request_data);
            }
            if (token?.data.messenger === "discord") {
                await addDiscordConfig(request_data);
            }
        }
    } catch (err) {
        console.log(err)
    }
};

module.exports = { addGroupConfig };