(function() {
  const serverUrl = 'http://127.0.0.1:3000';

  const fetchCommand = () => {
    $.ajax({
      type: 'GET',
      url: serverUrl,
      success: (command) => {
        SwimTeam.move(command);
      },
      complete: () => {
        // Compared with put setTimeout outside the AJAX request, this setTimeout will only issue another AJAX request 500ms after the current one completes. One has to complete before the next one gets kicked off.
        setTimeout(fetchCommand, 2000);
      },
    })
  };

  fetchCommand();

  /////////////////////////////////////////////////////////////////////
  // The ajax file uploader is provided for your convenience!
  // Note: remember to fix the URL below.
  /////////////////////////////////////////////////////////////////////

  const ajaxFileUpload = (file) => {
    var formData = new FormData();
    formData.append('file', file);
    $.ajax({
      type: 'POST',
      data: formData,
      url: 'FILL_ME_IN',
      cache: false,
      contentType: false,
      processData: false,
      success: () => {
        // reload the page
        window.location = window.location.href;
      }
    });
  };

  $('form').on('submit', function(e) {
    e.preventDefault();

    var form = $('form .file')[0];
    if (form.files.length === 0) {
      console.log('No file selected!');
      return;
    }

    var file = form.files[0];
    if (file.type !== 'image/jpeg') {
      console.log('Not a jpg file!');
      return;
    }

    ajaxFileUpload(file);
  });
})();
