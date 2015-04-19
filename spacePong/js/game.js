define(function(require) {
	var config		= require('config'),
		// Signal 		= require('libs/signals.min');
		Signal 		= require('libs/signals.min'),
		Player 		= require('player');
		
	var Game = function(graphics){
		this.graphics = graphics;
		this.init();
		return this; 
	};

	$.extend(Game.prototype, {
		init: function() {
			// alert();
			this.players = [];
			this.events = {
				gameOver: new Signal(),
				pause: new Signal(),
				resume: new Signal(),
			};
			Object.keys(config.players).forEach(function(key, i) {
				if ( i < config.MAX_PLAYERS ) {
					this.players.push(new Player( this.graphics, key ));
				}
			}.bind(this));
		},

		start: function(playerNum) {
			this.addListeners();
			this.playerNum = playerNum;
			this.graphics.showScreen("game");
			return this;
		},

		addListeners: function() {
			var that = this;
			createjs.Ticker.on("tick", function(e){
				for (var i=0; i < that.players.length; i+=1){
					if (that.players[i].score.num == config.winScore){
						that.events.pause.dispatch();
						that.players[i].playWinAnimation(function(){
							if (config.DEMO){
								;;;location.reload();
								that.events.resume.dispatch();
							} else {
								console.error("not done yet");
							}
						});
						createjs.Ticker.on("tick", that.graphics.stage);
						break;
					}
				}
			});
		}

	});

	return Game; 
});

