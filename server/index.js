const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/dev');
const { auth } = require('./middleware/auth');

const { User } = require("./models/User");


app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');

mongoose.connect(config.mongoURL,
    {
        // useNewUrlParser : true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
    }).then(() => console.log('db connected'))
    .catch(err => console.log(err));



app.get('/', (req, res) => res.send('hello wass!!'))


app.post('/api/users/register', (req, res) => {

    const user = new User(req.body);
    user.save((err, user) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/api/users/login', (req, res) => {

    //요청된 이메일을 데이터베이스에서 있는지 찾는다.

    User.findOne({ email: req.body.email }, (err, user) => {

        console.log('user', user)
        if (!user) {
            return req.json({
                loginSucess: false,
                message: "제공된 이메일에 해당된 유저가 없습니다."
            })
        }


        //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 일치하는지 확인.
        user.comparePassword(req.body.password, (err, isMatch) => {

            // console.log('err',err)
            // console.log('isMatch',isMatch)

            if (!isMatch)
                return res.json({ loginSucess: false, message: "비밀번호가 틀렸습니다" })

            //비밀번호 까지 맞다면 토큰 생성하기.
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);

                // 토큰을 저장한다.( 쿠키, 로컬스토리지 )
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSucess: true, userId: user._id })
            })
        })
    })
})

app.get('/api/users/auth', auth, (req,res) =>{

    //여기 까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True 라는 말.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0? false :true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req,res) => {
    User.findOneAndUpdate({_id:req.user._id},
        {token: ""}
        , (err, user) =>{
            if(err) return res.json({success: false, err});
            return res.status(200).send({
                success: true
            })
        }) 
})







app.listen(port, () => console.log(`listening on port ${port}!`))