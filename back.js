const express = require('express');
const cookieParser = require('cookie-parser');
const url = require('url');
const googleauth = require('./googleauth.js');
const gsheet = require('./googlesheets.js');
const vCookie = require('./validateCookie.js');
const ticketSystem = require('./ticketSystem.js');
server = express();
const httpapp = require('http').createServer(server);
const io = require('socket.io')(httpapp);
const port = process.env.port || 8080;
server.use(express.json());
server.use(cookieParser());
httpapp.listen(port, () => {
  console.log("listening")
});


io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  ticketSystem.read(token, (callback) => {
    socket.handshake.auth.access_token = callback;
  });

  vCookie.validate(socket.handshake.auth.access_token).then((data) => {
    if(vCookie.tokenValidation(data)){
        next();

    }else{
      console.log('socket rejected');

    }
  }, (e) => {
    console.log('no access');

  });



});
io.sockets.on('connection', (client) => {
  access_token = client.handshake.auth.access_token;
  console.log('access_token: ')
  console.log(access_token);
  console.log("connection");


  client.on('sheetId', (req, c) => {
    gsheet.validateSheet(req, access_token).then((res) => {
      c(res);
    });
  });
  client.on('disconnect', (reason) => {
    console.log('disconnection');
    const token = client.handshake.auth.token;
    ticketSystem.remove(token);
  });
});



server.get('/', (req, res) => {
  console.log('/');

  res.sendFile(__dirname + '/frontend/index.html');

});
server.get('/index.js', (req, res) => {

  res.sendFile(__dirname + '/frontend/index.js');
});
server.get('/pokemon', (req, res) => {
  res.sendFile(__dirname + '/frontend/pokemon.html');
});
server.get('/pokemon.png', (req, res) => {
  res.sendFile(__dirname + '/resources/pokemon.png');
});

server.get('/main', vCookie.silentValidation, vCookie.addSister, (req, res) => {
  res.sendFile(__dirname + '/frontend/main.html');
  console.log('main');


});
server.get('/main.js', (req, res) => {

  res.sendFile(__dirname + '/frontend/main.js');
});

server.get('/login', vCookie.validateCookie, vCookie.addSister, (req, res) => {
  console.log('login');
  res.redirect('/main');
});
server.get('/gateway', (req, res) => {
  const code = new url.URL(req.url, 'http://localhost:8080').searchParams.get('code');

  googleauth.getToken(code).then((token) => {

  //  console.log("googleauth token: " + token);
    res.cookie('session_token', token, {httpOnly: true, sameSite: 'Lax'});
    // ticketSystem.generateToken(token).then((sister_token) => {
    //   res.cookie('stid', sister_token, {httpOnly: false, sameSite: 'Lax'});
    res.redirect('/main');
  });

});

//https://myaccount.google.com/permissions?pli=1
