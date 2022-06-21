server.get('/pokemon', vCookie.silentValidation, vCookie.addSister, (req, res) => {
  res.sendFile(__dirname + '/frontend/main.html');


});
