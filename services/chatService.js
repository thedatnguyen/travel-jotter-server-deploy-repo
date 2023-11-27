const weavy = require('../configs/weavy');
const dropbox = require('../configs/dropbox');

const errorHandler = (err) => {
    console.log(err)
    return { error: { message: err.message }, result: undefined }
}

const provideToken = async (email) => {
    try {
        const access_token = await weavy.provideChatTokenForUser(email);
        return { result: { access_token } }
    } catch (error) {
        return errorHandler(error);
    }
}

const provideChat = async (email, membersChatId) => {
    try {
        let conversationId;
        const access_token = await weavy.provideChatTokenForUser(email);
        if (membersChatId) {
            conversationId = await weavy.createNewOrGetConversation(membersChatId, access_token);
        }
        const result = { access_token, conversationId }
        return { result }
    } catch (error) {
        return errorHandler(error);
    }
}

const deleteConversation = async (email, conversationId) => {
    try {
        const access_token = await weavy.provideChatTokenForUser(email);
        const deleteSuccess = await weavy.deleteConversation(conversationId, access_token);
        if (!deleteSuccess) return { error: { message: 'delete failed' } };
        return { result: conversationId };
    } catch (error) {
        return errorHandler(error);
    }
}

const changeConversationPicture = async (email, conversationId, conversationPicture) => {
    try {
        const access_token = await weavy.provideChatTokenForUser(email);
        const pictureBuffer = Buffer.from(conversationPicture, 'base64');
        const { pictureUrl } = await dropbox.uploadImage(pictureBuffer);
        const updateSuccess = await weavy.changeConversationPicture(conversationId, access_token, pictureUrl);
        if (!updateSuccess) return { error: { message: 'update failed' } };
        return { result: conversationId };
    } catch (error) {
        return errorHandler(error);
    }
}

const addMembersToConversation = async (email, membersEmail, conversationId) => {
    try {
        const access_token = await weavy.provideChatTokenForUser(email);
        const addSuccess = await weavy.addUsersToChat(access_token, membersEmail, conversationId);
        if (!addSuccess) return { error: { message: 'add members failed' } };
        return { result: membersEmail };
    } catch (error) {
        return errorHandler(error);
    }
}
module.exports.chatService = {
    provideToken,
    provideChat,
    deleteConversation,
    changeConversationPicture,
    addMembersToConversation
}