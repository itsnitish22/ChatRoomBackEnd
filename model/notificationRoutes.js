const express = require('express') //express
const router = express.Router() //creating router
const firebaseAdmin = require('firebase-admin')
const serviceAccount = require('../service-account.json')

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://chatroom-b75bb-default-rtdb.asia-southeast1.firebasedatabase.app"
});

router.post('/chatMsgNotification', async (req, res) => {
    try {
        const response = await sendNotificationToTheUser(req.body)
        if (response)
            res.status(200).json({
                messageSentSuccess: true
            })
        else
            res.status(200).json({
                messageSentSuccess: false
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})

async function sendNotificationToTheUser(data) {
    const messaging = firebaseAdmin.messaging();
    const payload = {
        notification: {
            title: data.title,
            body: data.message,
        }
    };
    var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };

    try {
        let result;
        console.log(data.toSendUserId)
        await messaging.sendToTopic(data.toSendUserId, payload, options)
            .then(function (response) {
                console.log("Successfully sent message:", response);
                result = true
            })
            .catch(function (error) {
                console.log("Error sending message:", error);
                result = false
            });
        console.log(`New Message Notification. Result: ${result}`);
        return result;
    } catch (error) {
        console.log("Error sending notification:", error);
        return false;
    }
}

module.exports = router