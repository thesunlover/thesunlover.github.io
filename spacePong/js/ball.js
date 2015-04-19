define(function(require) {
	var config		= require('config'),
		ndgmr 		= require('libs/ndgmr.Collision'),
		Signal 		= require('libs/signals.min');
		
	var Ball = function(graphics){ //call extend the createjs.Bitmap
		this.graphics = graphics;
		this.ball = graphics.ball;
		$.extend(this, config.ball);
		this.addListeners();
		this._pause = false;
		this.events = {
			'wallHit': new Signal(),
			'playerHit': new Signal(),
			'CPUHit': new Signal(),
		};
		return this;
	};

	$.extend(Ball.prototype, {
		'addListeners': function() {
			var that = this;
			this.graphics.events.imageLoadingDone.addOnce(function(){
				that.init_ball();

				that.tkr = new Object();
				createjs.Ticker.addEventListener("tick", function(e){
					that.move(e);
				});

			});
		},

		move : function(e){
			if (!this._pause){
				// console.error(e);
				this.ball.x += this.direction.x * this.speed;
				this.ball.y += this.direction.y * this.speed;
			}
			// console.log(this.ball.y, this.ball.y - this.ball.regY * this.direction.y, config.stageHeight);
			// console.log(this.ball.y, this.ball.y + this.ball.regY * this.direction.y, config.stageHeight);

			if (this.ball.x >= this.graphics.stageWidth) {
				var s = this.graphics.scores['left'];
				s.num += 1;
				s.text = s.num.toString();
				this.ball.x = this.graphics.stageWidth/2;
				this.direction.x *= -1;
			}

			if (this.ball.x <= 0) {
				var s = this.graphics.scores['right'];
				s.num += 1;
				s.text = s.num.toString();
				this.ball.x = this.graphics.stageWidth/2;
				this.direction.x *= -1;
			}

			//wall hit test
			var intersection = ndgmr.checkPixelCollision(this.ball, this.graphics.borders, 0);
			if (intersection) {
				this.direction.y *= -1;
			}

			Object.keys(this.graphics.paddles).forEach(function(key){
				var paddle = this.graphics.paddles[key];
				intersection = ndgmr.checkPixelCollision(this.ball, paddle, 0);
				if ( intersection ) {
					if (key==='left') {
						this.direction.x = 1;
					} else if (key==='right'){
						this.direction.x = -1;
					}
				}
			}.bind(this));
		},

		reset: function(){
			this.graphics.center_object_on_screen(this.ball);
		},

		pause: function(){
			this._pause = true;
		},

		resume: function(){
			this._pause = false;
		},

		'init_ball': function() {
			this.ball = this.graphics.ball;
		}

	});
	return Ball; 
});

