console.log(comic);
var ComicView = Backbone.View.extend({
    comic: comic,
    currentPart: 0,
    currentPanel: 0,
    events: {
        "click .thumbnail": "selectPanel",
        "click #viewer": "nextPanel"
    },
    initialize: function(){
        this.render();
    },
    nextPanel: function(){
        this.currentPanel++;
        if (this.currentPanel == comic.parts[this.currentPart].panels.length) {
            this.currentPanel = 0;
            this.currentPart++;
            if (this.currentPart == comic.parts.length) {
                this.currentPart = 0;
            }
        }
        this.render();
        ga('send', 'event', 'Comics', 'Next Panel', this.comic.title + ':' + this.currentPart + '-' + this.currentPanel);
    },
    selectPanel: function(e){
        var panel = $(e.target);
        this.currentPanel = panel.data('panel');
        this.currentPart = panel.data('part');
        this.render();
        ga('send', 'event', 'Comics', 'Select Panel', this.comic.title + ':' + this.currentPart + '-' + this.currentPanel);
    },
    render: function(){

        // set viewer image
        var viewer = $('#viewer');
        viewer.html('<img src="' + this.comic.parts[this.currentPart]['panels'][this.currentPanel] + '" />');
        viewer.fadeOut(0, function(){
          viewer.fadeIn('3000');
        });

        // deactivate all part headers
        $('header').removeClass('active');
        // deactivate all images
        $('.thumbnail img').removeClass('active');

        // activate part
        $('header[data-part="' + this.currentPart + '"]').addClass('active');
        // activate thumbnail
        $($('.thumbnail img[data-part="' + this.currentPart + '"]')[this.currentPanel]).addClass('active');

    }
});


$(document).ready(function(){
    var comicViewer = new ComicView({
        el: 'body'
    });
    $('body a').click(function(e){
        if ($(e.currentTarget).attr('href')!==undefined) {
          ga('send', 'event', 'Comics', 'Click Link', $(e.currentTarget).attr('href'));
        }
    });
});