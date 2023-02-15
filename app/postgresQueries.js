const { Client } = require('pg')

// const client = new Client({
//     user: process.env.LOCAL_POSTGRES_USERNAME,
//     host: process.env.LOCAL_POSTGRES_HOSTNAME,
//     database: process.env.LOCAL_POSTGRES_DATABASE',
//     password: process.env.LOCAL_POSTGRES_PASSWORD,
//     port: process.env.LOCAL_POSTGRES_PORT,
// })

//credentials postgres server
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
async function insertRoomIntoDBMappedToUserID(data) {
    const query = `insert into chatroom_rooms(user_id, room_id, room_name, is_active) values ($1, $2, $3, $4)`
    const values = [data.userId, data.roomId, data.roomName, true]
    await client.query(query, values, (err, result) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log('success posting data')
        }
    })
}

//fetching active status from db respective to room id
async function getActiveRoomStatusForAskedRoomID(data) {
    const query = `select is_active from chatroom_rooms where room_id = $1`;
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
    const query = `select room_name from chatroom_rooms where room_id = $1`;
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

//exporting the functions
module.exports = {
    insertRoomIntoDBMappedToUserID,
    getActiveRoomStatusForAskedRoomID,
    getActiveRoomNameForAskedRoomID
}

