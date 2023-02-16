const express = require('express') //express
const router = express.Router() //creating router
const postgresQueries = require('../app/postgresQueries') //importing postgres queries

//getting all active room for a userId
router.post('/getAllUserActiveRooms', async (req, res) => {
    try {
        console.log(req.body)
        const result = await postgresQueries.getAllUserActiveRooms(req.body.userId)
        console.log(result.rows)
        res.status(200).json({
            active_rooms: result.rows
        })
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
})

//exporting router
module.exports = router