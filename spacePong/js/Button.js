define(function(require) {

	var config  	= require('config'),
		Signal 		= require('libs/signals.min'),
		createjs	= require('libs/easeljs-0.7.1.min');

	var Button = function(label, position) {
		this.init(label, position);

	};

	$.extend(Button.prototype, new createjs.Container());
	Button.prototype.base_init = Button.prototype.initialize;
	$.extend(Button.prototype, {

		'init': function(label, position) {
			this.events = {
				'clicked': new Signal()
			};
			this.base_init();
			this.count = 0;
			this.events_alpha = config.events_alpha;

			this.text = new createjs.Text(label, "20px Arial", "#000");
			this.text.textBaseline = "top";
			this.text.textAlign = "center";

			this.label = label;
			this._width = Math.ceil(this.text.getMeasuredWidth())+30;
			this._height = Math.ceil(this.text.getMeasuredHeight())+20;

			this.background = new createjs.Shape();
			this.background.graphics.beginFill(config.button_color)
				.drawRoundRect(0, 0, this._width, this._height, 10);

			this.text.x = this._width/2;
			this.text.y = 10;

			// this.regX = Math.ceil(this._width/2);
			// this.regY = Math.ceil(this._height/2);
			this.x = position.x;
			this.y = position.y;

			this.addChild(this.background, this.text);

			// Object.getOwnPropertyNames(config.events_alpha)
			Object.keys(config.events_alpha)
			.forEach(function(key, i, arr) {
				// console.log(key);
				this.on(key, this.eventsHandler);
			}.bind(this));

			this.mouseChildren = false;
			this.mouseMoveOutside = false;

			return this;
		},

		'eventsHandler': function(event) {
			event.preventDefault();
			if ( !this.events_alpha[event.type] ) {
				return this;
			}
			// console.error(event.type, event.target._width, event.target._height, event );
			if ( event.type === "pressup" ) {
				// console.log(this.parent.getObjectUnderPoint(event.stageX, event.stageY));
				// console.error(this);
				if ( event.target !== this.parent.getObjectUnderPoint(event.stageX, event.stageY) ) {
					return this;
				} else {
					// console.error(this, this.events);
					this.events.clicked.dispatch();
				}
			}
			this.alpha = this.events_alpha[event.type];
			return this;
		},

	});
	
	return Button;
});
