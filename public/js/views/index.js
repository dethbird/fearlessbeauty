
/** autolink */
(function(){var h=[].slice;String.prototype.autoLink=function(){var b,f,d,a,e,g;a=1<=arguments.length?h.call(arguments,0):[];e=/(^|[\s\n]|<br\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;if(!(0<a.length))return this.replace(e,"$1<a href='$2'>$2</a>");d=a[0];f=function(){var c;c=[];for(b in d)g=d[b],"callback"!==b&&c.push(" "+b+"='"+g+"'");return c}().join("");return this.replace(e,function(c,b,a){c=("function"===typeof d.callback?d.callback(a):void 0)||"<a href='"+
a+"'"+f+">"+a+"</a>";return""+b+c})}}).call(this);

var workMode = 0;

/** Social media collections */
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


var PortfolioCollection = PostCollection.extend({
  posts: portfolioItemJson,
  type: 'portfolio',
  fetch: function() {
    this.parse(this.posts);
  }
});

// var ComicsCollection = PostCollection.extend({
//   posts: comicsJson,
//   type: 'comics',
//   fetch: function() {
//     this.parse(this.posts);
//   }
// });

var InstagramCollection = PostCollection.extend({
  postIds: instagramPostIds,
  type: 'instagram'
});

var TwitterCollection = PostCollection.extend({
  postIds: twitterTweetIds,
  type: 'twitter',
  fetch: function() {
    this.parse(this.postIds);
  }
});

var WordpressCollection = PostCollection.extend({
  postIds: wpPostIds,
  type: 'wordpress'
});


var portfolio = new PortfolioCollection();
// var comics = new ComicsCollection();
var instagrams = new InstagramCollection();
var tweets = new TwitterCollection();
var wpposts = new WordpressCollection();

/** post viewer */
var PostView = Backbone.View.extend({
  name: "PostView",
  events: {
    "click a#post-random-button": "randomPost"
  },
  postCollections: [
    wpposts, tweets
  ],
  initialize: function(){
    var that = this;
    var readyCount = 0;
    _.each(this.postCollections, function(c){
      c.on('parse', function(){
        readyCount++;
        if(readyCount == that.postCollections.length) {
          that.readyState();
        }
      });
      c.fetch();
    });
  },
  randomPost: function() {
    // random collection
    var c = this.postCollections[Math.floor(Math.random() * this.postCollections.length)];
    // random post
    this.model = c.models[Math.floor( Math.random() * c.models.length )];
    this.render();
    ga('send', 'event', 'Index', this.name + '.RandomPost', 'Click');
  },
  readyState: function() {
    this.model = this.postCollections[0].first();
    this.render();
  },
  render: function() {
    var that = this;
    this.$('.random-post').fadeOut(0, function(){
      that.$('.random-post').fadeIn('3000');
    });
    var template = _.template($("#post-" + this.model.get('type')).html());
    this.$('.random-post').html( template(this.model.get('data'), {escape: false}) );
    var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|(www\\.)?){1}([0-9A-Za-z-\\.@:%_\‌​+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

    if(this.model.get('type')=="instagram" || this.model.get('type')=="wordpress"  || this.model.get('type')=="portfolio") {

      $('.random-post').each(function(){

        var that = $(this);

         var hashtag_regexp = /@([a-zA-Z0-9]+)/g;
          that.html(
            that.html().replace(
              hashtag_regexp,
              '<a target="_blank" href="https://instagram.com/$1">@$1</a>'
            )
          );

          var hashtag_regexp = /#([a-zA-Z0-9]+)/g;
          that.html(
            that.html().replace(
              hashtag_regexp,
              '<a>#$1</a>'
            )
          );

          var markdownEl = $($(that).find('.description'));
          markdownEl.html(markdownConverter.makeHtml(markdownEl.html()));

          that.html(that.html().autoLink());

      });
    }


    //if this is twitter, render the tweet
    if(this.model.get('type')=="twitter") {

      var tweetDiv = this.$('.random-post .post.twitter .tweet');

      twttr.widgets.createTweet(
        this.model.get('data').id,
        tweetDiv[0],
        {
          width: 400
        }
      ).then(function(){
        // console.log('done');
      });
    }

    //track clicks
    this.$('.random-post a').click(function(e){
        if ($(e.currentTarget).attr('href')!==undefined) {
          ga('send', 'event', 'Index', 'Click Link', $(e.currentTarget).attr('href'));
        }
    });


  }
});

/** Portfolio */
var PortfolioView = PostView.extend({
  name: "PortfolioView",
  events: {
    "click a#portfolio-random-button": "randomPost"
  },
  postCollections: [
    // comics,
    portfolio,
    instagrams
  ]
});

$(document).ready(function(){

    if(workMode==1){
      // work mode
      $('section').css('background','none');
      $('header').css('background','none');
      $('section').css('background-color','#CCC');
      $('header').css('background-color','#CCC');
    }

    $('#great_button').click(function(){
      ga('send', 'event', 'Index', 'Great Button');
      alert('Fantastic!');
    });

    var portfolioGallery = new PortfolioView({
      el: $('section#portfolio')
    });

    var postviewer = new PostView({
      el: $('section#info')
    });

    $('body a').click(function(e){
        if ($(e.currentTarget).attr('href')!==undefined) {
          ga('send', 'event', 'Index', 'Click Link', $(e.currentTarget).attr('href'));
        }
    });

});