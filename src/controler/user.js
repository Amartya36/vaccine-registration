
const userModel = require('../model/usermodel')
const datetime = require("../model/datetimemodel")
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")

function isValiddate(value) {
    return (typeof value === "string" && value.trim().length > 0 && value.match(/^(2021)\-(07)\-(0[1-9]|1\d|2\d|3[00])$/));
}
const isValidPassword = function (pw) {
    let pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{8,15}$/;
    if (pass.test(pw)) return true;
};

function isValideMobile(value) {
    return (typeof value === "string" && value.trim().length > 0 && value.match(/^[0-9]{10}$/))
}
const isValidpin = function (value) {
    let pin = /^[0-9]{6}$/;
    if (pin.test(value)) return true;
};

exports.creatuser = async function (req, res) {
    try {
        const data = req.body
        const { Name, PhoneNumber, Age, Pincode, AadharNO, password, } = data

        if (!Name) return res.status(400).send({ status: false, msg: "please provide Name" })
        if (!PhoneNumber) return res.status(400).send({ status: false, msg: "please provide PhoneNumber" })
        if (!Age) return res.status(400).send({ status: false, msg: "please provide Age" })
        if (!Pincode) return res.status(400).send({ status: false, msg: "please provide Pincode" })
        if (!AadharNO) return res.status(400).send({ status: false, msg: "please provide AadharNO" })
        if (!password) return res.status(400).send({ status: false, msg: "please provide password" })
        if (!data.date) return res.status(400).send({ status: false, msg: "please provide password" })

        if (!isValiddate(data.date)) return res.status(400).send({ status: false, msg: "pleas write the date in (yyyy-mm-dd)like(2021-mm-dd) and the vectionation camp is runing on 1st june 21 to 30 jun 21 so please enter a valid date " })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, msg: "password is not valid" })
        if (!isValidpin(Pincode)) return res.status(400).send({ status: false, msg: "Pincode is not valid" })
        if (!isValideMobile(PhoneNumber)) return res.status(400).send({ status: false, msg: "PhoneNumber is not valid" })
        const finddate = await userModel.find({ date: data.date })
        if (finddate.length < 140) return res.status(400).send({ status: false, msg: `in ${data.date} slot is full` })

        const slottime = await datetime.findOne({ date: data.date })
        let xyz = []
        let abc = 0
        const arr2 = ["10.00am-10.30am", "10.30am-11.00am", "11.00am-11.30am", "11.30am-12.00pm", "12.00pm-12.30pm", "12.30pm-01.00pm", "01.00pm-01.30pm", "01.30pm-02.00pm", "02.00pm-2.30pm", "2.30pm-03.00pm", "03.00pm-03.30pm", "03.30pm-04.00pm", "04.00pm-04.30pm", "04.30pm-05.0pm"]
        if (slottime) {
            let times = slottime.time
            for (let i = 0; index < times.length; index++) {
                if (times[i] < 10) { xyz.push(i) }
                else {
                    times.push(0)
                    xyz.push(times.length - 1)
                }
            }
            let abc = xyz[0]
            data.time = arr2[abc]
        } else { data.time = arr2[abc] }


        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt)
        data.password = secPass
        data.isadmine = false

        const userdata = await userModel.findOne({ AadharNo: AadharNO })
        if (userdata) {
            let date = +new Date(userdata.date)
            const now = +new Date()
            let abc = (now > date)

            if (abc !== false) return res.status(400).send({ status: false, msg: "you are alredy registered for 1st dose after completing the first dose you can apply for the 2nd one " })
            data.dose = "2nd dose"
            data.vaccination_status = "First dose completed"

            let alltimes = slottime.time
            let aaa = alltimes[abc] + 1
            alltimes.splice(abc, 1, aaa);

            const update = await userModel.findByIdAndUpdate({ AadharNO: AadharNO }, { $set: data }, { new: true })

            await datetime.findOneAndUpdate({ date: data.date }, { time: alltimes }, { upsert: true }, { new: true })
            let obj1 = {
                date: update.date,
                time: update.time,
                dose: update.dose
            }

            return res.status(201).send({ status: true, msg: `sucessfull registation for ${data.dose}`, data: obj1 })


        }


        data.dose = "1st dose"
        const createdata = await userModel.create(data)
        let obj2 = {
            date: createdata.date,
            time: createdata.time,
            dose: createdata.dose
        }

        let alltimes = slottime.time
        let aaa = alltimes[abc] + 1
        alltimes.splice(abc, 1, aaa);

        await datetime.findOneAndUpdate({ date: data.date }, { time: alltimes }, { upsert: true }, { new: true })

        return res.status(201).send({ status: true, msg: `sucessfull registation for ${data.dose}`, data: obj2 })


    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }

}
exports.login = async function (req, res) {
    try {
        let data = req.body;
        if (Object.keys(data).length == 0) { return res.status(400).send({ status: false, msg: "Please enter data" }) }
        let { PhoneNumber, password } = data

        if (!PhoneNumber) return res.status(400).send({ status: false, msg: "PhoneNumber is mendatory" })
        if (!password) return res.status(400).send({ status: false, msg: "password is mendatory" })

        let userPhoneNumber = await userModel.findOne({ PhoneNumber: PhoneNumber })
        if (!userPhoneNumber) return res.status(404).send({ status: false, msg: "email not found" })

        let userPassword = await bcrypt.compare(password, userPhoneNumber.password);
        if (!userPassword) return res.status(404).send({ status: false, msg: "password not found" })

        let token = jwt.sign({ userId: userPhoneNumber._id }, "Vaccion-Registation")
        let obj = {
            userId: userPhoneNumber._id,
            token: token
        }
        return res.status(201).send({ status: true, message: "User login successfull", data: obj })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

exports.getuser = async (req, res) => {
    try {
        const filter = req.query
        const data = Object.keys(req.query)
        if (data.length == 0) return res.status(400).send({ status: false, msg: "please enter any query" })
        const arr = ["Age", "Pincode", "Vaccination_status"]
        data.map((a) => {
            if (!arr.includes(a)) return res.status(400).send({ status: false, msg: `please use[Age, Pincode ,Vaccination_status] key for filteration ${a}is not avalid key ` })
        })
        const userdata = await userModel.find(filter)
        if (userdata.length == 0) return res.status(200).send({ status: true, msg: "nodata found with this query" })
        return res.status(200).send({ status: true, data: userdata })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


exports.updateuser = async (req, res) => {
    try {
        let userid = req.params.userId
        const change = req.body
        const data = Object.keys(req.body)
        if (data.length == 0) return res.status(400).send({ status: false, msg: "please enter time" })
        const arr = ["time"]
        data.map((a) => {
            if (!arr.includes(a)) return res.status(400).send({ status: false, msg: `please use[time] key for filteration ${a}is not avalid key ` })
        })
        const arr2 = ["10.00am-10.30am", "10.30am-11.00am", "11.00am-11.30am", "11.30am-12.00pm", "12.00pm-12.30pm", "12.30pm-01.00pm", "01.00pm-01.30pm", "01.30pm-02.00pm", "02.00pm-2.30pm", "2.30pm-03.00pm", "03.00pm-03.30pm", "03.30pm-04.00pm", "04.00pm-04.30pm", "04.30pm-05.0pm"]

        if (!arr2.includes(data.time)) return res.status(400).send({ status: false, msg: `please enter valid time like ${arr2} ` })



        const userdata = await userModel.findOneAndUpdate({ _id: userid }, { $set: change }, { new: true })
        if (userdata.length == 0) return res.status(200).send({ status: true, msg: "nodata found with this query" })
        return res.status(200).send({ status: true, data: userdata })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}






