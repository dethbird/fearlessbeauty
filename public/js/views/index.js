
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
    $(that.el).html('');
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

var embedcodes = new EmbedCodeVideoCollection();

/** post viewer */
var EmbedCodeVideoView = Backbone.View.extend({
  name: "EmbedCodeVideoView",
  collection: embedcodes,
  initialize: function(){
    var that = this;
    this.collection.on('parse', function(){
        that.render();
    });
    this.collection.fetch();
  },
  render: function() {
    var that = this;
    $(that.el).html('');
    _.each(this.collection.models, function(e){
        $(that.el).append( e.get('data') );
    });
  }
});

var WordpressPostCollection = PostCollection.extend({
  posts: wordpressPosts,
  type: 'wordpressPosts',
  fetch: function() {
    this.parse(this.posts);
  },
  parse: function(data) {
    that = this;
    _.each(data, function(d){
      var model = new Post({
        type: that.type,
        data: d,
        id: d.id
      });
      that.add(model);
    });
    this.trigger('parse');
  }
});

var wordpresses = new WordpressPostCollection();

/** post viewer */
var WordpressPostView = Backbone.View.extend({
  name: "WordpressPostView",
  collection: wordpresses,
  initialize: function(){
    var that = this;
    this.collection.on('parse', function(){
        that.render();
    });
    this.collection.fetch();
  },
  render: function() {
    var that = this;
    $(that.el).html('');
    _.each(this.collection.models, function(e){
        var template = _.template($("#post-" + e.get('type')).html());
        $(that.el).append( template(e.attributes, {escape: false}) );
    });
  }
});

var imagesToRotateData = [
  {
    taglineClassName: 'image-rotator-tagline-03',
    logoClassName: 'image-rotator-logo-03',
    url: "img/rotator/003.jpg"
  },
  {
    taglineClassName: 'image-rotator-tagline-02',
    logoClassName: 'image-rotator-logo-02',
    url: "img/rotator/002.jpg"
  },
  {
    taglineClassName: 'image-rotator-tagline-04',
    logoClassName: 'image-rotator-logo-04',
    url: "img/rotator/004.jpg"
  },
];

var imagesToRotate = new Backbone.Collection(imagesToRotateData);


var ImageRotatorWithTaglineView = Backbone.View.extend({
  name: "ImageRotatorWithTaglineView",
  collection: imagesToRotate,
  currentModel: null,
  initialize: function() {

    var that = this;

    // load the images, trigger when they are all loaded
    var imagesLoadedCount = 0;
    $.each(this.collection.models, function(i,model) {

      var img = $('<img />');
      img.attr('src', model.get('url'));
      img.attr('id', i+1);
      img.css('z-index', 1000 + this.collection.models.length - i);
      img.addClass('rotator');
      $(that.el).append(img);

      model.set('image', img);
      model.set('id', i+1);

      if(i!=0){
        img.fadeOut(0);
      } else {
        that.currentModel = model;
      }
    });
    var template = _.template($("#template-banner").html());
    $(that.el).append( template({}, {escape: false}) );

    $('#banner-tagline').css('z-index', 1000 + this.collection.models.length + 1).addClass(this.currentModel.get('taglineClassName'));
    $('#banner-logo').css('z-index', 1000 + this.collection.models.length + 2).addClass(this.currentModel.get('logoClassName'));

    this.render();
  },
  render: function() {
    setInterval(_.bind(function(){
      this.nextImage();
    }, this), 10000);
  },
  nextImage: function() {
    var that = this;
    var index = this.currentModel.get('id');
    index++;
    if(index > this.collection.models.length) {
      index = 1;
    }
    this.currentModel = this.collection.models[index-1];
    $.each(this.collection.models, function(i,model){
      model.get('image').fadeOut(500, function(){
        if(model.get('id')==that.currentModel.get('id')) {

          that.currentModel.get('image').fadeIn(1000);

          var taglineTween = TweenMax.to(
            $('#banner-tagline'),
            2,
            {
              className: model.get('taglineClassName')
            }
          );
          var logoTween = TweenMax.to(
            $('#banner-logo'),
            2,
            {
              className: model.get('logoClassName')
            }
          );
        }
      });
    });
  }
});


$(document).ready(function(){
    // var youtubeViewer = new YoutubeVideoView({
    //   el: $('section#youtubeVideos')
    // });

    // var embedCodeViewer = new EmbedCodeVideoView({
    //   el: $('section#embedCodeVideos')
    // });

    var wordpressViewer = new WordpressPostView({
      el: $('section#wordpressPosts')
    });

    var imageRotateWithTaglineViewer = new ImageRotatorWithTaglineView({
      el: $('#home-header')
    });


    $(window).resize($.debounce(350, function(e){
      // youtubeViewer.render();
      // embedCodeViewer.render();
    }));

});



