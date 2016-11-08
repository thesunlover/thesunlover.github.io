setConfig();//comes from config_paths.js
define(function (require) {
	$(document.body)
		.css("width", ""+window.innerWidth+"px")
		.css("height", ""+window.innerHeight+"px");
    var Page = function(controller, page){
		var domE = page.get();
    	ScrollMagic.Scene.call(this, {triggerElement: domE, duration:this.getDuration()})
	    	.setPin(domE).addTo(controller)
	    	.addIndicators()
	    	.setTween(this.getPageTweens(page));		
    };
    Page.prototype = Object.create(ScrollMagic.Scene.prototype);
    Page.prototype.getDuration = function(){return 0;};
    Page.prototype.getPageTweens = function(page){
    	this.tween = new TimelineMax();
    	this.tween.to(page.selector+" p",1.0,{opacity:1, ease:Linear.easeNone, immediateRender:false});
    	return this.tween;
    };

    var HeaderPage = function(controller){
    	this.saved = {};
    	this.initTitle();
    	this.initPicture();
    	Page.call(this, controller, $("header"));
    };
    HeaderPage.prototype = Object.create(Page.prototype);
    HeaderPage.prototype.getDuration = function(){return window.innerHeight};
    HeaderPage.prototype.getPageTweens = function(){
    	this.tween = new TimelineMax();
    	window.header = this;
    	// this.tween.to(this.pic, 1.0, {scale:1, top:"5%",left:"5%", ease:Linear.easeNone, immediateRender: false});
    	// this.tween.to(this.pic, 1.0, {
    	// 	borderWidth: this.saved.picBorder,
    	// 	top: "5%",
    	// 	left:this.saved.picLeft,
    	// 	ease:Linear.easeNone, immediateRender: false
    	// });
    	// this.tween.to(this.title, 1.0, {opacity:1, ease:Linear.easeNone, immediateRender: false});
    	return this.tween;

    };
    HeaderPage.prototype.initTitle = function(){
    	this.title = $("header>h1,header>h2");
    };
    HeaderPage.prototype.initPicture = function(){
    	this.pic = $("img#myPhoto");
    	//save final visual params
    	this.saved.picBorder = this.pic.css("borderWidth"); 
    	this.saved.picTop = this.pic.css("top"); 
    	this.saved.picLeft = this.pic.css("left"); 
    	//init for animation
    	this.pic.css("borderWidth","0px");
    	this.pic.css("position","relative");
    	new TimelineMax()
    		.set(this.pic, {scale:2.0, top:"50%", left:"50%"})
    		.set(this.pic, {scale:2.0})
    		;
    	this.pic.css("borderWidth","0px");

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