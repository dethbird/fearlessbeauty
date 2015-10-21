
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
    url: "img/rotator/001.jpg",
    tagline: {
       top: 550,
       left: 450
    },
    logo: {
      top: 5,
      left: 15,
      scale: 0.9
    }
  },
  {
    url: "img/rotator/002.jpg",
    tagline: {
       top: 580,
       left: 450
    },
    logo: {
      top: -10,
      left: -75,
      scale: 0.6
    }
  },
  {
    url: "img/rotator/003.jpg",
    tagline: {
      top: 580,
      left: 50
    },
    logo: {
      top: -25,
      left: 470,
      scale: 0.7
    }
  },
  {
    url: "img/rotator/004.jpg",
    tagline: {
       top: 580,
       left: 450
    },
    logo: {
      top: -10,
      left: -75,
      scale: 0.6
    }
  }
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
      img.attr('id', i + 1);
      model.set('id', i+1);
      model.set('image', img);
      img.css('z-index', 1000 + this.collection.models.length - i);
      $(that.el).append(img);
      if(i!=0){
        img.fadeOut(0);
      } else {
        that.currentModel = model;
      }
    });
    var template = _.template($("#template-banner").html());
    $(that.el).append( template({}, {escape: false}) );

    $('#banner-tagline').css('z-index', 1000 + this.collection.models.length + 1);
    $('#banner-tagline').css('top', (that.currentModel.get('tagline').top));
    $('#banner-tagline').css('left', (that.currentModel.get('tagline').left));

    $('#banner-logo').css('z-index', 1000 + this.collection.models.length + 2);
    // $('#banner-logo').css('top', (that.currentModel.get('logo').top));
    // $('#banner-logo').css('left', (that.currentModel.get('logo').left));
    // $('#banner-logo').css('scale', (that.currentModel.get('logo').scale));
     var logoTween = TweenMax.to(
      $('#banner-logo'),
      0,
      {
        left: this.currentModel.get('logo').left,
        top: this.currentModel.get('logo').top,
        scale: this.currentModel.get('logo').scale,
        ease:Expo.easeOut
      }
    );

    this.render();
  },
  render: function() {
    setInterval(_.bind(function(){
      this.nextImage();
    }, this), 8000);
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
          $('#banner-tagline').css('top', model.get('tagline').top);
          var taglineTween = TweenMax.to(
            $('#banner-tagline'),
            2,
            {
              left: that.currentModel.get('tagline').left,
              top: that.currentModel.get('tagline').top,
              ease:Expo.easeOut
            }
          );
          var logoTween = TweenMax.to(
            $('#banner-logo'),
            2,
            {
              left: that.currentModel.get('logo').left,
              top: that.currentModel.get('logo').top,
              scale: that.currentModel.get('logo').scale,
              ease:Expo.easeOut
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



