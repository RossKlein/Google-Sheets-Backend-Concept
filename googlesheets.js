const { google } = require('googleapis');
const gauth = require('./googleauth.js');

async function validateSheet(sheetData, auth){

  console.log('sheetid:  ' + sheetData)

  return new Promise((resolve, reject) => {

    const oAuth2 = gauth.getClient();

    oAuth2.credentials = auth;
    headers: {Authorization: `Bearer ${auth}`}
    const sheets = google.sheets({version: 'v4', oAuth2});

    sheets.spreadsheets.values.get({

      spreadsheetId: sheetData.sheetId,
      range: sheetData.range,


    }, (err, res) => {

      console.log(res);

      resolve(res);
      console.log(err);
    });


  });
}

module.exports = {validateSheet}
