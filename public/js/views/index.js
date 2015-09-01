
/** autolink */
(function(){var h=[].slice;String.prototype.autoLink=function(){var b,f,d,a,e,g;a=1<=arguments.length?h.call(arguments,0):[];e=/(^|[\s\n]|<br\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;if(!(0<a.length))return this.replace(e,"$1<a href='$2'>$2</a>");d=a[0];f=function(){var c;c=[];for(b in d)g=d[b],"callback"!==b&&c.push(" "+b+"='"+g+"'");return c}().join("");return this.replace(e,function(c,b,a){c=("function"===typeof d.callback?d.callback(a):void 0)||"<a href='"+
a+"'"+f+">"+a+"</a>";return""+b+c})}}).call(this);

var Post = Backbone.Model.extend({
});

var PostCollection = Backbone.Collection.extend({
  model: Post,
  fetch: function() {
    var that = this;
    $.ajax('/posts/' + that.type, {
      data: {
        ids: that.postIds
      },
      success: function(data){
        that.parse(data);
      }
    });
  },
  parse: function(data) {
    that = this;
    _.each(data, function(d){
      var model = new Post({
        type: that.type,
        data: _.isObject(d) ? d : {id: d}
      });
      that.add(model);
    });
    this.trigger('parse');
    // console.log(this);
  }
});

var YoutubeVideoCollection = PostCollection.extend({
  posts: youtubeVideos,
  type: 'youtubeVideos',
  fetch: function() {
    this.parse(this.posts);
  },
  parse: function(data) {
    that = this;
    _.each(data, function(d){
      var model = new Post({
        type: that.type,
        data: _.isObject(d) ? d : {id: d}
      });
      model.set('id', d.id);
      model.set('aspectRatio',
        model.get('data').snippet.thumbnails.high.width / model.get('data').snippet.thumbnails.high.height
      );
      that.add(model);
    });
    this.trigger('parse');
    // console.log(this);
  }
});

var youtubes = new YoutubeVideoCollection();

/** post viewer */
var YoutubeVideoView = Backbone.View.extend({
  name: "YoutubeVideoView",
  collection: youtubes,
  initialize: function(){
    var that = this;
    this.collection.on('parse', function(){
        that.render();
    });
    this.collection.fetch();
  },
  render: function() {
    var that = this;
    _.each(this.collection.models, function(e){

        e.set('width', $(that.el).width());
        e.set('height', Math.round($(that.el).width() / e.get('aspectRatio')));
        var template = _.template($("#post-" + e.get('type')).html());
        $(that.el).append( template(e.attributes, {escape: false}) );
    });
  }
});

var EmbedCodeVideoCollection = PostCollection.extend({
  posts: embedCodeVideos,
  type: 'embedCodeVideos',
  fetch: function() {
    this.parse(this.posts);
  },
  parse: function(data) {
    that = this;
    _.each(data, function(d){
      var model = new Post({
        type: that.type,
        data: d
      });
      that.add(model);
    });
    this.trigger('parse');
  }
});

var youtubes = new EmbedCodeVideoCollection();

/** post viewer */
var EmbedCodeVideoView = Backbone.View.extend({
  name: "EmbedCodeVideoView",
  collection: youtubes,
  initialize: function(){
    var that = this;
    this.collection.on('parse', function(){
        that.render();
    });
    this.collection.fetch();
  },
  render: function() {
    var that = this;
    _.each(this.collection.models, function(e){
        // var template = _.template($("#post-" + e.get('type')).html());
        $(that.el).append( e.get('data') );
    });
  }
});

$(document).ready(function(){
    var youtubeViewer = new YoutubeVideoView({
      el: $('section#youtubeVideos')
    });

    var embedCodeViewer = new EmbedCodeVideoView({
      el: $('section#embedCodeVideos')
    });

});



