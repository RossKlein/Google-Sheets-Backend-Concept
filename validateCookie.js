const {google} = require('googleapis');
const ticketSystem = require('./ticketSystem.js');
const googleauth = require('./googleauth.js');
const fs = require('fs');
const oauth2 = google.oauth2('v2');
const credentials = JSON.parse(fs.readFileSync('google_pickle.json', 'utf-8'));

//middleware
//system to validate session tokens to allow silent sign in
//system also generates sister token for socket network
function validateCookie(req, res, next) {

  const {cookies} = req;
  if('session_token' in cookies){
    const session_token = cookies.session_token;
    validate(session_token).then((data)=> {

      if(credentials.web.client_id == data.audience){


        next();
      }else{
        throw 'Credentials are not valid for this application';
      }

    }).catch((e) => {
      console.log(e);
      console.log('Credentials rejected');
      res.redirect(googleauth.getAuthUrl());
    });
  } else {
    res.redirect(googleauth.getAuthUrl());
  }


}

function silentValidation(req, res, next) {
  const {cookies} = req;
  if('session_token' in cookies){

    const session_token = cookies.session_token;
  validate(session_token).then((data)=> {
    if(credentials.web.client_id == data.audience){

      next();
    }else{
      res.redirect('/');
    }

  }, (err) => {
    res.redirect('/');
  });
}else{
  res.redirect('/');
}
}
function tokenValidation(validateObject) {
  if(credentials.web.client_id == validateObject.audience){
    return true;
  }else{
    return false;
  }

}

function addSister(req, res, next) {

  const {cookies} = req;

  ticketSystem.generateToken(cookies.session_token).then((sister_token) => {

    res.cookie('stid', sister_token, {httpOnly: false, sameSite: 'Lax'});
    next();
  }).catch((r) => {
    console.log(r);
    next();
  });

}

async function validate(access_token) {

  const res = await oauth2.tokeninfo({
    access_token: access_token,
    auth: access_token
  });
  return res.data;

}
module.exports = {validateCookie, tokenValidation, silentValidation, addSister, validate}
