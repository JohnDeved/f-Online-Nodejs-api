$('.clickable .btn').click(function () {
  window.location = $(this).parent().find('code').text()
})
