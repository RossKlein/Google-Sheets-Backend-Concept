const { google } = require('googleapis');
const fs = require('fs');
const credentials = JSON.parse(fs.readFileSync('google_pickle.json', 'utf-8'));



const scopes = [
  'https://www.googleapis.com/auth/spreadsheets',
  'profile',
  'email'
];
const oAuth2Client = new google.auth.OAuth2(credentials.web.client_id, credentials.web.client_secret, credentials.web.redirect_uris[0]);
google.options({auth: oAuth2Client});

function getClient() {
  const oAuth2 = new google.auth.OAuth2(credentials.web.client_id, credentials.web.client_secret, credentials.web.redirect_uris[0]);
  return oAuth2;
}
function exchangeRefreshToken(refresh_token) {
  return new Promise((resolve, reject) => {

    const oAuth2 = getClient();
    oAuth2.credentials.refresh_token = refresh_token;
    oAuth2.refreshAccessToken( (err, tokens) => {
      reject(err);
      resolve(tokens);
    });
  });

}
function getAuthUrl(){
  const url = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    return url;
}

async function getToken(code) {
  const res = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(res.tokens);
  console.log('googleauth creds');
  console.log(oAuth2Client.credentials);
  return res.tokens.access_token;
}





module.exports = {getAuthUrl, exchangeRefreshToken, getClient, getToken};
