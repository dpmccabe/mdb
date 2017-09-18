require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'haml'
require 'json'
require 'rest_client'
require 'mongoid'
require 'better_errors'
require 'sinatra/reloader' if development?
require_relative ['secrets', settings.environment].join('/')

Mongoid.load!('mongoid.yml')

configure :development do
  use BetterErrors::Middleware
  BetterErrors.application_root = File.expand_path('..', __FILE__)
end

class Movie
  include Mongoid::Document
  field :_id, type: Integer
  field :title, type: String
  field :search_title, type: String
  field :tagline, type: String
  field :overview, type: String
  field :poster_path, type: String
  field :runtime, type: Integer
  field :imdb_id, type: String
  field :release_date, type: Date
  field :genres, type: Array
  field :directors, type: Array
  field :actors, type: Array
end

def tmdb_get(path)
  @tmdb_key ||= TMDB_KEY

  response = RestClient.get("https://api.themoviedb.org/3/#{path}", {
    params: { api_key: @tmdb_key },
    accept: :json
  })
  JSON.parse(response.body)
end

get '/' do
  if @list_id = params[:id]
    begin
      @list = tmdb_get("list/#{@list_id}")
      list_movie_ids = @list['items'].map { |movie| movie['id'].to_i }
      @title = [@list['name'], 'TMDb List Viewer'].join(' - ')
    rescue RestClient::ResourceNotFound => e
      @error = 'Sorry, there was an error trying to access that list. Please confirm the list ID.'
      halt haml(:index, format: :html5, layout: :layout)
    end

    @poster_path_base_url = tmdb_get('configuration')['images']['base_url']

    saved_movie_ids = Movie.all.pluck(:_id)
    movie_ids_to_save = list_movie_ids - saved_movie_ids

    if movie_ids_to_save.any?
      movies_to_save_attributes = movie_ids_to_save.first(10).map do |movie_id|
        puts movie_id
        tmdb_movie = tmdb_get("movie/#{movie_id}")
        credits = tmdb_get("movie/#{movie_id}/credits")
        actors = credits['cast']
        directors = credits['crew'].select { |p| p['department'] == 'Directing' }

        { _id: tmdb_movie['id'],
          title: tmdb_movie['title'].gsub(/\A(The|A|An) (.*)\z/, '\2, \1'),
          search_title: tmdb_movie['title'].downcase,
          tagline: tmdb_movie['tagline'],
          overview: tmdb_movie['overview'],
          poster_path: tmdb_movie['poster_path'],
          runtime: tmdb_movie['runtime'],
          imdb_id: tmdb_movie['imdb_id'],
          release_date: tmdb_movie['release_date'],
          genres: tmdb_movie['genres'].map { |g| g['name'] },
          directors: directors.map{ |p| p['name'] },
          actors: actors.map{ |p| p['name'] }
        }
      end

      Movie.create!(movies_to_save_attributes)
    end

    @movies = Movie.where(:_id.in => list_movie_ids).limit(1000).sort(title: 1)

    @genres = @movies.map{ |movie| movie.genres }.flatten.uniq.sort
    @excluded_genres = ['Disaster', 'Sports Film', 'Film Noir', 'Indie', 'Suspense']
    @genres -= @excluded_genres

    haml :list, format: :html5, layout: :layout
  else
    @title = 'TMDb List Viewer'
    haml :index, format: :html5, layout: :layout
  end
end

error do
  @error = env['sinatra.error'].message
  halt haml(:index, format: :html5, layout: :layout)
end
