const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
var morgan = require('morgan');

var AccessToken = require('./AccessToken');
var Privileges = require('./AccessToken').privileges;

const PORT = 8080;
const appID = "61ee4a31d8ff1400c1e7d74a";
const appKey = "7c417943247a4108aa1d9ddc5db2cc88";


const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json({limit: '1mb'}));  //body-parser 解析json格式数据
app.use(bodyParser.urlencoded({            //此项必须在 bodyParser.json 下面,为参数编码
  extended: true
}));
app.use(cors());

const nocache = (req, resp, next) => {
    resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    resp.header('Expires', '-1');
    resp.header('Pragma', 'no-cache');
    next();
};

const generateAccessToken =(req, resp) => {
    resp.header('Access-Control-Allow-Origin', '*');
    const roomID = req.body.roomID;
    console.log("roomID: "+ roomID);
  
    if (!roomID) {
        return resp.status(500).json({ 'error': 'roomID is required' });
    }

    const userID = req.body.userID;
    console.log("userID: "+ userID);
    if (!userID) {
        return resp.status(500).json({ 'error': 'uid is required' });
    }
    var key = new AccessToken.AccessToken(appID, appKey, roomID, userID);
    key.addPrivilege(Privileges.PrivSubscribeStream, 3600);
    key.addPrivilege(Privileges.PrivPublishStream, Math.floor(new Date() / 1000) + (24 * 3600));
    key.expireTime(Math.floor(new Date() / 1000) + (24 * 3600));

    const token = key.serialize();

    console.log(token);

    return resp.json({ 'token': token });
}

const getGenerateAccessToken = (req, resp) => { 
    generateAccessToken(req,resp);
};

const postGenerateAccessToken = (req, resp) => { 
    generateAccessToken(req,resp);
    console.log("something here");
    
};

app.get('/access_token', nocache, getGenerateAccessToken);
app.post('/access_token', nocache, postGenerateAccessToken);

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

