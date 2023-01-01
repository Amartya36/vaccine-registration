const express=require("express")
const mongoose=require("mongoose")
const rout=require("./router/route")
let app=express()
app.use(express.json())
mongoose.connect('mongodb+srv://amartya36:9WTUtifh9qoYUBZc@amartyaproject.gciwubl.mongodb.net/vection-registation', {
    useNewUrlParser: true
}, mongoose.set('strictQuery', false))
    .then(() => console.log("mongoose is connected"))
    .catch(err => console.log(err))
    app.use('/',rout)
    app.listen(3000,function () {
        console.log('the port is running on 3000')
    })