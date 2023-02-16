const express = require('express') //express
const router = express.Router() //creating router
const postgresQueries = require('../app/postgresQueries') //importing postgres queries

//getting all active room for a userId
router.get('/getUserActiveRooms', async (req, res) => {
    try {
        const result = await postgresQueries.getAllActiveRoomsForAskedUserId(req.body.userId)
        console.log(result.rows)
        res.status(200).json({
            activeRooms: result.rows
        })
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
})

//exporting router
module.exports = router