setConfig();//comes from config_paths.js
define(function (require) {
    var ScrollMagic = require("scrollmagic/ScrollMagic.min");

	var Main = function(){
		ScrollMagic.Controller.call(this,{
	        globalSceneOptions: {
	            triggerHook: 'onLeave'
	        }
	    });
	    this.pages = [].slice.call(document.getElementsByTagName("section"));
	    // console.log(this.pages);

	    this.pages.map(this.addPage, this);
	};
	Main.prototype = Object.create(ScrollMagic.Controller.prototype);
	Main.prototype.addPage = function(page){
		console.log(this, page);
		new ScrollMagic.Scene({
		        triggerElement: page
		    })
		    .setPin(page)
		    .addTo(this);		
	};
	new Main();
});