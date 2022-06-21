const jwt = require('jsonwebtoken');
var keygen = require("keygenerator");
const fs = require('fs');
const StormDB = require("stormdb");
const dbfile = __dirname + '/token.stormdb';
const engine = new StormDB.localFileEngine(dbfile, {
  async: true
});
const {secret} = JSON.parse(fs.readFileSync('secret.json', 'utf-8'));
const db = new StormDB(engine);

db.default({ list: [] });

//allows api access over socket network
//generate a token to send over sockets which can be exchanged for an access token
//token and access token are stored in a json database
//token is signed in a jwt token before sending, verifying it came from this server
async function generateToken(access_token) {
  let duplicate = checkDuplicate(access_token);
  if(duplicate.access_token == access_token){
    const token = await jwt.sign(duplicate.sister_token, secret);
    return token;
  }else {

    let sister_token = keygen.session_id();
    let data = (sister, access) => `{ "sister_token": "${sister}", "access_token": "${access_token}"}`;
    let jsondata = JSON.parse(data(sister_token, access_token));

    db.get('list').push(jsondata);
    db.save();
    const token = await jwt.sign(sister_token, secret);
    return token;
}
}


function checkDuplicate(access_token){

  let res = {access_token: null, sister_token: null};
  const list = db.get('list').value()
  list.filter(i => {
    if(i.access_token == access_token) {
      if(readToken(i.sister_token) == access_token){

        res.access_token = i.access_token;
        res.sister_token = i.sister_token;
      }
    }
  });
  return res;
}
//read jwt token inbound from cookie over socket
function read(key, callback) {

  jwt.verify(key, secret, (err, token) => {
    const list = db.get('list').value()
    let res = null;
    list.filter(i => {
      if(i.sister_token == token) {
        res =  i.access_token;
      }else{
        res =  null;
      }
    });

    callback(res);
  });

}
//reads raw token instead of translating jwt
function readToken(token) {
  let res = null;
  const list = db.get('list').value()
  list.filter(i => {
    if(i.sister_token == token) {
      res = i.access_token
    }
  });
  return res;
}
//remove token after user disconnects
function remove(key) {

  if(key){

    const token = jwt.verify(key, secret, (err, token) => {

      db.get('list').filter(i => i.sister_token != token);
      db.save();
    });
  }

}

module.exports = {read, remove, generateToken}
