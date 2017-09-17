function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

adjust_spacing = function() {
  line_width = document.body.clientWidth - 600
  per_line = 0
  needed_width = 0

  do {
    per_line++
    needed_width = 10 + per_line * 164
  } while (needed_width < line_width)

  per_line--
  space_left = line_width - (per_line * 154)
  margin = space_left / (per_line + 1) - 0.1

  // console.log([line_width, per_line, space_left, margin])

  $('ul#movies li').css('margin-right', margin + 'px')
  $('ul#movies li').css('margin-bottom', margin + 'px')

  // new_width = 

  $('ul#movies').css('margin-top', margin + 'px')
  $('ul#movies').css('margin-left', margin + 'px')
}

$(window).resize(function() {
  adjust_spacing()
})

// List
$('ul#movies li').click(function() {
  $(this).toggleClass('selected')

  if ($(this).data('selected') == 'yes') {
    $(this).data('selected', 'no')
  }
  else {
    $(this).data('selected', 'yes')
  }

  filter_movies()
})

$('ul#movies li').hover(function() {
  el = $(this)

  $.each(['title', 'year', 'overview', 'director', 'actor', 'genre', 'runtime'], function(i, field) {
    $('#' + field).html(el.data(field))
  })
  $('#details').removeClass('hidden')
}, function() {
  $('#details').addClass('hidden')
})

// Search
fields = ['title', 'year', 'overview', 'director', 'actor', 'genre', 'runtime', 'selected']

$('form').submit(function() {
  return(false)
})

filter_movies = function() {
  $('li.movie').addClass('shown')

  $.each(fields, function(i, field) {
    search_text = $('#search_' + field).val()

    if (search_text.length > 0) {
      $.each($('li.movie.shown'), function(j, movie) {
        if (field == "runtime") {
          if (parseInt($(movie).data(field)) > parseInt(search_text))
            $(movie).removeClass('shown')
        } else {
          var search_regex = new RegExp("\\b" + escapeRegExp(search_text), 'i')
          if (!$(movie).data(field).toString().match(search_regex))
            $(movie).removeClass('shown')
        }
      })
    }

    $('li.movie:not(.shown)').hide()
    $('li.movie.shown').show()
  })
}

$.each(fields, function(i, field) {
  $('#search_' + field).on('keyup change', function() {
    filter_movies()
  })

  $('a#clear_' + field).click(function(e) {
    e.preventDefault()
    $('#search_' + field).val('').trigger('change')
  })
})

$('a.selected-filter').click(function(e) {
  e.preventDefault()

  $('input#search_selected').val($(this).data('selected')).trigger('change')

  $('a.selected-filter').removeClass('active')
  $(this).addClass('active')

  if ($(this).data('selected') == 'yes') {
    $('ul#movies').addClass('ignore-selected')
  } else {
    $('ul#movies').removeClass('ignore-selected')
  }
})

// Ready
$(document).ready(function() {
  adjust_spacing()
})
