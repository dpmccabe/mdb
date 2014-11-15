$(document).ready(function() {
  var match_cell_widths = function() {
    var td_widths = $('table#mdb-table tbody tr:first td').map(function() {
      return $(this).css('width')
    }).get()

    $('table#mdb-table thead th:not(.list-info)').each(function(i, th) {
      $(th).css('width', td_widths[i])
    })
  }

  var match_thead_height = function() {
    thead_height = $('table#mdb-table thead').height()
    $('table#mdb-table').css('margin-top', thead_height  + 'px').css('margin-bottom', -thead_height  + 'px')
  }

  match_cell_widths()
  match_thead_height()

  $(window).resize(function() {
    match_cell_widths()
    match_thead_height()
  })

  $.each(['title', 'director', 'genre'], function(i, field) {
    $('#search_' + field).on('keyup change', function() {
      var search_text = $(this).val().toLowerCase()
      var tr_to_hide = $('table#mdb-table tbody tr').map(function(i, tr) {
        if ($(tr).data(field).indexOf(search_text) >= 0)
          return(null)
        else
          return('#' + $(tr).attr('id'))
      }).get().join(', ')
      $('table#mdb-table tbody tr').show()
      $(tr_to_hide).hide()
      match_cell_widths()
      match_thead_height()
    })

    $('a#clear_' + field).click(function(e) {
      $('#search_' + field).val('')
      $('table#mdb-table tbody tr').show()
      match_cell_widths()
      match_thead_height()
      e.preventDefault()
    })
  })

  $('table#mdb-table tbody tr').click(function() {
    $(this).toggleClass('expanded')
  })
})
