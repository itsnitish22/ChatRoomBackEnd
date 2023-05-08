const { resolve } = require('path')
const { Client } = require('pg') //client for postgres 
require('dotenv').config() //config env

// const client = new Client({
//     user: process.env.LOCAL_POSTGRES_USERNAME,
//     host: process.env.LOCAL_POSTGRES_HOSTNAME,
//     database: process.env.LOCAL_POSTGRES_DATABASE',
//     password: process.env.LOCAL_POSTGRES_PASSWORD,
//     port: process.env.LOCAL_POSTGRES_PORT,
// })

// credentials postgres server
const client = new Client({
    user: process.env.POSTGRES_USERNAME,
    host: process.env.POSTGRES_HOSTNAME,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    ssl: true
})

//connecting client
client.connect((err) => {
    if (err) {
        console.log(`error connecting to DB ${err}`)
    } else {
        console.log('successfully connected to DB')
    }
})

//inserting room into the db
async function insertroomIntoDB(data) {
    const query = `insert into chatting_rooms(room_id, creator_id, joiner_id, room_name, is_active, is_available, created_at, last_activity) values ($1, $2, $3, $4, $5, $6, NOW() AT TIME ZONE 'Asia/Kolkata', NOW())`
    const values = [data.roomId, data.creatorId, data.joinerId, data.roomName, true, true]
    client.query(query, values, (err, result) => {
        if (err) {
            console.log(err)
            return false
        } else {
            console.log('success posting data')
            return true
        }
    })
    return true
}

//fetching active status from db respective to room id
async function getActiveRoomStatusForAskedRoomID(data) {
    const query = `select is_active from chatting_rooms where room_id = $1`;
    const values = [data.roomId];
    var isActiveRoom = false;

    const result = await new Promise((resolve, reject) => {
        client.query(query, values, (err, result) => {
            try {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                    isActiveRoom = result.rows[0].is_active;
                }
            } catch {
                console.log(`name: ${data.roomId} does not exist`)
            }
        });
    });

    return isActiveRoom;
}

//fetching room name respective to room id
async function getActiveRoomNameForAskedRoomID(data) {
    const query = `select room_name from chatting_rooms where room_id = $1`;
    const values = [data.roomId];
    var roomName = "";

    const result = await new Promise((resolve, reject) => {
        client.query(query, values, (err, result) => {
            try {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                    roomName = result.rows[0].room_name;
                }
            } catch {
                console.log(`name: ${data.roomId} does not exist`)
            }

        });
    });

    return roomName;
}

//getting all active rooms for a user id
async function getAllUserActiveRooms(userId) {
    const query = `select * from chatting_rooms where creator_id = $1 and is_active = true`;
    const values = [userId];

    const result = await new Promise((resolve, reject) => {
        client.query(query, values, (err, result) => {
            try {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            } catch {
                console.log(`name: ${data.roomId} does not exist`)
            }
        });
    });

    return result;
}

//delele a room using roomid
async function deleteRoom(roomId) {
    const query = `delete from chatting_rooms where room_id = $1`
    const values = [roomId]

    const result = await new Promise((resolve, reject) => {
        client.query(query, values, (err, result) => {
            try {
                if (err) {
                    console.log(err)
                    reject(err)
                    return false
                } else {
                    resolve(result)
                }
            } catch {
                console.log(`name: ${data.roomId} does not exist`)
                return false
            }
        })
    })

    return true
}


//delele a room using roomid
async function saveUserToDb(data) {
    const query = `insert into chatting_users (user_id, user_name, user_email, user_avatar, user_gender, is_free, is_active, own_rooms, other_rooms) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
    const values = [data.userId, data.userName, data.userEmail, data.userAvatar, data.userGender, data.isFree, data.isActive, data.ownRooms, data.otherRooms]

    const result = await new Promise((resolve, reject) => {
        client.query(query, values, (err, result) => {
            try {
                if (err) {
                    console.log(err)
                    reject(err)
                    return false
                } else {
                    resolve(result)
                }
            } catch {
                console.log(`name: ${data.userId} does not exist`)
                return false
            }
        })
    })
    return true
}

//getting room's creator id
async function getRoomCreatorId(data) {
    const query = `select creator_id from chatting_rooms where room_id = $1`;
    const values = [data.roomId];
    var creatorId = "";

    const result = await new Promise((resolve, reject) => {
        client.query(query, values, (err, result) => {
            try {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                    creatorId = result.rows[0].creator_id;
                }
            } catch {
                console.log(`name: ${data.roomId} does not exist`)
            }
        });
    });
    return creatorId;
}

//updation function for updating status of joiner as he left the chat
async function updateJoinerLeftStatus(data) {
    const query = `select * from chatting_rooms where room_id = $1`;
    const values = [data.roomId];
    const result = await new Promise((resolve, reject) => {
        client.query(query, values, (err, result) => {
            try {
                if (err) {
                    console.log(err);
                    reject(err);
                    return false
                } else {
                    resolve(result);
                    if (result.rows[0].joiner_id == data.userId) { //if joiner and the person who left the room is same, this means the joiner as left the room [not creator] in that case, mark the joiner_id of that room as null and is_available as true
                        updateJoinerInChatRoom(null, data.roomId) //update joiner_id as null in that room
                        data["isAvailable"] = true
                        updateRoomIsAvailableStatus(data) //update is_available status to true of that room
                    }
                    return true
                }
            } catch {
                console.log(`name: ${data.roomId} does not exist`)
            }
        });
    });
    return true
}

//update joiner_id in chatting_rooms
async function updateJoinerInChatRoom(userId, roomId) {
    var query = `update chatting_rooms set joiner_id = $1 where room_id = $2`;
    const values = [userId, roomId];

    const result = await new Promise((resolve, reject) => {
        client.query(query, values, (err, result) => {
            try {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            } catch {
                console.log(`name: ${data.roomId} does not exist`)
            }
        });
    });
    return result
}

//make is_available as false or true in chatting_rooms
async function updateRoomIsAvailableStatus(data) {
    const query = `update chatting_rooms set is_available = $1 WHERE room_id = $2`
    const values = [data.isAvailable, data.roomId];
    var statusUpdated = false;

    const result = await new Promise((resolve, reject) => {
        client.query(query, values, (err, result) => {
            try {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                    statusUpdated = true
                }
            } catch {
                console.log(`name: ${data.roomId} does not exist`)
            }
        });
    });

    return statusUpdated;
}

//exporting the functions
module.exports = {
    insertroomIntoDB,
    getActiveRoomStatusForAskedRoomID,
    getActiveRoomNameForAskedRoomID,
    getAllUserActiveRooms,
    getRoomCreatorId,
    deleteRoom,
    saveUserToDb,
    updateJoinerLeftStatus,
    updateRoomIsAvailableStatus,
    updateJoinerInChatRoom
}

