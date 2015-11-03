setConfig();//comes from config_paths.js
define(function (require) {
    var Page = function(controller, page){
		var domE = page.get();
    	ScrollMagic.Scene.call(this, {triggerElement: domE})
	    	.setPin(domE).addTo(controller)
	    	.addIndicators()
	    	.setTween(this.getPageTweens(page));		
    };
    Page.prototype = Object.create(ScrollMagic.Scene.prototype);
    Page.prototype.getPageTweens = function(page){
    	return TweenLite.to(page.selector+" p",1.0,{opacity:1, ease:Linear.easeNone, immediateRender:false});
    };

    var HeaderPage = function(controller){
    	Page.call(this, controller, $("header"));
    };
    HeaderPage.prototype = Object.create(Page.prototype);
    HeaderPage.prototype.getPageTweens = function(){
    	return TweenLite.to($("header>h1,header>h2"), 1.0, {opacity:1, ease:Linear.easeNone, immediateRender: false});

    };
    var SectionPage = Page;

	var Main = function(){
		ScrollMagic.Controller.call(this,{
	        globalSceneOptions: {
	            triggerHook: 'onLeave'
	        }
	    });
	    this.pages = [new HeaderPage(this)].concat([
	    	$("section#contacts"),
	    	$("section#one"),
	    	$("section#two"),
	    	$("section#three"),
	    	$("section#four"),
	    	$("section#five"),
	    	$("section#six"),
    	].map(function($page){
    		return new SectionPage(this, $page); 
    	},this));
	};
	Main.prototype = Object.create(ScrollMagic.Controller.prototype);
	new Main();
});