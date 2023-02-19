const express = require('express') //express
const router = express.Router() //creating router
const postgresQueries = require('../app/postgresQueries') //importing postgres queries

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
        res.status(500).json({
            error: err
        })
    }
})

//exporting router
module.exports = router