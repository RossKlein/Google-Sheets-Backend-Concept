const socket = io("ws://localhost:8080", {
   auth: {
     token: checkAuth()
   }
});
socket.on("connect_error", (err) => {
  console.log(err);
  socket.close();
});


$('#signinButton').click(function() {
    location.href = '/login';
});
$('#pokemonButton').click(function() {
    location.href = '/pokemon';
});


function checkAuth() {
  console.log('checked');
  var socketToken = getCookie('stid');
  return socketToken;
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
