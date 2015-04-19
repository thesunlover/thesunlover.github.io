var Turtle = (function(){
var Pen = function(){
	this.color = "black";
	this.width = 1.0;
	this.up = true;
	this.down = !this.up;
};

var Turtle = function(stageID){
	this.pen = new Pen();
	this.orientation = 0;//degrees
	this.canvas = document.getElementById(stageID);
	this.maxWidth = this.canvas.width;
	this.maxHeight = this.canvas.height;
	this.location = {
		'x': 0,
		'y': 0
	}; 
	this.canvasCtx = this.canvas.getContext('2d');
	this.applyStrokeStyle();
};

Turtle.prototype.applyStrokeStyle = function(degrees){
	this.canvasCtx.lineWidth = this.pen.width;
	this.canvasCtx.strokeStyle = this.pen.color;
};

Turtle.prototype.resetPosition = function(x, y){
	this.location['x'] = x;
	this.location['y'] = y;
};

Turtle.prototype.move = function(distance){
	var move = this.calculateMove(distance);
	if (this.pen.up){
		this.canvasCtx.moveTo(move.x, move.y);
	} else {
		this.canvasCtx.lineTo(move.x, move.y);
	}
};

Turtle.prototype.calculateMove = function(distance){
	this.location['x'] += Math.cos(this.orientation) * distance;
	this.location['y'] += Math.sin(this.orientation) * distance;
	return this.location;
};

Turtle.prototype.turn = function(degrees){
	var radians = degrees * (2*Math.PI/360);
	// console.log(degrees,'->',radians);
	this.orientation += radians;
};

Turtle.prototype.penDown = function(){
	this.pen.down = true;
	this.pen.up = !this.pen.down;
    // this.canvasCtx.moveTo(this.location.x, this.location.y);
	this.canvasCtx.beginPath();
};

Turtle.prototype.penUp = function(){
	this.pen.up = true;
	this.pen.down = !this.pen.up;
	this.canvasCtx.stroke();
};

Turtle.prototype.penSize = function(size){
	this.pen.width = size;
	this.applyStrokeStyle();
};

Turtle.prototype.penColor = function(color, G, B){
	if (typeof(color)==='string'){// penColor("red"), penColor("#0123456")
		this.pen.color = color;
	} else if ( typeof(color) === 'number' 
				&& typeof(G) === 'number' 
				&& typeof(B) === 'number'){
		//penColor(0,23,78)
		var color = color.toString(16),
			G = G.toString(16),
			B = B.toString(16);
		this.pen.color = '#'+color+G+B;

	} else {
		throw "unsuported color format";
	}
	// HEX
	// RGB
	//string; like blue, red, etc.
	this.applyStrokeStyle();
};

var LindenmayerCurve = function(cfg){
	cfg && this.init(cfg);
};

LindenmayerCurve.prototype.init = function(cfg){
	this.skips = cfg.skips;
	// this.constants = [];
	this.axiom = cfg.axiom;
	this.rules = cfg.rules;
	// this.rules = {
	// 	'A': ['A','B'],
	// 	'B': ['A'],
	// }
};

LindenmayerCurve.prototype.getPathN = function(power){
	if (power === 0){
		return this.axiom;
	}
	var result = [];
	// console.log(power, "-=", this.getPathN(power-1));
	this.getPathN(power-1).forEach(function(elem, ix){
		// console.log("#$", elem, result, this.rules[elem] || [elem]);
		result = result.concat(this.rules[elem] || [elem]); //if constant just add it
		// console.log("#*****$", elem, result);
	}.bind(this));
	return result;
}

LindenmayerCurve.prototype.getDrawnPath = function(power){
	return this.getPathN(power).filter(function(move){
		return (this.skips.indexOf(move)===-1);
	}.bind(this));
}

//#### test start ####//
var doTest = function(){
	var test_c1 = new LindenmayerCurve({
		'axiom': ['A'],
		'rules': {
			'A': ['A','B','A'],
			'B': ['A'],
		}
	});
	var testCaseResult=[
		["A"],
		["A", "B", "A"],
		["A", "B", "A", "A", "A", "B", "A"],
		["A", "B", "A", "A", "A", "B", "A", "A", "B", "A", "A", "B", "A", "A", "A", "B", "A"]
	];
	for (var testNum=0;testNum<4;testNum+=1){

		if (test_c1.getPathN(testNum).join('') != testCaseResult[testNum].join('')){
			throw "test failed", test_c1.getPathN(testNum);
		} else {
			console.error('test passed:', testNum);
		}
	}
};
doTest();
//#### test end ####//

var HilbertCurve = function(power){
	// http://en.wikipedia.org/wiki/Hilbert_curve#Representation_as_Lindenmayer_system
	this.init({
		'skips':['A', 'B'],
		'axiom': ["A"],
		'rules': {
			"A": ["-", "B", "F", "+", "A", "F", "A", "+", "F", "B", "-"],
			"B": ["+", "A", "F", "-", "B", "F", "B", "-", "F", "A", "+"]
		}
	});
	this.actionsDecoder = {
		'-': {'turtleAction':'turn', 'parameter':90},//left turn
		'+': {'turtleAction':'turn', 'parameter':-90},//right turn
		'F': {'turtleAction':'move'} //draw straight
	}
	this.power = power;
	this.path = ['F'].concat(this.getDrawnPath(power))
};
var PeanoCurve = function(power){
	// rules taken from http://bl.ocks.org/nitaku/8949471
	this.init({
		'skips':['L', 'R'],
		'axiom': ["L"],
		'rules': {
			"L": ['L', 'F', 'R', 'F', 'L', '-', 'F', '-', 'R', 'F', 'L', 'F', 'R', '+', 'F', '+', 'L', 'F', 'R', 'F', 'L', ],
			"R": ['R', 'F', 'L', 'F', 'R', '+', 'F', '+', 'L', 'F', 'R', 'F', 'L', '-', 'F', '-', 'R', 'F', 'L', 'F', 'R', ]
		}
	});
	this.actionsDecoder = {
		'-': {'turtleAction':'turn', 'parameter':90},//left turn
		'+': {'turtleAction':'turn', 'parameter':-90},//right turn
		'F': {'turtleAction':'move'} //draw straight
	}
	this.power = power;
	this.path = ['F'].concat(this.getDrawnPath(power))
};
var cCurve = function(power, angle){
	// http://en.wikipedia.org/wiki/L%C3%A9vy_C_curve
	this.init({
		'skips':[],
		'axiom': ["F"],
		'rules': {
			"F": ['+', 'F', '-', '-', 'F', '+']
		}
	});
	this.actionsDecoder = {
		'-': {'turtleAction':'turn', 'parameter':angle},//left turn
		'+': {'turtleAction':'turn', 'parameter':-angle},//right turn
		'F': {'turtleAction':'move'} //draw straight
	}
	this.power = power;
	this.path = ['F'].concat(this.getDrawnPath(power))
};
HilbertCurve.prototype = PeanoCurve.prototype = cCurve.prototype = new LindenmayerCurve();

Turtle.prototype.drawFractalCurve = function(cfg, curve) {
	// power, penColor, step, penSize
	var that = this;
	this.penColor(cfg.penColor);
	this.penSize(cfg.penSize);
	this.penDown();

	curve.path.forEach(function(action){
		var data = curve.actionsDecoder[action]
		if (data.turtleAction === 'turn'){
			// console.error(cfg)
			that.turn(data.parameter);
		} else if (data.turtleAction === 'move'){
			// console.error(cfg)
			that.move( cfg.step );
		}
	});

	this.penUp();
}

Turtle.prototype.drawHilbert = function(cfg) {
	// power, penColor, step, penSize
	this.drawFractalCurve(cfg, new HilbertCurve(cfg.power))
}

Turtle.prototype.drawPeano = function(cfg) {
	// power, penColor, step, penSize
	this.drawFractalCurve(cfg, new PeanoCurve(cfg.power))
}

Turtle.prototype.drawCCurve = function(cfg) {
	// power, penColor, step, penSize
	this.drawFractalCurve(cfg, new cCurve(cfg.power, cfg.angle));
}


return Turtle;
})();

