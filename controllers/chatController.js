const { chatService } = require('../services/chatService');

const errorHandler = (response, error, code) => {
    console.log(error);
    return response.status(code).send({
        message: error.message,
        tokens: response.locals.tokens
    })
}

const provideChatToken = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { error, result } = await chatService.provideToken(email);
        if (error) return errorHandler(res, error, 400);
        res.status(200).send({
            result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}
const provideConversations = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { membersChatId } = req.body;
        const { error, result } = await chatService.provideChat(email, membersChatId);
        if (error) return errorHandler(res, error, 400);
        res.status(200).send({
            result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const deleteConversation = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { conversationId } = req.params;
        const { error, result } = await chatService.deleteConversation(email, conversationId);
        if (error) return errorHandler(res, error, 400);
        res.status(200).send({
            result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const updateConversationPicture = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { conversationId } = req.params;
        const { conversationPicture } = req.body;
        const { error, result } = await chatService.changeConversationPicture(email, conversationId, conversationPicture);
        if (error) return errorHandler(res, error, 400);
        res.status(200).send({
            result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

const addMembersToConversation = async (req, res) => {
    try {
        const { email } = res.locals.account;
        const { conversationId } = req.params;
        const { membersEmail } = req.body;
        const { error, result } = await chatService.addMembersToConversation(email, membersEmail, conversationId);
        if (error) return errorHandler(res, error, 400);
        res.status(200).end({
            result,
            tokens: res.locals.tokens
        })
    } catch (error) {
        return errorHandler(res, error, 500);
    }
}

module.exports = {
    provideChatToken,
    provideConversations,
    deleteConversation,
    updateConversationPicture,
    addMembersToConversation
}