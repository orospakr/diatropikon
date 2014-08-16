class Songs
  @_titles: 0    # Although it's directly accessible, the leading _ defines it by convention as private property.

  @get_count: ->
    # console.log "GET COUNT THIS IS " + this
    @_titles

  constructor: (@artist, @title) ->
    Songs._titles++

    
class Poop extends Songs
    @poop_method: ->
        console.log @get_count()

console.log Songs.get_count()
# => 0


song = new Songs("Rick Astley", "Never Gonna Give You Up")
console.log Songs.get_count()
# => 1

console.log Poop.get_count()

mypoop = Poop("fsadfasdf")
console.log Songs.get_count()
# => 2

# song.get_count()
# => TypeError: Object <Songs> has no method 'get_count'
