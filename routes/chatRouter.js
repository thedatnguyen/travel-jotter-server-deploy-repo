const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chatController');
const tokenVerify = require('../middlewares/tokenVerify');

router.route('/').all(tokenVerify)
    .get(chatController.provideChatToken)
    .post(chatController.provideConversations)

router.route('/:conversationId').all(tokenVerify)
    .delete(chatController.deleteConversation)

router.route('/:conversationId/members').all(tokenVerify)
    .post(chatController.addMembersToConversation)

router.route('/:conversationId/picture').all(tokenVerify)
    .patch(chatController.updateConversationPicture)

module.exports = router;