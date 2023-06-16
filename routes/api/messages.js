const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Chat = require('../../schemas/chatSchema');
const Message = require('../../schemas/messageSchema');
const Notification = require('../../schemas/NotificationSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.post("/", async (req, res, next) => {
    if (!req.body.content || !req.body.chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    };

    Message.create(newMessage)
    .then(message => {
        message.populate("sender chat")
            .then(populatedMessage => {
                User.populate(populatedMessage, { path: "chat.users" })
                    .then(populatedMessageWithUsers => {
                        var chat = Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: populatedMessageWithUsers })
                            .catch(error => console.log(error));

                        insertNotifications(chat, populatedMessageWithUsers);

                        res.status(201).send(populatedMessageWithUsers);
                    })
                    .catch(error => {
                        console.log(error);
                        res.sendStatus(400);
                    });
            })
            .catch(error => {
                console.log(error);
                res.sendStatus(400);
            });
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });
})

function insertNotifications(chat, message) {
    if (chat && chat.users && Array.isArray(chat.users)) {
        chat.users.forEach(userId => {
            if (userId == message.sender._id.toString()) return;
    
            Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id);
        });
    }
}

module.exports = router;