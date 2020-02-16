var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

console. logOnce = function(parameter) {
	/*
	Logs the value to the console, but only the first time it is called.
	Note that if you call this function from multiple places in the code, it will log once for each of those places.
	*/
	var trace = new Error().stack;
	console.traces = console.traces || [];
	if(!console.traces.contains(trace)) {
		console.traces.push(trace);
		console. log(parameter);
	}
};
console. errorOnce = function(parameter) {
	/*
	It's like console.logOnce() but it's for errors. See console.logOnce()
	*/
	var trace = new Error().stack;
	console.traces = console.traces || [];
	if(!console.traces.contains(trace)) {
		console.traces.push(trace);
		console. error(parameter);
	}
};
CanvasRenderingContext2D.prototype.fillArc = function(x, y, radius, startAngle, endAngle) {
	this.beginPath();
	this.moveTo(x, y);
	this.arc(x, y, radius, startAngle, endAngle);
	this.lineTo(x, y);
	this.fill();
};
CanvasRenderingContext2D.prototype.strokeArc = function(x, y, r, start, end, antiClockwise) {
	this.beginPath();
	this.arc(x, y, r, start, end, antiClockwise);
	this.stroke();
};
CanvasRenderingContext2D.prototype.clipArc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
	this.beginPath();
	this.moveTo(x, y);
	this.arc(x, y, radius, startAngle, endAngle);
	this.lineTo(x, y);
	this.clip();
};
CanvasRenderingContext2D.prototype.circle = function(x, y, r) {
	this.arc(x, y, r, Math.toRadians(0), Math.toRadians(360));
};
CanvasRenderingContext2D.prototype.fillCircle = function(x, y, r) {
	this.beginPath();
	this.arc(x, y, r, Math.toRadians(0), Math.toRadians(360));
	this.fill();
};
CanvasRenderingContext2D.prototype.strokeCircle = function(x, y, r) {
	this.beginPath();
	this.arc(x, y, r, Math.toRadians(0), Math.toRadians(360));
	this.stroke();
};
CanvasRenderingContext2D.prototype.clipCircle = function(x, y, r) {
	this.beginPath();
	this.arc(x, y, r, Math.toRadians(0), Math.toRadians(360));
	this.clip();
};
CanvasRenderingContext2D.prototype.fillEllipse = function(x, y, w, h) {
	/*
	This does NOT create a real ellipse! It just stretches a circle to make a kind of oval.
	*/
	this.save(); {
		this.translate(x, y);
		this.scale(w, h);
		this.fillCircle(0, 0, 1);
	} this.restore();
};
CanvasRenderingContext2D.prototype.line = function() {
	/*
	Can be used to draw a line or a series of lines.

	Possible parameters:
	- Numbers (alternating x and y values)
	- Objects with x and y properties for each point
	- Array of objects with x and y properties
	*/
	if(Array.isArray(arguments[0])) {
		/* assume the input is an array of objects */
		this.polygon.apply(this, arguments[0]);
	}
	else if(typeof arguments[0] === "object") {
		/* assume each of the arguments is an object */
		this.moveTo(arguments[0].x, arguments[0].y);
		for(var i = 0; i < arguments.length; i ++) {
			this.lineTo(arguments[i].x, arguments[i].y);
		}
	}
	else if(typeof arguments[0] === "number") {
		/* assume all inputs are numbers */
		this.moveTo(arguments[0], arguments[1]);
		for(var i = 2; i < arguments.length; i += 2) {
			this.lineTo(arguments[i], arguments[i + 1]);
		}
	}
};
CanvasRenderingContext2D.prototype.strokeLine = function() {
	/*
	Can be used to stroke a line or a series of lines. Similar to polygon() but it doesn't automatically close the path (and it outlines the path).
	*/
	this.beginPath();
	this.line.apply(this, arguments);
	this.stroke();
};
CanvasRenderingContext2D.prototype.polygon = function() {
	/* draw lines connecting all vertices + close path to form polygon */
	this.line.apply(this, arguments);
	this.closePath();
};
CanvasRenderingContext2D.prototype.fillPoly = function() {
	/*
	Arguments can be objects with 'x' and 'y' properties or numbers with each argument being either the x or the y, starting with x.
	*/
	this.beginPath();
	this.polygon.apply(this, arguments);
	this.fill();
};
CanvasRenderingContext2D.prototype.invertPath = function() {
	/*
	Inverts the canvas path. Drawing a line on each of the canvas boundaries will, for any point on the canvas, increase the number of lines crossed by 1. When using the "evenodd" fill rule, this will toggle whether the point is in the path or not.

	Calling this multiple times on the same path does not work for some reason.

	The evenodd fillrule MUST be used in order for this function to work as intended.
	*/
	const DISTANCE_OFFSCREEN = 8000;
	this.moveTo(-DISTANCE_OFFSCREEN, -DISTANCE_OFFSCREEN);
	this.lineTo(DISTANCE_OFFSCREEN, 0);
	this.lineTo(DISTANCE_OFFSCREEN, DISTANCE_OFFSCREEN);
	this.lineTo(-DISTANCE_OFFSCREEN, DISTANCE_OFFSCREEN);
	this.lineTo(-DISTANCE_OFFSCREEN, -DISTANCE_OFFSCREEN);
};
CanvasRenderingContext2D.prototype.loadTextStyle = function(textStyle) {
	if(typeof textStyle.fillStyle === "string") {
		this.fillStyle = textStyle.fillStyle;
	}
	else if(typeof textStyle.color === "string") {
		this.fillStyle = textStyle.color;
	}
	this.textAlign = textStyle.textAlign || "left";
	this.font = textStyle.font || "20px monospace";
};
CanvasRenderingContext2D.prototype.displayTextOverLines = function(text, x, y, width, lineHeight) {
	if(Array.isArray(text)) {
		/* array of strings -> put a line break between each array item + any other line breaks needed to make space */
		var lines = text.clone();
	}
	else {
		var lines = [text];
	}
	/* Split text into multiple lines */
	for(var i = 0; i < lines.length; i ++) {
		var currentLine = lines[i];
		while(this.measureText(currentLine).width > width) {
			forLoop: for(var j = currentLine.length; j > 0; j --) {
				if(currentLine.substring(j, j + 1) == " ") {
					var nextLine = lines[i + 1];
					if(nextLine === undefined) {
						nextLine = "";
					}
					movedWord = currentLine.substring(j + 1, Infinity);
					movedWord = movedWord.trim();
					currentLine = currentLine.substring(0, j);
					nextLine = movedWord + " " + nextLine;
					lines[i] = currentLine;
					lines[i + 1] = nextLine;
					break forLoop;
				}
			}
			currentLine = lines[i];
		}
	}
	/* Display the split text */
	var lineY = y;
	for(var i = 0; i < lines.length; i ++) {
		this.fillText(lines[i], x, lineY);
		lineY += lineHeight;
	}
};
CanvasRenderingContext2D.prototype.fillCanvas = function(color) {
	/*
	Fills the entire canvas with the current fillStyle.
	*/
	this.save(); {
		this.resetTransform();
		if(typeof color === "string") {
			this.fillStyle = color;
		}
		this.fillRect(0, 0, this.canvas.width, this.canvas.height);
	} this.restore();
};
CanvasRenderingContext2D.prototype.resetTransform = function() {
	this.setTransform(1, 0, 0, 1, 0, 0);
};
Object.prototype.clone = function() {
	var clone = new this.constructor();
	for(var i in this) {
		if(this.hasOwnProperty(i)) {
			if(typeof this[i] === "object" && this[i] !== null) {
				clone[i] = this[i].clone();
			}
			else {
				clone[i] = this[i];
			}
		}
	}
	return clone;
};
Function.prototype.extend = function(parent) {
	/*
	Sets this to inherit all METHODS belonging to 'parent'. Note that if you want objects to inherit properties, you have to use 'parent.call(this)' in the constructor.
	*/
	this.prototype = Object.create(parent.prototype);
	this.prototype.constructor = this;
	return this;
};
Function.prototype.method = function(name, method) {
	this.prototype[name] = method;
	return this;
};
Array.prototype.contains = function(obj) {
	for(var i = 0; i < this.length; i ++) {
		if(this[i] === obj) {
			return true;
		}
	}
	return false;
};
Array.prototype.removeAll = function(item) {
	for(var i = 0; i < this.length; i ++) {
		if(this[i] === item) {
			this.splice(i, 1);
			i --;
		}
	}
};
Array.prototype.removeAllInstances = function(constructor) {
	for(var i = 0; i < this.length; i ++) {
		if(this[i] instanceof constructor) {
			this.splice(i, 1);
			i --;
		}
	}
};
Array.prototype.swap = function(index1, index2) {
	var previousIndex1 = this[index1];
	this[index1] = this[index2];
	this[index2] = previousIndex1;
};
Array.prototype.randomItem = function() {
	return this[this.randomIndex()];
};
Array.prototype.randomIndex = function() {
	return Math.floor(Math.random() * this.length);
};
Array.prototype.getItemsWithProperty = function(propertyName, propertyValue) {
	if(propertyValue === undefined) {
		/* return the items that have the property, regardless of value */
		var itemsFound = [];
		for(var i = 0; i < this.length; i ++) {
			if(this[i].hasOwnProperty(propertyName) && this[i][propertyName] !== undefined) {
				itemsFound.push(this[i]);
			}
		}
		return itemsFound;
	}
	else {
		/* return the items whose properties match the value */
		var itemsFound = [];
		for(var i = 0; i < this.length; i ++) {
			if(this[i].hasOwnProperty(propertyName) && this[i][propertyName] === propertyValue) {
				itemsFound.push(this[i]);
			}
		}
		return itemsFound;
	}
};
Array.prototype.removeItemsWithProperty = function(propertyName, propertyValue) {
	if(propertyValue === undefined) {
		/* return the items that have the property, regardless of value */
		var itemsFound = [];
		for(var i = 0; i < this.length; i ++) {
			if(this[i].hasOwnProperty(propertyName) && this[i][propertyName] !== undefined) {
				this.splice(i, 1);
				i --;
			}
		}
		return itemsFound;
	}
	else {
		/* return the items whose properties match the value */
		var itemsFound = [];
		for(var i = 0; i < this.length; i ++) {
			if(this[i].hasOwnProperty(propertyName) && this[i][propertyName] === propertyValue) {
				this.splice(i, 1);
				i --;
			}
		}
		return itemsFound;
	}
};
Array.prototype.includesItemsWithProperty = function(propertyName, propertyValue) {
	return (this.getItemsWithProperty(propertyName, propertyValue).length !== 0);
};
Array.prototype.getObjectsByType = function(constructor) {
	var objects = [];
	for(var i = 0; i < this.length; i ++) {
		if(this[i] instanceof constructor) {
			objects.push(this[i]);
		}
	}
	return objects;
};
Number.prototype.mod = function(divisor) {
	/*
	This is used instead of the % operator because % returns negatives for negative numbers. (ex: -5 % 10 === -5)

	This is on the number prototype instead of Math since it seems more like an arithmetic operation than the Math functions.
	*/

	return ((this % divisor) + divisor) % divisor;
};
Math.average = function(values) {
	if(Array.isArray(arguments[0])) {
		return Math.average.apply(Math, arguments);
	}
	var sum = 0;
	for(var i = 0; i < arguments.length; i ++) {
		sum += arguments[i];
	}
	return sum / arguments.length;
};
Math.dist = function(x1, y1, x2, y2) {
	if(arguments.length === 4) {
		return Math.hypot(x1 - x2, y1 - y2); // 2-dimensional distance
	}
	else if(arguments.length === 2) {
		return Math.abs(arguments[0] - arguments[1]); // 1-dimensional distance
	}
};
Math.distSq = function(x1, y1, x2, y2) {
	/*
	Returns the distance between the points squared for better performance.
	*/
	var dx = x1 - x2;
	var dy = y1 - y2;
	return (dx * dx) + (dy * dy);
};
Math.map = function(value, min1, max1, min2, max2) {
	/*
	Maps 'value' from range ['min1' - 'max1'] to ['min2' - 'max2']
	*/
	return (value - min1) / (max1 - min1) * (max2 - min2) + min2;
};
Math.toRadians = function(deg) {
	return deg / 180 * Math.PI;
};
Math.toDegrees = function(rad) {
	return rad / Math.PI * 180;
};
Math.rotateDegrees = function(x, y, deg) {
	var rad = Math.toRadians(deg);
	return Math.rotate(x, y, rad);
};
Math.rotate = function(x, y, rad) {
	return {
		x: x * Math.cos(rad) - y * Math.sin(rad),
		y: x * Math.sin(rad) + y * Math.cos(rad)
	};
};
Math.rotateAboutPoint = function(x, y, pointX, pointY, degrees) {
	x -= pointX;
	y -= pointY;
	var rotated = Math.rotateDegrees(x, y, degrees);
	return {
		x: rotated.x + pointX,
		y: rotated.y + pointY
	};
};
Math.scale = function(x, y, scaleFactorX, scaleFactorY) {
	/*
	Returns ('x', 'y') scaled by 'scaleFactorX' and 'scaleFactorY' about the origin.
	*/
	scaleFactorY = scaleFactorY || scaleFactorX;
	return {
		x: x * scaleFactorX,
		y: y * scaleFactorY
	}
};
Math.scaleAboutPoint = function(x, y, pointX, pointY, scaleFactorX, scaleFactorY) {
	scaleFactorY = scaleFactorY || scaleFactorX;
	var scaledPoint = { x: x, y: y };
	scaledPoint.x -= pointX;
	scaledPoint.y -= pointY;
	scaledPoint = Math.scale(scaledPoint.x, scaledPoint.y, scaleFactorX, scaleFactorY);
	scaledPoint.x += pointX;
	scaledPoint.y += pointY;
	return scaledPoint;
};
Math.findPointsCircular = function(x, y, r, includeInsideCircle) {
	var circularPoints = [];
	if(includeInsideCircle) {
		for(var X = x - r; X < x + r; X ++) {
			for(var Y = y - r; Y < y + r; Y ++) {
				if(Math.distSq(x, y, X, Y) <= r * r) {
					circularPoints.push({ x: X, y: Y });
				}
			}
		}
		return circularPoints;
	}
	/* top right quadrant */
	for(var X = x; X < x + r; X ++) {
		for(var Y = y - r; Y < y; Y ++) {
			if(Math.floor(Math.dist(x, y, X, Y)) === r - 1) {
				circularPoints.push({x: X, y: Y});
			}
		}
	}
	/* bottom right quadrant */
	for(var X = x + r; X > x; X --) {
		for(var Y = y; Y < y + r; Y ++) {
			if(Math.floor(Math.dist(x, y, X, Y)) === r - 1) {
				circularPoints.push({x: X, y: Y});
			}
		}
	}
	/* bottom left */
	for(var X = x; X > x - r; X --) {
		for(var Y = y + r; Y > y; Y --) {
			if(Math.floor(Math.dist(x, y, X, Y)) === r - 1) {
				circularPoints.push({x: X, y: Y});
			}
		}
	}
	/* top left */
	for(var X = x - r; X < x; X ++) {
		for(var Y = y; Y > y - r; Y --) {
			if(Math.floor(Math.dist(x, y, X, Y)) === r - 1) {
				circularPoints.push({x: X, y: Y});
			}
		}
	}
	return circularPoints;
};
Math.findPointsLinear = function(x1, y1, x2, y2) {
	/*
	Returns all points on a line w/ endpoints ('x1', 'y1') and ('x2', 'y2') rounded to nearest integer.
	*/
	var inverted = false;
	/* Swap x's and y's if the line is closer to vertical than horizontal */
	if(Math.abs(x1 - x2) < Math.abs(y1 - y2)) {
		inverted = true;
		[x1, y1] = [y1, x1];
		[x2, y2] = [y2, x2];
	}
	/* Calculate line slope */
	var m = Math.abs(y1 - y2) / Math.abs(x1 - x2);
	/* Find points on line */
	var linearPoints = [];
	if(x1 < x2) {
		if(y1 < y2) {
			var y = y1;
			for(var x = x1; x < x2; x ++) {
				y += m;
				linearPoints.push({x: x, y: y});
			}
		}
		else if(y2 < y1) {
			var y = y2;
			for(var x = x2; x > x1; x --) {
				y += m;
				linearPoints.push({x: x, y: y});
			}
		}
	}
	else if(x2 < x1) {
		if(y1 < y2) {
			var y = y1;
			for(var x = x1; x > x2; x --) {
				y += m;
				linearPoints.push({x: x, y: y});
			}
		}
		else if(y2 < y1) {
			var y = y2;
			for(var x = x2; x < x1; x ++) {
				y += m;
				linearPoints.push({x: x, y: y});
			}
		}
	}
	if(x1 === x2) {
		for(var y = (y1 < y2) ? y1 : y2; y < (y1 < y2) ? y2 : y1; y ++) {
			linearPoints.push({x: x1, y: y});
		}
	}
	else if(y1 === y2) {
		if(x1 < x2) {
			for(var x = x1; x < x2; x ++) {
				linearPoints.push({x: x, y: y1});
			}
		}
		if(x2 < x1) {
			for(var x = x2; x < x1; x ++) {
				linearPoints.push({x: x, y: y1});
			}
		}
	}
	/* Swap it again to cancel out previous swap and return */
	if(inverted) {
		for(var i = 0; i < linearPoints.length; i ++) {
			[linearPoints[i].x, linearPoints[i].y] = [linearPoints[i].y, linearPoints[i].x];
		}
	}
	return linearPoints;
};
Math.constrain = function(num, min, max) {
	/*
	Returns 'num' constrained to be between 'min' and 'max'.
	*/
	num = Math.min(num, max);
	num = Math.max(num, min);
	return num;
};
Math.randomInRange = function(min, max) {
	/*
	Returns a random number between 'min' and 'max', including 'min' but excluding 'max'.
	*/
	return Math.map(Math.random(), 0, 1, min, max);
};
Math.normalize = function(x, y) {
	/*
	Scales the point ('x', 'y') so that it is 1 pixel away from the origin.
	*/
	var dist = Math.dist(0, 0, x, y);
	return {
		x: x / dist,
		y: y / dist
	};
};
Math.roundToAccuracy = function(value, numDecimalPlaces) {
	var power = Math.pow(10, numDecimalPlaces);
	return Math.round(value * power) / power;
};

