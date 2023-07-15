const express = require('express'); //express
const app = express(); //created app using express
const morgan = require('morgan') //morgan for logging
const path = require('path') //path to resolve path refs
const dbRoutes = require('../model/databaseRoutes') //api for db routes
const notificationRoutes = require('../model/notificationRoutes')
var bodyParser = require('body-parser') //body parser
require('dotenv').config() //config env

app.use(morgan('dev')) //morgan for dev
app.use(bodyParser.urlencoded({ extended: false })) //parse urlencoded bodies, simple bodies will be parsed because of false
app.use(bodyParser.json()) //parse json data

//landing page
app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve('public/landingpage.html'))
})

//seding requests of db endpoint to databaseRoutes
app.use('/db', dbRoutes)

app.use('/notification', notificationRoutes)

//if request doesn't hit anyone of the above, it will log this error, and if the error is something different, it will forward the request to next which then will handle other errors
app.use((req, res) => {
    res.status(404).sendFile(path.resolve('public/404.html'))
})

//exporting app
module.exports = app