window.addEventListener('load', function(){
	var turtle = new Turtle('HilbertStage');
	turtle.resetPosition(100,100);
	turtle.drawHilbert({
		'power':3,
		'step': 25,
		'penColor':'blue',
		'penSize': 5
	});
	turtle.resetPosition(100-12,100+12);
	turtle.drawHilbert({
		'power':2,
		'step': 50,
		'penColor':'green',
		'penSize': 3
	});
	turtle.resetPosition(100-25-12, 100+25+12);
	turtle.drawHilbert({
		'power':1,
		'step': 100,
		'penColor':'red',
		'penSize': 1
	});
	// Peano Curve
	turtle = new Turtle('PeanoStage');
	turtle.resetPosition(100,100);
	turtle.drawPeano({
		'power':3,
		'step': 10,
		'penColor':'black',
		'penSize': 3
	});
	//cCurve
	turtle = new Turtle('cCurveStage');
	turtle.resetPosition(100,200);
	turtle.drawCCurve({
		'power':7,
		'step': 15,
		'penColor':'blue',
		'penSize': 5,
		'angle': 45
	});
	turtle.resetPosition(112,200);
	turtle.drawCCurve({
		'power':5,
		'step': 10,
		'penColor':'black',
		'penSize': 1,
		'angle': 30
	});
	turtle.resetPosition(150,350);
	turtle.drawCCurve({
		'power':7,
		'step': 15,
		'penColor':'red',
		'penSize': 5,
		'angle': 50
	});
	// turtle.resetPosition(100-12,100+12);
	// turtle.drawHilbert({
	// 	'power':2,
	// 	'step': 50,
	// 	'penColor':'green',
	// 	'penSize': 3
	// });
	// turtle.resetPosition(100-25-12, 100+25+12);
	// turtle.drawHilbert({
	// 	'power':1,
	// 	'step': 100,
	// 	'penColor':'red',
	// 	'penSize': 1
	// });
	// turtle.resetPosition(0,0);
}, false );
