const express = require('express');
const mongoose = require('mongoose');
const Registeruser = require('./model');
const middleware = require('./middleware');
const jwt =require('jsonwebtoken');
const cors = require('cors');
const app = express();


mongoose.connect("mongodb+srv://username:userpassword@cluster0.fxjem.mongodb.net/?retryWrites=true&w=majority").then(
    ()=> console.log('DB connected....')
)


app.use(express.json());
app.use(cors({origin:"*"}))
app.post('/register',async (req, res)=>{
    try{
       const {username,email,password,confirmpassword} = req.body;
        let exist = await Registeruser.findOne({email})
        if(exist){
            return res.status(400).send('User Already Exist');
        }
        if(password !== confirmpassword){
            return res.status(400).send('Passwords are not matching');
        }
        let newUser = new Registeruser({
            username,
            email,
            password,
            confirmpassword
        });
        await newUser.save();
        res.status(200).send('Register Successfully!')
    }
    catch(err){
        console.log(err)
        return res.status(500).send('Internal server Error')
    }
})
app.get('/all',async (req, res)=>{
    try{
    let full = await Registeruser.find()
    console.log(full)
    res.status(200).send('ok')
    }
    catch(err){
        console.log(err)
        return res.status(500).send('Internal server Error')
    }
})

app.post('/login',async (req, res)=>{
    try{
        const {email,password}=req.body;
        let exist = await Registeruser.findOne({email});
        if(!exist){
            return res.status(400).send('User Not Found');
        }
        if(exist.password !== password){
            return res.status(400).send('Invalid credentials');
        }
        let payload = {
            user: {
                id : exist.id}}
        jwt.sign(payload,'jwtSecret',{expiresIn:3600000},
        (err,token)=>{
            if (err) throw err;
            return res.json({token})})
    }
    catch(err){
        console.log(err);
        return res.status(500).send('server err');
    }
})

app.get('/myprofile',middleware,async(req, res)=>{
    try{
        let exist = await Registeruser.findById(req.user.id);
        if(!exist){
            return res.status(400).send('user not found');
        }
        res.json(exist);
    }
    catch(err){
        console.log(err);
        return res.status(500).send('Invalid tokens')
    }
})
app.listen(5000,()=>{
    console.log('server running....')
})