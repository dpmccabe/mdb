require './app.rb'

path = '/Volumes/Movies (backup)/Movies'

Dir['/Volumes/Movies (backup)/Movies/*'].each do |file|
  name = File.basename(file)#.gsub(/\.\w{3}/, '')
  # next if name.match(/\(\d{4}\)/)
  next if name.match(/\.\w{3}$/)

  new_name = "#{name}.mkv"
  new_file = [path, new_name].join('/')
  p [file, new_file]
  File.rename(file, new_file)

  # movie = Movie.where(search_title: name.downcase).first
  # movie ||= Movie.where(search_title: name.downcase.gsub(/-/, ':')).first
  # movie ||= Movie.where(search_title: name.downcase.gsub(/:/, '/')).first
  # movie ||= Movie.where(search_title: name.downcase.gsub(/(\w)-\s/, '\1: ')).first

  # if movie
  #   new_name = "#{name} (#{movie.release_date.strftime('%Y')})"
  #   new_file = [path, new_name].join('/')
  #   File.rename(file, new_file)
  # else
  #   p name
  # end
end
