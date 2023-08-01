const express = require('express') //express
const router = express.Router() //creating router
const postgresQueries = require('../app/postgresQueries') //importing postgres queries
const responseWrapper = require('../utils/responseWrapper')

router.post('/clearOtherRooms', async (req, res) => {
    try {
        const result = await postgresQueries.clearOtherRooms(null, 0)
        if (result) {
            res.status(200).json({
                updated: true
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})


//getting all active room for a userId
router.post('/getAllUserActiveRooms', async (req, res) => {
    try {
        console.log(req.body)
        const result = await postgresQueries.getAllUserActiveRooms(req.body.userId)
        console.log(result.rows)
        console.log(result.rows.length)
        // setTimeout(function () {
        res.status(200).json({
            count: result.rows.length,
            active_rooms: result.rows
        })
        // }, 3000);

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})

//delete a room
router.post('/deleteCurrentRoom', async (req, res) => {
    try {
        console.log(req.body.nameValuePairs)
        const roomCreatorId = await postgresQueries.getRoomCreatorId(req.body.nameValuePairs)
        if (roomCreatorId != req.body.nameValuePairs.userId) {
            res.status(200).json({
                deletedRoom: false,
                message: 'You do not have permission to delete this room!'
            })
        } else {
            const result = await postgresQueries.deleteRoom(req.body.nameValuePairs.roomId)
            const deletedRoom = await postgresQueries.updateOwnRoomCount(req.body.nameValuePairs)
            if (result && deletedRoom)
                res.status(200).json({
                    deletedRoom: true,
                    message: 'Room deleted successfully'
                })
            else
                res.status(200).json({
                    deletedRoom: false,
                    message: 'Room does not exist'
                })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})

router.post('/saveUserToDb', async (req, res) => {
    try {
        console.log(req.body.nameValuePairs)
        const result = await postgresQueries.saveUserToDb(req.body.nameValuePairs)
        if (result) {
            res.status(200).json({
                message: 'user saved to db successfully'
            })
        } else {
            res.status(404).json({
                message: 'unable to save user to db'
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})

//can user join the room
router.post('/canJoinRoom', async (req, res) => {
    try {
        console.log(req.body.nameValuePairs)
        const result = await postgresQueries.getRoomCreatorId(req.body.nameValuePairs)
        const ownRoom = req.body.nameValuePairs

        if (req.body.nameValuePairs.userId == result) { //if creator_id (result) == userId, this means the creator is trying to join the room by copying and pasting the room_id in bottom sheet
            res.status(200).json({ //send a message to him, to click on the room below and join
                ownRoom: true,
                canJoin: true,
                actionForUser: "You can join the room!"
            })
        } else { //else means that creator_id (result) and userId are not same, this means userId is of joiner
            const checkForJoinerNull = await postgresQueries.getRoomDetailsFromRoomId(req.body.nameValuePairs.roomId)
            if (checkForJoinerNull.rowCount != 0) {
                if (checkForJoinerNull.rows[0].joiner_id != null) {
                    res.status(200).json({
                        ownRoom: false,
                        canJoin: false,
                        actionForUser: "Room is full!"
                    })
                } else {
                    const result = await postgresQueries.getActiveRoomStatusForAskedRoomID(req.body.nameValuePairs) //get is_active status for the room
                    if (result) { //if it is available, join the room
                        res.status(200).json({
                            ownRoom: false,
                            canJoin: true,
                            actionForUser: "You can join the room!"
                        })
                    } else { //otherwise, send msg that room is full
                        res.status(200).json({
                            ownRoom: false,
                            canJoin: false,
                            actionForUser: "Can't join this room!"
                        })
                    }
                }
            } else {
                res.status(200).json({
                    ownRoom: false,
                    canJoin: false,
                    actionForUser: "Room does not exist!"
                })
            }
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})

//update joiner_id in room [null or joiner_id (some id)]
router.post('/updateJoinerInChatRoom', async (req, res) => {
    try {
        console.log(req.body.nameValuePairs)
        const result = await postgresQueries.updateJoinerInChatRoom(req.body.nameValuePairs.userId, req.body.nameValuePairs.roomId, req.body.nameValuePairs.userName)
        if (result) {
            res.status(200).json({
                message: 'joiner_id updated successfully'
            })
        } else {
            res.status(404).json({
                message: 'unable to update joiner_id'
            })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})

//update is_available status for the room
router.post('/updateRoomIsAvailableStatus', async (req, res) => {
    try {
        console.log(req.body.nameValuePairs)
        const result = await postgresQueries.updateRoomIsAvailableStatus(req.body.nameValuePairs)
        if (result) {
            res.status(200).json({
                statusUpdated: true
            })
        } else {
            res.status(200).json({
                statusUpdated: false
            })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})

router.post('/getUserAvatar', async (req, res) => {
    try {
        console.log(req.body.nameValuePairs)
        const result = await postgresQueries.getUserAvatar(req.body.nameValuePairs)
        res.status(200).json({
            userAvatar: result
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})

router.post('/addRoomToOtherRoomsArray', async (req, res) => {
    try {
        console.log(req.body.nameValuePairs)
        const result = await postgresQueries.addRoomToOtherRoomsArray(req.body.nameValuePairs)
        if (result) {
            res.status(200).json({
                arrayUpdated: true
            })
        } else {
            res.status(200).json({
                arrayUpdated: false
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})

router.post('/getAllDistinctRoomsFromArrayOfOtherRooms', async (req, res) => {
    try {
        console.log(req.body.nameValuePairs)
        const result = await postgresQueries.getAllDistinctRoomsFromArrayOfOtherRooms(req.body.nameValuePairs)
        res.status(200).json({
            count: result.length,
            active_rooms: result
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})

router.post('/checkIfUserExists', async (req, res) => {
    try {
        console.log(req.body.nameValuePairs)
        const result = await postgresQueries.checkIfUserExists(req.body.nameValuePairs.userId)
        if (result.rowCount == 0) {
            res.status(200).json({
                userExists: false
            })
        } else {
            res.status(200).json({
                userExists: true
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})

router.post('/getRoomDetailsFromRoomId', async (req, res) => {
    try {
        console.log(req.body.nameValuePairs)
        const result = await postgresQueries.getRoomDetailsFromRoomId(req.body.nameValuePairs.roomId)
        console.log(result.rows)
        console.log(result.rows.length)
        // setTimeout(function () {
        res.status(200).json({
            count: result.rows.length,
            active_rooms: result.rows
        })
        // }, 3000);

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
})


//exporting router
module.exports = router