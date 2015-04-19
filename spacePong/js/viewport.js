define(function(require) {
	$.fn.verticalCenter = function(){
        var element = this;

        $(element).ready(function(){
            changeCss();

            $(window).bind("resize", function(){
                changeCss();
            });

            function changeCss(){
                var elementHeight = element.height(),
					windowHeight = $(window).height(),
					top,
					elementWidth = element.width(),
					windowWidth = $(window).width(),
	                left;

                if(windowHeight > elementHeight) {
                    top = Math.ceil(windowHeight/2 - elementHeight/2);
                } else {
                	top = 0;
                }
                if(windowWidth > elementWidth) {
                    left = Math.ceil(windowWidth/2 - elementWidth/2);
                } else {
                	left = 0;
                }
                $(element).css({
                    "position" : 'absolute',
                    "top" : top + "px",
                    "left" : left + "px"
                });
            };
        });

    },


	Viewport = function(){
		this.init();
	};


	$.extend(Viewport.prototype, {
		init: function() {
			console.log("viewport applied");
		}
	});

	return Viewport;

});

