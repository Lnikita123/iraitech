const express = require('express')
const multer = require('multer')
const route = require('./routes/route')
const { config } = require('dotenv')
const mongoose = require('mongoose')

const app = express()

config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(multer().any())
app.use('/', route)

mongoose.connect("mongodb+srv://NikitaLilhore:adi123@cluster0.mxdiktq.mongodb.net/ireatech?retryWrites=true&w=majority", { useNewUrlParser: true })
    .then(() => console.log('MongoDB is connected!!'))
    .catch(err => console.log(err))


app.listen(process.env.PORT || 3000, function () {
    console.log('Sever Connected at : ' + (process.env.PORT || 3000))
});