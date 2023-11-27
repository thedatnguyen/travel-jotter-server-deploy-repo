const axios = require('axios');

module.exports.createUser = async (accountData) => {
    const url = `${process.env.WAEVY_BASE_URL}/api/users`;
    const body = {
        uid: accountData.email,
        picture: accountData.pictureUrl,
        given_name: accountData.firstName,
        family_name: accountData.lastName,
        display_name: accountData.username
    };
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': process.env.WEAVY_TOKEN_FACTORY
        }
    }
    const newUser = await axios.post(url, body, configs);
    return newUser.data.id;
}


// if user does not exits then create new
module.exports.provideChatTokenForUser = async (email) => {
    // create user with uid {username}
    const url = `${process.env.WAEVY_BASE_URL}/api/users/${email}/tokens`;
    const body = { expires_in: 24 * 24 * 60 * 30 }; // 1 month
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': process.env.WEAVY_TOKEN_FACTORY
        }
    }

    const { access_token } = (await axios.post(url, body, configs)).data;
    return access_token;
}


module.exports.createNewOrGetConversation = async (membersChatId, accessToken) => {
    const url = `${process.env.WAEVY_BASE_URL}/api/conversations`;
    const body = {
        members: membersChatId
    }
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    }
    const conversationId = (await axios.post(url, body, configs)).data.id;
    return conversationId;
}

module.exports.addUsersToChat = async (accessToken, usernames, conversationId) => {
    const url = `${process.env.WAEVY_BASE_URL}/api/apps/${conversationId}/members`;
    const body = usernames;
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    }
    try {
        await axios.post(url, body, configs);
        return true;
    } catch (err) {
        return false;
    }
}

module.exports.getLastMessage = (chatId) => {
    let result = {};
    const url = `${process.env.WAEVY_BASE_URL}/api/apps/${chatId}/messages`;
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': process.env.WEAVY_TOKEN_FACTORY
        }
    }
    axios.get(url, configs)
        .then(apiResponse => {
            const messagesCount = apiResponse.data.count;
            result.lastMessage = apiResponse.data.data[messagesCount - 1].text;
        })
        .catch(err => {
            result.err = err.message;
        })
    return result;
}

module.exports.changeChatAvatar = async (id, avatarUrl) => {
    let result, error;
    const url = `https://f1746aae94594612865d8f61eb9291e7.weavy.io/api/users/${id}`;
    const body = {
        picture: avatarUrl
    }
    const configs = {
        headers: {
            Authorization: process.env.WEAVY_TOKEN_FACTORY,
            'content-type': 'application/json'
        }
    }
    await axios.patch(url, body, configs)
        .then(res => result = res.data)
        .catch(err => error = err);
    return { error, result }
}

module.exports.deleteConversation = async (conversationId, accessToken) => {
    const url = `${process.env.WAEVY_BASE_URL}/api/conversations/${conversationId}/trash`;
    const body = {}
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    }
    try {
        await axios.patch(url, body, configs);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports.changeConversationPicture = async (conversationId, accessToken, pictureUrl) => {
    const url = `${process.env.WAEVY_BASE_URL}/api/conversations/${conversationId}`;
    const body = { pictureUrl }
    const configs = {
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    }
    try {
        await axios.patch(url, body, configs);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}


