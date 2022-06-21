

const socket = io("ws://localhost:8080", {
   auth: {
     token: checkAuth()
   }
});
socket.on("connect_error", (err) => {
  console.log(err);
  socket.close();
});
$.fn.dataTable.ext.errMode = 'none';
$('#sheetIdButton').click(() => {
  const sheetid = document.getElementById('sheetid').value;
  const range = document.getElementById('range').value;


  submitSheetData(sheetid, range);
});
$('#backButton').click(function() {
    location.href = '/';
});
$('.info').keypress((e) => {
    if (e.which === 13) {
      const sheetid = document.getElementById('sheetid').value;
      const range = document.getElementById('range').value;
       submitSheetData(sheetid, range);
   }
});

function submitSheetData(sheetId, range) {
    const req = {sheetId: sheetId, range: range};
    socket.emit('sheetId', req, (c) => {
      console.log(JSON.stringify(c.data.values));


      if ( $.fn.dataTable.isDataTable( '#sheetdata' ) ) {
        table = $('#sheetdata').DataTable();
        table.destroy();
        $('#sheetdata').empty();
      }

      $('#sheetdata').DataTable({
        data: c.data.values,

        paging: false,
        columns: getColumns(c.data.values),
        destroy: true
      });
    });
}

function getColumns(data) {
  const length = data[0].length;
  let res = [];
  for(i=0;i<length; i++){
    res.push({ 'title': `${i}`});
  }
  console.log(res);
  return res;
}
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
