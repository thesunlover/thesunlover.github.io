define(function(require) {
	var config		= require('config'),
		createjs	= require('libs/easeljs-0.7.1.min'),
		createjs	= require('libs/preloadjs-0.4.1.min'),
		Signal 		= require('libs/signals.min');
		
	var Preloader = function(graphics){
		this.graphics = graphics;
		this.base_init();
		return this; 
	};
	$.extend(Preloader.prototype, new createjs.LoadQueue(true));
	Preloader.prototype.base_init = Preloader.prototype.init;
	$.extend(Preloader.prototype, {
		events: {
			// 'fileload': new Signal(),
			// 'progress': new Signal(),
			'done': new Signal(),
			// 'error': new Signal(),
		},

		start: function() {
			this.graphics.showScreen("preloader");
			var that = this;
			this.addEventListener("complete", function (e) {
				that.events.done.dispatch();
			});
			// this.addEventListener("progress", function (e) {
			// 	that.events.progress.dispatch(e.progress, e);
			// });
			this.addEventListener("fileload", function (e) {
				if (config.DEBUG){
					console.log(e.result);
				}
				// that.events.fileload.dispatch(e);
			});
			// this.addEventListener("error", function (e) {
			// 	if (config.DEBUG){
			// 		console.log(e.item);
			// 	}
			// 	that.events.error.dispatch(e);
			// });

			this.setMaxConnections(5);
			this.loadManifest(config.imagesManifest, true);
			return this;
		}

	});

	return Preloader; 
});

