define(function(require) {
	var config		= require('config'),
		Signal 		= require('libs/signals.min');
		
	var Player = function(graphics, location){
		this.graphics = graphics;
		this.init(location);
		return this;
	};

	$.extend(Player.prototype, {
		'init': function(location) {
			this.location = location;
			this.controls = config.players[this.location].controls;
			this.cfg = config.players[this.location].paddle;
			$.extend(this.cfg, config.paddle);
			this.addListeners();
			this.score = this.graphics.scores[location];
			this.winLabel = this.graphics.winLabels[location];

			this.keydown = null;
		},

		'init_paddle': function() {
			this.paddle = this.graphics.paddles[this.location];
			var limit_distance = config.paddle.limit_distance;
			if ( this.cfg.freeAxis === 'y' ){
				this.MIN = limit_distance;
				this.MAX = this.graphics.stageHeight - limit_distance;
			} else if ( this.cfg.freeAxis === 'x'){
				this.MIN = limit_distance;
				this.MAX = this.graphics.stageWidth - limit_distance;
			}

		},

		'addListeners': function() {
			this.graphics.events.imageLoadingDone.addOnce(function(){
				this.init_paddle();
				$(document).on("keydown", this.keyhandler.bind(this));
				$(document).on("keyup", this.keyhandler.bind(this));
			}.bind(this));
			// console.error('addListeners');
			createjs.Ticker.on("tick", function(e){
				// console.error(e);
				if (this.keydown){
					this.action(this.keydown, e.delta)
				}
			}.bind(this));
		},

		'keyhandler': function (event) {
			//check if event.key is related to this player and stop propagating it
			var key = String.fromCharCode(event.keyCode);
			if (Object.keys(this.controls).indexOf(key) !== -1) {
				if (event.stopPropagation) {
					event.stopPropagation();
					event.stopImmediatePropagation();
				} else if (event.cancelBubble!=null) {
					event.cancelBubble = true;
				}
				if (event.type === "keydown") { //probably not readable in next few lines
					//attach keypressed once
					if (!this.keydown || key !== this.keydown) {
						this.keydown = this.keydown || key;
						// console.error("down", key);
						this.action(key);
					}
				} else if (event.type === "keyup") {
					//detach key action
					if (key === this.keydown) {
						this.keydown = null;
						// console.error("Up", key);
					}
				}
			}
		},

		'action': function(key){
			
			var newPos = this.paddle[this.cfg.freeAxis];
				newPos = newPos + this.controls[key]*this.cfg.speed;
				if (newPos < this.MIN){
					newPos = this.MIN;
				}
				if (newPos > this.MAX){
					newPos = this.MAX;
				}
			this.paddle[this.cfg.freeAxis] = newPos;
		},

		'playWinAnimation': function(callback) {
			this.winLabel.visible = true;

			var winAnim = new TimelineMax().to(this.winLabel, 1.2, {
				'x':this.graphics.stageWidth/2,
				'y':this.graphics.stageHeight/2,
			})
			.to(this.winLabel, 1.0, {
				'scaleX': 1.7,
				'scaleY': 1.7,
				'repeat': 2,
				'yoyo': true,
				'force3D':true,
				'repeatDelay': 0.5
			})
			.addCallback(function(){
				callback && callback();
			});

		}

	});
	return Player; 
});