var randomSurvivalGame = {
	/*
	Things that need to be initialized before everything else. (Most of the actual program is in the statement after this one.)
	*/
	utils: {
		initializer: {
			/*
			This object allows you to request for things to be initialized while inside an object declaration.
			*/
			initFuncs: [],
			request: function(func) {
				this.initFuncs.push(func);
				return false;
			},
			initializeEverything: function() {
				while(this.initFuncs.length > 0) {
					for(var i = 0; i < this.initFuncs.length; i ++) {
						try {
							this.initFuncs[i]();
							this.initFuncs.splice(i, 1);
							i --;
						}
						catch(error) {
							/* This function was initalized in the wrong order, so skip it and come back later when more things have been initialized */
						}
					}
				}
			}
		}
	},
	events: {
		Enemy: function() {}
	}
};
randomSurvivalGame = {
	FPS: 60,
	gameLoop: function() {
		/*
		This method is the root of the call stack for the entire program. It is invoked using setInterval().
		*/
		randomSurvivalGame.utils.canvas.resize();
		c.fillCanvas(randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY);
		if(randomSurvivalGame.game.screen === "home") {
			randomSurvivalGame.ui.homeScreen();
		}
		else if(randomSurvivalGame.game.screen === "play") {
			randomSurvivalGame.game.exist();
		}
		else if(randomSurvivalGame.game.screen === "death") {
			randomSurvivalGame.ui.deathScreen();
		}
		else if(randomSurvivalGame.game.screen === "shop") {
			randomSurvivalGame.ui.shopScreen();
		}
		else if(randomSurvivalGame.game.screen === "achievements") {
			randomSurvivalGame.ui.achievementsScreen();
		}
		randomSurvivalGame.events.loadChatMessages();
		for(var i = 0; i < randomSurvivalGame.achievements.listOfAchievements.length; i ++) {
			randomSurvivalGame.achievements.listOfAchievements[i].checkProgress();
		}
		randomSurvivalGame.debugging.displayTestingModeWarning();
		randomSurvivalGame.ui.transitions.display();
		randomSurvivalGame.ui.transitions.update();

		document.body.style.cursor = randomSurvivalGame.input.mouse.cursor;
		randomSurvivalGame.input.mouse.cursor = "default";
		randomSurvivalGame.utils.frameCount ++;
		randomSurvivalGame.utils.pastInputs.update();
	},

	utils: {
		frameCount: 0,
		canvas: {
			/*
			Utilities related to drawing on the canvas. (Most of these have actually been moved to the CanvasRenderingContext2D prototype.)
			*/
			resize: function() {
				var size = Math.min(window.innerWidth, window.innerHeight);
				if(window.innerWidth < window.innerHeight) {
					canvas.style.left = "0px";
					canvas.style.top = ((window.innerHeight / 2) - (size / 2)) + "px";
					canvas.style.width = "100%";
					canvas.style.height = "";
				}
				else {
					canvas.style.left = ((window.innerWidth / 2) - (size / 2) + "px");
					canvas.style.top = "0px";
					canvas.style.width = "";
					canvas.style.height = "100%";
				}
			}
		},
		pastInputs: {
			/*
			Utility variables used for remembering the values of inputs 1 frame ago.
			*/
			mouse: {
				x: 0,
				y: 0,
				pressed: false
			},
			keys: [],
			update: function() {
				this.mouse.x = randomSurvivalGame.input.mouse.x;
				this.mouse.y = randomSurvivalGame.input.mouse.y;
				this.mouse.pressed = randomSurvivalGame.input.mouse.pressed;
				for(var i = 0; i < randomSurvivalGame.input.keys.length; i ++) {
					this.keys[i] = randomSurvivalGame.input.keys[i];
				}
			}
		},
		initializer: randomSurvivalGame.utils.initializer,

		geom: {
			Vector: function(x, y) {
				this.x = x;
				this.y = y;
			},
			Rectangle: function(x, y, w, h) {
				var Vector = randomSurvivalGame.utils.geom.vector;
				this.position = new Vector(x, y);
				this.size = new Vector(w, h);
			}
		},
		intersections: {
			rectangleRectangle: function(location1, dimension1, location2, dimension2) {
				return (
					location1.x + dimension1.x > location2.x &&
					location1.x < location2.x + dimension2.x &&
					location1.y + dimension1.y > location2.y &&
					location1.y < location2.y + dimension2.y
				);
			},
			pointRectangle: function(point, rectLocation, rectDimension) {
				return (
					point.x > rectLocation.x &&
					point.x < rectLocation.x + rectLocation.w &&
					point.y > rectLocation.y &&
					point.y < rectLocation.y + rectLocation.h
				);
			}
		},
		collisions: {
			rect: function(x, y, w, h, settings) {
				settings = settings || {};
				settings.velX = settings.velX || 0; // velocity of object requesting collisions
				settings.velY = settings.velY || 0;
				settings.caller = settings.caller || null; // object requesting collisions
				settings.sides = settings.sides || ["top", "bottom", "left", "right"];
				settings.includedTypes = settings.includedTypes || null; // if provided, this parameter will exclude all types of objects other than those given.
				settings.excludedTypes = settings.excludedTypes || null; // if provided, this parameter will exclude the types of objects given.
				settings.collisionRequirements = settings.collisionRequirements || function(obj) { return true; };

				var objects = randomSurvivalGame.game.objects;
				objectLoop: for(var i = 0; i < objects.length; i ++) {
					var obj = objects[i];
					if(obj instanceof randomSurvivalGame.game.Player && randomSurvivalGame.game.player.isIntangible()) {
						continue;
					}

					if(Array.isArray(settings.excludedTypes)) {
						for(var j = 0; j < settings.excludedTypes.length; j ++) {
							if(obj instanceof settings.excludedTypes[j]) {
								continue objectLoop;
							}
						}
					}
					if(Array.isArray(settings.includedTypes)) {
						var isIncluded = false;
						innerLoop: for(var j = 0; j < settings.includedTypes.length; j ++) {
							if(obj instanceof settings.includedTypes[j]) {
								isIncluded = true;
								break innerLoop;
							}
						}
						if(!isIncluded) {
							continue objectLoop;
						}
					}

					if(settings.collisionRequirements(obj) !== true) {
						continue;
					}

					if(
						obj.hitbox !== undefined && obj.hitbox !== null &&
						typeof obj.hitbox === "object" &&
						typeof obj.handleCollision === "function" &&
						obj !== settings.caller &&
						!obj.noCollisions
					) {
						const MINIMUM_COLLISION_BUFFER = 2;
						var collisionBuffer = { top: 5, bottom: 5, left: 5, right: 5 };
						if(obj.hasOwnProperty("velY")) {
							collisionBuffer.top = obj.velY - settings.velY + MINIMUM_COLLISION_BUFFER;
							collisionBuffer.bottom = settings.velY - obj.velY + MINIMUM_COLLISION_BUFFER;
						}
						if(obj.hasOwnProperty("velX")) {
							collisionBuffer.left = obj.velX - settings.velX + MINIMUM_COLLISION_BUFFER;
							collisionBuffer.right = settings.velX - obj.velX + MINIMUM_COLLISION_BUFFER;
						}
						for(var j in collisionBuffer) {
							if(collisionBuffer.hasOwnProperty(j)) {
								collisionBuffer[j] = Math.max(collisionBuffer[j], 5);
							}
						}
						if(
							obj.x + obj.hitbox.right >= x &&
							obj.x + obj.hitbox.left <= x + w &&
							obj.y + obj.hitbox.bottom >= y &&
							obj.y + obj.hitbox.bottom <= y + collisionBuffer.top &&
							settings.sides.includes("top")
						) {
							obj.y = Math.min(obj.y, y - obj.hitbox.bottom) + 1;
							obj.handleCollision("floor", settings.caller);
						}
						else if(
							obj.x + obj.hitbox.right >= x &&
							obj.x + obj.hitbox.left <= x + w &&
							obj.y + obj.hitbox.top <= y + h &&
							obj.y + obj.hitbox.top >= y + h - collisionBuffer.bottom &&
							settings.sides.includes("bottom")
						) {
							obj.y = Math.max(obj.y, y + h - obj.hitbox.top);
							obj.handleCollision("ceiling", settings.caller);
						}
						else if(
							obj.y + obj.hitbox.bottom >= y &&
							obj.y + obj.hitbox.top <= y + h &&
							obj.x + obj.hitbox.right >= x &&
							obj.x + obj.hitbox.right <= x + collisionBuffer.left &&
							settings.sides.includes("left")
						) {
							obj.x = Math.min(obj.x, x - obj.hitbox.right);
							obj.handleCollision("wall-to-right", this);
						}
						else if(
							obj.y + obj.hitbox.bottom >= y &&
							obj.y + obj.hitbox.top <= y + h &&
							obj.x + obj.hitbox.left <= x + w &&
							obj.x + obj.hitbox.left >= x + w - collisionBuffer.right &&
							settings.sides.includes("right")
						) {
							obj.x = Math.max(obj.x, x + w - obj.hitbox.left);
							obj.handleCollision("wall-to-left", this);
						}
					}
				}

				randomSurvivalGame.debugging.hitboxes.push({
					type: "rect",
					color: "blue",
					x: x, y: y, w: w, h: h,
					sides: settings.sides
				});
			}
		},
		killCollisions: {
			rect: function(x, y, w, h, deathCause) {
				var p = randomSurvivalGame.game.player;
				if(
					p.x + p.hitbox.right > x &&
					p.x + p.hitbox.left < x + w &&
					p.y + p.hitbox.bottom > y &&
					p.y + p.hitbox.top < y + h
				) {
					p.die(deathCause);
				}

				randomSurvivalGame.debugging.hitboxes.push({
					type: "rect",
					color: "red",
					x: x, y: y, w: w, h: h,
					sides: ["top", "bottom", "left", "right"]
				});
			},
			circle: function(x, y, r, deathCause) {
				var p = randomSurvivalGame.game.player;
				var radiusSq = r * r;
				if(
					Math.distSq(p.x + p.hitbox.left, p.y + p.hitbox.top, x, y) < radiusSq ||
					Math.distSq(p.x + p.hitbox.right, p.y + p.hitbox.top, x, y) < radiusSq ||
					Math.distSq(p.x + p.hitbox.left, p.y + p.hitbox.bottom, x, y) < radiusSq ||
					Math.distSq(p.x + p.hitbox.right, p.y + p.hitbox.bottom, x, y) < radiusSq
				) {
					p.die(deathCause);
				}

				randomSurvivalGame.debugging.hitboxes.push({
					type: "circle",
					color: "red",
					x: x, y: y, radius: r
				});
			},
			point: function(x, y, deathCause) {
				var p = randomSurvivalGame.game.player;
				if(
					x > p.x + p.hitbox.left &&
					x < p.x + p.hitbox.right &&
					y > p.y + p.hitbox.top &&
					y < p.y + p.hitbox.bottom
				) {
					p.die(deathCause);
				}

				randomSurvivalGame.debugging.hitboxes.push({
					type: "rect",
					color: "red",
					x: x - 1, y: y - 1, w: 2, h: 2,
					sides: ["top", "bottom", "left", "right"]
				});
			},
			line: function(x1, y1, x2, y2, deathCause) {
				var points = Math.findPointsLinear(x1, y1, x2, y2);
				for(var i = 0; i < points.length; i ++) {
					randomSurvivalGame.utils.killCollisions.point(points[i].x, points[i].y, deathCause);
				}
			}
		},

		sort: function(array, comparison) {
			/*
			Used when JavaScript's Array.sort() doesn't work because of sorting instability or strange comparison functions. Implements Selection Sort. (Unused)
			*/
			var numSorted = 0;
			while(numSorted < array.length) {
				var lowest = numSorted;
				for(var i = numSorted; i < array.length; i ++) {
					if(comparison(array[lowest], array[i]) == 1) {
						lowest = i;
					}
				}
				array.swap(numSorted, lowest);
				numSorted ++;
			}
			return array;
		},
		sortByType: function(array, types) {
			/*
			Uses bucket sort to sort the array by the types of objects in it. "types" parameter is a nested array of the form:
			[ [Foo, Bar], [Baz, Qux] ]
			to sort objects of type Foo and Bar before objects of type Baz and Qux. Objects that aren't specified by "types" will go to the end of the list.
			*/
			var buckets = [];
			for(var i = 0; i < types.length + 1; i ++) {
				buckets[i] = [];
			}
			/* place objects in buckets */
			outerLoop: for(var i = 0; i < array.length; i ++) {
				var obj = array[i];
				for(var j = 0; j < types.length; j ++) {
					for(var k = 0; k < types[j].length; k ++) {
						if(obj instanceof types[j][k]) {
							buckets[j].push(obj);
							continue outerLoop;
						}
					}
				}
				/* object is not in "types" - place at end of array */
				buckets[buckets.length - 1].push(obj);
			}
			/* put objects in buckets back into original array */
			return Array.prototype.concat.apply([], buckets);
		},

		mouseInRect: function(x, y, w, h) {
			var mouse = randomSurvivalGame.input.mouse;
			return (mouse.x > x && mouse.x < x + w && mouse.y > y && mouse.y < y + h);
		},
		mouseInCircle: function(x, y, r) {
			var mouse = randomSurvivalGame.input.mouse;
			return Math.distSq(mouse.x, mouse.y, x, y) <= (r * r);
		},

		isPointInPlayer: function(x, y) {
			var p = randomSurvivalGame.game.player;
			return (x > p.x + p.hitbox.left && x < p.x + p.hitbox.right && y > p.y + p.hitbox.top && y < p.y + p.hitbox.bottom);
		},
		isPlayerInRect: function(x, y, w, h) {
			var p = randomSurvivalGame.game.player;
			return (
				p.x + p.hitbox.right > x &&
				p.x + p.hitbox.left < x + w &&
				p.y + p.hitbox.bottom > y &&
				p.y + p.hitbox.top < y + h
			);
		},
		collidesWith: function(obj1, obj2) {
			if((typeof obj1.hitbox !== "object" || obj1.hitbox === null) || (typeof obj2.hitbox !== "object" || obj2.hitbox === null)) {
				return false;
			}
			return (
				obj1.x + obj1.hitbox.right > obj2.x + obj2.hitbox.left &&
				obj1.x + obj1.hitbox.left < obj2.x + obj2.hitbox.right &&
				obj1.y + obj1.hitbox.bottom > obj2.y + obj2.hitbox.top &&
				obj1.y + obj1.hitbox.top < obj2.y + obj2.hitbox.bottom
			);
		},
		isObjectInRect: function(obj, x, y, w, h) {
			if(typeof obj.hitbox !== "object" || obj.hitbox === null) {
				return false;
			}
			return (
				obj.x + obj.hitbox.left > x &&
				obj.x + obj.hitbox.right < x + w &&
				obj.y + obj.hitbox.bottom > y &&
				obj.y + obj.hitbox.top < y + h
			);
		}
	},
	input: {
		mouse: {
			x: 0,
			y: 0,
			pressed: false,
			cursor: "default" // (this one is actually output, not input)
		},
		keys: [],
		getMousePos: function(event) {
			var canvasRect = canvas.getBoundingClientRect();
			randomSurvivalGame.input.mouse.x = Math.map(
				event.clientX,
				canvasRect.left, canvasRect.right,
				0, canvas.width
			);
			randomSurvivalGame.input.mouse.y = Math.map(
				event.clientY,
				canvasRect.top, canvasRect.bottom,
				0, canvas.height
			);
		},
		initialized: randomSurvivalGame.utils.initializer.request(function() {
			document.body.onmousemove = function() {
				randomSurvivalGame.input.getMousePos(event);
			};
			document.body.onmousedown = function() {
				randomSurvivalGame.input.mouse.pressed = true;
			};
			document.body.onmouseup = function() {
				randomSurvivalGame.input.mouse.pressed = false;
			};
			document.body.onkeydown = function() {
				randomSurvivalGame.input.keys[event.which] = true;
			};
			document.body.onkeyup = function() {
				randomSurvivalGame.input.keys[event.which] = false;
			};
			randomSurvivalGame.input.initialized = true;
		})
	},

	ui: {
		Button: function(x, y, whereTo, icon) {
			this.x = x;
			this.y = y;
			this.whereTo = whereTo;
			this.icon = icon;
			this.mouseOver = false;
		}
		.method("display", function() {
			c.globalAlpha = 1;
			c.lineWidth = 5;
			if(this.icon === "play") {
				const BUTTON_SIZE = 75;
				this.resetAnimation = function() {
					this.iconScale = 1;
				};
				this.iconScale = this.iconScale || 1;
				/* button outline */
				c.strokeStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				c.lineWidth = 5;
				c.strokeCircle(this.x, this.y, BUTTON_SIZE);
				/* play button icon */
				c.save(); {
					c.translate(this.x, this.y);
					c.scale(this.iconScale, this.iconScale);
					c.fillStyle = randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY;
					c.fillPoly(
						-15, -22.5,
						-15, 22.5,
						30, 0
					);
				} c.restore();
				const SCALING_ANIMATION_SPEED = 0.1;
				if(this.mouseOver) {
					this.iconScale += SCALING_ANIMATION_SPEED;
				}
				else {
					this.iconScale -= SCALING_ANIMATION_SPEED;
				}
				const MIN_SCALE = 1;
				const MAX_SCALE = 1.5;
				this.iconScale = Math.constrain(this.iconScale, MIN_SCALE, MAX_SCALE);
			}
			else if(this.icon === "question") {
				const BUTTON_SIZE = 50;
				/* button outline */
				c.strokeStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				c.lineWidth = 5;
				c.fillCircle(this.x, this.y, BUTTON_SIZE);
				/* question mark */
				c.loadTextStyle({
					color: randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY,
					textAlign: "center"
				});
				c.save(); {
					c.translate(this.x, this.y);
					c.rotate(this.r);
					c.fillText("?", 0, 15);
				} c.restore();
				const MIN_ROTATION = 0.5;
				const MAX_ROTATION = 0;
				if(this.mouseOver && this.r < MIN_ROTATION) {
					this.r += 0.05;
				}
				if(!this.mouseOver && this.r > MAX_ROTATION) {
					this.r -= 0.05;
				}
			}
			else if(this.icon === "gear") {
				const BUTTON_SIZE = 50;
				/* button outline */
				c.strokeStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				c.lineWidth = 5;
				c.strokeCircle(this.x, this.y, BUTTON_SIZE);
				/* gear body */
				c.fillStyle = randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY;
				c.fillCircle(this.x, this.y, 20);
				/* gear prongs */
				for(var r = 0; r < 360; r += 360 / 9) {
					c.save(); {
						c.translate(this.x, this.y);
						c.rotate(Math.toRadians(r) + this.r);
						c.fillRect(-5, -28, 10, 28);
					} c.restore();
				}
				if(this.mouseOver) {
					this.r += 2;
				}
			}
			else if(this.icon === "dollar") {
				this.resetAnimation = function() {
					this.dollarIcons = [];
				};
				/* button outline */
				const BUTTON_SIZE = 50;
				c.strokeStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				c.lineWidth = 5;
				c.strokeCircle(this.x, this.y, BUTTON_SIZE);
				/* dollar sign */
				c.loadTextStyle({
					color: randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY,
					font: "50px cursive",
					textAlign: "center"
				});
				c.fillText("$", this.x, this.y + 15);
				/* dollar sign animation */
				this.dollarIcons = this.dollarIcons || [];
				if(this.mouseOver && randomSurvivalGame.utils.frameCount % 15 === 0) {
					this.dollarIcons.push({ x: Math.randomInRange(this.x - 50, this.x + 50), y: this.y - 50 });
				}
				if(this.dollarIcons.length > 0) {
					c.save(); {
						c.clipCircle(this.x, this.y, 50 - 1.5);
						c.loadTextStyle({
							color: randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY,
							font: "20px cursive",
							textAlign: "center"
						});
						for(var i = 0; i < this.dollarIcons.length; i ++) {
							c.fillText("$", this.dollarIcons[i].x, this.dollarIcons[i].y);
							this.dollarIcons[i].y += 3;
							if(this.dollarIcons[i].y > this.y + 100) {
								this.dollarIcons.splice(i, 1);
								i --;
							}
						}
					} c.restore();
				}
			}
			else if(this.icon === "trophy") {
				this.resetAnimation = function() {
					this.radii = [];
					this.shouldAddLightGraphic = false;
				};
				/* rays of light */
				const BUTTON_SIZE = 50;
				c.save(); {
					c.clipCircle(this.x, this.y, BUTTON_SIZE);
					this.radii = this.radii || [];
					if(this.mouseOver) {
						this.shouldAddLightGraphic = true;
					}
					if(this.shouldAddLightGraphic && (this.radii[0] > (BUTTON_SIZE / 2) || this.radii.length === 0)) {
						this.shouldAddLightGraphic = false;
						this.radii.unshift(0);
					}
					c.strokeStyle = "rgb(170, 170, 170)";
					for(var i = 0; i < this.radii.length; i ++) {
						this.radii[i] ++;
						if(this.radii[i] > BUTTON_SIZE + 10) {
							this.radii.splice(i, 1);
							i --;
							continue;
						}
						for(var r = 0; r < 360; r += 360 / 8) {
							c.strokeArc(this.x, this.y, this.radii[i], Math.toRadians(r - (360 / 8 / 4)), Math.toRadians(r + (360 / 8 / 4)));
						}
					}
				} c.restore();
				/* button outline */
				c.strokeStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				c.lineWidth = 5;
				c.strokeCircle(this.x, this.y, BUTTON_SIZE);
				/* trophy base */
				c.fillStyle = randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY;
				c.fillArc(this.x, this.y + 23, 13, Math.toRadians(-180), 0);
				/* trophy support */
				c.fillRect(this.x - 5, this.y - 2, 10, 20);
				/* trophy cup */
				c.save(); {
					c.translate(this.x, this.y - 22);
					c.scale(1, 1.5);
					c.fillArc(0, 0, 20, 0, Math.toRadians(180));
				} c.restore();
			}
			else if(this.icon === "house") {
				this.resetAnimation = function() {
					this.doorX = 0;
				};
				this.doorX = this.doorX || 0;
				/* button outline */
				const BUTTON_SIZE = 50;
				c.strokeStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				c.strokeCircle(this.x, this.y, BUTTON_SIZE);
				/* house icon */
				c.fillStyle = randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY;
				c.fillRect(this.x - 20, this.y - 15, 15, 35);
				c.fillRect(this.x - 20, this.y - 15, 40, 15);
				c.fillRect(this.x + 5, this.y - 15, 15, 35);
				c.fillPoly(
					this.x - 30, this.y - 10,
					this.x + 30, this.y - 10,
					this.x     , this.y - 30
				);
				/* animated door */
				c.fillRect(this.x + this.doorX - 6, this.y - 1, 12, 21);
				if(this.mouseOver) {
					if(this.doorX < 11) {
						this.doorX ++;
					}
				}
				else {
					if(this.doorX > 0) {
						this.doorX --;
					}
				}
			}
			else if(this.icon === "retry") {
				this.iconRotation = this.iconRotation || 0;
				this.resetAnimation = function() {
					this.iconRotation = 0;
				};
				/* button outline */
				const BUTTON_SIZE = 50;
				c.strokeStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				c.strokeCircle(this.x, this.y, BUTTON_SIZE);
				/* retry icon */
				c.save(); {
					c.translate(this.x, this.y);
					c.rotate(Math.toRadians(this.iconRotation));
					c.strokeStyle = randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY;
					c.strokeArc(0, 0, 30, Math.toRadians(90), Math.toRadians(360));
					c.fillPoly(
						15, 0,
						45, 0,
						30, 20
					);
				} c.restore();
				const ANIMATION_SPEED = 12;
				if(this.mouseOver) {
					this.iconRotation += ANIMATION_SPEED;
				}
				else {
					this.iconRotation -= ANIMATION_SPEED;
				}
				this.iconRotation = Math.constrain(this.iconRotation, 0, 90);
			}
			if(this.mouseOver) {
				randomSurvivalGame.input.mouse.cursor = "pointer";
			}
		})
		.method("hasMouseOver", function() {
			var mouse = randomSurvivalGame.input.mouse;
			var transitions = randomSurvivalGame.ui.transitions;

			if(transitions.opacity !== 0 && transitions.nextScreen === this.whereTo) {
				return true;
			}
			var buttonSize = (this.icon === "play" ? 75 : 50);
			return randomSurvivalGame.utils.mouseInCircle(this.x, this.y, buttonSize);
		})
		.method("checkForClick", function() {
			if(this.mouseOver && randomSurvivalGame.input.mouse.pressed && !randomSurvivalGame.utils.pastInputs.mouse.pressed) {
				randomSurvivalGame.ui.transitions.transitionToScreen(this.whereTo);
				if(this.icon === "retry" || this.icon === "play") {
					randomSurvivalGame.game.player.reset();
				}
				if(this.whereTo === "shop") {
					for(var i = 0; i < randomSurvivalGame.shop.items.length; i ++) {
						var item = randomSurvivalGame.shop.items[i];
						item.showingPopup = false;
					}
				}
			}
		})
		.method("exist", function() {
			this.display();
			this.mouseOver = this.hasMouseOver();
			this.checkForClick();
		}),

		DEATH_MESSAGES: {
			"laser": "You were shot by a laser.",
			"acid": "You fell into a pool of acid.",
			"boulder": "You were crushed by a boulder.",
			"spinning blades": "You were sliced in half.",
			"pirhanas": "You were bitten by a pirhana.",
			"pacmans": "You were killed by a pacman.",
			"rocket": "You were hit with a rocket.",
			"spikeballs": "You were sliced by a spikeball.",
			"spikewall": "You were impaled on a wall of spikes.",
			"laserbots": "You were zapped by a laserbot.",
			"bad guys": "The bad guys got you.",
			"aliens": "You were abducted by a UFO.",
			"fall": "You fell way too far."
		},
		COLORS: {
			UI_DARK_GRAY: "rgb(59, 67, 70)",
			STONE_DARK_GRAY: "rgb(100, 100, 100)",
			BACKGROUND_LIGHT_GRAY: "rgb(200, 200, 200)"
		},
		TITLE_TEXT_STYLE: {},
		initializedTitleTextStyle: randomSurvivalGame.utils.initializer.request(function() {
			randomSurvivalGame.ui.TITLE_TEXT_STYLE = {
				fillStyle: randomSurvivalGame.ui.COLORS.UI_DARK_GRAY,
				font: "50px cursive",
				textAlign: "center"
			};
			randomSurvivalGame.ui.initializedTitleTextStyle = true;
		}),
		buttons: [],
		initializedButtons: randomSurvivalGame.utils.initializer.request(function() {
			var ui = randomSurvivalGame.ui;
			var Button = ui.Button;
			ui.playButton = new Button(canvas.width / 2, canvas.height / 2, "play", "play");
			ui.shopButton = new Button((canvas.width / 2) - 125, (canvas.height / 2) + 100, "shop", "dollar");
			ui.achievementsButton = new Button((canvas.width / 2) + 125, (canvas.height / 2) + 100, "achievements", "trophy");
			ui.retryButton = new Button(canvas.width / 3 * 2, canvas.height / 2 + 250, "play", "retry");
			ui.homeFromDeath = new Button(canvas.width / 3, canvas.height / 2 + 250, "home", "house");
			ui.homeFromShop = new Button(75, 75, "home", "house");
			ui.homeFromAchievements = new Button(75, 75, "home", "house");

			ui.buttons = [
				ui.playButton,
				ui.shopButton,
				ui.achievementsButton,
				ui.retryButton,
				ui.homeFromDeath,
				ui.homeFromShop,
				ui.homeFromAchievements
			];
			ui.initializedButtons = true;
		}),

		homeScreen: function() {
			/* title */
			if(!randomSurvivalGame.debugging.TESTING_MODE) {
				c.loadTextStyle(this.TITLE_TEXT_STYLE);
				c.fillText("Randomonicity", canvas.width / 2, 150);
				c.fillText("Survival", canvas.width / 2, 200);
			}
			/* buttons */
			this.shopButton.exist();
			this.achievementsButton.exist();
			this.playButton.exist();
			if(randomSurvivalGame.input.keys[32]) {
				/* simulate pressing the play button when 'space' is pressed */
				randomSurvivalGame.ui.transitions.transitionToScreen("play");
				randomSurvivalGame.game.player.reset();
			}
		},
		deathScreen: function() {
			var p = randomSurvivalGame.game.player;
			/* title */
			c.loadTextStyle(this.TITLE_TEXT_STYLE);
			c.fillText("You Died", canvas.width / 2, canvas.height / 4);
			/* body text */
			c.loadTextStyle({
				font: "30px monospace",
				textAlign: "left"
			});
			if(typeof this.DEATH_MESSAGES[p.deathCause] !== "string") {
				c.fillText("You died.", canvas.width / 4, 300);
				console.errorOnce("Invalid player death cause of '" + p.deathCause + "'");
			}
			else {
				c.fillText(this.DEATH_MESSAGES[p.deathCause], canvas.width / 4, 300);
			}
			p.highScore = Math.max(p.score, p.highScore);
			c.fillText("You got a score of " + p.score + " points", canvas.width / 4, 350);
			c.fillText("Your highscore is " + p.highScore + " points", canvas.width / 4, 400);
			c.fillText("You collected " + p.coins + " coins", canvas.width / 4, 450);
			c.fillText("You now have " + p.totalCoins + " coins", canvas.width / 4, 500);
			/* buttons */
			this.homeFromDeath.exist();
			this.retryButton.exist();
			if(randomSurvivalGame.input.keys[32]) {
				/* simulate pressing the retry button when 'space' is pressed */
				randomSurvivalGame.ui.transitions.transitionToScreen("play");
				randomSurvivalGame.game.player.reset();
			}
		},
		shopScreen: function() {
			/* title */
			c.loadTextStyle(randomSurvivalGame.ui.TITLE_TEXT_STYLE);
			c.fillText("Shop", canvas.width / 2, 100);
			/* coin counter */
			c.loadTextStyle({
				color: "rgb(255, 255, 0)",
				font: "20px cursive",
				textAlign: "center"
			});
			c.fillText("coins: " + randomSurvivalGame.game.player.totalCoins, canvas.width / 2, 150);
			/* items */
			var shop = randomSurvivalGame.shop;
			for(var i = 0; i < shop.items.length; i ++) {
				shop.items[i].displayLogo(1);
			}
			for(var i = 0; i < shop.items.length; i ++) {
				shop.items[i].displayInfo();
			}
			for(var i = 0; i < shop.items.length; i ++) {
				shop.items[i].displayPopup();
			}
			/* home button */
			randomSurvivalGame.ui.homeFromShop.exist();
		},
		achievementsScreen: function() {
			/* title */
			c.loadTextStyle(randomSurvivalGame.ui.TITLE_TEXT_STYLE);
			c.fillText("Achievements", canvas.width / 2, 100);
			/* achievements */
			var achievements = randomSurvivalGame.achievements.listOfAchievements;
			for(var i = 0; i < achievements.length; i ++) {
				achievements[i].displayLogo();
			}
			for(var i = 0; i < achievements.length; i ++) {
				achievements[i].displayInfo();
			}
			/* home button */
			randomSurvivalGame.ui.homeFromAchievements.exist();
		},

		transitions: {
			nextScreen: null,
			opacity: 0,
			opacityDirection: 0,

			TRANSITION_SPEED: 0.1,

			display: function() {
				c.save(); {
					c.globalAlpha = this.opacity;
					c.fillCanvas("rgb(255, 255, 255)");
				} c.restore();
			},
			update: function() {
				this.opacity += this.opacityDirection;
				if(this.opacity > 1) {
					randomSurvivalGame.game.screen = this.nextScreen;
					this.opacityDirection = -this.TRANSITION_SPEED;
					/* reset animations on buttons */
					var buttons = randomSurvivalGame.ui.buttons;
					for(var i = 0; i < buttons.length; i ++) {
						buttons[i].mouseOver = false;
						if(typeof buttons[i].resetAnimation === "function") {
							buttons[i].resetAnimation();
						}
					}
				}
				else if(this.opacity < 0) {
					this.opacityDirection = 0;
				}
				this.opacity = Math.constrain(this.opacity, 0, 1);
			},
			transitionToScreen: function(screen) {
				this.opacityDirection = this.TRANSITION_SPEED;
				this.nextScreen = screen;
				if(screen === "death") {
					randomSurvivalGame.persistentData.saveCoins();
					randomSurvivalGame.persistentData.saveHighScores();
				}
			}
		}
	},
	game: {
		display: function() {
			var Platform = randomSurvivalGame.game.Platform;
			var Player = randomSurvivalGame.game.Player;
			var Coin = randomSurvivalGame.events.Coin;
			var Crosshair = randomSurvivalGame.events.laser.Crosshair;
			var Acid = randomSurvivalGame.events.acid.Acid;
			var Boulder = randomSurvivalGame.events.boulder.Boulder;
			var RockParticle = randomSurvivalGame.events.boulder.RockParticle;
			var SpinningBlade = randomSurvivalGame.events.spinningBlades.SpinningBlade;
			var Pacman = randomSurvivalGame.events.pacmans.Pacman;
			var Pirhana = randomSurvivalGame.events.pirhanas.Pirhana;
			var Dot = randomSurvivalGame.events.pacmans.Dot;
			var Rocket = randomSurvivalGame.events.rocket.Rocket;
			var FireParticle = randomSurvivalGame.events.rocket.FireParticle;
			var Spikeball = randomSurvivalGame.events.spikeballs.Spikeball;
			var SpikeWall = randomSurvivalGame.events.spikeWall.SpikeWall;
			var AfterImage = randomSurvivalGame.events.confusion.AfterImage;
			var LaserBot = randomSurvivalGame.events.laserBots.LaserBot;
			var Laser = randomSurvivalGame.events.laserBots.Laser;
			var BadGuy = randomSurvivalGame.events.badGuys.BadGuy;
			var Alien = randomSurvivalGame.events.aliens.Alien;
			var SmokeParticle = randomSurvivalGame.events.aliens.SmokeParticle;
			var MagnetParticle = randomSurvivalGame.shop.MagnetParticle;
			var SpeedParticle = randomSurvivalGame.shop.SpeedParticle;
			var DoubleJumpParticle = randomSurvivalGame.shop.DoubleJumpParticle;
			var PlayerDisintegrationParticle = randomSurvivalGame.game.playerDeathAnimations.PlayerDisintegrationParticle;
			var PlayerBodyPart = randomSurvivalGame.game.playerDeathAnimations.PlayerBodyPart;
			var order = [
				[AfterImage],
				[Coin, MagnetParticle, SmokeParticle],
				[Platform],
				[FireParticle, Dot, Laser, Player],
				[Crosshair, Boulder, RockParticle, SpinningBlade, Pirhana, Pacman, Rocket, Spikeball, LaserBot, BadGuy, Alien],
				[SpeedParticle, DoubleJumpParticle, PlayerDisintegrationParticle, PlayerBodyPart],
				[Acid, SpikeWall]
			];
			var renderingObjects = [];
			for(var i = 0; i < this.objects.length; i ++) {
				if(this.objects[i] instanceof AfterImage) {
					renderingObjects.push(this.objects[i].image);
					renderingObjects[renderingObjects.length - 1].afterImage = this.objects[i];
				}
				else {
					renderingObjects.push(this.objects[i]);
				}
			}
			renderingObjects = randomSurvivalGame.utils.sortByType(renderingObjects, order);
			/* replace images with their afterimages (confusion effect) */
			var afterImages = renderingObjects.getObjectsByType(AfterImage);
			outerLoop: for(var i = 0; i < renderingObjects.length; i ++) {
				if(renderingObjects[i].afterImage !== null && typeof renderingObjects[i].afterImage === "object") {
					renderingObjects[i] = renderingObjects[i].afterImage;
				}
			}
			/* display objects */
			c.save(); {
				c.translate(-randomSurvivalGame.game.camera.x, -randomSurvivalGame.game.camera.y);
				for(var i = 0; i < renderingObjects.length; i ++) {
					var obj = renderingObjects[i];
					if(!obj.splicing) {
						if(typeof obj.display === "function") {
							obj.display();
						}
						else {
							console.warn("An in-game object of type " + obj.constructor.name + " did not have a display() method.");
						}
					}
				}
			} c.restore();
			/* display visual effects */
			if(this.player.timeBlinded < randomSurvivalGame.events.effects.duration()) {
				randomSurvivalGame.events.blindness.displayBlindnessEffect();
			}
			else if(this.player.timeNauseated < randomSurvivalGame.events.effects.duration()) {
				randomSurvivalGame.events.nausea.displayNauseaEffect();
			}
			else if(this.player.timeConfused < randomSurvivalGame.events.effects.duration()) {
				randomSurvivalGame.events.confusion.displayConfusionEffect();
			}
			/* shop status effect indicators */
			var numItemsEquipped = 0;
			var items = randomSurvivalGame.shop.items;
			for(var i = 0; i < items.length; i ++) {
				if(items[i].equipped) {
					items[i].x = 50 + (100 * numItemsEquipped);
					items[i].y = 50;
					items[i].displayLogo(0.5);
					numItemsEquipped ++;
				}
			}
			/* score + coins */
			var p = randomSurvivalGame.game.player;
			c.loadTextStyle({
				color: randomSurvivalGame.ui.COLORS.UI_DARK_GRAY,
				textAlign: "left"
			});
			c.fillText("Score: " + p.score, 10, canvas.height - 10);
			c.textAlign = "right";
			c.fillText("Coins: " + p.coins, canvas.width - 10, canvas.height - 10);
			/* debug */
			if(randomSurvivalGame.debugging.SHOW_HITBOXES) {
				randomSurvivalGame.debugging.displayHitboxes();
			}
		},
		update: function() {
			this.timeToEvent --;
			if(this.timeToEvent <= 0 && randomSurvivalGame.game.currentEvent === null) {
				randomSurvivalGame.events.addEvent();
			}

			for(var i = 0; i < this.objects.length; i ++) {
				if(typeof this.objects[i].update === "function") {
					this.objects[i].update();
				}
				else {
					console.warn("An in-game object of type " + this.objects[i].constructor.name + " did not have a update() method.");
				}
				if(this.objects[i].splicing) {
					this.objects.splice(i, 1);
					i --;
					continue;
				}
			}
			this.loadCollisions();
		},
		exist: function() {
			randomSurvivalGame.debugging.hitboxes = [];

			this.objects.push(this.player);
			this.update();
			this.display();
			this.objects.removeAllInstances(this.Player);
		},

		loadCollisions: function() {
			randomSurvivalGame.game.player.standingOnPlatform = null;
			for(var i = 0; i < randomSurvivalGame.game.objects.length; i ++) {
				var obj = randomSurvivalGame.game.objects[i];
				/* border collisions */
				if(obj.collideWithBorders && typeof obj.hitbox === "object") {
					if(obj.x + obj.hitbox.right >= canvas.width) {
						obj.handleCollision("wall-to-right");
					}
					else if(obj.x + obj.hitbox.left <= 0) {
						obj.handleCollision("wall-to-left");
					}
					if(obj.y + obj.hitbox.bottom >= canvas.height) {
						obj.handleCollision("floor");
					}
					else if(obj.y + obj.hitbox.top <= 0) {
						obj.handleCollision("ceiling");
					}
				}
				/* platform collisions */
				if(typeof obj.collide === "function") {
					obj.collide();
				}
			}
			/* offscreen enemy collisions */
			if(randomSurvivalGame.game.numObjects(randomSurvivalGame.events.Enemy) !== 0) {
				const OFFSCREEN_PLATFORM_WIDTH = 100;
				randomSurvivalGame.utils.collisions.rect(-OFFSCREEN_PLATFORM_WIDTH, 225 - 10, OFFSCREEN_PLATFORM_WIDTH, 20);
				randomSurvivalGame.utils.collisions.rect(-OFFSCREEN_PLATFORM_WIDTH, 575 - 10, OFFSCREEN_PLATFORM_WIDTH, 20);
				randomSurvivalGame.utils.collisions.rect(canvas.width, 225 - 10, OFFSCREEN_PLATFORM_WIDTH, 20);
				randomSurvivalGame.utils.collisions.rect(canvas.width, 575 - 10, OFFSCREEN_PLATFORM_WIDTH, 20);
			}
		},

		Player: function() {
			/* Location + velocity */
			this.x = canvas.width / 2;
			this.y = (canvas.height / 2) - 100;
			this.velX = 0;
			this.velY = 0;
			this.hitbox = { right: 5, left: -5, top: 0, bottom: 46 };
			/* Player animation properties */
			this.animations = {
				legs: 5,
				arms: 10,
				legDir: 1,
				facing: "forward"
			};
			this.facing = "forward";
			/* Effect properties */
			this.timeConfused = Infinity;
			this.timeBlinded = Infinity;
			this.timeNauseated = Infinity;
			this.nauseaOffsetArray = Math.findPointsCircular(0, 0, 30);
			this.nauseaOffset = 0;
			/* Scoring */
			this.score = 0;
			this.highScore = 0;
			this.coins = 0; // number of coins collected in the current game
			this.totalCoins = 0;
			this.itemsEquipped = 0;
			this.hasDoubleJumped = false;
			/* Shop item properties */
			this.timeInvincible = Infinity;
			this.numRevives = 1;
			this.canExtendJump = true;
			this.timeExtended = 0;
			/* Achievement properties */
			this.eventsSurvived = [];
			this.repeatedEvent = false;
			this.previousEvent = "nothing";
			this.numRecords = 0;
			this.gonePlaces = false;
			this.beenGhost = false;
			/* Other properties */
			this.standingOnPlatform = null;
			this.beingAbductedBy = null; // used for UFO enemies
			this.isDead = false;
			this.timeToDeath = -1;
		}
		.method("display", function() {
			c.globalAlpha = 1;
			if((this.timeInvincible > this.invincibilityDuration() || randomSurvivalGame.utils.frameCount % 2 === 0) && !this.isDead) {
				c.lineWidth = 5;
				c.lineCap = "round";
				/* head */
				c.fillStyle = (this.isIntangible() ? "rgb(80, 80, 80)" : "rgb(0, 0, 0)");
				c.fillEllipse(this.x, this.y + 12 * 1.2, 10, 10 * 1.2);
				/* eyes */
				if(this.facing === "left" || this.facing === "forward") {
					c.fillStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
					c.fillCircle(this.x - 4, this.y + 10, 3);
				}
				if(this.facing === "right" || this.facing === "forward") {
					c.fillStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
					c.fillCircle(this.x + 4, this.y + 10, 3);
				}
				/* body */
				c.strokeStyle = (this.isIntangible() ? "rgb(80, 80, 80)" : "rgb(0, 0, 0)");
				c.strokeLine(this.x, this.y + 15, this.x, this.y + 36);
				/* legs */
				c.strokeLine(this.x, this.y + 36, this.x - this.animations.legs, this.y + 46);
				c.strokeLine(this.x, this.y + 36, this.x + this.animations.legs, this.y + 46);
				/* arms */
				c.strokeLine(this.x, this.y + 26, this.x + 10, this.y + 26 + this.animations.arms);
				c.strokeLine(this.x, this.y + 26, this.x - 10, this.y + 26 + this.animations.arms);
				c.lineCap = "butt";
			}
		})
		.method("update", function() {
			if(this.isDead) {
				this.updateAnimations();
				return;
			}
			this.timeConfused ++;
			this.timeBlinded ++;
			this.timeNauseated ++;
			this.timeInvincible ++;
			this.nauseaOffset ++;
			if(this.nauseaOffset >= 190) {
				this.nauseaOffset = 0;
			}
			var effectDuration = randomSurvivalGame.events.effects.duration();
			if(this.timeConfused > randomSurvivalGame.events.effects.duration() && this.timeConfused !== Infinity) {
				randomSurvivalGame.events.effects.add();
				this.surviveEvent("confusion");
				this.timeConfused = Infinity;
			}
			if(this.timeNauseated > randomSurvivalGame.events.effects.duration() && this.timeNauseated !== Infinity) {
				randomSurvivalGame.events.effects.add();
				this.surviveEvent("nausea");
				this.timeNauseated = Infinity;
			}
			if(this.timeBlinded > randomSurvivalGame.events.effects.duration() && this.timeBlinded !== Infinity) {
				randomSurvivalGame.events.effects.add();
				this.surviveEvent("blindness");
				this.timeBlinded = Infinity;
			}
			/* inputs */
			this.input();
			/* leg + arm animations */
			this.updateAnimations();
			/* walking */
			this.x += this.velX;
			this.y += this.velY;
			/* jumping */
			var jumpedThisFrame = false;
			if(randomSurvivalGame.input.keys[38] && this.velY === 0) {
				this.velY = -6;
				jumpedThisFrame = true;
				if(!randomSurvivalGame.input.keys[37] && !randomSurvivalGame.input.keys[39]) {
					this.facing = "forward";
				}
			}
			/* gravity */
			this.velY += 0.1;
			/* Collisions */
			if(!this.noCollisions) {
				const SCREEN_BORDERS = (!this.isIntangible() || randomSurvivalGame.shop.intangibilityTalisman.numUpgrades < 2);
				if(!SCREEN_BORDERS) {
					if(this.x > 800) {
						this.x = 0;
					}
					else if(this.x < 0) {
						this.x = 800;
					}
					if(this.usedRevive) {
						this.beenGhost = true;
					}
				}
				else {
					if(this.x < 10) {
						this.velX = 0;
						this.x = Math.max(this.x, 10);
					}
					if(this.x > 790) {
						this.velX = 0;
						this.x = Math.min(this.x, 790);
					}
				}
			}
			/* movement cap */
			const DEFAULT_MAX_VELOCITY = 3;
			var maxSpeed = 3;
			if(randomSurvivalGame.shop.speedIncreaser.equipped) {
				if(randomSurvivalGame.shop.speedIncreaser.numUpgrades < 3) {
					maxSpeed = DEFAULT_MAX_VELOCITY * 1.5;
				}
				else {
					maxSpeed = DEFAULT_MAX_VELOCITY * 2;
				}
			}
			this.velX = Math.constrain(this.velX, -maxSpeed, maxSpeed);
			/* high jumping */
			if(this.canExtendJump && randomSurvivalGame.input.keys[38] && this.timeExtended < 40 && randomSurvivalGame.shop.doubleJumper.equipped) {
				this.velY = -6;
				this.timeExtended ++;
				randomSurvivalGame.shop.doubleJumper.glowOpacity += 0.1;
			}
			if(!randomSurvivalGame.input.keys[38]) {
				this.canExtendJump = false;
			}
			/* friction */
			if(!randomSurvivalGame.input.keys[37] && !randomSurvivalGame.input.keys[39]) {
				this.velX *= 0.93;
			}
			/* shop items */
			var shop = randomSurvivalGame.shop;
			if(shop.doubleJumper.equipped && shop.doubleJumper.numUpgrades >= 2) {
				if(this.velY !== 0 && !this.hasDoubleJumped && randomSurvivalGame.input.keys[38] && !randomSurvivalGame.utils.pastInputs.keys[38] && !jumpedThisFrame) {
					this.velY = -6;
					this.hasDoubleJumped = true;
					if(randomSurvivalGame.shop.doubleJumper.numUpgrades >= 3) {
						this.canExtendJump = true;
						this.timeExtended = 0;
					}
					if(this.velX > DEFAULT_MAX_VELOCITY || this.velX < -DEFAULT_MAX_VELOCITY) {
						this.gonePlaces = true;
					}
					randomSurvivalGame.game.objects.push(new randomSurvivalGame.shop.DoubleJumpParticle(this.x, this.y + 46));
					randomSurvivalGame.shop.doubleJumper.glowOpacity = 1;
				}
			}
			if(shop.coinDoubler.equipped && shop.coinDoubler.numUpgrades > 1 && randomSurvivalGame.utils.frameCount % 40 === 0) {
				randomSurvivalGame.game.objects.push(new randomSurvivalGame.shop.MagnetParticle(75));
			}
			if(shop.speedIncreaser.equipped && Math.dist(this.velX, 0) > DEFAULT_MAX_VELOCITY / 2) {
				shop.speedIncreaser.glowOpacity += 0.1;
				if(this.velY === 0.1) {
					randomSurvivalGame.game.objects.push(new randomSurvivalGame.shop.SpeedParticle(
						this.x,
						this.y + 46
					));
				}
			}
			if(this.isIntangible()) {
				shop.intangibilityTalisman.glowOpacity += 0.1;
			}
			if(this.timeInvincible < this.invincibilityDuration()) {
				shop.secondLife.glowOpacity += 0.1;
			}
			/* falling deaths */
			if(this.y + this.hitbox.bottom > canvas.height && !randomSurvivalGame.events.acid.isAcidVisible()) {
				this.die("fall");
			}
		})
		.method("input", function() {
			var speed = (randomSurvivalGame.shop.speedIncreaser.equipped ? 0.2 : 0.1);
			if(randomSurvivalGame.input.keys[37]) {
				this.facing = "left";
				this.velX -= speed;
			}
			else if(randomSurvivalGame.input.keys[39]) {
				this.facing = "right";
				this.velX += speed;
			}
		})
		.method("updateAnimations", function() {
			/* leg animations */
			this.animations.legs += this.animations.legDir;
			if(randomSurvivalGame.input.keys[37] || randomSurvivalGame.input.keys[39]) {
				if(this.animations.legs >= 5) {
					this.animations.legDir = -0.5;
				}
				else if(this.animations.legs <= -5) {
					this.animations.legDir = 0.5;
				}
			}
			else {
				this.animations.legDir = 0;
				this.animations.legDir = (this.animations.legs > 0) ? 0.5 : -0.5;
				this.animations.legDir = (this.animations.legs <= -5 || this.animations.legs >= 5) ? 0 : this.animations.legDir;
			}
			/* arm animations */
			if(this.velY === 0) {
				this.animations.arms += (this.animations.arms < 10) ? 1 : 0;
			}
			else {
				this.animations.arms += (this.animations.arms > -5) ? -1 : 0;
			}
			/* death animations */
			var PlayerDisintegrationParticle = randomSurvivalGame.game.playerDeathAnimations.PlayerDisintegrationParticle;
			var PlayerBodyPart = randomSurvivalGame.game.playerDeathAnimations.PlayerBodyPart;
			if(randomSurvivalGame.game.numObjects(PlayerDisintegrationParticle) !== 0) {
				randomSurvivalGame.game.getObjectsByType(PlayerDisintegrationParticle)[0].checkForAnimationEnd();
			}
			if(randomSurvivalGame.game.numObjects(PlayerBodyPart) !== 0) {
				randomSurvivalGame.game.getObjectsByType(PlayerBodyPart)[0].checkForAnimationEnd();
			}
			this.timeToDeath --;
			if(this.isDead && this.timeToDeath === 0) {
				randomSurvivalGame.ui.transitions.transitionToScreen("death");
			}
		})
		.method("reset", function() {
			this.score = 0;
			this.coins = 0;
			this.x = 400;
			this.y = 300;
			this.velX = 0;
			this.velY = 0;
			randomSurvivalGame.game.camera = { x: 0, y: 0 };
			this.facing = "forward";
			this.animations.arms = 10;
			this.hitbox = new randomSurvivalGame.game.Player().hitbox;
			this.noCollisions = false;
			randomSurvivalGame.game.timeToEvent = 2 * randomSurvivalGame.FPS;
			this.isDead = false;
			this.diedThisGame = false;
			this.timeToDeath = -1;
			randomSurvivalGame.game.objects = [];
			randomSurvivalGame.game.initializePlatforms();
			randomSurvivalGame.game.chatMessages = [];
			randomSurvivalGame.game.currentEvent = null;
			this.timeNauseated = Infinity;
			this.timeConfused = Infinity;
			this.timeBlinded = Infinity;
			this.beingAbductedBy = null;
			this.timeInvincible = Infinity;
			this.usedRevive = false;
			this.coins = 0;
			if(!randomSurvivalGame.debugging.TESTING_MODE) {
				randomSurvivalGame.events.effects.add();
			}
			if(randomSurvivalGame.shop.secondLife.equipped) {
				this.numRevives = (randomSurvivalGame.shop.secondLife.numUpgrades >= 3) ? 2 : 1;
			}
			else {
				this.numRevives = 0;
			}
		})
		.method("handleCollision", function(dir, platform) {
			if(dir === "floor") {
				if(platform instanceof randomSurvivalGame.events.laserBots.LaserBot && this.velY > 0) {
					platform.isDead = true;
				}
				this.velY = Math.min(this.velY, 0);
				this.hasDoubleJumped = false;
				this.canExtendJump = true;
				this.timeExtended = 0;
				this.standingOnPlatform = platform;
			}
			else if(dir === "ceiling") {
				this.velY = Math.max(this.velY, 1);
			}
			else if(dir === "wall-to-left") {
				this.velX = Math.max(this.velX, 0);
			}
			else if(dir === "wall-to-right") {
				this.velX = Math.min(this.velX, 0);
			}
		})

		.method("die", function(cause) {
			this.deathCause = cause;
			var secondLife = randomSurvivalGame.shop.secondLife;
			if(this.timeInvincible > this.invincibilityDuration()) {
				if((secondLife.equipped && this.numRevives > 0) || randomSurvivalGame.debugging.TESTING_MODE && randomSurvivalGame.debugging.PLAYER_INVINCIBLE) {
					this.numRevives --;
					this.usedRevive = true;
					this.timeInvincible = 0;
				}
				else {
					if(!this.diedThisGame) {
						this.diedThisGame = true;
						this.totalCoins += this.coins;
					}
					var deathAnimations = {
						"disintegration": ["laser", "acid", "laserbots"],
						"limbs-fall-off": ["boulder", "spinning blades", "rocket", "spikeballs", "spikewall", "pirhanas", "bad guys"],
						"other-death-animation": ["pacmans"], // more complex animations defined somewhere else
						"no-death-animation": ["aliens", "fall"]
					};
					for(var i in deathAnimations) {
						if(deathAnimations.hasOwnProperty(i) && deathAnimations[i].contains(cause)) {
							if(i === "no-death-animation") {
								randomSurvivalGame.ui.transitions.transitionToScreen("death");
							}
							else if(i === "other-death-animation") {
								/* Do nothing. The animation will be handled somewhere else. */
							}
							else {
								this.beginDeathAnimation(i);
							}
						}
					}
				}
			}
			else if(this.y + 46 > 800) {
				this.y = 800 - 46;
				if(randomSurvivalGame.input.keys[38]) {
					this.velY = -7;
				}
			}
		})
		.method("beginDeathAnimation", function(deathAnimation) {
			/*
			Possible values for deathAnimation parameter: "disintegration", "limbs-fall-off"
			*/
			if(this.isDead) {
				return;
			}
			this.isDead = true;

			var objects = randomSurvivalGame.game.objects;
			if(deathAnimation === "disintegration") {
				var PlayerDisintegrationParticle = randomSurvivalGame.game.playerDeathAnimations.PlayerDisintegrationParticle;
				function disintegrateLine(x1, y1, x2, y2) {
					var points = Math.findPointsLinear(x1, y1, x2, y2);
					for(var i = 0; i < points.length; i ++) {
						objects.push(new PlayerDisintegrationParticle(points[i].x, points[i].y));
					}
				};
				function disintegrateEllipse(x, y, radiusX, radiusY) {
					var points = Math.findPointsCircular(x, y, Math.min(radiusX, radiusY), true);
					if(radiusX < radiusY) {
						for(var i = 0; i < points.length; i ++) {
							points[i].y = Math.scaleAboutPoint(points[i].x, points[i].y, x, y, 1, (radiusY / radiusX)).y;
						}
					}
					else {
						for(var i = 0; i < points.length; i ++) {
							points[i].x = Math.scaleAboutPoint(points[i].x, points[i].y, x, y, (radiusX / radiusY), 1).x;
						}
					}
					for(var i = 0; i < points.length; i ++) {
						randomSurvivalGame.game.objects.push(new PlayerDisintegrationParticle(points[i].x, points[i].y));
					}
				};
				function removeParticlesInCircle(x, y, r) {
					for(var i = 0; i < objects.length; i ++) {
						if(objects[i] instanceof PlayerDisintegrationParticle && Math.dist(objects[i].x, objects[i].y, x, y) < r) {
							objects.splice(i, 1);
							i --;
						}
					}
				};
				/* head */
				disintegrateEllipse(this.x, this.y + 12, 10, 12);
				/* body */
				disintegrateLine(this.x, this.y + 15, this.x, this.y + 36);
				/* legs */
				disintegrateLine(this.x, this.y + 36, this.x - this.animations.legs, this.y + 46);
				disintegrateLine(this.x, this.y + 36, this.x + this.animations.legs, this.y + 46);
				/* arms */
				disintegrateLine(this.x, this.y + 26, this.x + 10, this.y + 26 + this.animations.arms);
				disintegrateLine(this.x, this.y + 26, this.x - 10, this.y + 26 + this.animations.arms);
				/* remove particles where player's eyes are */
				if(this.facing === "left" || this.facing === "forward") {
					removeParticlesInCircle(this.x - 4, this.y + 10, 4);
				}
				if(this.facing === "right" || this.facing === "forward") {
					removeParticlesInCircle(this.x + 4, this.y + 10, 4);
				}
			}
			else if(deathAnimation === "limbs-fall-off") {
				var objects = randomSurvivalGame.game.objects;
				var PlayerBodyPart = randomSurvivalGame.game.playerDeathAnimations.PlayerBodyPart;
				objects.push(new PlayerBodyPart("player-head", { x: this.x, y: this.y + 12 * 1.2 }));
				/* body */
				c.strokeStyle = "rgb(0, 0, 0)";
				c.strokeLine(this.x, this.y + 15, this.x, this.y + 36);
				objects.push(
					new PlayerBodyPart(
						"line-segment",
						{
							x1: this.x,
							y1: this.y + 15,
							x2: this.x,
							y2: this.y + 36
						}
					)
				);
				/* legs */
				objects.push(
					new PlayerBodyPart(
						"line-segment",
						{
							x1: this.x,
							y1: this.y + 36,
							x2: this.x - this.animations.legs,
							y2: this.y + 46
						}
					)
				);
				objects.push(
					new PlayerBodyPart(
						"line-segment",
						{
							x1: this.x,
							y1: this.y + 36,
							x2: this.x + this.animations.legs,
							y2: this.y + 46
						}
					)
				);
				/* arms */
				objects.push(
					new PlayerBodyPart(
						"line-segment",
						{
							x1: this.x,
							y1: this.y + 26,
							x2: this.x + 10,
							y2: this.y + 26 + this.animations.arms
						}
					)
				);
				objects.push(
					new PlayerBodyPart(
						"line-segment",
						{
							x1: this.x,
							y1: this.y + 26,
							x2: this.x - 10,
							y2: this.y + 26 + this.animations.arms
						}
					)
				);
			}
		})
		.method("surviveEvent", function(event) {
			/*
			Adds the event to the player's list of events survived if the event is not already present in the list. Used for achievement "I Survived".
			*/
			for(var i = 0; i < this.eventsSurvived.length; i ++) {
				if(this.eventsSurvived[i] === event) {
					return;
				}
			}
			this.eventsSurvived.push(event);
			randomSurvivalGame.persistentData.saveAchievements();
		})
		.method("isIntangible", function() {
			if(this !== randomSurvivalGame.game.player) {
				return false; // for the Bad Guys that use the Player's methods
			}
			return (randomSurvivalGame.input.keys[40] && randomSurvivalGame.shop.intangibilityTalisman.equipped);
		})
		.method("invincibilityDuration", function() {
			/*
			Returns how many frames the invincibility effect should last.
			*/
			return randomSurvivalGame.FPS * (randomSurvivalGame.shop.secondLife.numUpgrades >= 2 ? 2 : 1);
		})
		.method("isInPath", function() {
			/*
			Used for collisions. Checks if the player (approximated by the corners of the player's hitbox) overlaps with the current canvas path.
			*/
			return (
				c.isPointInPath(this.x + this.hitbox.left, this.y + this.hitbox.top) ||
				c.isPointInPath(this.x + this.hitbox.right, this.y + this.hitbox.top) ||
				c.isPointInPath(this.x + this.hitbox.left, this.y + this.hitbox.bottom) ||
				c.isPointInPath(this.x + this.hitbox.right, this.y + this.hitbox.bottom)
			)
		}),

		player: null,
		initializedPlayer: randomSurvivalGame.utils.initializer.request(
			function() {
				randomSurvivalGame.game.player = new randomSurvivalGame.game.Player();
				randomSurvivalGame.game.initializedPlayer = true;
			}
		),

		playerDeathAnimations: {
			PlayerDisintegrationParticle: function(x, y) {
				this.x = x;
				this.y = y;
				var maximumXVelocity = 0.4;
				this.velX = Math.randomInRange(-maximumXVelocity, maximumXVelocity);
				this.velY = Math.randomInRange(-2, -1.5) + randomSurvivalGame.game.player.velY;
				if(randomSurvivalGame.game.getObjectsByType(randomSurvivalGame.events.acid.Acid).length !== 0) {
					this.velY = Math.min(this.velY, -2);
				}
				this.hitbox = { top: -2, bottom: 2, left: -2, right: 2 };
				this.isOnGround = false;
			}
			.method("display", function() {
				c.fillStyle = "rgb(0, 0, 0)";
				c.fillRect(this.x - 2, this.y - 2, 4, 4);
				if(this.isOnGround) {
					c.fillRect(this.x - 3, this.y - 2, 6, 4);
				}
			})
			.method("update", function() {
				if(!this.isOnGround) {
					this.x += this.velX;
					this.y += this.velY;
					this.velY += 0.1;
					this.velX *= 0.99;
					if(this.y > canvas.height + 50) {
						this.splicing = true;
						this.checkForAnimationEnd();
					}
					var Acid = randomSurvivalGame.events.acid.Acid;
					if(randomSurvivalGame.game.numObjects(Acid) !== 0) {
						if(this.y > randomSurvivalGame.game.getObjectsByType(Acid)[0].y) {
							this.velY = Math.randomInRange(-3, -5);
							this.hasTouchedAcid = true;
						}
					}
				}
			})
			.method("handleCollision", function(direction, platform) {
				if(direction === "floor") {
					if(!this.isOnGround) {
						this.splicing = (Math.random()) < 0.5;
						this.checkForAnimationEnd();
					}
					this.isOnGround = true;
					this.hitbox = null; // no more collisions necessary for this one
					if(platform instanceof randomSurvivalGame.game.playerDeathAnimations.PlayerDisintegrationParticle) {
						this.x = platform.x;
					}
				}
			})
			.method("collide", function() {
				if(this.isOnGround) {
					randomSurvivalGame.utils.collisions.rect(
						this.x - 1, this.y - 1, 2, 2,
						{
							includedTypes: [randomSurvivalGame.game.playerDeathAnimations.PlayerDisintegrationParticle],
							caller: this,
							collisionRequirements: function(obj) {
								if(obj.isOnGround) {
									return false;
								}
								return true;
							},
						}
					);
				}
			})
			.method("checkForAnimationEnd", function() {
				var particles = randomSurvivalGame.game.getObjectsByType(this.constructor);
				var stillPlayingAnimation = false;
				for(var i = 0; i < particles.length; i ++) {
					var particle = particles[i];
					if(!particle.splicing && !particle.isOnGround && !particle.hasTouchedAcid) {
						stillPlayingAnimation = true;
						break;
					}
				}
				if(!stillPlayingAnimation) {
					randomSurvivalGame.ui.transitions.transitionToScreen("death");
				}
			}),

			PlayerBodyPart: function(type, location) {
				/* Used in the death animation where the player's limbs fall off. */
				if(type === undefined || location === undefined) {
					return;
				}
				this.type = type; // "player-head" or "line-segment" (for arms / legs)
				if(this.type === "line-segment") {
					this.location = {
						x: location.x1,
						y: location.y1,
						length: Math.dist(location.x1, location.y1, location.x2, location.y2),
						rotation: Math.toDegrees(Math.atan2((location.y2 - location.y1), (location.x2 - location.x1)))
					};
				}
				else {
					this.location = {
						x: location.x,
						y: location.y,
						rotation: location.rotation || 0
					};
					this.facing = randomSurvivalGame.game.player.facing;
				}
				this.velX = Math.randomInRange(-3, 3);
				this.velY = Math.randomInRange(-3, 3);
			}
			.method("display", function() {
				c.save(); {
					c.lineCap = "round";
					c.translate(this.location.x, this.location.y);
					c.rotate(Math.toRadians(this.location.rotation));
					if(this.type === "player-head") {
						c.fillStyle = "rgb(0, 0, 0)";
						c.fillEllipse(0, 0, 10, 10 * 1.2);
						/* eyes */
						c.fillStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
						if(this.facing === "left" || this.facing === "forward") {
							c.fillCircle(-4, 0 + 10 - (12 * 1.2), 3);
						}
						if(this.facing === "right" || this.facing === "forward") {
							c.fillCircle(4, 0 + 10 - (12 * 1.2), 3);
						}
					}
					else {
						c.strokeStyle = "rgb(0, 0, 0)";
						c.strokeLine(0, 0, 0, this.location.length);
					}
				} c.restore();
			})
			.method("update", function() {
				this.location.x += this.velX;
				this.location.y += this.velY;
				this.location.rotation += this.velX;
				this.velY += 0.1;
				this.velX *= 0.96;

				this.age = this.age || 0;
				this.age ++;
			})
			.method("checkForAnimationEnd", function() {
				if(this.age > randomSurvivalGame.FPS) {
					randomSurvivalGame.ui.transitions.transitionToScreen("death");
				}
			})
		},

		camera: {
			x: 0,
			y: 0
		},

		difficulty: function() {
			/*
			Current difficulty system: linear progression (score of 0: minimum difficulty, score of 30: maximum difficulty). Each item you have equipped is like having 5 more score.
			*/
			return Math.constrain(Math.map(
				randomSurvivalGame.game.player.score + (randomSurvivalGame.shop.itemsEquipped().length * 5),
				0, 30,
				this.MIN_DIFFICULTY, this.MAX_DIFFICULTY
			), this.MIN_DIFFICULTY, this.MAX_DIFFICULTY);
		},
		MIN_DIFFICULTY: 0,
		MAX_DIFFICULTY: 100,

		Platform: function(x, y, w, h) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.ORIGINAL_X = x;
			this.ORIGINAL_Y = y;
			this.velX = 0;
			this.velY = 0;
			this.destinations = [];
			this.opacity = 1;
		}
		.method("display", function() {
			c.globalAlpha = this.opacity;
			c.fillStyle = randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY;
			c.fillRect(this.x, this.y, this.w, this.h);
		})
		.method("update", function() {
			this.opacity += (this.opacity < 1) ? 0.05 : 0;
			this.x += this.velX;
			this.y += this.velY;
			if(randomSurvivalGame.game.player.standingOnPlatform === this && randomSurvivalGame.events.blockShuffle.MOVE_PLAYER_WITH_PLATFORMS) {
				p.x += this.velX;
				p.y += this.velY;
			}

			/* stop moving for block shuffle event */
			if(!randomSurvivalGame.events.blockShuffle.CONSTANT_MOVEMENT_SPEED) {
				this.calculateVelocity();
			}
			if(this.isMoving()) {
				if(Math.dist(this.x, this.destinations[0].x) < 2 && Math.dist(this.y, this.destinations[0].y) < 2 && (this.velX !== 0 || this.velY !== 0)) {
					if(this.destinations.length > 0) {
						this.destinations.splice(0, 1);
						this.calculateVelocity();
					}
					else {
						this.x = this.ORIGINAL_X;
						this.y = this.ORIGINAL_Y;
						this.velX = 0;
						this.velY = 0;
					}
					var numMoving = 0;
					var platforms = randomSurvivalGame.game.getObjectsByType(randomSurvivalGame.game.Platform);
					for(var i = 0; i < platforms.length; i ++) {
						if(platforms[i].isMoving()) {
							numMoving ++;
						}
					}
					if(numMoving === 0) {
						for(var i = 0; i < platforms.length; i ++) {
							platforms[i].resetPosition();
						}
						randomSurvivalGame.events.blockShuffle.nextSequence();
					}
				}
			}
		})
		.method("calculateVelocity", function() {
			if(this.destinations.length === 0) {
				this.velX = 0;
				this.velY = 0;
				return;
			}
			var distanceX = -(this.x - this.destinations[0].x);
			var distanceY = -(this.y - this.destinations[0].y);
			var velocity = Math.normalize(distanceX, distanceY);
			var speed = this.destinations[0].speed || (Math.dist(0, 0, distanceX, distanceY) / randomSurvivalGame.FPS);
			if(!randomSurvivalGame.events.blockShuffle.CONSTANT_MOVEMENT_SPEED) {
				speed = Math.dist(0, 0, distanceX, distanceY) / randomSurvivalGame.FPS + 1;
			}
			this.velX = velocity.x * speed;
			this.velY = velocity.y * speed;
		})

		.method("locationToString", function() {
			/*
			Returns which area of the screen the platform is in, for debugging.
			*/
			var center = {
				x: this.x + (this.w / 2),
				y: this.y + (this.h / 2)
			};
			var xLocation;
			if(center.x < canvas.width / 3) {
				xLocation = "left";
			}
			else if(center.x > canvas.width / 3 * 2) {
				xLocation = "right";
			}
			else {
				xLocation = "middle";
			}
			var yLocation;
			if(center.y < canvas.height / 3) {
				yLocation = "top";
			}
			else if(center.y > canvas.height / 3 * 2) {
				yLocation = "bottom";
			}
			else {
				yLocation = "middle";
			}
			if(xLocation === "middle" && yLocation === "middle") {
				return "platform in the center";
			}
			else {
				return "platform in the " + yLocation + "-" + xLocation;
			}
		})
		.method("isMoving", function() {
			return (this.velX !== 0 || this.velY !== 0 || this.destinations.length !== 0);
		})
		.method("resetPosition", function() {
			this.x = this.ORIGINAL_X;
			this.y = this.ORIGINAL_Y;
			this.velX = 0;
			this.velY = 0;
			this.destinations = [];
		})
		.method("collide", function() {
			randomSurvivalGame.utils.collisions.rect(
				this.x, this.y, this.w, this.h,
				{
					caller: this,
					velX: this.velX, velY: this.velY
				}
			);
		}),

		objects: [],
		screen: "home",
		chatMessages: [],

		numObjects: function(constructor) {
			return this.getObjectsByType(constructor).length;
		},
		getObjectsByType: function(constructor) {
			/*
			Returns a list containing references to all instances of 'constructor' in objects.
			*/
			var arr = [];
			for(var i = 0; i < this.objects.length; i ++) {
				if(this.objects[i] instanceof constructor && !this.objects[i].splicing) {
					arr.push(this.objects[i]);
				}
			}
			return arr;
		},
		initializePlatforms: function() {
			var objects = randomSurvivalGame.game.objects;
			var Platform = randomSurvivalGame.game.Platform;

			for(var y = 225; y <= 575; y += 175) {
				if((y - 225) % (175 * 2) === 0) {
					objects.push(new Platform(0, y - 10, 160, 20));
					objects.push(new Platform(800 - 160, y - 10, 160, 20));
				}
				else {
					objects.push(new Platform(400 - (160 / 2), y - 10, 160, 20));
				}
			}
		},
		initializedPlatforms: randomSurvivalGame.utils.initializer.request(function() {
			randomSurvivalGame.game.initializePlatforms();
			randomSurvivalGame.game.initializedPlatforms = true;
		})
	},
	events: {
		Coin: function(x, y, timeToAppear) {
			this.x = x;
			this.y = y;
			this.spin = -1;
			this.spinDir = 0.05;
			this.timeToAppear = timeToAppear || 0;
			this.age = 0;
		}
		.method("display", function() {
			if(this.age > this.timeToAppear) {
				c.fillStyle = "rgb(255, 255, 0)";
				c.save(); {
					c.translate(this.x, this.y);
					c.scale(this.spin, 1);
					c.fillCircle(0, 0, 20);
				} c.restore();
			}
		})
		.method("update", function() {
			this.spin += this.spinDir;
			if(this.spin > 1) {
				this.spinDir = -0.05;
			}
			else if(this.spin < -1) {
				this.spinDir = 0.05;
			}
			this.age ++;
			var coinDoubler = randomSurvivalGame.shop.coinDoubler;
			var player = randomSurvivalGame.game.player;
			if(
				randomSurvivalGame.utils.isPlayerInRect(this.x - 20, this.y - 20, 40, 40) &&
				this.age > this.timeToAppear &&
				!(player.isIntangible() && randomSurvivalGame.shop.intangibilityTalisman.numUpgrades < 3)
			) {
				this.splicing = true;
				player.coins += (coinDoubler.equipped) ? 2 : 1;
				if(coinDoubler.equipped) {
					coinDoubler.glowOpacity = 1;
				}
			}
			if(this.age > this.timeToAppear && coinDoubler.equipped) {
				if(coinDoubler.numUpgrades === 2 && Math.dist(this.x, this.y, player.x, player.y) < 200) {
					this.x += (player.x - this.x) / 10;
					this.y += (player.y - this.y) / 10;
					coinDoubler.glowOpacity += 0.1;
				}
				else if(coinDoubler.numUpgrades === 3) {
					this.x += (player.x - this.x) / 10;
					this.y += (player.y - this.y) / 10;
					coinDoubler.glowOpacity += 0.1;
				}
			}
		}),
		ChatMessage: function(msg, type) {
			this.msg = msg;
			this.type = type;
			if(type === "event") {
				this.color = "rgb(255, 128, 0)"
			}
			else if(type === "effect") {
				this.color = "rgb(0, 255, 0)";
			}
			else if(type === "enemy") {
				this.color = "rgb(255, 0, 0)";
			}
			else if(type === "highscore") {
				this.color = "rgb(0, 0, 255)";
			}
			else if(type === "achievement") {
				this.color = "rgb(255, 255, 0)";
			}
			else {
				throw new Error("Unknown ChatMessage type of \"" + type + "\"");
			}
			this.time = 120;
		}
		.method("display", function(y) {
			c.loadTextStyle({
				color: this.color,
				textAlign: "right",
				font: "20px monospace"
			});
			c.fillText(this.msg, 790, y);
			this.time --;
		}),
		loadChatMessages: function() {
			var messages = randomSurvivalGame.game.chatMessages;
			for(var i = messages.length - 1; i >= 0; i --) {
				var message = messages[i];
				message.display((messages.length - i + 1) * 40 - 40);
				if(message.time <= 0) {
					messages.splice(i, 1);
					i --;
					continue;
				}
				if(randomSurvivalGame.game.screen !== "play" && message.type !== "achievement") {
					messages.splice(i, 1);
					i --;
					continue;
				}
			}
		},

		addEvent: function() {
			var p = randomSurvivalGame.game.player;

			var eventName = randomSurvivalGame.events.listOfEvents.randomItem();
			var theEvent = randomSurvivalGame.events[eventName];
			if(typeof theEvent !== "object" || theEvent === "null") {
				if(randomSurvivalGame.events.listOfEvents.length !== 0) {
					console.error("Unknown event ID: " + eventName);
				}
				this.endEvent();
				return;
			}
			randomSurvivalGame.game.currentEvent = eventName;
			theEvent.begin();
			if(eventName === p.previousEvent) {
				p.repeatedEvent = true;
			}
			p.previousEvent = eventName;
			p.score ++;
			if(p.score === p.highScore + 1) {
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("New Record!", "highscore"));
				p.numRecords ++;
				randomSurvivalGame.persistentData.saveAchievements();
			}
		},
		endEvent: function(timeToEvent) {
			timeToEvent = timeToEvent || randomSurvivalGame.FPS * 1;
			randomSurvivalGame.game.timeToEvent = timeToEvent;
			randomSurvivalGame.game.currentEvent = null;
		},

		currentEvent: null,
		timeToEvent: -5,
		listOfEvents: [
			"laser", "acid", "boulder", "spinningBlades", "pirhanas", "pacmans", "rocket", "spikeballs", "blockShuffle", "spikeWall",
			"confusion", "blindness", "nausea",
			"laserBots", "badGuys", "aliens"
		],
		initializedOriginalEvents: randomSurvivalGame.utils.initializer.request(function() {
			randomSurvivalGame.events.ORIGINAL_EVENTS = randomSurvivalGame.events.listOfEvents.clone();
			randomSurvivalGame.events.initializedOriginalEvents = true;
		}),

		laser: {
			Crosshair: function() {
				this.x = Math.random() * 800;
				this.y = Math.random() * 800;
				this.numMoves = 0;
				this.timeInLocation = 0;
				this.numBlinks = 0;
				this.timeSinceBlink = 0;
				this.blinking = false;
			}
			.method("display", function() {
				if(!this.blinking) {
					c.strokeStyle = "rgb(255, 0, 0)";
					c.strokeCircle(this.x, this.y, 50);
					for(var r = 0; r < 360; r += 90) {
						c.save(); {
							c.translate(this.x, this.y);
							c.rotate(Math.toRadians(r));
							c.strokeLine(0, -40, 0, -60);
						} c.restore();
					}
				}
			})
			.method("update", function() {
				this.timeInLocation ++;
				if(this.timeInLocation > 60 && this.numMoves < 4) {
					this.x = Math.random() * 800;
					this.y = Math.random() * 800;
					this.numMoves ++;
					this.timeInLocation = 0;
				}
				if(this.numMoves === 4) {
					this.x = randomSurvivalGame.game.player.x;
					this.y = randomSurvivalGame.game.player.y;
					this.numMoves = Infinity;
				}
				if(this.numMoves === Infinity) {
					this.timeSinceBlink ++;
					if(this.timeSinceBlink > 7) {
						this.blinking = !this.blinking;
						this.timeSinceBlink = 0;
						this.numBlinks ++;
					}
					var numBlinksBeforeExplosion = Math.map(
						randomSurvivalGame.game.difficulty(),
						randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY,
						6, 2
					);
					if(this.numBlinks > numBlinksBeforeExplosion) {
						this.explode();
						randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.Coin(this.x, this.y));
						this.splicing = true;
					}
				}
			})
			.method("explode", function(nonLethal) {
				nonLethal = nonLethal || false;
				const MIN_PARTICLE_VELOCITY = 1;
				const MAX_PARTICLE_VELOCITY = 5;
				const MIN_PARTICLE_SIZE = 5;
				const MAX_PARTICLE_SIZE = 20;
				const SIZE_DECREASE_SPEED = 0.1;
				const FADEOUT_SPEED = 0.02;
				const NUM_PARTICLES = 200;
				const MIN_OPACITY = 0.55;
				const MAX_OPACITY = 0.95;
				for(var i = 0; i < NUM_PARTICLES; i ++) {
					var degrees = Math.randomInRange(0, 360);
					var distance = Math.randomInRange(MIN_PARTICLE_VELOCITY, MAX_PARTICLE_VELOCITY);
					var velocity = Math.rotateDegrees(0, distance, degrees);
					randomSurvivalGame.game.objects.push(
						new randomSurvivalGame.events.rocket.FireParticle(
							this.x,
							this.y,
							Math.randomInRange(MIN_PARTICLE_SIZE, MAX_PARTICLE_SIZE),
							{
								SIZE_DECREASE_SPEED: SIZE_DECREASE_SPEED,
								FADEOUT_SPEED: FADEOUT_SPEED,
								velX: velocity.x,
								velY: velocity.y,
								KILLS_PLAYER: !nonLethal
							}
						)
					);
					randomSurvivalGame.game.objects[randomSurvivalGame.game.objects.length - 1].opacity = Math.randomInRange(MIN_OPACITY, MAX_OPACITY);
				}
			}),

			begin: function() {
				randomSurvivalGame.game.objects.push(new this.Crosshair());
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("Laser incoming!", "event"));
			}
		},
		acid: {
			Acid: function() {
				this.y = 850;
				this.velY = 0;
			}
			.method("display", function() {
				for(var x = 0; x < 800; x ++) {
					var brightness = Math.random() * 30;
					c.fillStyle = "rgb(" + brightness + ", 255, " + brightness + ")";
					c.fillRect(
						x,
						this.y + Math.sin(x / 10) * 10 * Math.sin(randomSurvivalGame.utils.frameCount / 10),
						1,
						800
					);
				}
			})
			.method("update", function() {
				/* update position */
				this.y += this.velY;
				if(this.y < 600 && this.velY < 0) {
					/* screen scrolling */
					randomSurvivalGame.game.camera.y += this.velY;
				}
				if(this.y < -100) {
					this.stopRising();
				}
				if(this.velY > 0 && this.y >= 850) {
					this.velY = 0;
					this.y = 850;
					randomSurvivalGame.game.player.surviveEvent("acid");
					randomSurvivalGame.events.endEvent(-1);
					this.splicing = true;
				}
				/* player collisions */
				var p = randomSurvivalGame.game.player;
				if(p.y + 46 > this.y) {
					p.die("acid");
					if(p.timeInvincible < p.invincibilityDuration()) {
						p.velY = Math.min(-5, p.velY);
						if(randomSurvivalGame.input.keys[38]) {
							p.velY = Math.min(-8.5, p.velY);
						}
					}
				}
			})
			.method("beginRising", function() {
				var objects = randomSurvivalGame.game.objects;
				var Platform = randomSurvivalGame.game.Platform;

				var acidSpeed = Math.map(
					randomSurvivalGame.game.difficulty(),
					randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY,
					2, 3.5
				)
				this.velY = -acidSpeed;
				var platformInMiddle = true;
				for(var y = 50; y >= -475; y -= 175) {
					if(platformInMiddle) {
						objects.push(new Platform((canvas.width / 2) - (160 / 2), y - 10, 160, 20));
					}
					else {
						objects.push(new Platform(0, y - 10, 160, 20));
						objects.push(new Platform(canvas.width - 160, y - 10, 160, 20));
					}
					platformInMiddle = !platformInMiddle;
				}
				for(var i = 0; i < objects.length; i ++) {
					if(objects[i] instanceof Platform && objects[i].y <= 210) {
						objects[i].opacity = 0;
					}
				}
				objects.push(new randomSurvivalGame.events.Coin(400, 0, 0));
			})
			.method("stopRising", function() {
				this.velY = 1;
				/* shift everything down back to the original playing area */
				randomSurvivalGame.game.camera.y = 0;
				// this.y += 700;
				// randomSurvivalGame.game.player.y += 700;
				/* delete platforms from acid rise */
				var PlayerDisintegrationParticle = randomSurvivalGame.game.playerDeathAnimations.PlayerDisintegrationParticle;
				var AfterImage = randomSurvivalGame.events.confusion.AfterImage;
				var Platform = randomSurvivalGame.game.Platform;
				var Player = randomSurvivalGame.game.Player;
				var objects = randomSurvivalGame.game.objects;

				var acidY = this.y + 700;
				for(var i = 0; i < objects.length; i ++) {
					var obj = objects[i];
					if(obj instanceof AfterImage) {
						obj.image.y += 700;
						if(obj.image.y > acidY && !(obj instanceof PlayerDisintegrationParticle)) {
							obj.splicing = true;
						}
					}
					else {
						obj.y += 700;
						if(obj.y > acidY) {
							obj.splicing = true;
						}
					}
				}
			}),

			begin: function() {
				var objects = randomSurvivalGame.game.objects;
				var acid = new randomSurvivalGame.events.acid.Acid();
				acid.beginRising();
				objects.push(acid);
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("The tides are rising...", "event"));
			},

			isAcidVisible: function() {
				var Acid = randomSurvivalGame.events.acid.Acid;
				return (randomSurvivalGame.game.numObjects(Acid) !== 0 && randomSurvivalGame.game.getObjectsByType(Acid)[0].y < canvas.height + 20);
			}
		},
		boulder: {
			Boulder: function(x, y, velX) {
				this.x = x;
				this.y = y;
				this.velX = velX;
				this.velY = 0;
				this.numBounces = 0;
				this.vertices = [];
				this.rotation = 0;
				this.size = Math.map(
					randomSurvivalGame.game.difficulty(),
					randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY,
					50, 65
				);
				var r = 0;
				while(r < 360) {
					r += Math.randomInRange(45, 60);
					if(r > 350) {
						r = 360;
					}
					this.vertices.push(Math.rotateDegrees(0, -this.size, r));
				}
				this.hitbox = { top: -this.size, bottom: this.size, left: -this.size, right: this.size };
			}
			.method("display", function() {
				c.fillStyle = randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY;
				c.save(); {
					c.translate(this.x, this.y);
					c.rotate(Math.toRadians(this.rotation));
					c.fillPoly(this.vertices);
				} c.restore();
			})
			.method("update", function() {
				this.velY += 0.1;
				this.x += this.velX;
				this.y += this.velY;
				this.rotation += (this.velX > 0) ? 5 : -5;
				/* killing player */
				if(!randomSurvivalGame.game.player.isIntangible()) {
					randomSurvivalGame.utils.killCollisions.circle(this.x, this.y, this.size, "boulder");
				}
				/* delete self if off-screen */
				if((this.velX < 0 && this.x < 50) || (this.velX > 0 && this.x > 750)) {
					this.shatter();
				}
			})
			.method("shatter", function() {
				randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.Coin(this.x, this.y));
				this.splicing = true;

				/* add rock particles */
				for(var i = 0; i < this.vertices.length; i ++) {
					var currentVertex = this.vertices[i];
					if(i === this.vertices.length - 1) {
						var nextVertex = this.vertices[0];
					}
					else {
						var nextVertex = this.vertices[i + 1];
					}

					var vertices = [{ x: 0, y: 0 }, currentVertex, nextVertex];
					var averageLoc = {
						x: (currentVertex.x + nextVertex.x) / 2,
						y: (currentVertex.y + nextVertex.y) / 2
					};
					var velocity = Math.normalize(averageLoc.x, averageLoc.y);
					velocity.x += Math.randomInRange(-1, 1);
					velocity.y += Math.randomInRange(-1, 1);
					randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.boulder.RockParticle(this.x, this.y, vertices, velocity.x, velocity.y));
				}
			})
			.method("handleCollision", function(direction, platform) {
				if(direction === "floor") {
					this.numBounces ++;
					if(this.numBounces === 1) {
						this.velY = -4;
					}
					else if(this.numBounces === 2) {
						this.velY = -3;
					}
					else {
						this.velY = -2;
					}
				}
			}),
			RockParticle: function(x, y, vertices, velX, velY) {
				this.x = x;
				this.y = y;
				this.vertices = vertices;
				this.velX = velX;
				this.velY = velY;
				this.rotation = 0;
			}
			.method("display", function() {
				c.fillStyle = randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY;
				c.save(); {
					c.translate(this.x, this.y);
					c.rotate(Math.toRadians(this.rotation));
					c.fillPoly(this.vertices);
				} c.restore();
			})
			.method("update", function() {
				this.x += this.velX;
				this.y += this.velY;
				this.velY += 0.1;
				this.velX *= 0.96;
				this.rotation += this.velX;
				if(this.y > 850) {
					this.splicing = true;
					if(randomSurvivalGame.game.numObjects(randomSurvivalGame.events.boulder.RockParticle) === 0) {
						/* This is the last rock particle, so end the event */
						randomSurvivalGame.events.endEvent(-1);
						randomSurvivalGame.game.player.surviveEvent("boulder");
					}
				}
			}),

			begin: function() {
				var chooser = Math.random();
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("Boulder incoming!", "event"));
				var Boulder = randomSurvivalGame.events.boulder.Boulder;
				if(chooser < 0.5) {
					randomSurvivalGame.game.objects.push(new Boulder(850, 100, -3));
				}
				else {
					randomSurvivalGame.game.objects.push(new Boulder(-50, 100, 3));
				}
			}
		},
		spinningBlades: {
			SpinningBlade: function(x, y) {
				this.x = x;
				this.y = y;
				this.r = 90;
				this.numRevolutions = 0;
				this.opacity = 0;

				var speed = Math.map(
					randomSurvivalGame.game.difficulty(),
					randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY,
					1, 2
				);
				this.fadeInSpeed = Math.map(
					randomSurvivalGame.game.difficulty(),
					randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY,
					1/20, 1/40
				);
				this.rotationSpeed = speed * ([-1, 1].randomItem());
				this.maxNumRevolutions = (speed > 1.5 ? 4 : 3);
				this.timeSinceLastRotation = 0;
			}
			.method("display", function() {
				c.fillStyle = "rgb(215, 215, 215)";
				c.globalAlpha = this.opacity;
				c.save(); {
					c.translate(this.x, this.y);
					c.rotate(Math.toRadians(this.r));
					c.fillPoly(
						-5, 0,
						5, 0,
						0, -80
					);
					c.fillPoly(
						-5, 0,
						5, 0,
						0, 80
					);
				} c.restore();
				c.globalAlpha = 1;
			})
			.method("update", function() {
				if(this.opacity >= 1) {
					this.r += this.rotationSpeed;
				}
				this.r = this.r.mod(360);
				if(
					(Math.dist(this.r, 90) < Math.abs(this.rotationSpeed) ||
					Math.dist(this.r, 270) < Math.abs(this.rotationSpeed)) &&
					this.opacity >= 1 && this.age > randomSurvivalGame.FPS && this.timeSinceLastRotation > 5
				) {
					this.numRevolutions ++;
					this.timeSinceLastRotation = 0;
				}
				this.timeSinceLastRotation ++;
				if(this.numRevolutions < this.maxNumRevolutions) {
					this.opacity += this.fadeInSpeed;
				}
				else {
					this.opacity -= 0.05;
				}
				this.opacity = Math.constrain(this.opacity, 0, 1);
				/* player collisions */
				var endPoint1 = Math.rotateDegrees(0, -80, this.r);
				var endPoint2 = { x: -endPoint1.x, y: -endPoint1.y };
				endPoint1.x += this.x; endPoint2.x += this.x;
				endPoint1.y += this.y; endPoint2.y += this.y;
				if(!randomSurvivalGame.game.player.isIntangible()) {
					randomSurvivalGame.utils.killCollisions.line(endPoint1.x, endPoint1.y, endPoint2.x, endPoint2.y, "spinning blades");
				}
				/* remove self when faded out */
				if(this.opacity <= 0 && this.numRevolutions >= 2) {
					this.splicing = true;
					if(randomSurvivalGame.game.numObjects(randomSurvivalGame.events.spinningBlades.SpinningBlade) === 0) {
						/* This is the last spinningblade, so end the event */
						randomSurvivalGame.game.player.surviveEvent("spinning blades");
						randomSurvivalGame.events.endEvent();
					}
				}

				this.age = this.age || 0;
				this.age ++;
			}),

			begin: function() {
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("Spinning blades are appearing", "event"));
				var platforms = randomSurvivalGame.game.getObjectsByType(randomSurvivalGame.game.Platform);
				for(var i = 0; i < platforms.length; i ++) {
					randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.spinningBlades.SpinningBlade(platforms[i].x + 80, platforms[i].y + 10));
				}
			}
		},
		pirhanas: {
			Pirhana: function(x) {
				this.x = x;
				this.y = 850;
				this.velY = -10;
				this.velY = Math.randomInRange(-8, -12);
				this.scaleY = 1;
				this.mouth = 1; // 1 = open, 0 = closed
				this.mouthAngle = 45;
				this.mouthVel = 0;
				this.age = 0;

				this.TIME_TO_APPEAR = Math.randomInRange(0, randomSurvivalGame.FPS * 2);
				this.BITE_SPEED = 3;
			}
			.method("display", function() {
				c.fillStyle = "rgb(0, 128, 0)";
				c.save(); {
					c.translate(this.x, this.y);
					c.scale(1, this.scaleY);
					c.fillArc(0, 0, 25, Math.toRadians(270 + this.mouthAngle), Math.toRadians(270 - this.mouthAngle));
					c.fillPoly(
						0, 12,
						-25, 37,
						25, 37
					);
				} c.restore();
			})
			.method("update", function() {
				this.age ++;
				if(this.age < this.TIME_TO_APPEAR) {
					return;
				}
				this.y += this.velY;
				this.velY += 0.1;
				if(this.velY > 0) {
					this.scaleY -= 0.1;
				}
				this.scaleY = Math.constrain(this.scaleY, -1, 1);
				this.mouthAngle += this.mouthVel;
				/* pirhana biting animations */
				var p = randomSurvivalGame.game.player;
				if(Math.dist(this.x, this.y, p.x, p.y) < 100 && this.mouthVel === 0) {
					this.mouthVel = -this.BITE_SPEED;
				}
				if(this.mouthAngle <= 0) {
					this.mouthVel = this.BITE_SPEED;
				}
				if(this.mouthAngle > 45 && this.mouthVel > 0) {
					this.mouthVel = 0;
				}
				/* player deaths */
				if(!p.isIntangible()) {
					randomSurvivalGame.utils.killCollisions.rect(this.x - 25, this.y - 25, 50, 62, "pirhanas");
				}
				/* remove offscreen pirhanas */
				if(this.y > 850 && this.velY > 0) {
					this.splicing = true;
					if(randomSurvivalGame.game.numObjects(randomSurvivalGame.events.pirhanas.Pirhana) === 0) {
						randomSurvivalGame.events.endEvent();
						p.surviveEvent("pirhanas");
					}
				}
			}),

			begin: function() {
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("Jumping pirhanas incoming!", "event"));
				/* fancy algorithm to make sure none of the pirhanas are touching */
				var pirhanasSeparated = false;
				var numPirhanas = Math.map(
					randomSurvivalGame.game.difficulty(),
					randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY,
					2, 6
				);
				while(!pirhanasSeparated) {
					var objects = randomSurvivalGame.game.objects;
					var Pirhana = randomSurvivalGame.events.pirhanas.Pirhana;

					objects.removeAllInstances(Pirhana);
					for(var i = 0; i < numPirhanas; i ++) {
						objects.push(new Pirhana(Math.randomInRange(50, canvas.width - 50)));
					}
					pirhanasSeparated = true;
					var pirhanas = randomSurvivalGame.game.getObjectsByType(Pirhana);
					for(var i = 0; i < objects.length; i ++) {
						/* check if they collide */
						for(var j = i + 1; j < pirhanas.length; j ++) {
							if(Math.dist(pirhanas[i].x, pirhanas[j].x) < 75) {
								pirhanasSeparated = false;
							}
						}
					}
				}
			}
		},
		pacmans: {
			Pacman: function(x, y, velX) {
				this.x = x;
				this.y = y;
				this.velX = velX;
				this.mouth = 0;
				this.mouthVel = -1;
				this.rotation = 0;
			}
			.method("display", function() {
				c.fillStyle = "rgb(255, 255, 0)";
				c.save(); {
					c.translate(this.x, this.y);
					if(this.velX < 0) {
						c.scale(-1, 1); // reflect for pacmans going left
					}
					c.fillArc(0, 0, 200, Math.toRadians(this.rotation + this.mouth), Math.toRadians(this.rotation - this.mouth));
				} c.restore();
			})
			.method("update", function() {
				const MOUTH_ANIMATION_SPEED = 0.5;

				var p = randomSurvivalGame.game.player;
				if(this.hasEatenPlayer) {
					this.mouth += 3 * MOUTH_ANIMATION_SPEED;
					this.mouth = Math.constrain(this.mouth, 0, 45);
					if(this.rotating) {
						this.rotateTowardPlayer();
					}
					else if(!randomSurvivalGame.game.player.isDead) {
						this.eatPlayer();
					}
					else {
						this.returnToDefaultRotation();
					}
				}
				else {
					this.x += this.velX;
					this.mouth += this.mouthVel;
					if(this.mouth >= 45) {
						this.mouthVel = -MOUTH_ANIMATION_SPEED;
					}
					else if(this.mouth <= 0) {
						this.mouthVel = MOUTH_ANIMATION_SPEED;
					}
				}
				/* player collisions */
				if(!p.isIntangible() && !this.hasEatenPlayer && !p.isDead) {
					c.save(); {
						c.translate(this.x, this.y);
						if(this.velX < 0) {
							c.scale(-1, 1); // reflect for pacmans going left
						}
						c.beginPath();
						c.moveTo(0, 0);
						c.arc(0, 0, 200, Math.toRadians(this.mouth), Math.toRadians(-this.mouth));
						c.lineTo(0, 0);
						if(p.isInPath()) {
							p.die("pacmans");
							this.hasEatenPlayer = true;
							this.rotating = true;
						}
					} c.restore();
				}
				/* remove dots when eaten */
				var objects = randomSurvivalGame.game.objects;
				for(var i = 0; i < objects.length; i ++) {
					var obj = objects[i];
					if(obj instanceof randomSurvivalGame.events.pacmans.Dot && obj.y === this.y &&
						((obj.x < this.x - 20 && this.velX > 0) ||
						(obj.x > this.x + 20 && this.velX < 0))
					) {
						obj.splicing = true;
					}
				}
				/* remove self when off screen */
				if((this.x > 1000 && this.velX > 0) || (this.x < -200 && this.velX < 0)) {
					this.splicing = true;
					if(randomSurvivalGame.game.numObjects(randomSurvivalGame.events.pacmans.Pacman) === 0) {
						randomSurvivalGame.events.endEvent(-1);
						randomSurvivalGame.game.player.surviveEvent("pacmans");
					}
				}
			})
			.method("rotateTowardPlayer", function() {
				/*
				Rotates the pacman so the pacman's mouth is pointing at the player. Returns whether it is done moving it's mouth.
				*/
				var p = randomSurvivalGame.game.player;
				var desiredRotation = Math.toDegrees(Math.atan2(p.y - this.y, p.x - this.x));
				if(this.velX < 0) {
					desiredRotation *= -1;
					desiredRotation += 180;
					if(Math.dist(this.rotation + 360, desiredRotation) < Math.dist(this.rotation, desiredRotation)) {
						this.rotation += 360;
					}
					if(Math.dist(this.rotation - 360, desiredRotation) < Math.dist(this.rotation, desiredRotation)) {
						this.rotation -= 360;
					}
				}
				this.rotation += (desiredRotation - this.rotation) / 4;
				if(Math.dist(this.rotation, desiredRotation) < 10) {
					this.rotating = false;
				}
			})
			.method("returnToDefaultRotation", function() {
				var desiredRotation = 0;
				if(Math.dist(this.rotation + 360, desiredRotation) < Math.dist(this.rotation, desiredRotation)) {
					this.rotation += 360;
				}
				if(Math.dist(this.rotation - 360, desiredRotation) < Math.dist(this.rotation, desiredRotation)) {
					this.rotation -= 360;
				}
				this.rotation += (0 - this.rotation) / 4;
				if(Math.dist(this.rotation, 0) <= 2) {
					this.hasEatenPlayer = false;
					randomSurvivalGame.game.player.timeToDeath = randomSurvivalGame.FPS * 2;
				}
			})
			.method("eatPlayer", function() {
				/*
				Moves the player toward the back of the pacman's mouth.
				*/
				var p = randomSurvivalGame.game.player;
				var point = Math.rotateDegrees(100 * (this.velX < 0 ? 1 : -1), 0, this.rotation * (this.velX < 0 ? -1 : 1));
				p.x += (this.x + point.x - p.x) / 10;
				p.y += (this.y + point.y - p.y) / 10;
				p.velX = 0;
				p.velY = 0;
				p.noCollisions = true;
				if(Math.dist(this.x + point.x, this.y + point.y, p.x, p.y) <= 10) {
					p.isDead = true;
				}
			}),

			Dot: function(x, y, timeToAppear) {
				this.x = x;
				this.y = y;
				this.timeToAppear = timeToAppear;
			}
			.method("display", function() {
				if(this.timeToAppear <= 0) {
					c.fillStyle = "rgb(255, 255, 255)";
					c.fillCircle(this.x, this.y, 20);
				}
			})
			.method("update", function() {
				this.timeToAppear --;
			}),

			begin: function() {
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("Pacmans incoming!", "event"));
				var Pacman = randomSurvivalGame.events.pacmans.Pacman;
				var speed = Math.map(
					randomSurvivalGame.game.difficulty(),
					randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY,
					1.5, 2
				);
				if(Math.random() < 0.5) {
					randomSurvivalGame.game.objects.push(new Pacman(
						-200,
						canvas.height / 4,
						speed
					));
					randomSurvivalGame.game.objects.push(new Pacman(
						canvas.width + 200,
						canvas.height - (canvas.height / 4),
						-speed
					));
					var coinNum = Math.round(Math.random() * 11 + 1) * 60;
					for(var x = 0; x < 800; x += 60) {
						if(x === coinNum) {
							randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.Coin(x, 200, x * 0.25));
						} else {
							randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.pacmans.Dot(x, 200, x * 0.25));
						}
						randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.pacmans.Dot(800 - x, 600, x * 0.25));
					}
				}
				else {
					randomSurvivalGame.game.objects.push(new Pacman(
						-200,
						canvas.height - (canvas.height / 4),
						speed
					));
					randomSurvivalGame.game.objects.push(new Pacman(
						canvas.width + 200,
						canvas.height / 4,
						-speed
					));
					var coinNum = Math.round(Math.random() * 11 + 1) * 60;
					for(var x = 0; x < 800; x += 60) {
						if(x === coinNum) {
							randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.Coin(800 - x, 200, x * 0.25));
						} else {
							randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.pacmans.Dot(800 - x, 200, x * 0.25));
						}
						randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.pacmans.Dot(x, 600, x * 0.25));
					}
				}
			}
		},
		rocket: {
			Rocket: function(x, y) {
				this.x = x;
				this.y = y;
				var velocity = Math.normalize(randomSurvivalGame.game.player.x - this.x, randomSurvivalGame.game.player.y - this.y);
				var speed = Math.map(
					randomSurvivalGame.game.difficulty(),
					randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY,
					5, 8
				);
				this.velX = velocity.x * speed;
				this.velY = velocity.y * speed;
				this.angle = Math.toDegrees(Math.atan2(this.velY, this.velX));
			}
			.method("display", function() {
				c.save(); {
					c.fillStyle = "rgb(150, 150, 155)";
					c.translate(this.x, this.y);
					c.rotate(Math.toRadians(this.angle));
					c.fillRect(0, -10, 50, 20);
					/* tip */
					c.fillPoly(
						50, -10,
						100, 0,
						50, 10
					);
					/* spikes on back */
					for(var scale = -1; scale <= 1; scale += 2) {
						c.save(); {
							c.scale(1, scale);
							c.fillPoly(
								0, 10,
								-50, 15,
								0, 0
							);
						} c.restore();
					}
				} c.restore();
			})
			.method("update", function() {
				var p = randomSurvivalGame.game.player;

				this.x += this.velX;
				this.y += this.velY;
				randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.rocket.FireParticle(this.x, this.y));
				if(!p.isIntangible()) {
					var point1 = Math.rotateDegrees(-50, 10, this.angle);
					var point2 = Math.rotateDegrees(-50, -10, this.angle);
					var point3 = Math.rotateDegrees(90, -10, this.angle);
					var point4 = Math.rotateDegrees(90, 10, this.angle);
					point1.x += this.x;
					point1.y += this.y;
					point2.x += this.x;
					point2.y += this.y;
					point3.x += this.x;
					point3.y += this.y;
					point4.x += this.x;
					point4.y += this.y;
					var points = [point1, point2, point3, point4];
					for(var i = 0; i < points.length; i ++) {
						var next = (i + 1) % points.length;
						randomSurvivalGame.utils.killCollisions.line(points[i].x, points[i].y, points[next].x, points[next].y, "rocket");
					}
				}
				/* remove self if off-screen */
				const OFFSCREEN_BUFFER = 100;
				if(this.x < -OFFSCREEN_BUFFER || this.x > canvas.width + OFFSCREEN_BUFFER) {
					this.splicing = true;
					randomSurvivalGame.events.endEvent(-1);
					randomSurvivalGame.game.player.surviveEvent("rocket");
				}
			}),

			FireParticle: function(x, y, size, settings) {
				settings = settings || {};
				this.x = x;
				this.y = y;
				this.velX = settings.velX || Math.random();
				this.velY = settings.velY || Math.random();
				this.opacity = 0.75;
				this.color = Math.random() * 20 + 100;
				this.size = size || 10;

				this.SIZE_DECREASE_SPEED = settings.SIZE_DECREASE_SPEED || 0.5;
				this.FADEOUT_SPEED = settings.FADEOUT_SPEED || 0.01;
				this.KILLS_PLAYER = settings.KILLS_PLAYER || false;
			}
			.method("display", function() {
				c.save(); {
					c.globalAlpha = this.opacity;
					c.fillStyle = "rgb(255, " + this.color + ", 0)";
					if(this.size > 0) {
						c.fillCircle(this.x, this.y, this.size);
					}
				} c.restore();
			})
			.method("update", function() {
				this.opacity -= this.FADEOUT_SPEED;
				this.size -= this.SIZE_DECREASE_SPEED;
				this.x += this.velX;
				this.y += this.velY;
				if(this.size <= 0 || this.opacity <= 0) {
					this.splicing = true;
					if(randomSurvivalGame.game.currentEvent === "laser" && randomSurvivalGame.game.numObjects(randomSurvivalGame.events.rocket.FireParticle) === 0) {
						randomSurvivalGame.events.endEvent();
						randomSurvivalGame.game.player.surviveEvent("laser");
					}
				}
				if(this.KILLS_PLAYER && this.opacity > 0.15 && !randomSurvivalGame.game.player.isIntangible()) {
					randomSurvivalGame.utils.killCollisions.rect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2, "laser");
				}
			}),

			begin: function() {
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("Rocket incoming!", "event"));

				var Rocket = randomSurvivalGame.events.rocket.Rocket;
				var p = randomSurvivalGame.game.player;

				var rocketY = randomSurvivalGame.game.player.y + Math.randomInRange(-200, 200);
				rocketY = Math.constrain(rocketY, 0, canvas.height);
				if(p.x > 400) {
					randomSurvivalGame.game.objects.push(new Rocket(-100, rocketY));
				}
				else {
					randomSurvivalGame.game.objects.push(new Rocket(canvas.width + 100, rocketY));
				}
			}
		},
		spikeballs: {
			Spikeball: function(x, y, velX, velY) {
				this.x = x;
				this.y = y;
				this.velX = velX;
				this.velY = velY;
				this.r = 0;
				this.age = 0;
				this.opacity = 0;
				this.fadedIn = false;
				this.hitbox = { left: -30, right: 30, top: -30, bottom: 30 };
				this.collideWithBorders = true;

				this.ROTATION_SPEED = 5;
				this.MAXIMUM_AGE = 500;
			}
			.method("display", function() {
				const NUM_SPIKES = 10;
				const DEGREES_BETWEEN_SPIKES = 360 / NUM_SPIKES;
				var points = [];
				for(var degrees = 0; degrees < 360; degrees += DEGREES_BETWEEN_SPIKES / 2) {
					if(degrees % DEGREES_BETWEEN_SPIKES) {
						points.push(Math.rotateDegrees(0, -30, degrees));
					}
					else {
						points.push(Math.rotateDegrees(0, -20, degrees));
					}
				}
				c.save(); {
					c.beginPath();
					c.moveTo(this.x, this.y);
					c.arc(this.x, this.y, 15, Math.toRadians(-90), Math.toRadians((this.age / this.MAXIMUM_AGE) * 360 - 90));
					c.lineTo(this.x, this.y);
					c.invertPath();
					c.clip("evenodd");

					c.fillStyle = "rgb(150, 150, 155)";
					c.translate(this.x, this.y);
					c.rotate(Math.toRadians(this.r));
					c.fillPoly(points);
				} c.restore();
			})
			.method("update", function() {
				this.r += this.ROTATION_SPEED;
				this.x += this.velX;
				this.y += this.velY;
				this.age ++;
				/* player collisions */
				if(!randomSurvivalGame.game.player.isIntangible()) {
					randomSurvivalGame.utils.killCollisions.circle(this.x, this.y, 30, "spikeballs");
				}
				/* remove self if off screen */
				this.collideWithBorders = (this.age < this.MAXIMUM_AGE);
				if(!this.collideWithBorders && !randomSurvivalGame.utils.isObjectInRect(this, -100, -100, canvas.width + 200, canvas.height + 200)) {
					this.splicing = true;
					if(randomSurvivalGame.game.numObjects(randomSurvivalGame.events.spikeballs.Spikeball) === 0) {
						randomSurvivalGame.events.endEvent();
						randomSurvivalGame.game.player.surviveEvent("spikeballs");
					}
				}
			})
			.method("handleCollision", function(direction, platform) {
				if(direction === "floor") {
					this.velY = -Math.abs(this.velY);
				}
				else if(direction === "ceiling") {
					this.velY = Math.abs(this.velY);
				}
				else if(direction === "wall-to-left") {
					this.velX = Math.abs(this.velX);
				}
				else if(direction === "wall-to-right") {
					this.velX = -Math.abs(this.velX);
				}
				if(platform instanceof randomSurvivalGame.events.spikeballs.Spikeball) {
					var spikeball = platform;
					if(direction === "floor") {
						spikeball.handleCollision("ceiling");
					}
					else if(direction === "ceiling") {
						spikeball.handleCollision("floor");
					}
					else if(direction === "wall-to-left") {
						spikeball.handleCollision("wall-to-right");
					}
					else if(direction === "wall-to-right") {
						spikeball.handleCollision("wall-to-left");
					}
				}
			})
			.method("collide", function() {
				randomSurvivalGame.utils.collisions.rect(this.x - 30, this.y - 30, 60, 60, {
					includedTypes: [randomSurvivalGame.events.spikeballs.Spikeball],
					velX: this.velX,
					velY: this.velY,
					caller: this
				});
			}),

			begin: function() {
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("Spikeballs incoming!", "event"));
				const NUM_SPIKEBALLS = 3;
				var numSpikeballs = Math.map(
					randomSurvivalGame.game.difficulty(),
					randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY,
					3, 6
				);
				var spikeballsOnLeft = Math.round(Math.randomInRange(numSpikeballs / 2 - 1, numSpikeballs / 2 + 1));
				var spikeballsOnRight = numSpikeballs - spikeballsOnLeft;
				this.addSpikeballs(spikeballsOnLeft, "left");
				this.addSpikeballs(spikeballsOnRight, "right");
			},
			addSpikeballs: function(numSpikeballs, direction) {
				var objects = randomSurvivalGame.game.objects;
				var Spikeball = randomSurvivalGame.events.spikeballs.Spikeball;
				/* initialize array of possible spikeball angles */
				var angles = [];
				for(var i = -this.POSSIBLE_SPIKEBALL_ANGLES; i < this.POSSIBLE_SPIKEBALL_ANGLES; i ++) {
					angles.push(i);
				}
				/* add spikeballs, at separate angles so they don't end up taking the exact same path */
				while(numSpikeballs > 0) {
					var angle = angles.randomItem();
					/* remove nearby angles */
					for(var i = 0; i < angles.length; i ++) {
						var distanceBetweenAngles = Math.min(
							Math.dist(angle + 360, angles[i]),
							Math.dist(angle      , angles[i]),
							Math.dist(angle - 360, angles[i])
						);
						if(distanceBetweenAngles < this.MIN_ANGLE_BETWEEN_SPIKEBALLS) {
							angles.splice(i, 1);
							i --;
						}
					}
					/* add spikeball at angle */
					var velocity = Math.rotateDegrees(this.SPIKEBALL_VELOCITY, 0, angle);
					if(direction === "right") {
						velocity.x *= -1;
					}
					objects.push(new Spikeball(
						(direction === "right" ?
							canvas.width + this.SPIKEBALL_DISTANCE_FROM_BORDERS :
							-this.SPIKEBALL_DISTANCE_FROM_BORDERS
						),
						canvas.height / 2,
						velocity.x * (direction === "right" ? -1 : 1),
						velocity.y
					));
					numSpikeballs --;
				}
			},

			SPIKEBALL_VELOCITY: 5,
			MIN_ANGLE_BETWEEN_SPIKEBALLS: 30,
			POSSIBLE_SPIKEBALL_ANGLES: 75,
			SPIKEBALL_DISTANCE_FROM_BORDERS: 50
		},
		blockShuffle: {
			begin: function() {
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("The blocks are shuffling", "event"));
				this.blocksMoved = 0;
				this.nextSequence();
			},

			cycleBlocks: function(blocks, isBackwards) {
				if(typeof isBackwards !== "boolean") {
					this.cycleBlocks(blocks, Math.random() < 0.5);
				}
				else if(isBackwards) {
					for(var i = blocks.length - 1; i >= 0; i --) {
						var previousIndex = (i - 1 >= 0) ? i - 1 : blocks.length - 1;
						var block = blocks[i];
						var previousBlock = blocks[previousIndex];
						block.destinations = [{
							x: previousBlock.x,
							y: previousBlock.y
						}];
						block.calculateVelocity();
					}
				}
				else {
					for(var i = 0; i < blocks.length; i ++) {
						var nextIndex = (i + 1 < blocks.length) ? i + 1 : 0;
						var block = blocks[i];
						var nextBlock = blocks[nextIndex];
						block.destinations = [{
							x: nextBlock.x,
							y: nextBlock.y
						}];
						block.calculateVelocity();
					}
				}
			},
			nextSequence: function() {
				if(this.blocksMoved > 5) {
					randomSurvivalGame.events.endEvent();
					randomSurvivalGame.game.player.surviveEvent("block shuffle");
				}
				else {
					var numberOfBlocksEachSequenceMoves = {
						"swapCornerAndCenter": 2,
						"swapTopOrBottom": 2,
						"move3Blocks": 3,
						"moveCornerBlocks": 4,
						"moveAllBlocks": 5
					};
					var sequences = ["swapCornerAndCenter", "swapTopOrBottom", "move3Blocks", "moveCornerBlocks", "moveAllBlocks"];
					if(randomSurvivalGame.game.difficulty() > Math.map(1/3, 0, 1, randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY)) {
						sequences.removeAll("swapTopOrBottom");
					}
					if(randomSurvivalGame.game.difficulty() > Math.map(2/3, 0, 1, randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY)) {
						sequences.removeAll("swapCornerAndCenter");
					}
					var randomSequence = sequences.randomItem();
					this[randomSequence]();
					this.blocksMoved += numberOfBlocksEachSequenceMoves[randomSequence];
				}
			},
			getPlatformByLocation: function(location) {
				var platforms = randomSurvivalGame.game.getObjectsByType(randomSurvivalGame.game.Platform);
				for(var i = 0; i < platforms.length; i ++) {
					if(platforms[i].locationToString().replace("platform in the ", "") === location) {
						return platforms[i];
					}
				}
				return null;
			},

			swapCornerAndCenter: function(whichCorner) {
				if(typeof whichCorner !== "string") {
					this.swapCornerAndCenter(
						["top", "bottom"].randomItem() + "-" +
						["left", "right"].randomItem()
					);
					return;
				}
				var corner = this.getPlatformByLocation(whichCorner);
				var center = this.getPlatformByLocation("center");
				const SPEED = 3;
				if(Math.random() < 0.5) {
					corner.destinations = [
						{ x: corner.x, y: center.y, speed: SPEED },
						{ x: center.x, y: center.y, speed: SPEED }
					];
					center.destinations = [
						{ x: center.x, y: corner.y, speed: SPEED },
						{ x: corner.x, y: corner.y, speed: SPEED }
					];
					corner.calculateVelocity();
					center.calculateVelocity();
				}
				else {
					corner.destinations = [
						{ x: center.x, y: corner.y, speed: SPEED },
						{ x: center.x, y: center.y, speed: SPEED }
					];
					center.destinations = [
						{ x: corner.x, y: center.y, speed: SPEED },
						{ x: corner.x, y: corner.y, speed: SPEED }
					];
					corner.calculateVelocity();
					center.calculateVelocity();
				}
			},
			swapTopOrBottom: function(location) {
				/*
				Swaps either the top two platforms with each other, or the bottom two platforms with each other.
				*/
				if(location === "top" || location === "bottom") {
					const CYCLE_HEIGHT = 125;
					const VERTICAL_SPEED = 2;
					const HORIZONTAL_SPEED = 5;
					var left = this.getPlatformByLocation(location + "-left");
					var right = this.getPlatformByLocation(location + "-right");
					if(Math.random() < 0.5 && false) {
						/* Swap left and right to make them move the other way */
						var temporary = left;
						left = right;
						right = temporary;
					}
					left.destinations = [
						{ x: left.x, y: left.y - CYCLE_HEIGHT, speed: VERTICAL_SPEED },
						{ x: right.x, y: right.y - CYCLE_HEIGHT, speed: HORIZONTAL_SPEED },
						{ x: right.x, y: right.y, speed: VERTICAL_SPEED }
					];
					right.destinations = [
						{ x: right.x, y: right.y + CYCLE_HEIGHT, speed: VERTICAL_SPEED },
						{ x: left.x, y: right.y + CYCLE_HEIGHT, speed: HORIZONTAL_SPEED },
						{ x: left.x, y: right.y, speed: VERTICAL_SPEED }
					];
					left.calculateVelocity();
					right.calculateVelocity();
				}
				else {
					this.swapTopOrBottom(["top", "bottom"].randomItem());
				}
			},
			move3Blocks: function() {
				/*
				This function cycles around 3 blocks total - 1 in the middle, and two on the left / right / top / bottom.
				*/
				var direction = ["left", "right", "top", "bottom"].randomItem();
				if(direction === "left" || direction === "right") {
					this.cycleBlocks([
						this.getPlatformByLocation("top-" + direction),
						this.getPlatformByLocation("bottom-" + direction),
						this.getPlatformByLocation("center")
					]);
				}
				else {
					this.cycleBlocks([
						this.getPlatformByLocation(direction + "-left"),
						this.getPlatformByLocation(direction + "-right"),
						this.getPlatformByLocation("center")
					]);
				}
			},
			moveCornerBlocks: function() {
				/*
				Moves the corner blocks around in a circle.
				*/
				this.cycleBlocks([
					this.getPlatformByLocation("top-left"),
					this.getPlatformByLocation("bottom-left"),
					this.getPlatformByLocation("bottom-right"),
					this.getPlatformByLocation("top-right")
				]);
			},
			moveAllBlocks: function() {
				/*
				Moves all blocks in a somewhat circular pattern. Basically just moveCornerBlocks() but it includes the middle one in the cycle.
				*/
				var blocks = [
					this.getPlatformByLocation("top-left"),
					this.getPlatformByLocation("bottom-left"),
					this.getPlatformByLocation("bottom-right"),
					this.getPlatformByLocation("top-right")
				];
				var insertAfter = Math.round(Math.random() * blocks.length);
				blocks.splice(insertAfter, 0, this.getPlatformByLocation("center"));
				this.cycleBlocks(blocks);
			},

			reset: function() {
				var platforms = randomSurvivalGame.game.getObjectsByType(randomSurvivalGame.game.Platform);
				for(var i = 0; i < platforms.length; i ++) {
					platforms[i].resetPosition();
				}
			},

			blocksMoved: 0,
			CONSTANT_MOVEMENT_SPEED: false,
			MOVE_PLAYER_WITH_PLATFORMS: false,
		},
		spikeWall: {
			SpikeWall: function(x) {
				this.FAST_SPEED = 10;
				this.SLOW_SPEED = 2;
				this.x = x;
				this.velX = (x < 400) ? this.FAST_SPEED : -this.FAST_SPEED;
				this.direction = (x < 400) ? "right" : "left";
			}
			.method("display", function() {
				c.strokeStyle = "rgb(215, 215, 215)";
				c.fillStyle = randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY;
				if(this.direction === "right") {
					c.fillRect(this.x - 800, 0, 800, 800);
					c.strokeRect(this.x - 800, 0, 800, 800);
					for(var y = 0; y < 800; y += 40) {
						c.fillStyle = "rgb(215, 215, 215)";
						c.fillPoly(
							this.x, y,
							this.x, y + 40,
							this.x + 20, y + 20
						);
					}
				}
				else {
					c.fillRect(this.x, 0, 800, 800);
					for(var y = 0; y < 800; y += 40) {
						c.fillStyle = "rgb(215, 215, 215)";
						c.beginPath();
						c.moveTo(this.x, y);
						c.lineTo(this.x, y + 40);
						c.lineTo(this.x - 20, y + 20);
						c.fill();
					}
				}
			})
			.method("update", function() {
				this.x += this.velX;
				const DISTANCE_FROM_SCREEN_EDGE = 250;
				if(this.direction === "right" && this.x > DISTANCE_FROM_SCREEN_EDGE) {
					this.velX = -this.SLOW_SPEED;
					this.x = Math.min(this.x, DISTANCE_FROM_SCREEN_EDGE);
					randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.Coin(80, [175, 525].randomItem()));
				}
				if(this.direction === "left" && this.x < canvas.width - DISTANCE_FROM_SCREEN_EDGE) {
					this.velX = this.SLOW_SPEED;
					this.x = Math.max(this.x, canvas.width - DISTANCE_FROM_SCREEN_EDGE);
					randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.Coin(720, [175, 525].randomItem()));
				}

				var p = randomSurvivalGame.game.player;
				if(!p.isIntangible()) {
					if(this.direction === "right" && p.x + p.hitbox.left < this.x + 5) {
						p.die("spikewall");
					}
					else if(this.direction === "left" && p.x + p.hitbox.right > this.x - 5) {
						p.die("spikewall");
					}
				}

				const DISTANCE_OFFSCREEN = 50;
				if((this.velX < 0 && this.x < -DISTANCE_OFFSCREEN) || (this.velX > 0 && this.x > canvas.width + DISTANCE_OFFSCREEN)) {
					this.splicing = true;
					randomSurvivalGame.events.endEvent(-1);
					p.surviveEvent("spikewall");
				}
			}),

			begin: function() {
				var SpikeWall = randomSurvivalGame.events.spikeWall.SpikeWall;
				var ChatMessage = randomSurvivalGame.events.ChatMessage;

				const SPIKEWALL_DISTANCE = 1500;
				if(Math.random() < 0.5) {
					randomSurvivalGame.game.objects.push(new SpikeWall(-SPIKEWALL_DISTANCE));
					randomSurvivalGame.game.chatMessages.push(new ChatMessage("Spike wall incoming from the left!", "event"));
				}
				else {
					randomSurvivalGame.game.objects.push(new SpikeWall(canvas.width + SPIKEWALL_DISTANCE));
					randomSurvivalGame.game.chatMessages.push(new ChatMessage("Spike wall incoming from the right!", "event"));
				}
			}
		},

		effects: {
			add: function() {
				if(!randomSurvivalGame.events.listOfEvents.contains("blindness")) {
					randomSurvivalGame.events.listOfEvents.push("blindness");
				}
				if(!randomSurvivalGame.events.listOfEvents.contains("nausea")) {
					randomSurvivalGame.events.listOfEvents.push("nausea");
				}
				if(!randomSurvivalGame.events.listOfEvents.contains("confusion")) {
					randomSurvivalGame.events.listOfEvents.push("confusion");
				}
			},
			remove: function() {
				randomSurvivalGame.events.listOfEvents.removeAll("blindness");
				randomSurvivalGame.events.listOfEvents.removeAll("nausea");
				randomSurvivalGame.events.listOfEvents.removeAll("confusion");
			},

			duration: function() {
				/*
				Returns how long every effect should last, in frames.
				*/
				return randomSurvivalGame.FPS * Math.map(
					randomSurvivalGame.game.difficulty(),
					randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY,
					15, 20
				);
			}
		},
		confusion: {
			AfterImage: function(image) {
				this.image = image;
				var timeConfused = randomSurvivalGame.game.player.timeConfused;
				if(timeConfused < randomSurvivalGame.events.effects.duration() - randomSurvivalGame.FPS) {
					this.timeLeft = Math.map(
						timeConfused,
						0, randomSurvivalGame.events.effects.duration(),
						30, 20
					);
				}
				else {
					this.timeLeft = Math.map(
						timeConfused,
						randomSurvivalGame.events.effects.duration() - randomSurvivalGame.FPS, randomSurvivalGame.events.effects.duration(),
						20, 0
					);
				}
				this.timeToExist = this.timeLeft;
			}
			.method("display", function() {
				var opacity = this.timeLeft / this.timeToExist;
				opacity = Math.constrain(opacity, 0, 1);
				c.save(); {
					c.globalAlpha = opacity;
					this.image.display();
				} c.restore();
			})
			.method("update", function() {
				this.timeLeft --;
				if(this.timeLeft <= 0) {
					this.splicing = true;
				}
			}),

			displayConfusionEffect: function() {
				/*
				Creates afterimages of all the objects in the game.
				*/
				if(randomSurvivalGame.utils.frameCount % 3 !== 0) {
					return;
				}
				var skippedObjects = [
					randomSurvivalGame.events.confusion.AfterImage, // to prevent infinite recursion
					randomSurvivalGame.events.rocket.FireParticle, // to reduce lag
					randomSurvivalGame.game.playerDeathAnimations.PlayerDisintegrationParticle, // to reduce lag
					randomSurvivalGame.events.acid.Acid, // to reduce lag + isn't really that noticeable
					randomSurvivalGame.events.spikeWall.SpikeWall, // not really that noticeable
					randomSurvivalGame.events.Coin, // to make the coins not look strange
					randomSurvivalGame.events.pacmans.Dot, // not visible at all since dots don't move
				];
				var objects = randomSurvivalGame.game.objects;
				outerLoop: for(var i = 0; i < objects.length; i ++) {
					innerLoop: for(var j = 0; j < skippedObjects.length; j ++) {
						if(objects[i] instanceof skippedObjects[j]) {
							continue outerLoop;
						}
					}
					if(objects[i].splicing) {
						continue;
					}
					var image = new randomSurvivalGame.events.confusion.AfterImage(objects[i].clone());
					objects.push(image);
				}
			},
			begin: function() {
				randomSurvivalGame.game.player.timeConfused = 0;
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("You have been confused", "effect"));
				randomSurvivalGame.events.effects.remove();
				randomSurvivalGame.events.endEvent();
			}
		},
		blindness: {
			displayBlindnessEffect: function() {
				/*
				When 'timeBlinded' is 0, smallRadius = 50 and largeRadius = 150.
				When 'timeBlinded' is 1 second away from the end of the event, smallRadius and largeRadius are half the width of the screen.
				When 'timeBlinded' is at the end of the event, smallRadius and largeRadius are the length of the screen diagonal.
				*/
				var timeBlinded = randomSurvivalGame.game.player.timeBlinded;
				if(timeBlinded === Infinity || timeBlinded < 0 || timeBlinded > randomSurvivalGame.events.effects.duration()) {
					return;
				}
				const SCREEN_DIAGONAL_LENGTH = Math.dist(0, 0, canvas.width, canvas.height);
				if(timeBlinded < randomSurvivalGame.events.effects.duration() - randomSurvivalGame.FPS) {
					var largeRadius = Math.map(
						timeBlinded,
						0, randomSurvivalGame.events.effects.duration() - randomSurvivalGame.FPS,
						150, (canvas.width / 2)
					);
					var smallRadius = Math.map(
						timeBlinded,
						0, randomSurvivalGame.events.effects.duration() - randomSurvivalGame.FPS,
						50, (canvas.width / 2)
					);
				}
				else {
					var largeRadius = Math.map(
						timeBlinded,
						randomSurvivalGame.events.effects.duration() - randomSurvivalGame.FPS, randomSurvivalGame.events.effects.duration(),
						(canvas.width / 2), SCREEN_DIAGONAL_LENGTH
					);
					var smallRadius = Math.map(
						timeBlinded,
						randomSurvivalGame.events.effects.duration() - randomSurvivalGame.FPS, randomSurvivalGame.events.effects.duration(),
						(canvas.width / 2) - 10, SCREEN_DIAGONAL_LENGTH
					);
				}
				c.globalAlpha = 1;
				var x = randomSurvivalGame.game.player.x - randomSurvivalGame.game.camera.x;
				var y = randomSurvivalGame.game.player.y - randomSurvivalGame.game.camera.y;
				var gradient = c.createRadialGradient(x, y, smallRadius, x, y, largeRadius);
				gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
				gradient.addColorStop(1, "rgba(0, 0, 0, 255)");
				c.fillStyle = gradient;
				c.fillCanvas();
			},
			begin: function() {
				randomSurvivalGame.game.player.timeBlinded = 0;
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("You have been blinded", "effect"));
				randomSurvivalGame.events.effects.remove();
				randomSurvivalGame.events.endEvent();
			}
		},
		nausea: {
			displayNauseaEffect: function(obj) {
				/*
				Displays two copies of 'obj' around it.
				*/
				if(obj === undefined || obj === null) {
					for(var i = 0; i < randomSurvivalGame.game.objects.length; i ++) {
						var obj = randomSurvivalGame.game.objects[i];
						if(obj.splicing) {
							continue;
						}
						if(typeof obj.display === "function") {
							c.save(); {
								c.translate(-randomSurvivalGame.game.camera.x, -randomSurvivalGame.game.camera.y);
								this.displayNauseaEffect(obj);
							} c.restore();
						}
					}
					return;
				}
				var p = randomSurvivalGame.game.player;
				var offsetX = p.nauseaOffsetArray[p.nauseaOffset].x;
				var offsetY = p.nauseaOffsetArray[p.nauseaOffset].y;
				var timeNauseated = randomSurvivalGame.game.player.timeNauseated;
				if(timeNauseated < randomSurvivalGame.events.effects.duration() - randomSurvivalGame.FPS) {
					var intensity = Math.map(timeNauseated, 0, randomSurvivalGame.events.effects.duration() - randomSurvivalGame.FPS, 1.5, 1);
				}
				else {
					var intensity = Math.map(timeNauseated, randomSurvivalGame.events.effects.duration() - randomSurvivalGame.FPS, randomSurvivalGame.events.effects.duration(), 1, 0);
				}
				offsetX *= intensity;
				offsetY *= intensity;
				obj.x += offsetX;
				obj.y += offsetY;
				obj.display();
				obj.x -= 2 * offsetX;
				obj.y -= 2 * offsetY;
				obj.display();
				obj.x += offsetX;
				obj.y += offsetY;
			},
			begin: function() {
				randomSurvivalGame.game.player.timeNauseated = 0;
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("You have been nauseated", "effect"));
				randomSurvivalGame.events.effects.remove();
				randomSurvivalGame.events.endEvent();
			}
		},

		Enemy: randomSurvivalGame.events.Enemy,
		enemies: {
			addEnemiesAtPosition: function(enemyType, num, positions, noisiness) {
				num = num || 1;
				positions = positions || [
					{ x: 0 - 50, y: 225 - 75 },
					{ x: 0 - 50, y: 575 - 75 },
					{ x: canvas.width + 50, y: 225 - 75 },
					{ x: canvas.width + 50, y: 575 - 75 }
				];
				noisiness = noisiness || 0;
				for(var i = 0; i < num; i ++) {
					var index = positions.randomIndex();
					var pos = positions[index];
					randomSurvivalGame.game.objects.push(new (enemyType)(pos.x, pos.y));
					var theEnemy = randomSurvivalGame.game.objects[randomSurvivalGame.game.objects.length - 1];
					theEnemy.x += Math.randomInRange(-noisiness, noisiness);
					theEnemy.y += Math.randomInRange(-noisiness, noisiness);
					positions.splice(index, 1);
				}
			}
		},
		laserBots: {
			LaserBot: function(x, y) {
				randomSurvivalGame.events.Enemy.call(this);
				this.x = x;
				this.y = y;
				this.velY = 0;
				this.velX = 0;
				this.hitbox = { top: -60, bottom: 0, left: -10, right: 10 };
				this.isDead = false;

				this.timeSinceShot = Math.randomInRange(0, 70);
				this.standingOnPlatform = null;
				this.destination = null; // which platform it is moving toward
				this.goingToDestination = false;
				this.destX = null;
				this.jumpHeight = 5;
				this.canJumpToPlatform = false;
				this.jumpsSinceMove = 0;
				this.jumpsRequired = 1; // how many jumps needed before switching platforms
				this.initialized = false; // whether it has moved entirely onto the screen

				this.facing = "right";
				this.springY = 1;
				this.springVelY = 0;
				this.buttonY = 0;
			}
			.extend(randomSurvivalGame.events.Enemy)
			.method("display", function() {
				var bodyY = this.y - 20 - (30 * this.springY);
				c.globalAlpha = 1;
				/* self-destruct button */
				c.fillStyle = "rgb(255, 0, 0)";
				c.fillRect(this.x - 5, bodyY - 5 + this.buttonY, 10, 10);
				/* body */
				c.fillStyle = "rgb(150, 150, 155)";
				c.strokeStyle = "rgb(150, 150, 155)";
				c.fillRect(this.x - 10, bodyY, 20, 20);
				/* spring */
				c.lineWidth = 2;
				c.save(); {
					c.translate(this.x, this.y);
					c.scale(1, this.springY);
					c.beginPath();
					for(var y = 0; y >= -30; y -= 3) {
						var x = (y % (3 * 2) === 0) ? -7 : 7;
						if(y === 0) {
							c.moveTo(x, y);
						}
						else {
							c.lineTo(x, y);
						}
					}
					c.stroke();
				} c.restore();
				/* laser */
				if(this.facing === "right") {
					c.beginPath();
					c.moveTo(this.x + 10, bodyY + 3);
					c.lineTo(this.x + 20, bodyY + 3);
					c.stroke();
					c.strokeLine(
						this.x + 10, bodyY + 3,
						this.x + 20, bodyY + 3
					);
				}
				else {
					c.beginPath();
					c.moveTo(this.x - 10, bodyY + 3);
					c.lineTo(this.x - 20, bodyY + 3);
					c.stroke();
				}
			})
			.method("update", function() {
				if(this.y > 850) {
					this.splicing = true;
					if(randomSurvivalGame.game.numObjects(randomSurvivalGame.events.laserBots.LaserBot) === 0) {
						/* this is the final LaserBot; end the event */
						randomSurvivalGame.events.endEvent(randomSurvivalGame.FPS * 2);
						randomSurvivalGame.game.player.surviveEvent("laserbots");
					}
				}
				/* movement */
				if(!this.isDead) {
					if(this.destination !== null) {
						this.destX = this.destination.x + (this.destination.w / 2);
					}
					if(!this.initialized) {
						this.destX = (this.x < canvas.width / 2) ? 80 : canvas.width - 80;
						this.goingToDestination = true;
					}
					if(this.destX !== null && this.goingToDestination) {
						if(this.x < this.destX) {
							this.velX = 4;
						}
						else if(this.x > this.destX) {
							this.velX = -4;
						}
						if(!this.initialized) {
							this.velX /= 4;
						}
						if(Math.abs(this.x - this.destX) < 4) {
							this.x = this.destX;
							this.velX = 0;
							this.destX = null;
							this.standingOnPlatform = this.destination;
							this.destination = null;
							this.goingToDestination = false;
							this.initialized = true;
						}
					}
					this.x += this.velX;
				}
				else {
					this.destX = null;
					this.destination = null;
					this.standingOnPlatform = null;
					this.velY = Math.max(this.velY, 3);
					this.springVelY = (this.springY < 1) ? 0.1 : 0;
				}
				this.y += this.velY;
				var p = randomSurvivalGame.game.player;
				if(p.standingOnPlatform === this) {
					if(this.isDead) {
						if(randomSurvivalGame.input.keys[38]) {
							p.velY = -5;
						}
						else {
							p.velY = -3;
						}
						p.standingOnPlatform = null;
					}
					else {
						p.x += this.velX;
						p.y += this.velY;
					}
				}
				this.velY += 0.1;
				/* animation properties */
				this.springY += this.springVelY;
				this.buttonY += (this.isDead && this.buttonY < 10) ? 1 : 0;
				this.facing = (this.x < p.x) ? "right" : "left";
				/* shooting */
				this.timeSinceShot ++;
				if(this.timeSinceShot > 100) {
					this.shoot();
				}
				/* off-screen collisions */
				if(!this.initialized) {
					var platforms = randomSurvivalGame.game.getObjectsByType(randomSurvivalGame.game.Platform);
					var closestPlatform = 0;
					if(this.x < 0) {
						for(var i = 0; i < platforms.length; i ++) {
							if(Math.dist(platforms[i].x, 0) <= 1 && Math.dist(platforms[i].y, this.y) < Math.dist(platforms[closestPlatform].y, this.y)) {
								closestPlatform = i;
							}
						}
						randomSurvivalGame.utils.collisions.rect(-150, platforms[closestPlatform].y, 150, 20, { includedTypes: [randomSurvivalGame.events.laserBots.LaserBot] });
					}
					else if(this.x > canvas.width) {
						for(var i = 0; i < platforms.length; i ++) {
							if(Math.dist(platforms[i].x, 800 - 160) <= 1 && Math.dist(platforms[i].y, this.y) < Math.dist(platforms[closestPlatform].y, this.y)) {
								closestPlatform = i;
							}
						}
						randomSurvivalGame.utils.collisions.rect(800, platforms[closestPlatform].y, 150, 20, { includedTypes: [randomSurvivalGame.events.laserBots.LaserBot] });
					}
				}
			})
			.method("calculateDestination", function() {
				if(this.standingOnPlatform !== null && this.destination === null && this.jumpsSinceMove > this.jumpsRequired) {
					const JUMP_HEIGHT = 100;
					const LEFT_PLATFORM_X = 0;
					const MIDDLE_PLATFORM_X = (canvas.width / 2) - (160 / 2);
					const RIGHT_PLATFORM_X = canvas.width - (160 / 2);
					var platforms = randomSurvivalGame.game.getObjectsByType(randomSurvivalGame.game.Platform);
					var p = randomSurvivalGame.game.player;
					for(var i = 0; i < platforms.length; i ++) {
						var platform = platforms[i];
						if(
							p.y < platform.y &&
							p.y + p.hitbox.bottom > platform.y - JUMP_HEIGHT &&
							this.standingOnPlatform !== platform
						) {
							/* this laserbot now wants to be on this platform */
							if(!randomSurvivalGame.events.laserBots.isPlatformOccupied(platform)) {
								this.goToPlatform(platform);
								if(this.destination !== null) {
									break;
								}
							}
							else if(platform.x !== MIDDLE_PLATFORM_X && this.standingOnPlatform.x !== MIDDLE_PLATFORM_X) {
								/* if it wants to go to a side platform and isn't on the middle platform, go to the middle platform (if unoccupied) */
								for(var j = 0; j < platforms.length; j ++) {
									if(Math.dist(platforms[j].x, MIDDLE_PLATFORM_X) <= 1 && !randomSurvivalGame.events.laserBots.isPlatformOccupied(platforms[j])) {
										this.goToPlatform(platforms[j]);
									}
								}
							}
						}
					}
				}
			})
			.method("goToPlatform", function(platform) {
				/*
				This function should only be called when one assumes that:
				- This laserbot has not calculated where to go
				- The destination platform is unoccupied
				- This laserbot wants to go to that platform
				*/
				const MIDDLE_PLATFORM_X = (canvas.width / 2) - (160 / 2);
				if(Math.dist(platform.x, MIDDLE_PLATFORM_X) <= 1) {
					/* going to the middle platform */
					this.destX = platform.x + (platform.w / 2);
					this.destination = platform;
					if(this.standingOnPlatform.y >= platform.y) {
						this.jumpHeight = 7;
					}
					else {
						this.jumpHeight = 3;
					}
					this.canJumpToPlatform = false;
				}
				else {
					/* going to one of the corner platforms */
					if(Math.dist(this.standingOnPlatform.x, MIDDLE_PLATFORM_X) <= 1) {
						this.destX = platform.x + (platform.w / 2);
						this.destination = platform;
						if(this.standingOnPlatform.y > platform.y) {
							this.jumpHeight = 7;
						}
						else {
							this.jumpHeight = 3;
						}
						this.canJumpToPlatform = false;
					}
					else {
						/* find middle platform and go to it */
						var platforms = randomSurvivalGame.game.getObjectsByType(randomSurvivalGame.game.Platform);
						for(var i = 0; i < platforms.length; i ++) {
							if(Math.dist(platforms[i].x, MIDDLE_PLATFORM_X) <= 1 && !randomSurvivalGame.events.laserBots.isPlatformOccupied(platforms[i])) {
								this.goToPlatform(platforms[i]);
							}
						}
					}
				}
			})
			.method("handleCollision", function(direction, platform) {
				if(this.isDead) {
					this.hitbox = null; // no more platform collisions
					return;
				}
				if(direction === "floor") {
					const SPEED = 0.1;
					this.velY = 0;
					if(this.springVelY === 0) {
						this.springVelY = -SPEED;
					}
					else if(this.springVelY === -SPEED && this.springY <= 0) {
						this.springVelY = SPEED;
					}
					else if(this.springVelY === SPEED && this.springY >= 1) {
						/* calculate which platform it wants to be on */
						this.calculateDestination();

						this.springVelY = 0;
						this.springY = 1;
						if(this.jumpsSinceMove > this.jumpsRequired) {
							this.velY = -this.jumpHeight;
							this.jumpHeight = 5;
						}
						else {
							this.velY = -5; // default jump height when not switching platforms
						}
						if(this.destination !== null && this.jumpsSinceMove > this.jumpsRequired) {
							this.goingToDestination = true;
							this.jumpsSinceMove = 0;
						}
						this.jumpsSinceMove ++;
						this.canJumpToPlatform = true;
					}
					this.standingOnPlatform = platform;
					if(!this.goingToDestination && this.destX !== platform.x + (platform.w / 2)) {
						this.destX = platform.x + (platform.w / 2);
					}
				}
			})
			.method("collide", function() {
				if(this.isDead) { return; }
				var bodyY = this.y - 20 - (30 * this.springY);
				randomSurvivalGame.utils.collisions.rect(
					this.x - 10, bodyY, 20, 20,
					{
						sides: ["left", "right", "top"],
						caller: this,
						velX: this.velX,
						velY: this.velY - (this.springVelY * 30),
						excludedTypes: [randomSurvivalGame.game.playerDeathAnimations.PlayerDisintegrationParticle]
					}
				);
			})
			.method("shoot", function() {
				var bodyY = this.y - 20 - (30 * this.springY);
				this.timeSinceShot = 0;
				var Laser = randomSurvivalGame.events.laserBots.Laser;
				if(this.facing === "right") {
					randomSurvivalGame.game.objects.push(new Laser(this.x, bodyY + 3, 4, this));
				}
				else {
					randomSurvivalGame.game.objects.push(new Laser(this.x, bodyY + 3, -4, this));
				}
			}),

			Laser: function(x, y, velX, shooter) {
				this.x = x;
				this.y = y;
				this.velX = velX;
				this.length = 0;
				this.shooter = shooter; // which laserbot shot this laser
			}
			.method("display", function() {
				c.strokeStyle = "rgb(255, 0, 0)";
				c.lineWidth = 5;
				if(this.velX > 0) {
					c.strokeLine(
						this.x, this.y, this.x - this.length, this.y
					);
				}
				else {
					c.strokeLine(
						this.x, this.y, this.x + this.length, this.y
					);
				}
			})
			.method("update", function() {
				this.x += this.velX;
				if(this.length < 50) {
					this.length += Math.abs(this.velX);
					if(this.shooter instanceof randomSurvivalGame.events.laserBots.LaserBot) {
						this.y = this.shooter.y - 20 - (30 * this.shooter.springY) + 3;
						this.x += this.shooter.velX;
					}
				}
				else if(!randomSurvivalGame.game.player.isIntangible()) {
					if(this.velX < 0) {
						randomSurvivalGame.utils.killCollisions.rect(this.x, this.y, this.length, 1, "laserbots");
					}
					else {
						randomSurvivalGame.utils.killCollisions.rect(this.x - this.length, this.y, this.length, 1, "laserbots");
					}
				}
				if(this.x < 0 - 50 || this.x > canvas.width + 50) {
					this.splicing = true;
				}
			}),

			isPlatformOccupied: function(platform) {
				/*
				Used for the LaserBot's logic. Returns whether the platform has a LaserBot on it, or whether there is a LaserBot going to the platform.
				*/
				var laserBots = randomSurvivalGame.game.getObjectsByType(randomSurvivalGame.events.laserBots.LaserBot);
				for(var i = 0; i < laserBots.length; i ++) {
					if(laserBots[i].destination === platform || laserBots[i].standingOnPlatform === platform) {
						return true;
					}
				}
				return false;
			},

			begin: function() {
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("LaserBots are invading!", "enemy"));
				var numEnemies = 2;
				if(randomSurvivalGame.game.difficulty() > Math.map(1/2, 0, 1, randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY)) {
					numEnemies = 3;
				}
				if(randomSurvivalGame.game.difficulty() >= randomSurvivalGame.game.MAX_DIFFICULTY) {
					numEnemies = 4;
				}
				randomSurvivalGame.events.enemies.addEnemiesAtPosition(randomSurvivalGame.events.laserBots.LaserBot, numEnemies, null, 50);
			}
		},
		badGuys: {
			BadGuy: function(x, y) {
				this.x = x;
				this.y = y;
				this.velX = 0;
				this.velY = 0;
				this.player = new randomSurvivalGame.game.Player();
				this.player.timeInvincible = Infinity;
				this.hitbox = this.player.hitbox;
				/* arm + leg animation properties */
				this.animations = {
					legs: 0,
					arms: 0,
					legDir: 0.5,
					armDir: 0
				};
			}
			.extend(randomSurvivalGame.events.Enemy)
			.method("display", function() {
				/* display stick figure graphics (same as player) */
				this.player.animations.legs = this.animations.legs;
				this.player.animations.arms = this.animations.arms;
				this.player.facing = "none"; // remove default grey player eyes
				this.player.display();
				/* display red eyes */
				c.fillStyle = "rgb(255, 0, 0)";
				c.beginPath();
				if(this.x > randomSurvivalGame.game.player.x) {
					c.fillCircle(this.player.x - 4, this.player.y + 10, 3);
				}
				else {
					c.fillCircle(this.player.x + 4, this.player.y + 10, 3);
				}
				c.fill();
			})
			.method("update", function() {
				this.player.x = this.x;
				this.player.y = this.y;
				this.x += this.velX;
				this.y += this.velY;
				this.velX = Math.constrain(this.velX, -3, 3);
				const SPEED = 0.1;
				var p = randomSurvivalGame.game.player;
				if(this.x < p.x) {
					this.velX += SPEED;
				}
				else {
					this.velX -= SPEED;
				}
				this.velY += 0.1;
				/* leg + arm animations */
				this.updateAnimations();
				/* death */
				if(this.y > 850) {
					this.splicing = true;
					if(randomSurvivalGame.game.numObjects(randomSurvivalGame.events.badGuys.BadGuy) === 0) {
						randomSurvivalGame.events.endEvent(randomSurvivalGame.FPS * 2.5);
						randomSurvivalGame.game.player.surviveEvent("bad guys");
					}
				}
				/* kill player */
				if(!p.isIntangible()) {
					randomSurvivalGame.utils.killCollisions.rect(this.x - 5, this.y, 10, 46, "bad guys");
				}
				/* border collisions */
				if(this.x + this.hitbox.right > canvas.width) {
					this.velX = Math.min(this.velX, -5);
				}
				else if(this.x + this.hitbox.left < 0) {
					this.velX = Math.max(this.velX, 5);
				}
			})
			.method("updateAnimations", function() {
				/* leg animations */
				this.animations.legs += this.animations.legDir;
				if(this.animations.legs < -5) {
					this.animations.legDir = 0.5;
				}
				else if(this.animations.legs > 5) {
					this.animations.legDir = -0.5;
				}
				/* arm animations */
				this.animations.arms += this.animations.armDir;
				this.animations.arms = Math.constrain(this.animations.arms, -5, 10);
				if(this.velY === 0.1) {
					this.animations.armDir = 1;
				}
				else {
					this.animations.armDir = -1;
				}
			})
			.method("collide", function() {
				randomSurvivalGame.utils.collisions.rect(
					this.x - 5, this.y, 10, 46,
					{
						includedTypes: [randomSurvivalGame.events.badGuys.BadGuy],
						caller: this,
						velX: this.velX,
						velY: this.velY
					}
				);
			})
			.method("handleCollision", function(direction, platform) {
				if(direction === "floor") {
					this.velY = 0;
					if(platform !== null && (this.x - 5 < platform.x || this.x + 5 > platform.x + platform.w)) {
						this.velY = -6;
					}
				}
				else if(direction === "wall-to-left") {
					this.velX = 3;
				}
				else if(direction === "wall-to-right") {
					this.velX = -3;
				}
				else if(direction === "ceiling") {
					this.velY = 4;
				}
			}),

			begin: function() {
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("Bad Guys are invading!", "enemy"));
				var numEnemies = 2;
				if(randomSurvivalGame.game.difficulty() > Math.map(1/2, 0, 1, randomSurvivalGame.game.MIN_DIFFICULTY, randomSurvivalGame.game.MAX_DIFFICULTY)) {
					numEnemies = 3;
				}
				if(randomSurvivalGame.game.difficulty() >= randomSurvivalGame.game.MAX_DIFFICULTY) {
					numEnemies = 4;
				}
				randomSurvivalGame.events.enemies.addEnemiesAtPosition(randomSurvivalGame.events.badGuys.BadGuy, numEnemies, null, 25);
			}
		},
		aliens: {
			Alien: function(x, y) {
				// referred to as UFOs in-game
				this.x = x;
				this.y = y;
				this.velX = 0;
				this.velY = 0;
				this.rotation = 0;
				this.tractorBeamOpacity = 0;
				this.lives = 3;
				this.timeInvincible = 0;

				this.hitbox = { top: -40, bottom: 20, left: -40, right: 40 };
				this.ACCELERATION = 0.05;
				this.MAX_VELOCITY = 4;

				this.TRACTOR_BEAM_HEIGHT = 90;
				this.TRACTOR_BEAM_ACTIVATION_SPEED = 0.05;
			}
			.extend(randomSurvivalGame.events.Enemy)
			.method("display", function() {
				c.save(); {
					c.translate(this.x, this.y);
					c.rotate(Math.toRadians(this.rotation));
					/* tractor beam */
					c.save(); {
						var gradient = c.createLinearGradient(0, 0, 0, this.TRACTOR_BEAM_HEIGHT);
						gradient.addColorStop(1, "rgb(255, 255, 0, 0)");
						gradient.addColorStop(0, "rgb(255, 255, 0, 1)");
						c.fillStyle = gradient;
						c.globalAlpha = this.tractorBeamOpacity;
						c.fillPoly(
							-15, 0,
							15, 0,
							30, this.TRACTOR_BEAM_HEIGHT,
							-30, this.TRACTOR_BEAM_HEIGHT
						);
					} c.restore();
					/* spaceship body */
					c.save(); {
						c.fillStyle = "rgb(150, 150, 155)";
						c.scale(1, 0.5);
						c.fillCircle(0, 0, 40);
					} c.restore();
					/* moving lines (to make spaceship look like it is spinning) */
					c.save(); {
						c.scale(1, 0.5);
						c.clipCircle(0, 0, 40);
						c.strokeStyle = "rgb(120, 120, 125)";
						for(var r = 0; r <= 360; r += 360 / 8) {
							var rotation = r + (randomSurvivalGame.utils.frameCount * 4); // for animation
							var point = Math.rotateDegrees(-50, 0, rotation);
							c.strokeLine(
								0, -20,
								point.x, point.y - 20
							);
						}
					} c.restore();
					/* spaceship cockpit - bottom arc */
					c.fillStyle = "rgb(13, 191, 61)";
					c.save(); {
						c.translate(0, -20);
						c.scale(1, 0.5);
						c.fillArc(0, 0, 20, Math.toRadians(90 - 70), Math.toRadians(90 + 70));
					} c.restore();
					/* spaceship cockpit - top arc */
					c.save(); {
						c.translate(0, -20);
						/* calculate where the bottom arc ended */
						var point = Math.rotateDegrees(0, 20, 70);
						var left = point.x;
						var right = -point.x;
						var top = -5;
						var bottom = point.y - 2;
						c.fillRect(left, top, right - left, bottom - top);
						c.fillArc(0, top, right, Math.toRadians(180), Math.toRadians(360));
						/* cracks in windsheild to show health */
						c.strokeStyle = "rgb(63, 241, 121)";
						c.lineWidth = 2;
						if(this.lives <= 2) {
							c.strokeLine(right, top, right - 20, top - 10);
							c.strokeLine(right - 10, top - 5, right - 20, top + 5);
						}
						if(this.lives <= 1) {
							c.strokeLine(left, top, left + 15, top + 15);
							c.strokeLine(left + 7, top + 7, left + 7, top - 5);
						}
					} c.restore();
				} c.restore();
			})
			.method("update", function() {
				/* movement */
				var p = randomSurvivalGame.game.player;
				var destX = p.x;
				var destY = p.y - 75;
				if(p.beingAbductedBy !== null && p.beingAbductedBy !== this) {
					/* move away from player */
					this.velX += (this.x < destX) ? -this.ACCELERATION : this.ACCELERATION;
					this.velY += (this.y < destY) ? -this.ACCELERATION : this.ACCELERATION;
				}
				else {
					/* move towards player */
					this.velX += (this.x > destX) ? -this.ACCELERATION : this.ACCELERATION;
					this.velY += (this.y > destY) ? -this.ACCELERATION : this.ACCELERATION;
				}
				this.x += this.velX;
				this.y += this.velY;
				this.velX = Math.constrain(this.velX, -this.MAX_VELOCITY, this.MAX_VELOCITY);
				this.velY = Math.constrain(this.velY, -this.MAX_VELOCITY, this.MAX_VELOCITY);
				/* tractor beam activation */
				if(Math.dist(this.x, this.y, destX, destY) <= 100) {
					this.tractorBeamOpacity += this.TRACTOR_BEAM_ACTIVATION_SPEED;
				}
				else {
					this.tractorBeamOpacity -= this.TRACTOR_BEAM_ACTIVATION_SPEED;
				}
				this.tractorBeamOpacity = Math.constrain(this.tractorBeamOpacity, 0, 1);
				/* tractor beam player abduction */
				if(this.tractorBeamOpacity > 0.25) {
					if(randomSurvivalGame.utils.isPlayerInRect(this.x - 30, this.y, 60, this.TRACTOR_BEAM_HEIGHT + 15)) {
						p.beingAbductedBy = this;
					}
					else if(p.beingAbductedBy === this) {
						p.beingAbductedBy = null;
					}
				}
				if(p.beingAbductedBy === this && !p.isIntangible()) {
					if((this.velX < 0 && p.x > this.x) || (this.velX > 0 && p.x < this.x)) {
						p.velX = this.velX;
					}
					else {
						p.velX = 0;
					}
					p.velY = this.velY;
					if(p.y + p.hitbox.top > this.y + 30) {
						p.velY --;
					}
					else {
						p.velY ++;
					}
					if(p.y < -100) {
						p.die("aliens");
					}
				}
				/* collide with other UFOs */
				if(this.timeInvincible < 0) {
					var aliens = randomSurvivalGame.game.getObjectsByType(randomSurvivalGame.events.aliens.Alien);
					for(var i = 0; i < aliens.length; i ++) {
						if(aliens[i] !== this && randomSurvivalGame.utils.collidesWith(this, aliens[i])) {
							this.lives --;
							aliens[i].lives --;
							var velocity = Math.normalize(
								aliens[i].x - this.x,
								aliens[i].y - this.y
							);
							velocity.x *= 10;
							velocity.y *= 10;
							this.velX = -velocity.x;
							this.velY = -velocity.y;
							aliens[i].velX = velocity.x;
							aliens[i].velY = velocity.y;
							this.timeInvincible = randomSurvivalGame.FPS / 10;
							aliens[i].timeInvincible = randomSurvivalGame.FPS / 10;
							if(this.lives <= 0 && aliens[i].lives <= 0) {
								this.splicing = true;
								aliens[i].splicing = true;
								if(p.beingAbductedBy === this || p.beingAbductedBy === aliens[i]) {
									p.beingAbductedBy = null;
								}
								if(randomSurvivalGame.game.numObjects(randomSurvivalGame.events.aliens.Alien) === 0) {
									randomSurvivalGame.game.player.surviveEvent("aliens");
									randomSurvivalGame.events.endEvent(randomSurvivalGame.FPS * 2);
								}
								/* create explosion */
								var laser = new randomSurvivalGame.events.laser.Crosshair();
								laser.x = Math.average(this.x, aliens[i].x);
								laser.y = Math.average(this.y, aliens[i].y);
								laser.explode(true);
							}
						}
					}
				}
				this.timeInvincible --;
				/* screen edge collisions */
				if(this.x + this.hitbox.right > canvas.width) {
					this.velX = -Math.abs(this.velX);
				}
				else if(this.x + this.hitbox.left < 0) {
					this.velX = Math.abs(this.velX);
				}
				this.y = Math.constrain(this.y, -200, canvas.height + 100);
				/* move toward center of screen to avoid top platforms while abducting player */
				if(p.beingAbductedBy === this) {
					if(this.x > canvas.width - 160) {
						this.velX -= 0.2;
					}
					else if(this.x < 160) {
						this.velX += 0.2;
					}
				}
				/* smoke particles when damage has been taken */
				if(this.lives < 3) {
					function addSmokeParticle(self) {
						randomSurvivalGame.game.objects.push(new randomSurvivalGame.events.aliens.SmokeParticle(
							Math.randomInRange(self.x - 20, self.x + 20),
							Math.randomInRange(self.y - 20, self.y + 20),
							Math.constrain(-self.velX + Math.randomInRange(-1, 1), -2, 2),
							Math.constrain(-self.velY + Math.randomInRange(-1, 1), -2, 2)
						));
					};
					if(randomSurvivalGame.utils.frameCount % 3 === 0) {
						addSmokeParticle(this);
					}
					if(randomSurvivalGame.utils.frameCount % 3 === 0 && this.lives <= 1) {
						addSmokeParticle(this);
					}
				}
			})
			.method("handleCollision", function(direction, platform) {
				if(direction === "floor") {
					this.velY = -Math.abs(this.velY);
				}
				else if(direction === "ceiling") {
					this.velY = Math.abs(this.velY);
				}
				else if(direction === "wall-to-right") {
					this.velX = -Math.abs(this.velX);
				}
				else if(direction === "wall-to-left") {
					this.velX = Math.abs(this.velX);
				}
			}),

			SmokeParticle: function(x, y, velX, velY) {
				this.x = x;
				this.y = y;
				this.velX = velX;
				this.velY = velX;
				this.opacity = 1;
				this.size = Math.randomInRange(7, 10);
			}
			.method("display", function() {
				c.save(); {
					c.fillStyle = "rgb(0, 0, 0)";
					c.globalAlpha = this.opacity;
					c.fillCircle(this.x, this.y, this.size);
				} c.restore();
			})
			.method("update", function() {
				this.x += this.velX;
				this.y += this.velY;
				this.opacity -= 1 / 200;
				this.size -= 1 / 20;
				if(this.opacity <= 0 || this.size <= 0) {
					this.splicing = true;
				}
			}),

			begin: function() {
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("UFOs are invading!", "enemy"));
				var numEnemies = 2;
				if(numEnemies === 2) {
					var xPosition = (Math.random() < 0.5) ? (0 - 50) : (canvas.width + 50);
					randomSurvivalGame.events.enemies.addEnemiesAtPosition(
						randomSurvivalGame.events.aliens.Alien, 2,
						[
							{ x: xPosition, y: 225 - 75 },
							{ x: xPosition, y: 575 - 75 }
						],
						0
					);
				}
			}
		},
	},
	shop: {
		ShopItem: function(x, y, name, display, upgrades, color) {
			this.x = x;
			this.y = y;
			this.ORIGINAL_X = x;
			this.ORIGINAL_Y = y;
			this.name = name;
			this.display = display; // a function called to display graphics
			this.upgrades = upgrades;
			this.color = color;
			this.bought = false;
			this.equipped = false;
			this.description = upgrades[0].text;
			this.infoOpacity = 0;
			this.numUpgrades = 0;
			this.showingPopup = false;
			this.glowOpacity = 0;
		}
		.method("displayLogo", function(size) {
			if(size === 1) {
				this.x = this.ORIGINAL_X;
				this.y = this.ORIGINAL_Y;
			}
			c.save(); {
				c.translate(this.x, this.y);
				c.scale(size, size);
				if(size !== 1) {
					const GLOW_EFFECT_SIZE = 75 + 25;
					c.save(); {
						var gradient = c.createRadialGradient(0, 0, 75, 0, 0, GLOW_EFFECT_SIZE);
						var colors = this.color.match(/\d+/g);
						gradient.addColorStop(0, "rgba(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ", 1)");
						gradient.addColorStop(1, "rgba(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ", 0)");
						this.glowOpacity -= 0.05;
						this.glowOpacity = Math.constrain(this.glowOpacity, 0, 1);
						c.globalAlpha = this.glowOpacity;
						c.fillStyle = gradient;
						c.fillCircle(0, 0, GLOW_EFFECT_SIZE);
					} c.restore();
				}
				c.strokeStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				c.fillStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
				c.lineWidth = 5;
				c.strokeCircle(0, 0, 75);
				if(size !== 1) {
					c.fill();
				}
				if(this.bought && !this.noUpgrades) {
					c.fillStyle = (this.equipped) ? randomSurvivalGame.ui.COLORS.UI_DARK_GRAY : randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
					c.strokeStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
					c.fillCircle  (50, -50, 20);
					c.strokeCircle(50, -50, 20);
					c.loadTextStyle({
						color: (this.equipped ? randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY : randomSurvivalGame.ui.COLORS.UI_DARK_GRAY),
						textAlign: "center",
						font: "bold 20px monospace"
					});
					c.fillText(this.numUpgrades, 50, -45);
				}
				this.display(!this.bought);
			} c.restore();
			var mouseOver = false;
			if(randomSurvivalGame.utils.mouseInCircle(this.x, this.y, 75)) {
				mouseOver = true;
			}
			if(this.infoOpacity > 0) {
				if(this.x >= 500 && randomSurvivalGame.utils.mouseInRect(this.x - 85 - 250, this.y - 100, 250, 200)) {
					mouseOver = true;
				}
				if(this.x <= 500 && randomSurvivalGame.utils.mouseInRect(this.x + 85, this.y - 100, 250, 200)) {
					mouseOver = true;
				}
				if(this.x <= 500 && randomSurvivalGame.utils.mouseInRect(this.x, this.y - 75, 100, 150)) {
					mouseOver = true;
				}
				if(this.x >= 500 && randomSurvivalGame.utils.mouseInRect(this.x - 100, this.y - 75, 100, 150)) {
					mouseOver = true;
				}
			}
			/* prevent conflicts between overlapping shop items when mousing over */
			var shop = randomSurvivalGame.shop;
			for(var i = 0; i < shop.items.length; i ++) {
				if(shop.items[i].infoOpacity > 0 && shop.items[i] !== this) {
					mouseOver = false;
				}
			}
			if(mouseOver) {
				this.infoOpacity += 0.1;
			}
			else {
				this.infoOpacity -= 0.1;
			}
			this.infoOpacity = Math.constrain(this.infoOpacity, 0, 1);
		})
		.method("displayInfo", function(direction) {
			if(this.infoOpacity <= 0) {
				return;
			}
			if(direction !== "right" && direction !== "left") {
				this.displayInfo((this.x > canvas.width / 2) ? "left" : "right");
				return;
			}
			const BOX_WIDTH = 250;
			const BOX_HEIGHT = 200;
			const MARGIN_WIDTH = 10;
			c.save(); {
				c.globalAlpha = Math.max(this.infoOpacity, 0);
				c.fillStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				/* display triangle + box */
				c.save(); {
					c.translate(this.x, this.y);
					if(direction === "left") {
						c.scale(-1, 1);
					}
					c.fillPoly(
						75, 0,
						85, 10,
						85, -10
					);
					c.fillRect(85, -(BOX_HEIGHT / 2), BOX_WIDTH, BOX_HEIGHT);
				} c.restore();
				/* display text */
				c.save(); {
					/* translate to top-left corner of textbox */
					c.translate(this.x, this.y);
					var buttonOffset = { x: this.x, y: this.y };
					if(direction === "left") {
						c.translate(-85 - BOX_WIDTH, -(BOX_HEIGHT / 2));
						buttonOffset.x += (-85 - BOX_WIDTH);
					}
					else {
						c.translate(85, -(BOX_HEIGHT / 2));
						buttonOffset.x += 85;
					}
					buttonOffset.y -= BOX_HEIGHT / 2;
					/* textbox title */
					c.loadTextStyle({
						color: randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY,
						font: (this.name.length > 21) ? "17px monospace" : "20px monospace",
					});
					c.fillText(this.name, MARGIN_WIDTH, 20);
					/* title underline */
					c.strokeStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
					c.strokeLine(
						MARGIN_WIDTH            , 30,
						BOX_WIDTH - MARGIN_WIDTH, 30
					);
					/* description text */
					c.loadTextStyle({ font: "20px monospace" });
					c.displayTextOverLines(this.description, MARGIN_WIDTH, 50, BOX_WIDTH - (MARGIN_WIDTH), 20);
					/* buttons */
					var self = this;
					if(this.bought) {
						if(!this.noEquipping) {
							this.displayButton(
								MARGIN_WIDTH, BOX_HEIGHT - 80, BOX_WIDTH - (MARGIN_WIDTH * 2), 30,
								{
									text: (this.equipped ? "Unequip" : "Equip"),
									onclick: function() {
										self.equipped = !self.equipped;
										randomSurvivalGame.persistentData.saveShopItems();
									},
									canBeClicked: (randomSurvivalGame.shop.canEquipAnotherItem() || this.equipped),
									translation: buttonOffset,
								}
							);
						}
						if(!this.noUpgrades) {
							this.displayButton(
								MARGIN_WIDTH, BOX_HEIGHT - 40, BOX_WIDTH - (MARGIN_WIDTH * 2), 30,
								{
									text: (this.isFullyUpgraded() ? "Fully Upgraded" : "Upgrade - " + this.calculatePrice() + " coins"),
									onclick: function() {
										self.showingPopup = true;
									},
									translation: buttonOffset
								}
							);
						}
					}
					else {
						this.displayButton(
							MARGIN_WIDTH, BOX_HEIGHT - 40, BOX_WIDTH - (MARGIN_WIDTH * 2), 30,
							{
								text: "Buy - " + this.calculatePrice() + " coins",
								onclick: function() {
									var p = randomSurvivalGame.game.player;
									if(!self.bought && p.totalCoins >= self.calculatePrice()) {
										p.totalCoins -= self.calculatePrice();
										self.bought = true;
										self.numUpgrades ++;
										randomSurvivalGame.persistentData.saveShopItems();
										randomSurvivalGame.persistentData.saveCoins();
									}
								},
								translation: buttonOffset
							}
						);
					}
				} c.restore();
			} c.restore();
		})
		.method("displayPopup", function() {
			if(this.showingPopup) {
				var shop = randomSurvivalGame.shop;
				for(var i = 0; i < shop.items.length; i ++) {
					shop.items[i].infoOpacity = -0.5;
				}
				c.fillStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				c.fillRect(250, 250, 300, 300);
				/* title */
				c.loadTextStyle({
					color: randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY,
				});
				c.fillText((this.isFullyUpgraded() ? "Fully Upgraded Abilities:" : "Upgrade Item"), 260, 270);
				/* line */
				c.strokeStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
				c.strokeLine(
					260, 280,
					540, 280
				);
				/* upgrade description */
				c.displayTextOverLines(this.calculateUpgradeDescription(), 260, 300, 280, 20);
				/* button 1 (close dialog box) */
				var self = this;
				this.displayButton(
					260, (this.isFullyUpgraded()) ? 470 + 40 : 470, 280, 30,
					{
						text: "Close",
						onclick: function() {
							self.showingPopup = false;
						}
					}
				);
				/* button 2 */
				if(!this.isFullyUpgraded()) {
					this.displayButton(
						260, 510, 280, 30,
						{
							text: "Upgrade - " + this.calculatePrice() + " coins",
							onclick: function() {
								var p = randomSurvivalGame.game.player;
								if(p.totalCoins >= self.calculatePrice()) {
									p.totalCoins -= self.calculatePrice();
									self.numUpgrades ++;
									self.showingPopup = false;
									randomSurvivalGame.persistentData.saveShopItems();
									randomSurvivalGame.persistentData.saveCoins();
								}
							}
						}
					);
				}
			}
		})
		.method("displayButton", function(x, y, w, h, settings) {
			settings = settings || {};
			settings.text = settings.text || "Text Here";
			settings.onclick = settings.onclick || function() {
				console. log("Button was clicked");
			};
			settings.translation = settings.translation || { x: 0, y: 0 }; // used for if the canvas is translated so that the mouse positions will be correct
			if(settings.canBeClicked === undefined || settings.canBeClicked === null) {
				settings.canBeClicked = true;
			}
			c.save(); {
				c.loadTextStyle({
					textAlign: "center"
				});
				c.strokeRect(x, y, w, h);
				c.fillText(settings.text, x + (w / 2), y + (h / 2) + 5);
			} c.restore();
			if(settings.canBeClicked && randomSurvivalGame.utils.mouseInRect(x + settings.translation.x, y + settings.translation.y, w, h)) {
				randomSurvivalGame.input.mouse.cursor = "pointer";
				if(randomSurvivalGame.input.mouse.pressed && !randomSurvivalGame.utils.pastInputs.mouse.pressed) {
					settings.onclick();
				}
			}
		})

		.method("isFullyUpgraded", function() {
			return this.numUpgrades >= this.upgrades.length;
		})
		.method("calculatePrice", function() {
			if(this.numUpgrades < this.upgrades.length) {
				return this.upgrades[this.numUpgrades].price;
			}
			else {
				return null;
			}
		})
		.method("calculateUpgradeDescription", function() {
			if(this.isFullyUpgraded()) {
				var lastUpgradeText = this.upgrades[this.upgrades.length - 1].text;
				for(var i = 0; i < lastUpgradeText.length; i ++) {
					if(lastUpgradeText[i] === "Upgraded Level:") {
						return lastUpgradeText.slice(i + 1);
					}
				}
			}
			else {
				return this.upgrades[this.numUpgrades].text;
			}
		}),

		initializedShopItems: randomSurvivalGame.utils.initializer.request(function() {
			var shop = randomSurvivalGame.shop;
			var ShopItem = randomSurvivalGame.shop.ShopItem;

			shop.coinDoubler = new ShopItem(
				800 / 4, 800 / 3,
				"Piggy Bank of Money",
				function(isGrayscale) {
					c.save(); {
						c.translate(10, 0);
						/* body */
						c.fillStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(223, 160, 171)");
						c.fillCircle(0, 0, 30);
						/* legs */
						c.fillRect(0 - 20, 0, 15, 35);
						c.fillRect(0 + 5, 0, 15, 35);
						/* head */
						c.save(); {
							c.beginPath();
							c.circle(0 - 50, 0 - 20, 20);
							c.invertPath();
							c.clip("evenodd");

							c.fillCircle(0 - 40, 0 - 10, 20);
						} c.restore();
						/* chin */
						c.fillPoly(
							0 - 40, 0 + 10,
							0     , 0 + 20,
							0     , 0
						);
						/* coin slot - whitespace */
						c.strokeStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
						c.strokeArc(0, 0, 20, Math.toRadians(270 - 35), Math.toRadians(270 + 35));
					} c.restore();
				},
				[
						{
							text: "With this amazing piggy bank, you will be able to collect a lot of money.",
							price: 5
						},
						{
							text: [
								"Current Level:",
								"● 2x coin multiplier",
								"",
								"Upgraded Level:",
								"● 2x coin multiplier",
								"● Coin magnet"
							],
							price: 10
						},
						{
							text: [
								"Current Level:",
								"● 2x coin multiplier",
								"● Coin magnet",
								"",
								"Upgraded Level:",
								"● 2x coin multiplier",
								"● Stronger coin magnet"
							],
							price: 15
						},
					],
				"rgb(223, 160, 171)"
			);
			shop.speedIncreaser = new ShopItem(
				800 / 4 * 2, 800 / 3,
				"Boots of Speed",
				function(isGrayscale) {
					c.save(); {
						c.translate(0, -5);
						c.scale(0.85, 0.85);
						const HEAD_DISTANCE = 10;
						const ARM_SIZE = 20;
						const LEG_SIZE = 20;
						const SHOE_SIZE = 20;
						const BODY_SIZE = 20;
						var gray = randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY;
						c.strokeStyle = (isGrayscale ? gray : "rgb(0, 0, 0)");
						c.lineWidth = 5 * (1 / 0.85);
						c.strokeLine(-BODY_SIZE / 2, -BODY_SIZE / 2, BODY_SIZE / 2, BODY_SIZE / 2);
						c.save(); {
							c.translate(BODY_SIZE / 2, BODY_SIZE / 2);
							c.strokeStyle = (isGrayscale ? gray : "rgb(0, 223, 0)");
							c.strokeLine(0, LEG_SIZE * 2, -SHOE_SIZE, LEG_SIZE * 2);
							c.strokeLine(LEG_SIZE * 2, LEG_SIZE * 2, LEG_SIZE * 2 - SHOE_SIZE, LEG_SIZE * 2);
							c.strokeStyle = (isGrayscale ? gray : "rgb(0, 0, 0)");
							c.strokeLine(
								0, 0,
								-LEG_SIZE, LEG_SIZE,
								0, LEG_SIZE * 2
							);
							c.strokeLine(
								0, 0,
								LEG_SIZE * 2, LEG_SIZE * 2
							);
						} c.restore();
						c.save(); {
							c.fillStyle = (isGrayscale ? gray : "rgb(0, 0, 0)");
							c.translate(-BODY_SIZE / 2, -BODY_SIZE / 2);
							c.fillCircle(-HEAD_DISTANCE, -HEAD_DISTANCE, Math.dist(-HEAD_DISTANCE, -HEAD_DISTANCE, 0, 0));
							c.strokeLine(
								0, 0,
								-ARM_SIZE, ARM_SIZE,
								-2 * ARM_SIZE, 0
							)
							c.strokeLine(
								0, 0,
								ARM_SIZE, -ARM_SIZE,
								2 * ARM_SIZE, 0
							);
						} c.restore();
					} c.restore();
				},
				[
					{
						text: "These speedy boots let you run extremely fast.",
						price: 10
					},
					{
						text: [
							"Current Level:",
							"● 1.5x max speed",
							"",
							"Upgraded Level:",
							"● 1.5x max speed",
							"● 2x acceleration"
						],
						price: 10
					},
					{
						text: [
							"Current Level:",
							"● 1.5x max speed",
							"● 2x acceleration",
							"",
							"Upgraded Level:",
							"● 2x max speed",
							"● 2x acceleration"
						],
						price: 10
					},
				],
				"rgb(0, 255, 0)"
			);
			shop.doubleJumper = new ShopItem(
				800 / 4 * 3, 800 / 3,
				"Potion of Jumping",
				function(isGrayscale) {
					c.save(); {
						c.translate(0, 8);
						c.strokeStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(0, 0, 0)");
						c.fillStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : this.color);
						c.save(); {
							c.beginPath();
							c.rect(-5, -30, 10, 13);
							c.invertPath();
							c.clip("evenodd");
							c.beginPath();
							c.arc(0, 0, 20, Math.toRadians(-30), Math.toRadians(180 + 30));
							c.fill();
							c.strokeCircle(0, 0, 20);
						} c.restore();
						c.strokeLine(-5, -17, -5, -30);
						c.strokeLine(5, -17, 5, -30);
						c.fillStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
						c.fillCircle(0, -35, 10);
						c.strokeCircle(0, -35, 10);
					} c.restore();
				},
				[
					{
						text: "Drink this potion to jump much higher! Hold [up] to increase jump height.",
						price: 10
					},
					{
						text: [
							"Current Level:",
							"● High jumping",
							"",
							"Upgraded Level:",
							"● High jumping",
							"● Double jumping"
						],
						price: 10
					},
					{
						text: [
							"Current Level:",
							"● High jumping",
							"● Double jumping",
							"",
							"Upgraded Level:",
							"● High jumping",
							"● High double jumping"
						],
						price: 10
					},
				],
				"rgb(255, 128, 0)"
			);
			shop.intangibilityTalisman = new ShopItem(
				800 / 4, 800 / 3 * 2,
				"Talisman of Intangibility",
				function(isGrayscale) {
					c.save(); {
						c.clipCircle(0, 0, 75 - 1.5);
						c.fillStyle = randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY;
						c.fillCircle(0, 0, 30);
						/* gemstone */
						c.fillStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY : "rgb(0, 0, 128)");
						c.fillPoly(
							0 - 6, 0 - 12,
							0 + 6, 0 -12,
							0 + 15, 0,
							0 + 6, 0 + 12,
							0 - 6, 0 + 12,
							0 - 15, 0,
						);
						/* necklace threads */
						c.strokeStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(138, 87, 0)");
						c.strokeLine(
							0 - 5, 0 - 29,
							0 - 15, 0 - 75
						);
						c.strokeLine(
							0 + 5, 0 - 29,
							0 + 15, 0 - 75
						);
					} c.restore();
				},
				[
					{
						text: "Walk through everything with this magical talisman. Press [down] to use.",
						price: 10
					},
					{
						text: [
							"Current Level:",
							"● Intangibility",
							"",
							"Upgraded Level:",
							"● Intangibility",
							"● Screen edge wrap"
						],
						price: 10
					},
					{
						text: [
							"Current Level:",
							"● Intangibility",
							"● Screen edge wrap",
							"",
							"Upgraded Level:",
							"● Intangibility",
							"● Screen edge wrap",
							"● Don't pass through coins while intangible"
						],
						price: 15
					},
				],
				"rgb(0, 0, 128)"
			);
			shop.secondLife = new ShopItem(
				800 / 4 * 2, 800 / 3 * 2,
				"Skull of Reanimation",
				function(isGrayscale) {
					c.fillStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(255, 255, 255)");
					/* skull */
					c.fillCircle(0, 0, 30);
					/* skull chin */
					c.fillRect(0 - 15, 0 + 20, 30, 20);
					/* eyes - whitespace */
					c.fillStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
					c.fillCircle(0 - 13, 0 - 10, 7);
					c.fillCircle(0 + 13, 0 - 10, 7);
					/* mouth */
					c.fillRect(0 - 2, 0 + 20, 4, 20);
					c.fillRect(0 - 10, 0 + 20, 4, 20);
					c.fillRect(0 + 6, 0 + 20, 4, 20);
				},
				[
					{
						text: "Come back from the dead! This ancient skull grants you extra lives.",
						price: 15
					},
					{
						text: [
							"Current Level:",
							"● 1 extra life",
							"● Invincible after revive",
							"",
							"Upgraded Level:",
							"● 1 extra life",
							"● Long invincibility period after revive"
						],
						price: 15
					},
					{
						text: [
							"Current Level:",
							"● 1 extra life",
							"● Long invincibility period after revive",
							"",
							"",
							"Upgraded Level:",
							"● 2 extra lives",
							"● Long invincibility period after revive"
						],
						price: 15
					},
				],
				"rgb(255, 255, 255)"
			);
			shop.secondItem = new ShopItem(
				800 / 4 * 3, 800 / 3 * 2,
				"Box of Storage",
				function(isGrayscale) {
					c.save(); {
						c.translate(-10, 10);
						const BOX_WIDTH = 30;
						const BOX_HEIGHT = 30;
						const BOX_DEPTH_X = 25;
						const BOX_DEPTH_Y = 20;
						c.fillStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(138, 87, 0)");
						c.fillStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(97, 66, 0)");
						c.strokeStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
						c.lineWidth = 1;
						var points = [
							{ x: -BOX_WIDTH / 2, y: -BOX_HEIGHT / 2 },
							{ x:  BOX_WIDTH / 2, y: -BOX_HEIGHT / 2 },
							{ x:  BOX_WIDTH / 2, y:  BOX_HEIGHT / 2 },
							{ x: -BOX_WIDTH / 2, y:  BOX_HEIGHT / 2 },
						]; // 4 corners of front face (in clockwise order, starting from top-left)
						/* polygons for each face of cube */
						for(var i = 0; i < points.length; i ++) {
							var next = (i + 1) % points.length;
							var p1 = points[i];
							var p2 = {
								x: points[i].x + BOX_DEPTH_X,
								y: points[i].y - BOX_DEPTH_Y
							};
							var p3 = {
								x: points[next].x + BOX_DEPTH_X,
								y: points[next].y - BOX_DEPTH_Y
							};
							var p4 = points[next];
							c.fillPoly(p1, p2, p3, p4);
							// break;
						}
						/* front face */
						c.fillPoly(points);
						/* lines seprating faces of cube */
						var topRight = points[1];
						var topLeft = points[0];
						var bottomRight = points[2];
						var topRightBack = {
							x: topRight.x + BOX_DEPTH_X,
							y: topRight.y - BOX_DEPTH_Y
						};
						c.strokeLine(topRight, topLeft);
						c.strokeLine(topRight, bottomRight);
						c.strokeLine(topRight, topRightBack);
						c.save(); {
							c.translate(0, 4);
							c.strokeLine(topRight, topLeft);
							c.strokeLine(topRight, bottomRight);
							c.strokeLine(topRight, topRightBack);
						} c.restore();
					} c.restore();
				},
				[
					{
						text: "Are your hands full? Use this cardboard box to carry an extra item with you each game.",
						price: 15
					}
				]
			);
			shop.secondItem.noUpgrades = true;
			shop.secondItem.noEquipping = true;

			shop.items = [
				shop.coinDoubler,
				shop.speedIncreaser,
				shop.doubleJumper,
				shop.intangibilityTalisman,
				shop.secondLife,
				shop.secondItem
			];
			shop.initializedShopItems = true;
		}),

		itemsBought: function() {
			var itemsBought = [];
			for(var i = 0; i < this.items.length; i ++) {
				if(this.items[i].bought) {
					itemsBought.push(this.items[i]);
				}
			}
			return itemsBought;
		},
		itemsEquipped: function() {
			var itemsEquipped = [];
			for(var i = 0; i < this.items.length; i ++) {
				if(this.items[i].equipped) {
					itemsEquipped.push(this.items[i]);
				}
			}
			return itemsEquipped;
		},
		canEquipAnotherItem: function() {
			var numEquipped = this.itemsEquipped().length;
			if(this.secondItem.bought) {
				return numEquipped < 2;
			}
			else {
				return numEquipped < 1;
			}
		},

		DoubleJumpParticle: function(x, y) {
			this.x = x;
			this.y = y;
			this.size = 2;
			this.op = 1;
		}
		.method("display", function() {
			c.globalAlpha = this.op;
			c.strokeStyle = randomSurvivalGame.shop.doubleJumper.color;
			c.lineWidth = 5;
			c.save(); {
				c.translate(this.x, this.y);
				c.scale(this.size, 1);
				c.strokeCircle(0, 0, 5);
			} c.restore();
			this.size += 0.1;
			this.op -= 0.02;
			c.globalAlpha = 1;
		})
		.method("update", function() {
			if(this.op <= 0) {
				this.splicing = true;
			}
		}),
		MagnetParticle: function(size) {
			this.x = randomSurvivalGame.game.player.x;
			this.y = randomSurvivalGame.game.player.y + (46 / 2);
			this.size = size;
			this.opacity = 0;
		}
		.method("display", function() {
			c.save(); {
				c.globalAlpha = Math.constrain(this.opacity, 0, 1);
				c.strokeStyle = "rgb(125, 125, 125)";
				c.lineWidth = 1;
				c.strokeCircle(this.x, this.y, this.size);
			} c.restore();
		})
		.method("update", function() {
			this.size -= 0.5;
			this.opacity += 0.025;
			this.x = randomSurvivalGame.game.player.x;
			this.y = randomSurvivalGame.game.player.y + (46 / 2);
			if(this.size < 0) {
				this.splicing = true;
			}
		}),
		SpeedParticle: function(x, y) {
			this.x = x;
			this.y = y;
			this.velX = Math.randomInRange(-1, 1);
			this.velY = Math.randomInRange(-1, 1);
			this.size = Math.randomInRange(5, 10);
			this.opacity = 0.75;
		}
		.method("display", function() {
			c.save(); {
				c.fillStyle = "rgb(0, 255, 0)";
				c.globalAlpha = Math.constrain(this.opacity, 0, 1);
				c.fillCircle(this.x, this.y, this.size);
			} c.restore();
		})
		.method("update", function() {
			this.x += this.velX;
			this.y += this.velY;
			this.opacity -= 1 / 100;
			this.size -= 0.25;
			if(this.size <= 0 || this.opacity <= 0) {
				this.splicing = true;
			}
		})
	},
	achievements: {
		Achievement: function(x, y, name, description, display, calculateProgress) {
			this.x = x;
			this.y = y;
			this.name = name;
			this.description = description;
			this.display = display; // a function to display the graphics
			this.calculateProgress = function() {
				var progress = calculateProgress();
				return Math.constrain(progress, 0, 1);
			}; // a function to give a value between 0 and 1 indicating how much of the achievement the user has completed.
			this.calculateProgressAsString = function() {
				var progress = calculateProgress();
				progress *= 100;
				progress = Math.roundToAccuracy(progress, 2);
				return progress + "%";
			};
			this.infoOpacity = 0;
			this.hasBeenAchieved = false;
		}
		.method("displayLogo", function() {
			/* background circle */
			c.fillStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
			c.strokeStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
			c.fillCircle(this.x, this.y, 50);
			c.strokeCircle(this.x, this.y, 50);
			/* graphic */
			this.display(this, (!this.hasBeenAchieved));
			/* fading in */
			if(randomSurvivalGame.utils.mouseInCircle(this.x, this.y, 50)) {
				this.infoOpacity += 0.1;
			}
			else {
				this.infoOpacity -= 0.1;
			}
			this.infoOpacity = Math.constrain(this.infoOpacity, 0, 1);
		})
		.method("displayInfo", function(direction) {
			const BOX_WIDTH = 250;
			const BOX_HEIGHT = 200;
			const MARGIN_WIDTH = 10;
			if(direction === "left") {
				c.globalAlpha = this.infoOpacity;
				c.fillStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				c.fillPoly(
					this.x - 50, this.y,
					this.x - 60, this.y - 10,
					this.x - 60, this.y + 10
				);
				c.save(); {
					c.translate(this.x - 60, this.y);
					c.translate(-BOX_WIDTH, -(BOX_HEIGHT / 2));
					this.displayInfo("no-direction");
				} c.restore();
			}
			else if(direction === "right") {
				c.globalAlpha = this.infoOpacity;
				c.fillStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				c.fillPoly(
					this.x + 50, this.y,
					this.x + 60, this.y - 10,
					this.x + 60, this.y + 10
				);
				c.save(); {
					c.translate(this.x + 60, this.y);
					c.translate(0, -(BOX_HEIGHT / 2));
					this.displayInfo("no-direction");
				} c.restore();
			}
			else if(direction === "no-direction") {
				/*
				direction === "no-direction": assume that the canvas has already been translated right or left and draw the infobox at the origin.
				*/
				c.fillStyle = randomSurvivalGame.ui.COLORS.UI_DARK_GRAY;
				c.fillRect(0, 0, BOX_WIDTH, BOX_HEIGHT);
				/* title */
				c.loadTextStyle({
					color: randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY,
					font: "20px monospace"
				});
				c.fillText(this.name, MARGIN_WIDTH, 20);
				/* title underline */
				c.strokeStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
				c.strokeLine(
					MARGIN_WIDTH, 30,
					BOX_WIDTH - MARGIN_WIDTH, 30
				);
				/* description text */
				c.displayTextOverLines(this.description, 10, 50, BOX_WIDTH - (2 * MARGIN_WIDTH), 20);
				/* progress */
				c.strokeRect(MARGIN_WIDTH, BOX_HEIGHT - 30 - MARGIN_WIDTH, BOX_WIDTH - (MARGIN_WIDTH * 2), 30);
				c.textAlign = "center";
				if(this.hasBeenAchieved) {
					c.fillText("Achieved", BOX_WIDTH / 2, BOX_HEIGHT - 30 - MARGIN_WIDTH + 15 + 5);
					c.textAlign = "left";
				}
				else {
					c.fillText("Progress: " + this.calculateProgressAsString(), BOX_WIDTH / 2, BOX_HEIGHT - 30 - MARGIN_WIDTH + 15 + 5);
				}
			}
			else {
				/* pick a direction to display the info box */
				if(this.x < 450) {
					this.displayInfo("right");
				}
				else {
					this.displayInfo("left");
				}
			}
		})
		.method("checkProgress", function() {
			if(this.calculateProgress() >= 1 && !this.hasBeenAchieved) {
				randomSurvivalGame.game.chatMessages.push(new randomSurvivalGame.events.ChatMessage("Achievement Earned: " + this.name, "achievement"));
				this.hasBeenAchieved = true;
				randomSurvivalGame.persistentData.saveAchievements();
			}
		}),

		listOfAchievements: [],
		initializedAchievements: randomSurvivalGame.utils.initializer.request(function() {
			var Achievement = randomSurvivalGame.achievements.Achievement;
			randomSurvivalGame.achievements.listOfAchievements = [
				new Achievement(
					200, 200,
					"I Survived",
					"Survive all of the events.",
					function(self, isGrayscale) {
						c.save(); {
							c.translate(self.x, self.y);
							c.scale(0.75, 0.75);
							/* skull */
							c.fillStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(255, 255, 255)");
							c.fillCircle(0, 0, 30);
							/* skull chin */
							c.fillRect(0 - 15, 0 + 20, 30, 20);
							/* eyes - whitespace */
							c.fillStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
							c.fillCircle(0 - 13, 0 - 10, 7);
							c.fillCircle(0 + 13, 0 - 10, 7);
							/* mouth */
							c.fillRect(0 - 2, 0 + 20, 4, 20);
							c.fillRect(0 - 10, 0 + 20, 4, 20);
							c.fillRect(0 + 6, 0 + 20, 4, 20);
							/* x icon over skull */
							if(isGrayscale) {
								c.strokeStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
								c.lineWidth = 7;
								c.strokeLine(-40, -40, 40, 40);
								c.strokeLine(40, -40, -40, 40);
							}

							c.strokeStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(255, 0, 0)");
							c.lineWidth = 3;
							c.strokeLine(-40, -40, 40, 40);
							c.strokeLine(40, -40, -40, 40);
						} c.restore();
					},
					function() {
						return (randomSurvivalGame.game.player.eventsSurvived.length / randomSurvivalGame.events.ORIGINAL_EVENTS.length);
					}
				),
				new Achievement(
					400, 200,
					"Survivalist",
					"Achieve a score of 10 points or higher.",
					function(self, isGrayscale) {
						c.fillStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(255, 0, 0)");
						c.fillPoly(
							self.x - 30, self.y,
							self.x + 30, self.y,
							self.x, self.y + 30
						);
						c.fillArc(self.x - 15, self.y, 15, Math.toRadians(180), Math.toRadians(360));
						c.fillArc(self.x + 15, self.y, 15, Math.toRadians(180), Math.toRadians(360));
					},
					function() {
						var p = randomSurvivalGame.game.player;
						var theHighscore = Math.max(p.score, p.highScore);
						return theHighscore / 10;
					}
				),
				new Achievement(
					600, 200,
					"Extreme Survivalist",
					"Achieve a score of 20 points or higher.",
					function(self, isGrayscale) {
						function displayHeartGraphic(x, y) {
							c.save(); {
								c.translate(x, y);
								c.scale(0.5, 0.5);
								c.fillStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(255, 0, 0)");
								c.fillPoly(
									-30, 0,
									30, 0,
									0, 30
								);
								c.fillArc(-15, 0, 15, Math.toRadians(180), Math.toRadians(360));
								c.fillArc(15, 0, 15, Math.toRadians(180), Math.toRadians(360));
							} c.restore();
						};
						displayHeartGraphic(self.x - 20, self.y);
						displayHeartGraphic(self.x + 20, self.y);
					},
					function() {
						var p = randomSurvivalGame.game.player;
						var theHighscore = Math.max(p.score, p.highScore);
						return theHighscore / 20;
					}
				),
				new Achievement(
					200, 400,
					"What are the Odds",
					"Experience the same event twice in a row.",
					function(self, isGrayscale) {
						/* front face */
						c.fillStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(0, 128, 255)");
						c.fillRect(self.x - 20 - 6, self.y - 10 + 6, 30, 30);
						/* top face */
						c.fillPoly(
							self.x - 20 - 6, self.y - 12 + 6,
							self.x + 10 - 6, self.y - 12 + 6,
							self.x + 30 - 6, self.y - 32 + 6,
							self.x + 0 - 6 , self.y - 32 + 6
						);
						/* right face */
						c.fillPoly(
							self.x + 12 - 6, self.y - 10 + 6,
							self.x + 12 - 6, self.y + 20 + 6,
							self.x + 32 - 6, self.y + 6,
							self.x + 32 - 6, self.y - 30 + 6
						);
						/* die 1 - whitespace */
						c.fillStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
						c.save(); {
							c.translate(self.x  - 1, self.y - 15);
							c.scale(1, 0.5);
							c.fillCircle(0, 0, 5);
						} c.restore();
						/* die 2 - whitespace */
						c.save(); {
							c.translate(self.x + 12, self.y + 7);
							c.scale(0.5, 1);
							c.fillCircle(0, 0, 5);
						} c.restore();
						c.save(); {
							c.translate(self.x + 21, self.y - 7);
							c.scale(0.5, 1);
							c.fillCircle(0, 0, 5);
						} c.restore();
						/* die 3 - whitespace */
						c.fillCircle(self.x - 19, self.y + 4, 4);
						c.fillCircle(self.x - 1, self.y + 18, 4);
						c.fillCircle(self.x - 9, self.y + 11, 4);
					},
					function() {
						var p = randomSurvivalGame.game.player;
						return (p.repeatedEvent ? 1 : 0);
					}
				),
				new Achievement(
					400, 400,
					"Moneybags",
					"Buy something from the shop.",
					function(self, isGrayscale) {
						c.loadTextStyle({
							color: (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(255, 255, 0)"),
							font: "bold 40px monospace",
							textAlign: "center"
						});
						c.fillText("$", self.x, self.y + 12);
					},
					function() {
						return randomSurvivalGame.shop.itemsBought().length;
					}
				),
				new Achievement(
					600, 400,
					"Extreme Moneybags",
					"Buy everything in the shop.",
					function(self, isGrayscale) {
						c.loadTextStyle({
							color: (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(255, 255, 0)"),
							font: "bold 40px monospace",
							textAlign: "center"
						});
						c.fillText("$$", self.x, self.y + 12);
					},
					function() {
						return randomSurvivalGame.shop.itemsBought.length / randomSurvivalGame.shop.items.length;
					}
				),
				new Achievement(
					200, 600,
					"Improvement",
					"Beat your record five times.",
					function(self, isGrayscale) {
						c.loadTextStyle({
							fillStyle: (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(0, 128, 0)"),
							font: "bold 50px monospace",
							textAlign: "center"
						});
						c.fillText("+", self.x, self.y + 12);
					},
					function() {
						return randomSurvivalGame.game.player.numRecords / 5;
					}
				),
				new Achievement(
					400, 600,
					"Places to Be",
					"[???]",
					function(self) {
						c.save(); {
							c.lineWidth = 2;
							c.setLineDash([2, 2]);
							c.strokeLine(
								self.x, self.y - 10,
								self.x, self.y + 10,
								self.x + 10, self.y + 20
							);
							c.strokeLine(
								self.x, self.y + 10,
								self.x - 10, self.y + 20,
							);
							c.strokeLine(
								self.x, self.y - 10,
								self.x + 10, self.y
							);
							c.strokeLine(
								self.x, self.y - 10,
								self.x - 10, self.y
							);
							c.strokeCircle(self.x, self.y - 15, 5);
						} c.restore();
					},
					function() {
						return randomSurvivalGame.game.player.gonePlaces ? 1 : 0;
					}
				),
				new Achievement(
					600, 600,
					"Ghost",
					"[???]",
					function(self, isGrayscale) {
						c.save(); {
							c.translate(0, 5);
							c.fillStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(255, 255, 255)");
							c.fillRect(self.x - 15, self.y - 15, 30, 30);
							c.beginPath();
							c.arc(self.x, self.y - 15, 15, Math.PI, 2 * Math.PI);
							c.fill();
							/* wavy bits on bottom of ghost */
							for(var x = -12; x <= 12; x += 6) {
								if(x % 12 === 0) {
									c.fillStyle = (isGrayscale ? randomSurvivalGame.ui.COLORS.STONE_DARK_GRAY : "rgb(255, 255, 255)");
								}
								else {
									c.fillStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY; // whitespace
								}
								c.fillCircle(self.x + x, self.y + 15, 3);
							}
							/* eyes - whitespace */
							c.fillStyle = randomSurvivalGame.ui.COLORS.BACKGROUND_LIGHT_GRAY;
							c.fillCircle(self.x - 7, self.y - 10, 5);
							c.fillCircle(self.x + 7, self.y - 10, 5);
						} c.restore();
					},
					function() {
						return randomSurvivalGame.game.player.beenGhost ? 1 : 0;
					}
				)
			];
			randomSurvivalGame.achievements.initializedAchievements = true;
		})
	},
	debugging: {
		TESTING_MODE: true,
		SHOW_HITBOXES: false,
		INCLUDED_EVENTS: ["aliens"],
		PERMANENT_EFFECT: null,
		PLAYER_INVINCIBLE: false,

		hitboxes: [],
		displayHitboxes: function(hitbox) {
			if(hitbox === undefined || hitbox === null) {
				/* generate hitboxes */
				var objects = randomSurvivalGame.game.objects;
				for(var i = 0; i < objects.length; i ++) {
					var obj = objects[i];
					if(typeof obj.hitbox === "object" && obj.hitbox !== null) {
						randomSurvivalGame.debugging.hitboxes.push({
							type: "rect",
							color: "green",
							x: obj.x + obj.hitbox.left,
							y: obj.y + obj.hitbox.top,
							w: obj.hitbox.right - obj.hitbox.left,
							h: obj.hitbox.bottom - obj.hitbox.top,
							sides: ["top", "bottom", "left", "right"]
						})
					}
				}
				var p = randomSurvivalGame.game.player;
				randomSurvivalGame.debugging.hitboxes.push({
					type: "rect",
					color: "green",
					x: p.x + p.hitbox.left,
					y: p.y + p.hitbox.top,
					w: p.hitbox.right - p.hitbox.left,
					h: p.hitbox.bottom - p.hitbox.top,
					sides: ["top", "bottom", "left", "right"]
				});
				/* sort hitboxes by type */
				function sorter(a, b) {
					const A_FIRST = -1;
					const B_FIRST = 1;
					/*
					blue hitboxes < green hitboxes < red hitboxes
					*/
					var sortOrderA;
					if(a.color === "blue") { sortOrderA = -1; }
					else if(a.color === "green") { sortOrderA = 0; }
					else if(a.color === "red") { sortOrderA = 1; }
					var sortOrderB;
					if(b.color === "blue") { sortOrderB = -1; }
					else if(b.color === "green") { sortOrderB = 0; }
					else if(b.color === "red") { sortOrderB = 1; }
					return sortOrderA - sortOrderB;
				};
				randomSurvivalGame.debugging.hitboxes.sort(sorter);
				/* load all hitboxes */
				for(var i = 0; i < randomSurvivalGame.debugging.hitboxes.length; i ++) {
					let hitbox = randomSurvivalGame.debugging.hitboxes[i];
					if(hitbox !== undefined && hitbox !== null) {
						randomSurvivalGame.debugging.displayHitboxes(hitbox);
					}
				}
			}
			else {
				var color = (Math.sin(randomSurvivalGame.utils.frameCount / 10) * 55 + 200);
				if(hitbox.color === "blue") {
					c.strokeStyle = "rgb(0, 0, " + color + ")";
				}
				else if(hitbox.color === "green") {
					c.strokeStyle = "rgb(0, " + color + ", 0)";
				}
				else if(hitbox.color === "red") {
					c.strokeStyle = "rgb(" + color + ", 0, 0)";
				}
				c.lineWidth = 5;
				if(hitbox.type === "rect") {
					if(hitbox.sides.contains("top")) {
						c.beginPath();
						c.moveTo(hitbox.x - (c.lineWidth / 2), hitbox.y);
						c.lineTo(hitbox.x + hitbox.w + (c.lineWidth / 2), hitbox.y);
						c.stroke();
					}
					if(hitbox.sides.contains("bottom")) {
						c.beginPath();
						c.moveTo(hitbox.x - (c.lineWidth / 2), hitbox.y + hitbox.h);
						c.lineTo(hitbox.x + hitbox.w + (c.lineWidth / 2), hitbox.y + hitbox.h);
						c.stroke();
					}
					if(hitbox.sides.contains("left")) {
						c.beginPath();
						c.moveTo(hitbox.x, hitbox.y);
						c.lineTo(hitbox.x, hitbox.y + hitbox.h);
						c.stroke();
					}
					if(hitbox.sides.contains("right")) {
						c.beginPath();
						c.moveTo(hitbox.x + hitbox.w, hitbox.y);
						c.lineTo(hitbox.x + hitbox.w, hitbox.y + hitbox.h);
						c.stroke();
					}
				}
				else if(hitbox.type === "circle") {
					c.beginPath();
					c.arc(hitbox.x, hitbox.y, hitbox.radius, 0, 2 * Math.PI);
					c.stroke();
				}
			}
		},

		initializedDebuggingSettings: randomSurvivalGame.utils.initializer.request(function() {
			if(randomSurvivalGame.debugging.TESTING_MODE) {
				randomSurvivalGame.events.listOfEvents = randomSurvivalGame.debugging.INCLUDED_EVENTS;
				randomSurvivalGame.game.player.totalCoins = 1000;
				randomSurvivalGame.debugging.initializedDebuggingSettings = true;
				if(randomSurvivalGame.debugging.PERMANENT_EFFECT !== null) {
					var effect = randomSurvivalGame.debugging.PERMANENT_EFFECT;
					var p = randomSurvivalGame.game.player;
					var effectPropertyNames = {
						"confusion": "timeConfused",
						"blindness": "timeBlinded",
						"nausea": "timeNauseated"
					};
					var effectName = effectPropertyNames[effect];
					window.setInterval(function() {
						p[effectName] = randomSurvivalGame.events.effects.duration();
					}, 1000 / randomSurvivalGame.FPS);
				}
			}
		}),
		displayTestingModeWarning: function() {
			c.loadTextStyle({
				color: "rgb(255, 255, 255)",
				font: "15px monospace"
			});
			if(this.TESTING_MODE && this.SHOW_HITBOXES) {
				c.fillText("testing mode and hitboxes are on", 10, 20);
			}
			else if(this.TESTING_MODE) {
				c.fillText("testing mode is on", 10, 20);
			}
			else if(this.SHOW_HITBOXES) {
				c.fillText("hitboxes are on", 10, 20);
			}
		},
		drawPoint: function(x, y) {
			/*
			Displays a red circle on the point. (Useful for visualizing graphic function calls)
			*/
			c.save(); {
				c.fillStyle = "rgb(255, 0, 0)";
				var size = Math.sin(randomSurvivalGame.utils.frameCount / 10) * 5 + 10;
				if(typeof arguments[0] === "number") {
					c.fillCircle(arguments[0], arguments[1], size);
				}
				else {
					c.fillCircle(arguments[0].x, arguments[0].y, size);
				}
			} c.restore();
		}
	},

	persistentData: {
		saveAllData: function() {
			this.saveCoins();
			this.saveHighScores();
			this.saveShopItems();
			this.saveAchievements();
		},
		loadAllData: function() {
			this.loadHighScores();
			this.loadCoins();
			this.loadShopItems();
			this.loadAchievements();
		},
		loadedAllData: randomSurvivalGame.utils.initializer.request(function() {
			randomSurvivalGame.persistentData.loadAllData();
			randomSurvivalGame.persistentData.loadedAllData = true;
		}),
		clearAllData: function() {
			localStorage.removeItem("randomSurvivalGame.achievements.achievement1");
			localStorage.removeItem("randomSurvivalGame.achievements.achievement4");
			localStorage.removeItem("randomSurvivalGame.achievements.achievement7");
			localStorage.removeItem("randomSurvivalGame.achievements.achievement8");
			localStorage.removeItem("randomSurvivalGame.achievements.achievement9");
			localStorage.removeItem("randomSurvivalGame.game.player.coins");
			localStorage.removeItem("randomSurvivalGame.game.player.highScore");
			localStorage.removeItem("randomSurvivalGame.shop");
		},

		saveHighScores: function() {
			localStorage.setItem("randomSurvivalGame.game.player.highScore", randomSurvivalGame.game.player.highScore);
		},
		saveCoins: function() {
			localStorage.setItem("randomSurvivalGame.game.player.coins", randomSurvivalGame.game.player.totalCoins);
		},
		saveShopItems: function() {
			var shop = {
				coinDoubler: [ randomSurvivalGame.shop.coinDoubler.numUpgrades, randomSurvivalGame.shop.coinDoubler.equipped ],
				speedIncreaser: [ randomSurvivalGame.shop.speedIncreaser.numUpgrades, randomSurvivalGame.shop.speedIncreaser.equipped ],
				doubleJumper: [ randomSurvivalGame.shop.doubleJumper.numUpgrades, randomSurvivalGame.shop.doubleJumper.equipped ],
				intangibilityTalisman: [ randomSurvivalGame.shop.intangibilityTalisman.numUpgrades, randomSurvivalGame.shop.intangibilityTalisman.equipped ],
				secondLife: [ randomSurvivalGame.shop.secondLife.numUpgrades, randomSurvivalGame.shop.secondLife.equipped ],
				secondItem: [ randomSurvivalGame.shop.secondItem.numUpgrades, false ]
			};
			localStorage.setItem("randomSurvivalGame.shop", JSON.stringify(shop));
		},
		saveAchievements: function() {
			if(!randomSurvivalGame.persistentData.loadedAllData) {
				return;
			}
			/* achievement 1 - list of events survived */
			localStorage.setItem("randomSurvivalGame.achievements.achievement1", JSON.stringify(randomSurvivalGame.game.player.eventsSurvived));
			/* achievement 4 - whether the user has completed it */
			localStorage.setItem("randomSurvivalGame.achievements.achievement4", randomSurvivalGame.game.player.repeatedEvent);
			/* achievement 7 - how many times the user has beaten their record */
			localStorage.setItem("randomSurvivalGame.achievements.achievement7", randomSurvivalGame.game.player.numRecords);
			/* achievement 8 - whether the user has completed it */
			localStorage.setItem("randomSurvivalGame.achievements.achievement8", randomSurvivalGame.game.player.gonePlaces);
			/* achievement 9 - whether the user has completed it */
			localStorage.setItem("randomSurvivalGame.achievements.achievement9", randomSurvivalGame.game.player.beenGhost);
		},

		loadHighScores: function() {
			var highScore = localStorage.getItem("randomSurvivalGame.game.player.highScore");
			if(highScore !== null) {
				randomSurvivalGame.game.player.highScore = parseInt(highScore);
			}
		},
		loadCoins: function() {
			var coins = localStorage.getItem("randomSurvivalGame.game.player.coins");
			if(coins !== null) {
				randomSurvivalGame.game.player.totalCoins = parseInt(coins);
			}
		},
		loadShopItems: function() {
			var shop = JSON.parse(localStorage.getItem("randomSurvivalGame.shop"));
			for(var shopItem in shop) {
				if(shop.hasOwnProperty(shopItem)) {
					randomSurvivalGame.shop[shopItem].numUpgrades = shop[shopItem][0];
					randomSurvivalGame.shop[shopItem].equipped = shop[shopItem][1];
					randomSurvivalGame.shop[shopItem].bought = (randomSurvivalGame.shop[shopItem].numUpgrades >= 1);
				}
			}
		},
		loadAchievements: function() {
			/* achievement 1 - list of events survived */
			var achievement1 = JSON.parse(localStorage.getItem("randomSurvivalGame.achievements.achievement1"));
			if(achievement1 !== null) {
				randomSurvivalGame.game.player.eventsSurvived = achievement1;
			}
			/* achievement 4 - whether the user has completed it */
			randomSurvivalGame.game.player.repeatedEvent = (localStorage.getItem("randomSurvivalGame.achievements.achievement4") === "true");
			/* achievement 7 - how many times the user has beaten their record */
			randomSurvivalGame.game.player.numRecords = parseInt(localStorage.getItem("randomSurvivalGame.achievements.achievement7")) || 0;
			/* achievement 8 - whether the user has completed it */
			randomSurvivalGame.game.player.gonePlaces = (localStorage.getItem("randomSurvivalGame.achievements.achievement8") === "true");
			/* achievement 9 - whether the user has completed it */
			randomSurvivalGame.game.player.beenGhost = (localStorage.getItem("randomSurvivalGame.achievements.achievement9") === "true");
			/* remove achievement notifications player has already achieved */
			for(var i = 0; i < randomSurvivalGame.achievements.listOfAchievements.length; i ++) {
				var achievement = randomSurvivalGame.achievements.listOfAchievements[i];
				achievement.checkProgress();
			}
			randomSurvivalGame.game.chatMessages = [];
		}
	}
};
randomSurvivalGame.utils.initializer.initializeEverything();

window.setInterval(randomSurvivalGame.gameLoop, 1000 / randomSurvivalGame.FPS);
