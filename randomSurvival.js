const FPS = 60;
const TESTING_MODE = true;
const SHOW_HITBOXES = false;

var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

var utilities = {
	frameCount: 0,
	canvas: {
		/*
		Utilities related to drawing on the canvas. (Most of these have actually been moved to the CanvasRenderingContext2D prototype.)
		*/
		resize: function() {
			if(window.innerWidth < window.innerHeight) {
				canvas.style.width = "100%";
				canvas.style.height = "";
			}
			else {
				canvas.style.width = "";
				canvas.style.height = "100%";
			}
			if(canvas.style.width === "100%") {
				canvas.style.top = (window.innerHeight / 2) - (window.innerWidth / 2) + "px";
				canvas.style.left = "0px";
			}
			else {
				canvas.style.left = (window.innerWidth / 2) - (window.innerHeight / 2) + "px";
				canvas.style.top = "0px";
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
			utilities.pastInputs.mouse.x = input.mouse.x;
			utilities.pastInputs.mouse.y = input.mouse.y;
			utilities.pastInputs.mouse.pressed = input.mouse.pressed;
			for(var i = 0; i < input.keys.length; i ++) {
				utilities.pastInputs.keys[i] = input.keys[i];
			}
		}
	},
	sort: function(array, comparison) {
		/*
		Used when JavaScript's Array.sort() doesn't work because of sorting instability or strange comparison functions. Implements Selection Sort.
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
	mouseInRect: function(x, y, w, h) {
		return (input.mouse.x > x && input.mouse.x < x + w && input.mouse.y > y && input.mouse.y < y + h);
	},
	mouseInCircle: function(x, y, r) {
		return Math.distSq(input.mouse.x, input.mouse.y, x, y) <= (r * r);
	},

	killCollisionCircle: function(x, y, radius, deathCause) {
		/*
		Kills the player if the player is inside the circular region.
		*/
		var radiusSq = radius * radius;
		if(
			Math.distSq(p.x + p.hitbox.left, p.y + p.hitbox.top, x, y) < radiusSq ||
			Math.distSq(p.x + p.hitbox.right, p.y + p.hitbox.top, x, y) < radiusSq ||
			Math.distSq(p.x + p.hitbox.left, p.y + p.hitbox.bottom, x, y) < radiusSq ||
			Math.distSq(p.x + p.hitbox.right, p.y + p.hitbox.bottom, x, y) < radiusSq
		) {
			p.die(deathCause);
		}

		game.hitboxes.push({
			type: "circle",
			color: "red",
			x: x, y: y, radius: radius
		});
	},
	killCollisionRect: function(x, y, w, h, deathCause) {
		/*
		Kills the player if the player is inside the rectangular region.
		*/
		if(
			p.x + p.hitbox.right > x &&
			p.x + p.hitbox.left < x + w &&
			p.y + p.hitbox.bottom > y &&
			p.y + p.hitbox.top < y + h
		) {
			p.die(deathCause);
		}

		game.hitboxes.push({
			type: "rect",
			color: "red",
			x: x, y: y, w: w, h: h,
			sides: ["top", "bottom", "left", "right"]
		});
	},
	killCollisionPoint: function(x, y, deathCause) {
		if(
			x > p.x + p.hitbox.left &&
			x < p.x + p.hitbox.right &&
			y > p.y + p.hitbox.top &&
			y < p.y + p.hitbox.bottom
		) {
			p.die(deathCause);
		}

		game.hitboxes.push({
			type: "rect",
			color: "red",
			x: x - 1, y: y - 1, w: 2, h: 2,
			sides: ["top", "bottom", "left", "right"]
		});
	},
	killCollisionLine: function(x1, y1, x2, y2, deathCause) {
		var points = Math.findPointsLinear(x1, y1, x2, y2);
		for(var i = 0; i < points.length; i ++) {
			this.killCollisionPoint(points[i].x, points[i].y, deathCause);
		}
	},

	collisionRect: function(x, y, w, h, settings) {
		settings = settings || {};
		settings.velX = settings.velX || 0; // velocity of object requesting collisions
		settings.velY = settings.velY || 0;
		settings.caller = settings.caller || null; // object requesting collisions
		settings.sides = settings.sides || ["top", "bottom", "left", "right"];
		settings.includedTypes = settings.includedTypes || null; // if provided, this parameter will exclude all types of objects other than those given.
		settings.excludedTypes = settings.excludedTypes || null; // if provided, this parameter will exclude the types of objects given.

		if(!p.isIntangible()) {
			game.objects.push(p);
		}
		objectLoop: for(var i = 0; i < game.objects.length; i ++) {
			var obj = game.objects[i];

			if(Array.isArray(settings.excludedTypes)) {
				for(var j = 0; j < settings.excludedTypes; j ++) {
					if(obj instanceof settings.excludedTypes[j]) {
						continue objectLoop;
					}
				}
			}
			else if(Array.isArray(settings.includedTypes)) {
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

			if(game.objects[i].hitbox !== undefined && game.objects[i].hitbox !== null && typeof game.objects[i].hitbox === "object" && typeof game.objects[i].handleCollision === "function") {
				var collisionBuffer = { top: 5, bottom: 5, left: 5, right: 5 };
				if(obj.hasOwnProperty("velY")) {
					collisionBuffer.top = obj.velY - settings.velY + 2;
					collisionBuffer.bottom = settings.velY - obj.velY + 2;
				}
				if(obj.hasOwnProperty("velX")) {
					collisionBuffer.left = obj.velX - settings.velX + 2;
					collisionBuffer.right = settings.velX - obj.velX + 2;
				}
				for(var j in collisionBuffer) {
					if(collisionBuffer.hasOwnProperty(j)) {
						collisionBuffer[j] = Math.max(collisionBuffer[j], 5);
					}
				}
				if(obj instanceof Player) {
					y += p.worldY;
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
				if(obj instanceof Player) {
					y -= p.worldY;
				}
			}
		}
		game.objects.removeAllInstances(Player);

		game.hitboxes.push({
			type: "rect",
			color: "blue",
			x: x, y: y, w: w, h: h,
			sides: settings.sides
		});
	},

	isPointInPlayer: function(x, y) {
		return (x > p.x + p.hitbox.left && x < p.x + p.hitbox.right && y > p.y + p.hitbox.top && y < p.y + p.hitbox.bottom);
	},
	isPlayerInRect: function(x, y, w, h) {
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
	}
};
var input = {
	mouse: {
		x: 0,
		y: 0,
		pressed: false,
		cursor: "default"
	},
	keys: [],
	getMousePos: function(event) {
		var canvasRect = canvas.getBoundingClientRect();
		input.mouse.x = (event.clientX - canvasRect.left) / (canvasRect.right - canvasRect.left) * canvas.width;
		input.mouse.y = (event.clientY - canvasRect.top) / (canvasRect.bottom - canvasRect.top) * canvas.height;
	},
	initialized: function() {
		document.body.onmousemove = function() {
			input.getMousePos(event);
		};
		document.body.onmousedown = function() {
			input.mouse.pressed = true;
		};
		document.body.onmouseup = function() {
			input.mouse.pressed = false;
		};
		document.body.onkeydown = function() {
			input.keys[event.which] = true;
		};
		document.body.onkeyup = function() {
			input.keys[event.which] = false;
		};
		return true;
	} ()
};
const COLORS = {
	UI_DARK_GRAY: "rgb(59, 67, 70)",
	STONE_DARK_GRAY: "rgb(100, 100, 100)",
	BACKGROUND_LIGHT_GRAY: "rgb(200, 200, 200)"
};

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
CanvasRenderingContext2D.prototype.circle = function(x, y, r) {
	this.arc(x, y, r, 0, Math.toRadians(360));
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
	this.moveTo(-8000, -8000);
	this.lineTo(8000, 0);
	this.lineTo(8000, 8000);
	this.lineTo(-8000, 8000);
	this.lineTo(-8000, -8000);
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
}
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
Object.prototype.extend = function(parent) {
	/*
	Sets this to inherit all methods belonging to 'parent'.
	*/
	this.prototype = Object.create(parent.prototype);
	this.prototype.constructor = this;
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
	var index = Math.floor(Math.random() * this.length);
	return this[index];
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
	var rad = (deg / 180.0) * Math.PI;
	return Math.rotate(x, y, rad);
};
Math.rotate = function(x, y, rad) {
	return {
		x: x * Math.cos(rad) - y * Math.sin(rad),
		y: x * Math.sin(rad) + y * Math.cos(rad)
	};
};
Math.findPointsCircular = function(x, y, r) {
	var circularPoints = [];
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

function Player() {
	/* Location + velocity */
	this.x = 400;
	this.y = 300;
	this.velX = 0;
	this.velY = 0;
	this.worldY = 0;
	this.hitbox = { right: 5, left: -5, top: 0, bottom: 46 };
	/* Player animation properties */
	this.legs = 5;
	this.legDir = 1;
	this.facing = "forward";
	this.armHeight = 10;
	/* Effect properties */
	this.timeConfused = 0;
	this.timeBlinded = 0;
	this.timeNauseated = 0;
	this.nauseaOffsetArray = Math.findPointsCircular(0, 0, 30);
	this.nauseaOffset = 0;
	/* Scoring */
	this.score = -1;
	this.highScore = 0;
	this.coins = 0; // number of coins collected in the current game
	this.totalCoins = 0;
	this.itemsEquipped = 0;
	this.hasDoubleJumped = false;
	/* Shop item properties */
	this.invincible = 0;
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
};
Player.prototype.display = function() {
	c.globalAlpha = 1;
	/*
	The player is a rectangle. 10 wide, 46 tall. (this.x, this.y) is at the middle of the top of the rectangle.
	*/
	if(this.invincible < 0 || utilities.frameCount % 2 === 0) {
		c.lineWidth = 5;
		c.lineCap = "round";
		/* head */
		c.fillStyle = "rgb(0, 0, 0)";
		c.save(); {
			c.translate(this.x, this.y);
			c.scale(1, 1.2);
			c.fillCircle(0, 12, 10);
		} c.restore();
		/* eyes */
		if(this.facing === "left" || this.facing === "forward") {
			c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY;
			c.fillCircle(this.x - 4, this.y + 10, 3);
		}
		if(this.facing === "right" || this.facing === "forward") {
			c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY;
			c.fillCircle(this.x + 4, this.y + 10, 3);
		}
		/* body */
		c.strokeStyle = "rgb(0, 0, 0)";
		c.strokeLine(this.x, this.y + 15, this.x, this.y + 36);
		/* legs */
		c.strokeLine(this.x, this.y + 36, this.x - this.legs, this.y + 46);
		c.strokeLine(this.x, this.y + 36, this.x + this.legs, this.y + 46);
		/* arms */
		c.strokeLine(this.x, this.y + 26, this.x + 10, this.y + 26 + this.armHeight);
		c.strokeLine(this.x, this.y + 26, this.x - 10, this.y + 26 + this.armHeight);
		c.lineCap = "butt";
	}
};
Player.prototype.update = function() {
	this.timeConfused --;
	this.timeBlinded --;
	this.timeNauseated --;
	this.invincible --;
	this.nauseaOffset ++;
	if(this.nauseaOffset >= 190) {
		this.nauseaOffset = 0;
	}
	if(this.timeConfused === 0 || this.timeBlinded === 0 || this.timeNauseated === 0) {
		effects.add();
	}
	if(this.timeConfused === 0) {
		this.surviveEvent("confusion");
	}
	if(this.timeNauseated === 0) {
		this.surviveEvent("nauesea");
	}
	if(this.timeBlinded === 0) {
		this.surviveEvent("blindness");
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
	if(input.keys[38] && this.velY === 0) {
		this.velY = -6;
		jumpedThisFrame = true;
		if(!input.keys[37] && !input.keys[39]) {
			this.facing = "forward";
		}
	}
	/* gravity */
	this.velY += 0.1;
	/* Collisions */
	const SCREEN_BORDERS = (!this.isIntangible() || shop.intangibilityTalisman.numUpgrades < 2);
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
	/* movement cap */
	const DEFAULT_MAX_VELOCITY = 3;
	var maxSpeed = 3;
	if(shop.speedIncreaser.equipped) {
		if(shop.speedIncreaser.numUpgrades < 3) {
			maxSpeed = DEFAULT_MAX_VELOCITY * 1.5;
		}
		else {
			maxSpeed = DEFAULT_MAX_VELOCITY * 2;
		}
	}
	this.velX = Math.constrain(this.velX, -maxSpeed, maxSpeed);
	/* high jumping */
	if(this.canExtendJump && input.keys[38] && this.timeExtended < 40 && shop.doubleJumper.equipped) {
		this.velY = -6;
		this.timeExtended ++;
	}
	if(!input.keys[38]) {
		this.canExtendJump = false;
	}
	/* friction */
	if(!input.keys[37] && !input.keys[39]) {
		this.velX *= 0.93;
	}
	/* double jumping */
	if(shop.doubleJumper.equipped && shop.doubleJumper.numUpgrades >= 2) {
		if(this.velY !== 0 && !this.hasDoubleJumped && input.keys[38] && !utilities.pastInputs.keys[38] && !jumpedThisFrame) {
			this.velY = -6;
			this.hasDoubleJumped = true;
			if(shop.doubleJumper.numUpgrades >= 3) {
				this.canExtendJump = true;
				this.timeExtended = 0;
			}
			if(this.velX > DEFAULT_MAX_VELOCITY || this.velX < -DEFAULT_MAX_VELOCITY) {
				this.gonePlaces = true;
			}
			game.objects.push(new DoubleJumpParticle(this.x, this.y + 46 - this.worldY));
		}
	}
};
Player.prototype.input = function() {
	if(input.keys[37]) {
		this.facing = "left";
		this.velX -= shop.speedIncreaser.equipped ? 0.2 : 0.1;
	}
	else if(input.keys[39]) {
		this.facing = "right";
		this.velX += shop.speedIncreaser.equipped ? 0.2 : 0.1;
	}
};
Player.prototype.updateAnimations = function() {
	/* leg animations */
	this.legs += this.legDir;
	if(input.keys[37] || input.keys[39]) {
		if(this.legs >= 5) {
			this.legDir = -0.5;
		}
		else if(this.legs <= -5) {
			this.legDir = 0.5;
		}
	}
	else {
		this.legDir = 0;
		this.legDir = (this.legs > 0) ? 0.5 : -0.5;
		this.legDir = (this.legs <= -5 || this.legs >= 5) ? 0 : this.legDir;
	}
	/* arm animations */
	if(this.velY === 0) {
		this.armHeight += (this.armHeight < 10) ? 1 : 0;
	}
	else {
		this.armHeight += (this.armHeight > -5) ? -1 : 0;
	}
};
Player.prototype.reset = function() {
	this.score = 0;
	this.coins = 0;
	this.x = 400;
	this.y = 300;
	this.velX = 0;
	this.velY = 0;
	this.facing = "forward";
	this.armHeight = 10;
	this.worldY = 0;
	game.timeToEvent = 2 * FPS;
	game.objects = [];
	game.initializePlatforms();
	game.chatMessages = [];
	game.currentEvent = null;
	this.timeNauseated = -5;
	this.timeConfused = -5;
	this.timeBlinded = -5;
	this.beingAbductedBy = null;
	this.invincible = 0;
	this.usedRevive = false;
	this.coins = 0;
	if(!TESTING_MODE) {
		effects.add();
	}
	if(shop.secondLife.equipped) {
		this.numRevives = (shop.secondLife.numUpgrades >= 3) ? 2 : 1;
	}
	else {
		this.numRevives = 0;
	}
};
Player.prototype.handleCollision = function(dir, platform) {
	if(dir === "floor") {
		if(platform instanceof LaserBot && this.velY > 0) {
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
};

Player.prototype.die = function(cause) {
	if(this.invincible < 0) {
		if(shop.secondLife.equipped && this.numRevives > 0) {
			this.numRevives --;
			this.invincible = (shop.secondLife.numUpgrades >= 2) ? FPS * 2 : FPS;
			console.log("becoming invincible for " + this.invincible + " frames");
		}
		else {
			game.screen = "death";
			this.deathCause = cause;
			this.totalCoins += this.coins;
		}
	}
	else if(this.y + 46 > 800) {
		this.y = 800 - 46;
		if(input.keys[38]) {
			this.velY = -7;
		}
	}
};
Player.prototype.surviveEvent = function(event) {
	/*
	Adds the event to the player's list of events survived if the event is not already present in the list. Used for achievement "I Survived".
	*/
	for(var i = 0; i < this.eventsSurvived.length; i ++) {
		if(this.eventsSurvived[i] === event) {
			return;
		}
	}
	this.eventsSurvived.push(event);
};
Player.prototype.isIntangible = function() {
	return (input.keys[40] && shop.intangibilityTalisman.equipped);
};
Player.prototype.isInPath = function() {
	/*
	Used for collisions. Checks if the player (approximated by the corners of the player's hitbox) overlaps with the current canvas path.
	*/
	return (
		c.isPointInPath(this.x + this.hitbox.left, this.y + this.hitbox.top) ||
		c.isPointInPath(this.x + this.hitbox.right, this.y + this.hitbox.top) ||
		c.isPointInPath(this.x + this.hitbox.left, this.y + this.hitbox.bottom) ||
		c.isPointInPath(this.x + this.hitbox.right, this.y + this.hitbox.bottom)
	)
};

var p = new Player();

function Platform(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.origX = x;
	this.origY = y;
	this.velX = 0;
	this.velY = 0;
	this.destX = x;
	this.destY = y;
	this.opacity = 1;
};
Platform.prototype.calculateVelocity = function() {
	this.velX = (this.x - this.destX) / -120;
	this.velY = (this.y - this.destY) / -120;
};
Platform.prototype.update = function() {
	this.opacity += (this.opacity < 1) ? 0.05 : 0;
	this.x += this.velX;
	this.y += this.velY;
	if(p.standingOnPlatform === this) {
		p.x += this.velX;
		p.y += this.velY;
	}

	/* stop moving for block shuffle event */
	if(this.x + 2 > this.destX && this.x - 2 < this.destX && this.y + 2 > this.destY && this.y - 2 < this.destY && (this.velX !== 0 || this.velY !== 0)) {
		this.velX = 0;
		this.velY = 0;
		this.x = this.origX;
		this.y = this.origY;
		var numMoving = 0;
		for(var i = 0; i < game.objects.length; i ++) {
			if(game.objects[i] instanceof Platform && (game.objects[i].velX !== 0 || game.objects[i].velY !== 0)) {
				numMoving ++;
			}
		}
		if(numMoving === 0) {
			game.endEvent();
			p.surviveEvent("block shuffle");
		}
	}
};
Platform.prototype.collide = function() {
	utilities.collisionRect(
		this.x, this.y, this.w, this.h,
		{
			caller: this,
			velX: this.velX, velY: this.velY
		}
	);
};
Platform.prototype.display = function() {
	c.globalAlpha = this.opacity;
	this.y += p.worldY;
	c.fillStyle = COLORS.STONE_DARK_GRAY;
	c.fillRect(this.x, this.y, this.w, this.h);
	this.y -= p.worldY;
	c.globalAlpha = 1;
};
Platform.prototype.locationToString = function() {
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
};

function Button(x, y, whereTo, icon) {
	this.x = x;
	this.y = y;
	this.whereTo = whereTo;
	this.icon = icon;
	this.mouseOver = false;
};
Button.prototype.display = function() {
	c.globalAlpha = 1;
	c.lineWidth = 5;
	if(this.icon === "play") {
		this.resetAnimation = function() {
			this.iconScale = 1;
		};
		this.iconScale = this.iconScale || 1;
		/* button outline */
		c.strokeStyle = COLORS.UI_DARK_GRAY;
		c.lineWidth = 5;
		c.strokeCircle(this.x, this.y, 75);
		/* small triangle (mouse is not over) */
		c.save(); {
			c.translate(this.x, this.y);
			c.scale(this.iconScale, this.iconScale);
			c.fillStyle = COLORS.STONE_DARK_GRAY;
			c.fillPoly(
				-15, -22.5,
				-15, 22.5,
				30, 0
			);
		} c.restore();
		if(this.mouseOver) {
			this.iconScale += 0.1;
		}
		else {
			this.iconScale -= 0.1;
		}
		this.iconScale = Math.constrain(this.iconScale, 1, 1.5);
	}
	else if(this.icon === "question") {
		/* button outline */
		c.strokeStyle = COLORS.UI_DARK_GRAY;
		c.lineWidth = 5;
		c.fillCircle(this.x, this.y, 50);
		/* question mark */
		c.loadTextStyle({
			color: COLORS.STONE_DARK_GRAY,
			textAlign: "center"
		});
		c.save(); {
			c.translate(this.x, this.y);
			c.rotate(this.r);
			c.fillText("?", 0, 15);
		} c.restore();
		if(this.mouseOver && this.r < 0.5) {
			this.r += 0.05;
		}
		if(!this.mouseOver && this.r > 0) {
			this.r -= 0.05;
		}
	}
	else if(this.icon === "gear") {
		/* button outline */
		c.strokeStyle = COLORS.UI_DARK_GRAY;
		c.lineWidth = 5;
		c.strokeCircle(this.x, this.y, 50);
		/* gear body */
		c.fillStyle = COLORS.STONE_DARK_GRAY;
		c.fillCircle(this.x, this.y, 20);
		/* gear prongs */
		for(var r = 0; r < 2 * Math.PI; r += (2 * Math.PI) / 9) {
			c.save(); {
				c.translate(this.x, this.y);
				c.rotate(r + this.r);
				c.fillRect(-5, -28, 10, 28);
			} c.restore();
		}
		if(this.mouseOver) {
			this.r += 0.05;
		}
	}
	else if(this.icon === "dollar") {
		this.resetAnimation = function() {
			this.dollarIcons = [];
		};
		/* button outline */
		c.strokeStyle = COLORS.UI_DARK_GRAY;
		c.lineWidth = 5;
		c.strokeCircle(this.x, this.y, 50);
		/* dollar sign */
		c.loadTextStyle({
			color: COLORS.STONE_DARK_GRAY,
			font: "50px cursive",
			textAlign: "center"
		});
		c.fillText("$", this.x, this.y + 15);
		/* dollar sign animation */
		this.dollarIcons = this.dollarIcons || [];
		if(this.mouseOver && utilities.frameCount % 15 === 0) {
			this.dollarIcons.push({ x: Math.randomInRange(225, 325), y: 450 });
		}
		if(this.dollarIcons.length > 0) {
			c.save(); {
				c.clipCircle(this.x, this.y, 50 - 1.5);
				c.loadTextStyle({
					color: COLORS.STONE_DARK_GRAY,
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
		c.save(); {
			c.clipCircle(this.x, this.y, 50);
			this.radii = this.radii || [];
			if(this.mouseOver) {
				this.shouldAddLightGraphic = true;
			}
			if(this.shouldAddLightGraphic && (this.radii[0] > 25 || this.radii.length === 0)) {
				this.shouldAddLightGraphic = false;
				this.radii.unshift(0);
			}
			c.strokeStyle = "rgb(170, 170, 170)";
			for(var i = 0; i < this.radii.length; i ++) {
				this.radii[i] ++;
				if(this.radii[i] > 60) {
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
		c.strokeStyle = COLORS.UI_DARK_GRAY;
		c.lineWidth = 5;
		c.strokeCircle(this.x, this.y, 50);
		/* trophy base */
		c.fillStyle = COLORS.STONE_DARK_GRAY;
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
		c.strokeStyle = COLORS.UI_DARK_GRAY;
		c.strokeCircle(this.x, this.y, 50);
		/* house icon */
		c.fillStyle = COLORS.STONE_DARK_GRAY;
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
		c.strokeStyle = COLORS.UI_DARK_GRAY;
		c.strokeCircle(this.x, this.y, 50);
		/* retry icon */
		c.save(); {
			c.translate(this.x, this.y);
			c.rotate(Math.toRadians(this.iconRotation));
			c.strokeStyle = COLORS.STONE_DARK_GRAY;
			c.strokeArc(0, 0, 30, Math.toRadians(90), Math.toRadians(360));
			c.fillPoly(
				15, 0,
				45, 0,
				30, 20
			);
		} c.restore();
		if(this.mouseOver) {
			this.iconRotation += 12;
		}
		else {
			this.iconRotation -= 12;
		}
		this.iconRotation = Math.constrain(this.iconRotation, 0, 90);
	}
	if(this.mouseOver) {
		input.mouse.cursor = "pointer";
	}
};
Button.prototype.hasMouseOver = function() {
	return Math.hypot(input.mouse.x - this.x, input.mouse.y - this.y) < ((this.icon === "play") ? 75 : 50);
};
Button.prototype.checkForClick = function() {
	if(this.mouseOver && input.mouse.pressed && !utilities.pastInputs.mouse.pressed) {
		game.screen = this.whereTo;
		if(this.icon === "retry" || this.icon === "play") {
			p.reset();
		}
		for(var i = 0; i < buttons.length; i ++) {
			buttons[i].mouseOver = false;
			if(typeof buttons[i].resetAnimation === "function") {
				buttons[i].resetAnimation();
			}
		}
	}
};
var playButton = new Button(400, 400, "play", "play");
var shopButton = new Button(275, 500, "shop", "dollar");
var achievementsButton = new Button(525, 500, "achievements", "trophy");
var homeFromDeath = new Button(266, 650, "home", "house");
var homeFromShop = new Button(75, 75, "home", "house");
var homeFromAchievements = new Button(75, 75, "home", "house");
var retryButton = new Button(533, 650, "play", "retry");
var buttons = [playButton, shopButton, achievementsButton, retryButton, homeFromDeath, homeFromShop, homeFromAchievements];

function DoubleJumpParticle(x, y) {
	this.x = x;
	this.y = y;
	this.size = 2;
	this.op = 1;
};
DoubleJumpParticle.prototype.display = function() {
	c.globalAlpha = this.op;
	c.strokeStyle = "rgb(255, 255, 0)";
	c.lineWidth = 5;
	c.save(); {
		c.translate(this.x, this.y + p.worldY);
		c.scale(this.size, 1);
		c.strokeCircle(0, 0, 5);
	} c.restore();
	this.size += 0.1;
	this.op -= 0.02;
	c.globalAlpha = 1;
};
DoubleJumpParticle.prototype.update = function() {
	if(this.op <= 0) {
		this.splicing = true;
	}
};
function ShopItem(x, y, name, display, upgrades) {
	this.x = x;
	this.y = y;
	this.origX = x;
	this.origY = y;
	this.name = name;
	this.display = display; // a function called to display graphics
	this.upgrades = upgrades;
	this.bought = false;
	this.equipped = false;
	this.description = upgrades[0].text;
	this.infoOp = 0;
	this.numUpgrades = 0;
	this.showingPopup = false;
};
ShopItem.prototype.displayLogo = function(size) {
	if(size === 1) {
		this.x = this.origX;
		this.y = this.origY;
	}
	c.save(); {
		c.translate(this.x, this.y);
		c.scale(size, size);
		c.strokeStyle = COLORS.UI_DARK_GRAY;
		c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY;
		c.lineWidth = 5;
		c.strokeCircle(0, 0, 75);
		if(size !== 1) {
			c.fill();
		}
		if(this.bought && !this.noUpgrades) {
			c.fillStyle = (this.equipped) ? COLORS.UI_DARK_GRAY : COLORS.BACKGROUND_LIGHT_GRAY;
			c.strokeStyle = COLORS.UI_DARK_GRAY;
			c.fillCircle  (50, -50, 20);
			c.strokeCircle(50, -50, 20);
			c.loadTextStyle({
				color: (this.equipped ? COLORS.BACKGROUND_LIGHT_GRAY : COLORS.UI_DARK_GRAY),
				textAlign: "center",
				font: "bold 20px monospace"
			});
			c.fillText(this.numUpgrades, 50, -45);
		}
		this.display(!this.bought);
	} c.restore();
	var mouseOver = false;
	if(Math.dist(input.mouse.x, input.mouse.y, this.x, this.y) <= 75) {
		mouseOver = true;
	}
	if(this.infoOp > 0) {
		if(this.x >= 500 && utilities.mouseInRect(this.x - 85 - 250, this.y - 100, 250, 200)) {
			mouseOver = true;
		}
		if(this.x <= 500 && utilities.mouseInRect(this.x + 85, this.y - 100, 250, 200)) {
			mouseOver = true;
		}
		if(this.x <= 500 && utilities.mouseInRect(this.x, this.y - 75, 100, 150)) {
			mouseOver = true;
		}
		if(this.x >= 500 && utilities.mouseInRect(this.x - 100, this.y - 75, 100, 150)) {
			mouseOver = true;
		}
	}
	/* prevent conflicts between overlapping shop items when mousing over */
	for(var i = 0; i < shop.items.length; i ++) {
		if(shop.items[i].infoOp > 0 && shop.items[i] !== this) {
			mouseOver = false;
		}
	}
	if(mouseOver) {
		this.infoOp += 0.1;
	}
	else {
		this.infoOp -= 0.1;
	}
	this.infoOp = Math.constrain(this.infoOp, 0, 1);
	c.restore();
};
ShopItem.prototype.displayInfo = function(direction) {
	if(this.infoOp <= 0) {
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
		c.globalAlpha = Math.max(this.infoOp, 0);
		c.fillStyle = COLORS.UI_DARK_GRAY;
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
				color: COLORS.BACKGROUND_LIGHT_GRAY,
				font: (this.name.length > 21) ? "17px monospace" : "20px monospace",
			});
			c.fillText(this.name, MARGIN_WIDTH, 20);
			/* title underline */
			c.strokeStyle = COLORS.BACKGROUND_LIGHT_GRAY;
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
							},
							canBeClicked: (shop.canEquipAnotherItem() || this.equipped),
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
							if(!self.bought && p.totalCoins > self.calculatePrice()) {
								p.totalCoins -= self.calculatePrice();
								self.bought = true;
								self.numUpgrades ++;
							}
						},
						translation: buttonOffset
					}
				);
			}
		} c.restore();
	} c.restore();
};
ShopItem.prototype.displayPopup = function() {
	if(this.showingPopup) {
		for(var i = 0; i < shop.items.length; i ++) {
			shop.items[i].infoOp = -0.5;
		}
		c.fillStyle = COLORS.UI_DARK_GRAY;
		c.fillRect(250, 250, 300, 300);
		/* title */
		c.loadTextStyle({
			color: COLORS.BACKGROUND_LIGHT_GRAY,
		});
		c.fillText((this.isFullyUpgraded() ? "Fully Upgraded Abilities:" : "Upgrade Item"), 260, 270);
		/* line */
		c.strokeStyle = COLORS.BACKGROUND_LIGHT_GRAY;
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
						if(p.totalCoins > self.calculatePrice()) {
							p.totalCoins -= self.calculatePrice();
							self.numUpgrades ++;
							self.showingPopup = false;
						}
					}
				}
			);
		}
	}
};
ShopItem.prototype.displayButton = function(x, y, w, h, settings) {
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
	if(settings.canBeClicked && utilities.mouseInRect(x + settings.translation.x, y + settings.translation.y, w, h)) {
		input.mouse.cursor = "pointer";
		if(input.mouse.pressed && !utilities.pastInputs.mouse.pressed) {
			settings.onclick();
		}
	}
};
ShopItem.prototype.isFullyUpgraded = function() {
	return this.numUpgrades >= this.upgrades.length;
};
ShopItem.prototype.calculatePrice = function() {
	if(this.numUpgrades < this.upgrades.length) {
		return this.upgrades[this.numUpgrades].price;
	}
	else {
		return null;
	}
};
ShopItem.prototype.calculateUpgradeDescription = function() {
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
};
var shop = {
	items: [],
	initialize: function() {
		this.secondItem.noUpgrades = true;
		this.secondItem.noEquipping = true;
		this.items = [this.coinDoubler, this.speedIncreaser, this.doubleJumper, this.intangibilityTalisman, this.secondLife, this.secondItem];
	},
	coinDoubler: new ShopItem(
		800 / 4, 800 / 3,
		"Piggy Bank of Money",
		function(isGrayscale) {
			c.save(); {
				c.translate(10, 0);
				/* body */
				c.fillStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(223, 160, 171)");
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
				} } c.restore();
				/* chin */
				c.fillPoly(
					0 - 40, 0 + 10,
					0     , 0 + 20,
					0     , 0
				);
				/* coin slot - whitespace */
				c.strokeStyle = COLORS.BACKGROUND_LIGHT_GRAY;
				c.strokeArc(0, 0, 20, Math.toRadians(270 - 35), Math.toRadians(270 + 35));
				c.restore();
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
			]
	),
	speedIncreaser: new ShopItem(
		800 / 4 * 2, 800 / 3,
		"Boots of Speediness",
		function(isGrayscale) {
			/* boots */
			c.fillStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(0, 223, 0)");
			c.fillRect(0 - 10, 0 + 46, 20, 5);
			c.fillRect(0 + 30, 0 + 46, 20, 5);
			/* stickman body + limbs */
			c.strokeStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(0, 0, 0)");
			c.strokeLine(
				0 - 10, 0 - 10,
				0 + 10, 0 + 10,
				0 - 10, 0 + 30,
				0 + 10, 0 + 50
			);
			c.strokeLine(
				0 + 10, 0 + 10,
				0 + 50, 0 + 50
			);
			c.strokeLine(
				0 + 10, 0 - 30,
				0 - 30, 0 + 10,
				0 - 50, 0 - 10
			);
			c.strokeLine(
				0 + 10, 0 - 30,
				0 + 30, 0 - 10
			);
			/* stickman head */
			c.fillStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(0, 0, 0)");
			c.fillCircle(-17, -17, 10);
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
		]
	),
	doubleJumper: new ShopItem(
		800 / 4 * 3, 800 / 3,
		"Potion of Jumpiness",
		function(isGrayscale) {
			/* potion */
			c.fillStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(255, 255, 0)");
			c.fillPoly(
				0 - 5 - 4, 0 + 4,
				0 + 5 + 4, 0 + 4,
				0 + 25, 0 + 20,
				0 - 25, 0 + 20
			);
			/* beaker body */
			c.strokeStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(0, 0, 0)");
			c.strokeLine(
				0 - 5, 0 - 20,
				0 - 5, 0,
				0 - 5 - 20, 0 + 20,
				0 + 25, 0 + 20,
				0 + 5, 0,
				0 + 5, 0 - 20
			);
			/* beaker opening */
			c.strokeCircle(0, 0 - 27, 10);
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
		]
	),
	intangibilityTalisman: new ShopItem(
		800 / 4, 800 / 3 * 2,
		"Talisman of Intangibility",
		function(isGrayscale) {
			c.save(); {
				c.clipCircle(0, 0, 75 - 1.5);
				c.fillStyle = COLORS.STONE_DARK_GRAY;
				c.fillCircle(0, 0, 30);
				/* gemstone */
				c.fillStyle = (isGrayscale ? COLORS.BACKGROUND_LIGHT_GRAY : "rgb(0, 0, 128)");
				c.fillPoly(
					0 - 6, 0 - 12,
					0 + 6, 0 -12,
					0 + 15, 0,
					0 + 6, 0 + 12,
					0 - 6, 0 + 12,
					0 - 15, 0,
				);
				/* necklace threads */
				c.strokeStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(138, 87, 0)");
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
		]
	),
	secondLife: new ShopItem(
		800 / 4 * 2, 800 / 3 * 2,
		"Skull of Reanimation",
		function(isGrayscale) {
			c.fillStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(255, 255, 255)");
			/* skull */
			c.fillCircle(0, 0, 30);
			/* skull chin */
			c.fillRect(0 - 15, 0 + 20, 30, 20);
			/* eyes - whitespace */
			c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY;
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
		]
	),
	secondItem: new ShopItem(
		800 / 4 * 3, 800 / 3 * 2,
		"Box of Storage",
		function(isGrayscale) {
			c.fillStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(138, 87, 0)");
			/* front face */
			c.beginPath();
			c.fillRect(0 - 30, 0 - 10, 40, 40);
			c.fill();
			/* top face */
			c.fillPoly(
				0 - 30, 0 - 12,
				0 + 10, 0 - 12,
				0 + 40, 0 - 40,
				0     , 0 - 40
			);
			/* right face */
			c.fillPoly(
				0 + 12, 0 - 10,
				0 + 12, 0 + 30,
				0 + 42, 0,
				0 + 42, 0 - 40
			);
			/* lines separating lid from box - whitespace */
			c.strokeStyle = COLORS.BACKGROUND_LIGHT_GRAY;
			c.lineWidth = 2;
			c.strokeLine(
				0 - 30, 0 - 5,
				0 + 10, 0 - 5
			);
			c.strokeLine(
				0 + 10, 0 - 3,
				0 + 42, 0 - 35
			);
			c.lineWidth = 5;
		},
		[
			{
				text: "Are your hands full? Carry an extra shop item with you each game.",
				price: 15
			}
		]
	),

	itemsBought: function() {
		var itemsBought = [];
		for(var i = 0; i < this.items.length; i ++) {
			if(this.items[i].upgrades > 0) {
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
	}
};
shop.initialize();

function Achievement(x, y, name, description, display, calculateProgress) {
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
	this.infoOp = 0;
	this.hasBeenAchieved = false;
};
Achievement.prototype.displayLogo = function() {
	/* background circle */
	c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY;
	c.strokeStyle = COLORS.UI_DARK_GRAY;
	c.fillCircle(this.x, this.y, 50);
	c.strokeCircle(this.x, this.y, 50);
	/* graphic */
	this.display(this, (!this.hasBeenAchieved));
	/* fading in */
	if(Math.dist(this.x, this.y, input.mouse.x, input.mouse.y) <= 50) {
		this.infoOp += 0.1;
	}
	else {
		this.infoOp -= 0.1;
	}
	this.infoOp = Math.constrain(this.infoOp, 0, 1);
};
Achievement.prototype.displayInfo = function(direction) {
	const BOX_WIDTH = 250;
	const BOX_HEIGHT = 200;
	const MARGIN_WIDTH = 10;
	if(direction === "left") {
		c.globalAlpha = this.infoOp;
		c.fillStyle = COLORS.UI_DARK_GRAY;
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
		c.globalAlpha = this.infoOp;
		c.fillStyle = COLORS.UI_DARK_GRAY;
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
		c.fillStyle = COLORS.UI_DARK_GRAY;
		c.fillRect(0, 0, BOX_WIDTH, BOX_HEIGHT);
		/* title */
		c.loadTextStyle({
			color: COLORS.BACKGROUND_LIGHT_GRAY,
			font: "20px monospace"
		});
		c.fillText(this.name, MARGIN_WIDTH, 20);
		/* title underline */
		c.strokeStyle = COLORS.BACKGROUND_LIGHT_GRAY;
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
};
Achievement.prototype.checkProgress = function() {
	if(this.calculateProgress() >= 1 && !this.hasBeenAchieved) {
		game.chatMessages.push(new ChatMessage("Achievement Earned: " + this.name, "rgb(255, 255, 0)"));
		this.hasBeenAchieved = true;
	}
}
var achievements = [
	new Achievement(
		200, 200,
		"I Survived",
		"Survive all of the events.",
		function(self, isGrayscale) {
			/* rays of light */
			for(var r = 0; r < 360; r += 360 / 6) {
				c.fillStyle = (isGrayscale ? COLORS.BACKGROUND_LIGHT_GRAY : "rgb(255, 128, 0)");
				c.save(); {
					c.translate(self.x, self.y);
					c.rotate(Math.toRadians(r));
					c.fillArc(0, 0, 47, Math.toRadians(-11), Math.toRadians(11));
				} c.restore();
			}
			/* stickman */
			c.beginPath();
			c.strokeStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(0, 0, 0)");
			c.strokeLine(
				self.x - 20, self.y + 25,
				self.x - 20, self.y + 10,
				self.x + 20, self.y + 10,
				self.x + 20, self.y + 25
			);
			c.strokeLine(
				self.x, self.y + 10,
				self.x, self.y - 10
			);
			c.strokeLine(
				self.x - 20, self.y - 30,
				self.x - 20, self.y - 10,
				self.x + 20, self.y - 10,
				self.x + 20, self.y - 30
			);
			c.fillStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(0, 0, 0)");
			c.fillCircle(self.x, self.y - 17, 10);
		},
		function() {
			return (p.eventsSurvived.length / game.events.length) * 100;
		}
	),
	new Achievement(
		400, 200,
		"Survivalist",
		"Achieve a score of 10 points or higher.",
		function(self, isGrayscale) {
			c.fillStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(255, 0, 0)");
			c.fillPoly(
				self.x - 30, self.y,
				self.x + 30, self.y,
				self.x, self.y + 30
			);
			c.fillArc(self.x - 15, self.y, 15, Math.toRadians(180), Math.toRadians(360));
			c.fillArc(self.x + 15, self.y, 15, Math.toRadians(180), Math.toRadians(360));
		},
		function() {
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
					c.fillStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(255, 0, 0)");
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
			c.fillStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(0, 128, 255)");
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
			c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY;
			c.save(); {
				c.translate(self.x  - 1, self.y - 15);
				c.scale(1, 0.75);
				c.fillCircle(0, 0, 5);
			} c.restore();
			/* die 2 - whitespace */
			c.save(); {
				c.translate(self.x + 12, self.y - 3);
				c.scale(0.75, 1);
				c.fillCircle(0, 0, 5);
			} c.restore();
			c.save(); {
				c.translate(self.x + 21, self.y + 3);
				c.scale(0.75, 1);
				c.fillCircle(0, 0, 5);
			} c.restore();
			/* die 3 - whitespace */
			c.fillCircle(self.x - 21, self.y + 4, 5);
			c.fillCircle(self.x - 1, self.y + 18, 5);
			c.fillCircle(self.x - 10, self.y + 11, 5);
		},
		function() {
			return (p.repeatedEvent ? 1 : 0);
		}
	),
	new Achievement(
		400, 400,
		"Moneybags",
		"Buy something from the shop.",
		function(self, isGrayscale) {
			c.loadTextStyle({
				color: (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(255, 255, 0)"),
				font: "bold 40px monospace",
				textAlign: "center"
			});
			c.fillText("$", self.x, self.y + 12);
		},
		function() {
			return shop.itemsBought().length;
		}
	),
	new Achievement(
		600, 400,
		"Extreme Moneybags",
		"Buy everything in the shop.",
		function(self, isGrayscale) {
			c.loadTextStyle({
				color: (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(255, 255, 0)"),
				font: "bold 40px monospace",
				textAlign: "center"
			});
			c.fillText("$$", self.x, self.y + 12);
		},
		function() {
			return shop.itemsBought.length / shop.items.length;
		}
	),
	new Achievement(
		200, 600,
		"Improvement",
		"Beat your record five times.",
		function(self, isGrayscale) {
			c.loadTextStyle({
				fillStyle: (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(0, 128, 0)"),
				font: "bold 50px monospace",
				textAlign: "center"
			});
			c.fillText("+", self.x, self.y + 12);
		},
		function() {
			return p.numRecords / 5;
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
			return p.gonePlaces ? 1 : 0;
		}
	),
	new Achievement(
		600, 600,
		"Ghost",
		"[???]",
		function(self, isGrayscale) {
			c.save(); {
				c.translate(0, 5);
				c.fillStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(255, 255, 255)");
				c.fillRect(self.x - 15, self.y - 15, 30, 30);
				c.beginPath();
				c.arc(self.x, self.y - 15, 15, Math.PI, 2 * Math.PI);
				c.fill();
				/* wavy bits on bottom of ghost */
				for(var x = -12; x <= 12; x += 6) {
					if(x % 12 === 0) {
						c.fillStyle = (isGrayscale ? COLORS.STONE_DARK_GRAY : "rgb(255, 255, 255)");
					}
					else {
						c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY; // whitespace
					}
					c.fillCircle(self.x + x, self.y + 15, 3);
				}
				/* eyes - whitespace */
				c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY;
				c.fillCircle(self.x - 7, self.y - 10, 5);
				c.fillCircle(self.x + 7, self.y - 10, 5);
			} c.restore();
		},
		function() {
			return p.beenGhost ? 1 : 0;
		}
	),
];

function Coin(x, y, timeToAppear) {
	this.x = x;
	this.y = y;
	this.spin = -1;
	this.spinDir = 0.05;
	this.timeToAppear = timeToAppear || 0;
	this.age = 0;
};
Coin.prototype.display = function() {
	if(this.age > this.timeToAppear) {
		c.fillStyle = "rgb(255, 255, 0)";
		c.save(); {
			c.translate(this.x, this.y + p.worldY);
			c.scale(this.spin, 1);
			c.fillCircle(0, 0, 20);
		} c.restore();
	}
};
Coin.prototype.update = function() {
	this.spin += this.spinDir;
	if(this.spin > 1) {
		this.spinDir = -0.05;
	}
	else if(this.spin < -1) {
		this.spinDir = 0.05;
	}
	this.age ++;
	if(p.x + 5 > this.x - 20 && p.x - 5 < this.x + 20 && p.y + 46 > this.y + p.worldY - 20 && p.y < this.y + 20 + p.worldY && this.age > this.timeToAppear && !(p.isIntangible() && shop.intangibilityTalisman.numUpgrades < 3)) {
		this.splicing = true;
		p.coins += (shop.coinDoubler.equipped) ? 2 : 1;
	}
	if(this.age > this.timeToAppear && shop.coinDoubler.equipped) {
		if(shop.coinDoubler.numUpgrades === 2 && Math.dist(this.x, this.y, p.x, p.y) < 200) {
			this.x += (p.x - this.x) / 10;
			this.y += (p.y - this.y) / 10;
		}
		if(shop.coinDoubler.numUpgrades === 3) {
			this.x += (p.x - this.x) / 10;
			this.y += (p.y - this.y) / 10;
		}
	}
};
function ChatMessage(msg, col) {
	this.msg = msg;
	this.col = col;
	this.time = 120;
};
ChatMessage.prototype.display = function(y) {
	c.loadTextStyle({
		color: this.col,
		textAlign: "right",
		font: "20px monospace"
	});
	c.fillText(this.msg, 790, y);
	this.time --;
};
/* laser event */
function Crosshair() {
	this.x = Math.random() * 800;
	this.y = Math.random() * 800;
	this.numMoves = 0;
	this.timeInLocation = 0;
	this.numBlinks = 0;
	this.timeSinceBlink = 0;
	this.blinking = false;
};
Crosshair.prototype.display = function() {
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
};
Crosshair.prototype.update = function() {
	this.timeInLocation ++;
	if(this.timeInLocation > 60 && this.numMoves < 4) {
		this.x = Math.random() * 800;
		this.y = Math.random() * 800;
		this.numMoves ++;
		this.timeInLocation = 0;
	}
	if(this.numMoves === 4) {
		this.x = p.x;
		this.y = p.y;
		this.numMoves = Infinity;
	}
	if(this.numMoves === Infinity) {
		this.timeSinceBlink ++;
		if(this.timeSinceBlink > 7) {
			this.blinking = !this.blinking;
			this.timeSinceBlink = 0;
			this.numBlinks ++;
		}
		if(this.numBlinks > 6) {
			this.explode();
			game.objects.push(new Coin(this.x, this.y));
			this.splicing = true;
		}
	}
};
Crosshair.prototype.explode = function(nonLethal) {
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
		game.objects.push(
			new FireParticle(
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
		game.objects[game.objects.length - 1].opacity = Math.randomInRange(MIN_OPACITY, MAX_OPACITY);
	}
};
/* rising acid event */
function Acid() {
	this.y = 850;
	this.velY = 0;
};
Acid.prototype.display = function() {
	for(var x = 0; x < 800; x ++) {
		var brightness = Math.random() * 30;
		c.fillStyle = "rgb(" + brightness + ", 255, " + brightness + ")";
		c.fillRect(x, this.y + p.worldY + Math.sin(x / 10) * 10 * Math.sin(utilities.frameCount / 10), 1, 800);
	}
};
Acid.prototype.update = function() {
	/* update position */
	this.y += this.velY;
	if(this.y < 600 && this.velY < 0) {
		/* screen scrolling */
		p.worldY -= this.velY;
		p.y -= this.velY;
	}
	if(this.y < -100) {
		this.stopRising();
	}
	if(this.velY > 0 && this.y >= 850) {
		this.velY = 0;
		this.y = 850;
		p.surviveEvent("acid");
		game.endEvent(-1);
		this.splicing = true;
	}
	/* player collisions */
	if(p.y + 46 > this.y + p.worldY) {
		p.die("acid");
		if(p.invincible) {
			p.velY = Math.min(-5, p.velY);
			if(input.keys[38]) {
				p.velY = Math.min(-8.5, p.velY);
			}
		}
	}
};
Acid.prototype.beginRising = function() {
	this.velY = -2;
	var platformInMiddle = true;
	for(var y = 50; y >= -475; y -= 175) {
		if(platformInMiddle) {
			game.objects.push(new Platform((canvas.width / 2) - (160 / 2), y - 10, 160, 20));
		}
		else {
			game.objects.push(new Platform(0, y - 10, 160, 20));
			game.objects.push(new Platform(canvas.width - 160, y - 10, 160, 20));
		}
		platformInMiddle = !platformInMiddle;
	}
	for(var i = 0; i < game.objects.length; i ++) {
		if(game.objects[i] instanceof Platform && game.objects[i].y <= 210) {
			game.objects[i].opacity = 0;
		}
	}
	game.objects.push(new Coin(400, 0, 0));
	game.chatMessages.push(new ChatMessage("The tides are rising...", "rgb(255, 128, 0)"));
};
Acid.prototype.stopRising = function() {
	this.velY = 1;
	/* shift everything down back to the original playing area */
	p.worldY = 0;
	this.y += 700;
	/* delete platforms from acid rise */
	for(var i = 0; i < game.objects.length; i ++) {
		if(game.objects[i].y < 200) {
			game.objects[i].splicing = true;
		}
		/* remove platform afterimages if the player has the confusion effect */
		if(game.objects[i] instanceof AfterImage && game.objects[i].image instanceof Platform && game.objects[i].image.y < 200) {
			game.objects[i].splicing = true;
		}
		/* translate other afterimages down */
		if(game.objects[i] instanceof AfterImage && !game.objects[i].splicing) {
			game.objects[i].image.y += 700;
		}
	}
};
/* boulders event */
function Boulder(x, y, velX) {
	this.x = x;
	this.y = y;
	this.velX = velX;
	this.velY = 0;
	this.numBounces = 0;
	this.vertices = [];
	this.rotation = 0;
	var r = 0;
	while(r < 360) {
		r += Math.randomInRange(45, 60);
		if(r > 350) {
			r = 360;
		}
		this.vertices.push(Math.rotateDegrees(0, -50, r));
	}
	this.hitbox = { top: -50, bottom: 50, left: -50, right: 50 };
};
Boulder.prototype.display = function() {
	c.fillStyle = COLORS.STONE_DARK_GRAY;
	c.save(); {
		c.translate(this.x, this.y);
		c.rotate(Math.toRadians(this.rotation));
		c.fillPoly(this.vertices);
	} c.restore();
};
Boulder.prototype.update = function() {
	this.velY += 0.1;
	this.x += this.velX;
	this.y += this.velY;
	this.rotation += (this.velX > 0) ? 5 : -5;
	/* killing player */
	if(!p.isIntangible()) {
		utilities.killCollisionCircle(this.x, this.y, 50, "boulder");
	}
	/* delete self if off-screen */
	if((this.velX < 0 && this.x < 50) || (this.velX > 0 && this.x > 750)) {
		this.shatter();
		p.surviveEvent("boulder");
	}
};
Boulder.prototype.shatter = function() {
	game.objects.push(new Coin(this.x, this.y));
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
		game.objects.push(new RockParticle(this.x, this.y, vertices, velocity.x, velocity.y));
	}
};
Boulder.prototype.handleCollision = function(direction, platform) {
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
};
function RockParticle(x, y, vertices, velX, velY) {
	this.x = x;
	this.y = y;
	this.vertices = vertices;
	this.velX = velX;
	this.velY = velY;
	this.rotation = 0;
};
RockParticle.prototype.display = function() {
	c.fillStyle = COLORS.STONE_DARK_GRAY;
	c.save(); {
		c.translate(this.x, this.y);
		c.rotate(Math.toRadians(this.rotation));
		c.fillPoly(this.vertices);
	} c.restore();
};
RockParticle.prototype.update = function() {
	this.x += this.velX;
	this.y += this.velY;
	this.velY += 0.1;
	this.velX *= 0.96;
	this.rotation += this.velX;
	if(this.y > 850) {
		this.splicing = true;
		if(game.numObjects(RockParticle) === 0) {
			/* This is the last rock particle, so end the event */
			game.endEvent(-1);
			p.surviveEvent("boulders");
		}
	}
};
/* spinny blades event */
function SpinnyBlade(x, y) {
	this.x = x;
	this.y = y;
	this.r = 90;
	this.numRevolutions = 0;
	this.opacity = 0;

	this.ROTATION_SPEED = 1 * (Math.random() < 0.5 ? 1 : -1);
	this.MAX_NUM_REVOLUTIONS = 3;
};
SpinnyBlade.prototype.display = function() {
	c.fillStyle = "rgb(215, 215, 215)";
	c.globalAlpha = this.opacity;
	c.save(); {
		c.translate(this.x, this.y + p.worldY);
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
};
SpinnyBlade.prototype.update = function() {
	if(this.opacity >= 1) {
		this.r += this.ROTATION_SPEED;
	}
	this.r = this.r.mod(360);
	if(
		(Math.dist(this.r, 90) < Math.abs(this.ROTATION_SPEED) ||
		Math.dist(this.r, 270) < Math.abs(this.ROTATION_SPEED)) &&
		this.opacity >= 1 && this.age > FPS
	) {
		this.numRevolutions ++;
	}
	if(this.numRevolutions < this.MAX_NUM_REVOLUTIONS) {
		this.opacity += 0.05;
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
	if(!p.isIntangible()) {
		utilities.killCollisionLine(endPoint1.x, endPoint1.y, endPoint2.x, endPoint2.y, "spinnyblades");
	}
	/* remove self when faded out */
	if(this.opacity <= 0 && this.numRevolutions >= 2) {
		this.splicing = true;
		if(game.numObjects(SpinnyBlade) === 0) {
			/* This is the last spinnyblade, so end the event */
			p.surviveEvent("spinnyblades");
			game.endEvent();
		}
	}

	this.age = this.age || 0;
	this.age ++;
};
/* jumping pirhanas event */
function Pirhana(x) {
	this.x = x;
	this.y = 850;
	this.velY = -10;
	this.scaleY = 1;
	this.mouth = 1; // 1 = open, 0 = closed
	this.mouthAngle = 45;
	this.mouthVel = 0;

	this.BITE_SPEED = 3;
};
Pirhana.prototype.display = function() {
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
};
Pirhana.prototype.update = function() {
	this.y += this.velY;
	this.velY += 0.1;
	if(this.velY > 0) {
		this.scaleY -= 0.1;
	}
	this.scaleY = Math.constrain(this.scaleY, -1, 1);
	this.mouthAngle += this.mouthVel;
	/* pirhana biting animations */
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
		utilities.killCollisionRect(this.x - 25, this.y - 25, 50, 62, "pirhanas");
	}
	/* remove offscreen pirhanas */
	if(this.y > 850 && this.velY > 0) {
		this.splicing = true;
		if(game.numObjects(Pirhana) === 0) {
			game.endEvent();
			p.surviveEvent("pirhanas");
		}
	}
};
/* giant pacman event */
function Dot(x, y, timeToAppear) {
	this.x = x;
	this.y = y;
	this.timeToAppear = timeToAppear;
};
Dot.prototype.display = function() {
	if(this.timeToAppear <= 0) {
		c.fillStyle = "rgb(255, 255, 255)";
		c.fillCircle(this.x, this.y, 20);
	}
};
Dot.prototype.update = function() {
	this.timeToAppear --;
};
function Pacman(x, y, velX) {
	this.x = x;
	this.y = y;
	this.velX = velX;
	this.mouth = 0;
	this.mouthVel = -1;
};
Pacman.prototype.display = function() {
	c.fillStyle = "rgb(255, 255, 0)";
	c.save(); {
		c.translate(this.x, this.y);
		if(this.velX < 0) {
			c.scale(-1, 1); // reflect for pacmans going left
		}
		c.fillArc(0, 0, 200, Math.toRadians(this.mouth), Math.toRadians(-this.mouth));
	} c.restore();
};
Pacman.prototype.update = function() {
	this.x += this.velX;
	this.mouth += this.mouthVel;
	const MOUTH_ANIMATION_SPEED = 0.5;
	if(this.mouth >= 45) {
		this.mouthVel = -MOUTH_ANIMATION_SPEED;
	}
	else if(this.mouth <= 0) {
		this.mouthVel = MOUTH_ANIMATION_SPEED;
	}
	/* player collisions */
	if(!p.isIntangible()) {
		c.save(); {
			c.translate(this.x, this.y);
			if(this.velX < 0) {
				c.scale(-1, 1); // reflect for pacmans going left
			}
			c.moveTo(0, 0);
			c.arc(0, 0, 200, Math.toRadians(this.mouth), Math.toRadians(-this.mouth));
			c.lineTo(0, 0);
			if(p.isInPath()) {
				p.die("pacmans");
			}
		} c.restore();
	}
	/* remove dots when eaten */
	for(var i = 0; i < game.objects.length; i ++) {
		if(game.objects[i] instanceof Dot && game.objects[i].y === this.y &&
			((game.objects[i].x < this.x - 20 && this.velX > 0) ||
			(game.objects[i].x > this.x + 20 && this.velX < 0))
		) {
			game.objects[i].splicing = true;
		}
	}
	/* remove self when off screen */
	if((this.x > 1000 && this.velX > 0) || (this.x < -200 && this.velX < 0)) {
		this.splicing = true;
		if(game.numObjects(Pacman) === 0) {
			game.endEvent(-1);
			p.surviveEvent("pacmans");
		}
	}
};
/* rocket event */
function FireParticle(x, y, size, settings) {
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
};
FireParticle.prototype.display = function() {
	c.save(); {
		c.globalAlpha = this.opacity;
		c.fillStyle = "rgb(255, " + this.color + ", 0)";
		if(this.size > 0) {
			c.fillCircle(this.x, this.y, this.size);
		}
	} c.restore();
};
FireParticle.prototype.update = function() {
	this.opacity -= this.FADEOUT_SPEED;
	this.size -= this.SIZE_DECREASE_SPEED;
	this.x += this.velX;
	this.y += this.velY;
	if(this.size <= 0 || this.opacity <= 0) {
		this.splicing = true;
		if(game.currentEvent === "laser" && game.numObjects(FireParticle) === 0) {
			game.endEvent();
			p.surviveEvent("laser");
		}
	}
	if(this.KILLS_PLAYER && this.opacity > 0.15) {
		utilities.killCollisionRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2, "laser");
	}
};
function Rocket(x, y, velX) {
	this.x = x;
	this.y = y;
	this.velX = velX;
};
Rocket.prototype.display = function() {
	c.save(); {
		c.translate(this.x, this.y);
		if(this.velX < 0) {
			c.scale(-1, 1);
		}
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
};
Rocket.prototype.update = function() {
	this.x += this.velX;
	if(utilities.frameCount % 1 === 0) {
		game.objects.push(new FireParticle(this.x, this.y));
	}
	if(!p.isIntangible()) {
		if(this.velX > 0) {
			utilities.killCollisionRect(this.x - 50, this.y, 150, 10, "rocket");
		}
		else {
			utilities.killCollisionRect(this.x - 100, this.y, 150, 10, "rocket");
		}
	}
	/* remove self if off-screen */
	const OFFSCREEN_BUFFER = 100;
	if(this.x < -OFFSCREEN_BUFFER || this.x > canvas.width + OFFSCREEN_BUFFER) {
		this.splicing = true;
		game.endEvent(-1);
		p.surviveEvent("rocket");
	}
	/* add coin if in middle of screen */
	if(this.x > 398 && this.x < 402) {
		game.objects.push(new Coin(this.x, this.y + 5));
	}
};
/* spikeball event */
function Spikeball(velX, velY) {
	this.x = 400;
	this.y = 400;
	this.velX = velX;
	this.velY = velY;
	this.r = 0;
	this.age = 0;
	this.opacity = 0;
	this.fadedIn = false;
	this.hitbox = { left: -30, right: 30, top: -30, bottom: 30 };
	this.collideWithBorders = true;

	this.ROTATION_SPEED = 5;
};
Spikeball.prototype.display = function() {
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
		c.fillStyle = "rgb(150, 150, 155)";
		c.globalAlpha = this.opacity;
		c.translate(this.x, this.y);
		c.rotate(Math.toRadians(this.r));
		c.fillPoly(points);
	} c.restore();
};
Spikeball.prototype.update = function() {
	this.r += this.ROTATION_SPEED;
	/* fading in */
	if(!this.fadedIn) {
		this.opacity += 0.05;
	}
	if(this.opacity >= 1) {
		this.fadedIn = true;
	}
	if(this.fadedIn) {
		this.x += this.velX;
		this.y += this.velY;
		this.age ++;
		this.opacity -= 0.002;
	}
	/* player collisions */
	if(this.age > 20 && !p.isIntangible()) {
		utilities.killCollisionCircle(this.x, this.y, 30, "spikeballs");
	}
	/* remove self if faded out */
	if(this.opacity <= 0) {
		this.splicing = true;
		if(game.numObjects(Spikeball) === 0) {
			game.endEvent();
			p.surviveEvent("spikeballs");
		}
	}
};
Spikeball.prototype.handleCollision = function(direction, platform) {
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
};
/* spike wall event */
function Spikewall(x) {
	this.FAST_SPEED = 10;
	this.SLOW_SPEED = 2;
	this.x = x;
	this.velX = (x < 400) ? this.FAST_SPEED : -this.FAST_SPEED;
	this.direction = (x < 400) ? "right" : "left";
};
Spikewall.prototype.display = function() {
	c.strokeStyle = "rgb(215, 215, 215)";
	c.fillStyle = COLORS.STONE_DARK_GRAY;
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
};
Spikewall.prototype.update = function() {
	this.x += this.velX;
	if(this.direction === "right" && this.x > 250) {
		this.velX = -this.SLOW_SPEED;
		this.x = Math.min(this.x, 250);
		game.objects.push(new Coin(80, (Math.random() < 0.5) ? 175 : 525));
	}
	if(this.direction === "left" && this.x < canvas.width - 250) {
		this.velX = this.SLOW_SPEED;
		this.x = Math.max(this.x, canvas.width - 250);
		game.objects.push(new Coin(720, (Math.random() < 0.5) ? 175 : 525));
	}
	utilities.killCollisionRect(this.x - 5, 0, 10, canvas.height, "spikewall");
	if((this.velX < 0 && this.x < -50) || (this.velX > 0 && this.x > 850)) {
		this.splicing = true;
		game.endEvent(-1);
		p.surviveEvent("spikewall");
	}
};
/* lasting effects (blindness, confusion, nausea) */
function AfterImage(image) {
	this.image = image;
	var timeElapsed = (FPS * 15) - p.timeConfused;
	if(timeElapsed < FPS * 14) {
		this.timeLeft = Math.map(
			timeElapsed,
			0, FPS * 15,
			30, 20
		);
	}
	else {
		this.timeLeft = Math.map(
			timeElapsed,
			FPS * 14, FPS * 15,
			20, 0
		);
	}
	this.timeToExist = this.timeLeft;
};
AfterImage.prototype.display = function() {
	var opacity = this.timeLeft / this.timeToExist;
	opacity = Math.constrain(opacity, 0, 1);
	c.save(); {
		if(this.image instanceof Player) {
			c.translate(0, p.worldY);
		}
		c.globalAlpha = opacity;
		this.image.display();
	} c.restore();
};
AfterImage.prototype.update = function() {
	this.timeLeft --;
	if(this.timeLeft <= 0) {
		this.splicing = true;
	}
};
var effects = {
	remove: function() {
		game.removeEventByID("blindness");
		game.removeEventByID("nausea");
		game.removeEventByID("confusion");
	},
	add: function() {
		if(!game.events.includesItemsWithProperty("id", "blindness")) {
			game.events.push(game.originalEvents.getItemsWithProperty("id", "blindness")[0]);
		}
		if(!game.events.includesItemsWithProperty("id", "nausea")) {
			game.events.push(game.originalEvents.getItemsWithProperty("id", "nausea")[0]);
		}
		if(!game.events.includesItemsWithProperty("id", "confusion")) {
			game.events.push(game.originalEvents.getItemsWithProperty("id", "confusion")[0]);
		}
	},
	displayNauseaEffect: function(obj) {
		/*
		Displays two copies of 'obj' around it.
		*/
		var offsetX = p.nauseaOffsetArray[p.nauseaOffset].x;
		var offsetY = p.nauseaOffsetArray[p.nauseaOffset].y;
		var timeElapsed = (FPS * 15) - p.timeNauseated;
		if(timeElapsed < FPS * 14) {
			var intensity = Math.map(timeElapsed, 0, FPS * 14, 1.5, 1);
		}
		else {
			var intensity = Math.map(timeElapsed, FPS * 14, FPS * 15, 1, 0);
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
	displayBlindnessEffect: function() {
		/*
		When timeElapsed is 0, largeRadius is 150 and smallRadius is 50.
		When timeElapsed is FPS * 15, largeRadius and smallRadius are SCREEN_DIAGONAL_LENGTH.
		*/
		const SCREEN_DIAGONAL_LENGTH = Math.dist(0, 0, 800, 800);
		var timeElapsed = (FPS * 15) - p.timeBlinded;
		if(timeElapsed < FPS * 14) {
			var largeRadius = Math.map(
				timeElapsed,
				0, FPS * 14,
				150, 400
			);
			var smallRadius = Math.map(
				timeElapsed,
				0, FPS * 14,
				50, 390
			);
		}
		else {
			var largeRadius = Math.map(
				timeElapsed,
				FPS * 14, FPS * 15,
				400, SCREEN_DIAGONAL_LENGTH
			);
			var smallRadius = Math.map(
				timeElapsed,
				FPS * 14, FPS * 15,
				390, SCREEN_DIAGONAL_LENGTH
			);
		}

		c.globalAlpha = 1;
		var gradient = c.createRadialGradient(p.x, p.y, smallRadius, p.x, p.y, largeRadius);
		gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
		gradient.addColorStop(1, "rgba(0, 0, 0, 255)");
		c.fillStyle = gradient;
		c.fillRect(0, 0, 800, 800);
	},
	displayConfusionEffect: function() {
		/*
		Creates afterimages of all the objects in the game.
		*/
		if(utilities.frameCount % 3 !== 0) {
			return;
		}
		var skippedObjects = [
			AfterImage, // to prevent infinite recursion
			FireParticle, // to reduce lag
			Acid, // to reduce lag + isn't really that noticeable
			Spikewall, // not really that noticeable
			Coin, // to make the coins not look strange
			Dot, // not visible at all since dots don't move
		];
		outerLoop: for(var i = 0; i < game.objects.length; i ++) {
			innerLoop: for(var j = 0; j < skippedObjects.length; j ++) {
				if(game.objects[i] instanceof skippedObjects[j]) {
					continue outerLoop;
				}
			}
			if(game.objects[i].splicing) {
				continue;
			}
			game.objects.push(new AfterImage(game.objects[i].clone()));
		}

		var playerAfterImage = p.clone();
		playerAfterImage.y -= p.worldY;
		game.objects.push(new AfterImage(playerAfterImage.clone()));
	}
};
/* enemies */
function Enemy() {};
function LaserBot(x, y) {
	Enemy.call(this);
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
};
LaserBot.extend(Enemy);
LaserBot.prototype.display = function() {
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
};
LaserBot.prototype.update = function() {
	if(this.y > 850) {
		this.splicing = true;
		if(game.numObjects(LaserBot) === 0) {
			/* this is the final LaserBot; end the event */
			game.endEvent(FPS * 2);
			p.surviveEvent("laserbots");
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
	if(p.standingOnPlatform === this) {
		if(this.isDead) {
			if(input.keys[38]) {
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
		var platforms = game.getObjectsByType(Platform);
		var closestPlatform = 0;
		if(this.x < 0) {
			for(var i = 0; i < platforms.length; i ++) {
				if(Math.dist(platforms[i].x, 0) <= 1 && Math.dist(platforms[i].y, this.y) < Math.dist(platforms[closestPlatform].y, this.y)) {
					closestPlatform = i;
				}
			}
			utilities.collisionRect(-150, platforms[closestPlatform].y, 150, 20, { includedTypes: [LaserBot] });
		}
		else if(this.x > canvas.width) {
			for(var i = 0; i < platforms.length; i ++) {
				if(Math.dist(platforms[i].x, 800 - 160) <= 1 && Math.dist(platforms[i].y, this.y) < Math.dist(platforms[closestPlatform].y, this.y)) {
					closestPlatform = i;
				}
			}
			utilities.collisionRect(800, platforms[closestPlatform].y, 150, 20, { includedTypes: [LaserBot] });
		}
	}
};
LaserBot.prototype.calculateDestination = function() {
	if(this.standingOnPlatform !== null && this.destination === null && this.jumpsSinceMove > this.jumpsRequired) {
		const JUMP_HEIGHT = 100;
		const LEFT_PLATFORM_X = 0;
		const MIDDLE_PLATFORM_X = (canvas.width / 2) - (160 / 2);
		const RIGHT_PLATFORM_X = canvas.width - (160 / 2);
		var platforms = game.getObjectsByType(Platform);
		for(var i = 0; i < platforms.length; i ++) {
			var platform = platforms[i];
			if(
				p.y < platform.y &&
				p.y + p.hitbox.bottom > platform.y - JUMP_HEIGHT &&
				this.standingOnPlatform !== platform
			) {
				/* this laserbot now wants to be on this platform */
				if(!LaserBot.isPlatformOccupied(platform)) {
					this.goToPlatform(platform);
					if(this.destination !== null) {
						break;
					}
				}
				else if(platform.x !== MIDDLE_PLATFORM_X && this.standingOnPlatform.x !== MIDDLE_PLATFORM_X) {
					/* if it wants to go to a side platform and isn't on the middle platform, go to the middle platform (if unoccupied) */
					for(var j = 0; j < platforms.length; j ++) {
						if(Math.dist(platforms[j].x, MIDDLE_PLATFORM_X) <= 1 && !LaserBot.isPlatformOccupied(platforms[j])) {
							this.goToPlatform(platforms[j]);
						}
					}
				}
			}
		}
	}
};
LaserBot.prototype.goToPlatform = function(platform) {
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
			var platforms = game.getObjectsByType(Platform);
			for(var i = 0; i < platforms.length; i ++) {
				if(Math.dist(platforms[i].x, MIDDLE_PLATFORM_X) <= 1 && !LaserBot.isPlatformOccupied(platforms[i])) {
					this.goToPlatform(platforms[i]);
				}
			}
		}
	}
};
LaserBot.prototype.handleCollision = function(direction, platform) {
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
};
LaserBot.prototype.collide = function() {
	if(this.isDead) { return; }
	var bodyY = this.y - 20 - (30 * this.springY);
	utilities.collisionRect(
		this.x - 10, bodyY, 20, 20,
		{
			sides: ["left", "right", "top"],
			caller: this,
			velX: this.velX,
			velY: this.velY - (this.springVelY * 30)
		}
	);
};
LaserBot.prototype.shoot = function() {
	var bodyY = this.y - 20 - (30 * this.springY);
	this.timeSinceShot = 0;
	if(this.facing === "right") {
		game.objects.push(new Laser(this.x, bodyY + 3, 4, this));
	}
	else {
		game.objects.push(new Laser(this.x, bodyY + 3, -4, this));
	}
};
LaserBot.isPlatformOccupied = function(platform) {
	/*
	Used for the LaserBot's logic. Returns whether the platform has a LaserBot on it, or whether there is a LaserBot going to the platform.
	*/
	var laserBots = game.getObjectsByType(LaserBot);
	for(var i = 0; i < laserBots.length; i ++) {
		if(laserBots[i].destination === platform || laserBots[i].standingOnPlatform === platform) {
			return true;
		}
	}
	return false;
};
function Laser(x, y, velX, shooter) {
	this.x = x;
	this.y = y;
	this.velX = velX;
	this.length = 0;
	this.shooter = shooter; // which laserbot shot this laser
};
Laser.prototype.display = function() {
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
};
Laser.prototype.update = function() {
	this.x += this.velX;
	if(this.length < 50) {
		this.length += Math.abs(this.velX);
		if(this.shooter instanceof LaserBot) {
			this.y = this.shooter.y - 20 - (30 * this.shooter.springY) + 3;
			this.x += this.shooter.velX;
		}
	}
	else if(!p.isIntangible()) {
		if(this.velX < 0) {
			utilities.killCollisionRect(this.x, this.y, this.length, 1, "laserbots");
		}
		else {
			utilities.killCollisionRect(this.x - this.length, this.y, this.length, 1, "laserbots");
		}
	}
	if(this.x < 0 - 50 || this.x > canvas.width + 50) {
		this.splicing = true;
	}
};
function BadGuy(x, y) {
	this.x = x;
	this.y = y;
	this.velX = 0;
	this.velY = 0;
	this.player = new Player();
	this.player.invincible = -1;
	this.hitbox = this.player.hitbox;
	/* arm + leg animation properties */
	this.legWidth = 0;
	this.legDir = 0.5;
	this.armHeight = 0; // -5 (arms lifted) to 10 (arms down)
	this.armDir = 0;
};
BadGuy.extend(Enemy);
BadGuy.prototype.display = function() {
	/* display stick figure graphics (same as player) */
	this.player.legs = this.legWidth;
	this.player.armHeight = this.armHeight;
	this.player.facing = "none"; // remove default grey player eyes
	this.player.display();
	/* display red eyes */
	c.fillStyle = "rgb(255, 0, 0)";
	c.beginPath();
	if(this.x > p.x) {
		c.fillCircle(this.player.x - 4, this.player.y + 10, 3);
	}
	else {
		c.fillCircle(this.player.x + 4, this.player.y + 10, 3);
	}
	c.fill();
};
BadGuy.prototype.update = function() {
	this.player.x = this.x;
	this.player.y = this.y;
	this.x += this.velX;
	this.y += this.velY;
	this.velX = Math.constrain(this.velX, -3, 3);
	const SPEED = 0.1;
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
		if(game.numObjects(BadGuy) === 0) {
			game.endEvent(FPS * 2.5);
			p.surviveEvent("bad guys");
		}
	}
	/* kill player */
	utilities.killCollisionRect(this.x - 5, this.y, 10, 46, "bad guys");
	/* border collisions */
	if(this.x + this.hitbox.right > canvas.width) {
		this.velX = Math.min(this.velX, -5);
	}
	else if(this.x + this.hitbox.left < 0) {
		this.velX = Math.max(this.velX, 5);
	}
};
BadGuy.prototype.updateAnimations = function() {
	/* leg animations */
	this.legWidth += this.legDir;
	if(this.legWidth < -5) {
		this.legDir = 0.5;
	}
	else if(this.legWidth > 5) {
		this.legDir = -0.5;
	}
	/* arm animations */
	this.armHeight += this.armDir;
	this.armHeight = Math.constrain(this.armHeight, -5, 10);
	if(this.velY === 0.1) {
		this.armDir = 1;
	}
	else {
		this.armDir = -1;
	}
};
BadGuy.prototype.collide = function() {
	utilities.collisionRect(
		this.x - 5, this.y, 10, 46,
		{
			includedTypes: [BadGuy],
			caller: this,
			velX: this.velX,
			velY: this.velY
		}
	);
};
BadGuy.prototype.handleCollision = function(direction, platform) {
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
};
function Alien(x, y) {
	// referred to as UFOs in-game
	this.x = x;
	this.y = y;
	this.velX = 0;
	this.velY = 0;
	this.rotation = 0;
	this.tractorBeamOpacity = 0;

	this.hitbox = { top: -40, bottom: 20, left: -40, right: 40 };
	this.ACCELERATION = 0.05;
	this.MAX_VELOCITY = 4;

	this.TRACTOR_BEAM_HEIGHT = 90;
	this.TRACTOR_BEAM_ACTIVATION_SPEED = 0.05;
};
Alien.extend(Enemy);
Alien.prototype.display = function() {
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
				var rotation = r + (utilities.frameCount * 4); // for animation
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
		} c.restore();
	} c.restore();
};
Alien.prototype.update = function() {
	/* movement */
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
	var aliens = game.getObjectsByType(Alien);
	for(var i = 0; i < aliens.length; i ++) {
		if(aliens[i] !== this) {
			var distance = Math.dist(this.x, this.y, aliens[i].x, aliens[i].y);
			/* move away from other UFOs, depending on how close they are (closer = faster) */
			if(distance < 150) {
				const SPEED = 0.1;
				this.velX += (this.x < aliens[i].x) ? -SPEED : SPEED;
				this.velY += (this.y < aliens[i].y) ? -SPEED : SPEED;
			}
		}
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
		if(utilities.isPlayerInRect(this.x - 30, this.y, 60, this.TRACTOR_BEAM_HEIGHT + 15)) {
			p.beingAbductedBy = this;
		}
		else if(p.beingAbductedBy === this) {
			p.beingAbductedBy = null;
		}
	}
	if(p.beingAbductedBy === this) {
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
	var aliens = game.getObjectsByType(Alien);
	for(var i = 0; i < aliens.length; i ++) {
		if(aliens[i] !== this && utilities.collidesWith(this, aliens[i])) {
			this.splicing = true;
			aliens[i].splicing = true;
			if(p.beingAbductedBy === this || p.beingAbductedBy === aliens[i]) {
				p.beingAbductedBy = null;
			}
			if(game.numObjects(Alien) === 0) {
				p.surviveEvent("aliens");
				game.endEvent(FPS * 2);
			}
			/* create explosion */
			var laser = new Crosshair();
			laser.x = Math.average(this.x, aliens[i].x);
			laser.y = Math.average(this.y, aliens[i].y);
			laser.explode(true);
		}
	}
	/* screen edge collisions */
	if(this.x + this.hitbox.right > canvas.width) {
		this.velX = -Math.abs(this.velX);
	}
	else if(this.x + this.hitbox.left < 0) {
		this.velX = Math.abs(this.velX);
	}
	/* move toward center of screen to avoid top platforms while abducting player */
	if(p.beingAbductedBy === this) {
		if(this.x > canvas.width - 160) {
			this.velX -= 0.2;
		}
		else if(this.x < 160) {
			this.velX += 0.2;
		}
	}
};
Alien.prototype.handleCollision = function(direction, platform) {
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
};
/* generic event selection + running */
var game = {
	events: [
		{
			id: "laser",
			begin: function() {
				game.objects.push(new Crosshair());
				game.chatMessages.push(new ChatMessage("Laser incoming!", "rgb(255, 128, 0)"));
			}
		},
		{
			id: "acid",
			begin: function() {
				game.objects.push(new Acid());
				game.objects[game.objects.length - 1].beginRising();
			}
		},
		{
			id: "boulder",
			begin: function() {
				var chooser = Math.random();
				game.chatMessages.push(new ChatMessage("Boulder incoming!", "rgb(255, 128, 0)"));
				if(chooser < 0.5) {
					game.objects.push(new Boulder(850, 100, -3));
				}
				else {
					game.objects.push(new Boulder(-50, 100, 3));
				}
			}
		},
		{
			id: "spinnyblades",
			begin: function() {
				game.chatMessages.push(new ChatMessage("Spinning blades are appearing", "rgb(255, 128, 0)"));
				var platforms = game.getObjectsByType(Platform);
				for(var i = 0; i < platforms.length; i ++) {
					game.objects.push(new SpinnyBlade(platforms[i].x + 80, platforms[i].y + 10));
				}
			}
		},
		{
			id: "pirhanas",
			begin: function() {
				game.chatMessages.push(new ChatMessage("Jumping pirhanas incoming!", "rgb(255, 128, 0)"));
				/* fancy algorithm to make sure none of the pirhanas are touching */
				var pirhanasSeparated = false;
				while(!pirhanasSeparated) {
					for(var i = 0; i < game.objects.length; i ++) {
						if(game.objects[i] instanceof Pirhana) {
							game.objects.splice(i, 1);
							i --;
							continue;
						}
					}
					game.objects.push(new Pirhana(Math.random() * 700 + 50));
					game.objects.push(new Pirhana(Math.random() * 700 + 50));
					game.objects.push(new Pirhana(Math.random() * 700 + 50));
					pirhanasSeparated = true;
					for(var i = 0; i < game.objects.length; i ++) {
						/* check if they collide */
						for(var j = 0; j < game.objects.length; j ++) {
							if(i !== j && game.objects[i] instanceof Pirhana && game.objects[j] instanceof Pirhana && Math.dist(game.objects[i].x, game.objects[j].x) < 75) {
								pirhanasSeparated = false;
							}
						}
					}
				}
			}
		},
		{
			id: "pacmans",
			begin: function() {
				game.chatMessages.push(new ChatMessage("Pacmans incoming!", "rgb(255, 128, 0)"));
				var coinNum = Math.round(Math.random() * 11 + 1) * 60;
				for(var x = 0; x < 800; x += 60) {
					if(x === coinNum) {
						game.objects.push(new Coin(x, 200, x * 0.25));
					} else {
						game.objects.push(new Dot(x, 200, x * 0.25));
					}
					game.objects.push(new Dot(800 - x, 600, x * 0.25));
				}
				game.objects.push(new Pacman(-200, 200, 1.5));
				game.objects.push(new Pacman(1000, 600, -1.5));
			}
		},
		{
			id: "rocket",
			begin: function() {
				game.chatMessages.push(new ChatMessage("Rocket incoming!", "rgb(255, 128, 0)"));
				if(p.x > 400) {
					game.objects.push(new Rocket(-100, p.y, 6));
				}
				else {
					game.objects.push(new Rocket(900, p.y, -6));
				}
			}
		},
		{
			id: "spikeballs",
			begin: function() {
				game.chatMessages.push(new ChatMessage("Spikeballs incoming!", "rgb(255, 128, 0)"));
				var angles = [];
				var buffer = 30;
				for(var i = 0; i < 360; i ++) {
					if((i > 90 - buffer && i < 90 + buffer) || (i > 270 - buffer && i < 270 + buffer)) {
						continue;
					}
					angles.push(i);
				}
				for(var i = 0; i < 3; i ++) {
					var index = Math.floor(Math.random() * (angles.length - 1));
					var angle = angles[index];
					for(var j = 0; j < angles.length; j ++) {
						var distanceBetweenAngles = Math.min(Math.abs(angle - angles[j]), Math.abs((angle + 360) - angles[j]), Math.abs((angle - 360) - angles[j]));
						if(distanceBetweenAngles < buffer) {
							angles.splice(j, 1);
							j --;
							continue;
						}
					}
					var angleRadians = angle / 180 * Math.PI;
					var velocity = Math.rotateDegrees(0, -5, angle);
					game.objects.push(new Spikeball(velocity.x, velocity.y));
				}
			}
		},
		{
			id: "block shuffle",
			begin: function() {
				game.chatMessages.push(new ChatMessage("The blocks are shuffling", "rgb(255, 128, 0)"));
				var platforms = game.getObjectsByType(Platform);
				for(var i = 0; i < platforms.length; i ++) {
					if(platforms[i].y < 300) {
						if(platforms[i].x < 400) {
							platforms[i].destX = 0;
							platforms[i].destY = 565;
						}
						else {
							platforms[i].destX = 0;
							platforms[i].destY = 215;
						}
					}
					if(platforms[i].y > 400) {
						if(platforms[i].x < 400) {
							platforms[i].destX = 320;
							platforms[i].destY = 390;
						}
						else {
							platforms[i].destX = 640;
							platforms[i].destY = 215;
						}
					}
					if(platforms[i].y > 300 && platforms[i].y < 400) {
						platforms[i].destX = 640;
						platforms[i].destY = 565;
					}
					platforms[i].calculateVelocity();
				}
			}
		},
		{
			id: "spikewall",
			begin: function() {
				var spikeWallDistance = 1500;
				if(Math.random() < 0.5) {
					game.objects.push(new Spikewall(-spikeWallDistance));
					game.chatMessages.push(new ChatMessage("Spike wall incoming from the left!", "rgb(255, 128, 0)"));
				}
				else {
					game.objects.push(new Spikewall(800 + spikeWallDistance));
					game.chatMessages.push(new ChatMessage("Spike wall incoming from the right!", "rgb(255, 128, 0)"));
				}
			}
		},
		{
			id: "confusion",
			begin: function() {
				p.timeConfused = FPS * 15;
				game.chatMessages.push(new ChatMessage("You have been confused", "rgb(0, 255, 0)"));
				effects.remove();
				game.endEvent();
			}
		},
		{
			id: "blindness",
			begin: function() {
				p.timeBlinded = FPS * 15;
				game.chatMessages.push(new ChatMessage("You have been blinded", "rgb(0, 255, 0)"));
				effects.remove();
				game.endEvent();
			}
		},
		{
			id: "nausea",
			begin: function() {
				p.timeNauseated = FPS * 15;
				game.chatMessages.push(new ChatMessage("You have been nauseated", "rgb(0, 255, 0)"));
				effects.remove();
				game.endEvent();
			}
		},
		{
			id: "laserbots",
			begin: function() {
				game.chatMessages.push(new ChatMessage("LaserBots are invading!", "rgb(255, 0, 0)"));
				var numEnemies = 2;
				game.addEnemiesAtPosition(LaserBot, numEnemies, null, 50);
			}
		},
		{
			id: "bad guys",
			begin: function() {
				game.chatMessages.push(new ChatMessage("Bad Guys are invading!", "rgb(255, 0, 0)"));
				var numEnemies = 2;
				game.addEnemiesAtPosition(BadGuy, numEnemies, null, 25);
			}
		},
		{
			id: "aliens",
			begin: function() {
				game.chatMessages.push(new ChatMessage("UFOs are invading!", "rgb(255, 0, 0)"));
				var numEnemies = 2;
				if(numEnemies === 2) {
					var xPosition = (Math.random() < 0.5) ? (0 - 50) : (canvas.width + 50);
					game.addEnemiesAtPosition(
						Alien, 2,
						[
							{ x: xPosition, y: 225 - 75 },
							{ x: xPosition, y: 575 - 75 }
						],
						0
					);
				}
			}
		}
	],
	currentEvent: null,
	timeToEvent: -5,
	objects: [],
	chatMessages: [],
	hitboxes: [], // debugging only. for showing hitboxes if SHOW_HITBOXES is true
	screen: "home",

	exist: function() {
		game.hitboxes = [];

		c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY;
		c.fillRect(0, 0, 800, 800);
		/* player */
		p.update();
		p.display();
		/* random events */
		game.runEvent();
		if(p.y + 46 >= 800 && (game.numObjects(Acid) === 0 || game.getObjectsByType(Acid)[0].y + p.worldY > 820)) {
			p.die("fall");
		}
		/* shop status effect indicators */
		var numItemsEquipped = 0;
		for(var i = 0; i < shop.items.length; i ++) {
			if(shop.items[i].equipped) {
				shop.items[i].x = 50 + 100 * numItemsEquipped;
				shop.items[i].y = 50;
				shop.items[i].displayLogo(0.5);
				numItemsEquipped ++;
			}
		}
		/* offscreen enemy collisions */
		if(game.numObjects(Enemy) !== 0) {
			utilities.collisionRect(-100,         225 - 10, 100, 20);
			utilities.collisionRect(-100,         575 - 10, 100, 20);
			utilities.collisionRect(canvas.width, 225 - 10, 100, 20);
			utilities.collisionRect(canvas.width, 575 - 10, 100, 20);
		}
		/* score + coins */
		c.loadTextStyle({
			color: COLORS.UI_DARK_GRAY,
			textAlign: "left"
		});
		c.fillText("Score: " + p.score, 10, 790);
		c.textAlign = "right";
		c.fillText("Coins: " + p.coins, 790, 790);
		/* debug */
		if(SHOW_HITBOXES) {
			game.displayHitboxes();
		}
	},

	numObjects: function(constructor) {
		return game.getObjectsByType(constructor).length;
	},
	getObjectsByType: function(constructor) {
		/*
		Returns a list containing references to all instances of 'constructor' in objects.
		*/
		var arr = [];
		for(var i = 0; i < game.objects.length; i ++) {
			if(game.objects[i] instanceof constructor && !game.objects[i].splicing) {
				arr.push(game.objects[i]);
			}
		}
		return arr;
	},
	getEventByID: function(id) {
		return this.events.getItemsWithProperty("id", id)[0];
	},
	removeEventByID: function(id) {
		this.events.removeItemsWithProperty("id", id)[0];
	},
	initializePlatforms: function() {
		for(var y = 225; y <= 575; y += 175) {
			if((y - 225) % (175 * 2) === 0) {
				game.objects.push(new Platform(0, y - 10, 160, 20));
				game.objects.push(new Platform(800 - 160, y - 10, 160, 20));
			}
			else {
				game.objects.push(new Platform(400 - (160 / 2), y - 10, 160, 20));
			}
		}
	},
	displayHitboxes: function(hitbox) {
		if(hitbox === undefined || hitbox === null) {
			/* generate hitboxes */
			for(var i = 0; i < game.objects.length; i ++) {
				var obj = game.objects[i];
				if(typeof obj.hitbox === "object" && obj.hitbox !== null) {
					game.hitboxes.push({
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
			game.hitboxes.push({
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
			game.hitboxes.sort(sorter);
			/* load all hitboxes */
			for(var i = 0; i < game.hitboxes.length; i ++) {
				let hitbox = game.hitboxes[i];
				if(hitbox !== undefined && hitbox !== null) {
					game.displayHitboxes(hitbox);
				}
			}
		}
		else {
			var color = (Math.sin(utilities.frameCount / 10) * 55 + 200);
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
			var index = Math.floor(Math.random() * positions.length);
			var pos = positions[index];
			game.objects.push(new (enemyType)(pos.x, pos.y));
			var theEnemy = game.objects[game.objects.length - 1];
			theEnemy.x += Math.randomInRange(-noisiness, noisiness);
			theEnemy.y += Math.randomInRange(-noisiness, noisiness);
			positions.splice(index, 1);
		}
	},

	sortObjects: function() {
		var inverted = false;
		var sorter = function(a, b) {
			const A_FIRST = -1;
			const B_FIRST = 1;
			/* afterimages */
			if(a instanceof AfterImage) {
				a = a.image;
			}
			if(b instanceof AfterImage) {
				b = b.image;
			}
			/* things that are rendered behind everything else */
			if(a instanceof Coin || a instanceof Dot) {
				return A_FIRST;
			}
			/* things that are rendered in front of everything else */
			if(a instanceof Spikewall || a instanceof Acid || a instanceof Pacman || a instanceof Player) {
				return B_FIRST;
			}
			/* special cases */
			if(a instanceof FireParticle && b instanceof Rocket) {
				return A_FIRST;
			}
			if(a instanceof LaserBot && b instanceof Laser) {
				return B_FIRST;
			}
			if(a instanceof Platform && b instanceof SpinnyBlade) {
				return A_FIRST;
			}
			if(a instanceof Platform && b instanceof Dot) {
				return A_FIRST;
			}
			if(a instanceof Platform && b instanceof Spikeball) {
				return A_FIRST;
			}
			if(a instanceof Platform && b instanceof Crosshair) {
				return A_FIRST;
			}
			if(a instanceof Platform && b instanceof Enemy) {
				return B_FIRST;
			}
			if(a instanceof Platform && b instanceof Laser) {
				return A_FIRST;
			}
			/* inverse cases */
			if(!inverted) {
				/* Variable 'inverted' is used to prevent infinite recursion */
				inverted = true;
				var invertedOrder = sorter(b, a);
				inverted = false;
				return invertedOrder * -1;
			}
			/* default case */
			return A_FIRST;
		};
		game.objects = utilities.sort(game.objects, sorter);
	},
	loadCollisions: function() {
		p.standingOnPlatform = null;
		for(var i = 0; i < game.objects.length; i ++) {
			var obj = game.objects[i];
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
	},
	addEvent: function() {
		p.score ++;
		var theEvent = game.events.randomItem();
		game.currentEvent = theEvent.id;
		theEvent.begin();
		if(game.currentEvent === p.previousEvent) {
			p.repeatedEvent = true;
		}
		p.previousEvent = game.currentEvent;
		if(p.score === p.highScore + 1) {
			p.numRecords ++;
			game.chatMessages.push(new ChatMessage("New Record!", "rgb(0, 0, 255)"));
		}
	},
	runEvent: function() {
		game.timeToEvent --;
		if(game.timeToEvent <= 0 && game.currentEvent === null) {
			game.addEvent();
		}
		/* update objects */
		for(var i = 0; i < game.objects.length; i ++) {
			if(typeof game.objects[i].update === "function") {
				game.objects[i].update();
			}
			else {
				console.warn("An in-game object of type " + game.objects[i].constructor.name + " did not have a update() method.");
			}
			if(game.objects[i].splicing) {
				game.objects.splice(i, 1);
				i --;
				continue;
			}
		}
		/* display objects */
		game.sortObjects();
		for(var i = 0; i < game.objects.length; i ++) {
			if(game.objects[i].splicing) {
				continue;
			}
			if(typeof game.objects[i].display === "function") {
				game.objects[i].display();
			}
			else {
				console.warn("An in-game object of type " + game.objects[i].constructor.name + " did not have a display() method.");
			}
		}
		/* collisions */
		game.loadCollisions();
		/* visual effects */
		if(p.timeBlinded > 0) {
			effects.displayBlindnessEffect();
		}
		if(p.timeNauseated > 0) {
			effects.displayNauseaEffect(p);
			for(var i = 0; i < game.objects.length; i ++) {
				if(game.objects[i].splicing) {
					continue;
				}
				if(typeof game.objects[i].display === "function") {
					effects.displayNauseaEffect(game.objects[i]);
				}
			}
		}
		if(p.timeConfused > 0) {
			effects.displayConfusionEffect();
		}
	},
	endEvent: function(timeToNextEvent) {
		timeToNextEvent = timeToNextEvent || FPS * 1;
		game.timeToEvent = timeToNextEvent;
		game.currentEvent = null;
	}
};
game.originalEvents = game.events.clone();
game.events = TESTING_MODE ? [game.getEventByID("spikewall")] : game.events;
p.totalCoins = TESTING_MODE ? 1000 : p.totalCoins;
var debugging = {
	displayTestingModeWarning: function() {
		c.loadTextStyle({
			color: "rgb(255, 255, 255)",
			font: "15px monospace"
		});
		if(TESTING_MODE && SHOW_HITBOXES) {
			c.fillText("testing mode and hitboxes are on", 10, 20);
		}
		else if(TESTING_MODE) {
			c.fillText("testing mode is on", 10, 20);
		}
		else if(SHOW_HITBOXES) {
			c.fillText("hitboxes are on", 10, 20);
		}
	}
};
var ui = {
	homeScreen: function() {
		/* background + erase previous frame */
		c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY;
		c.fillRect(0, 0, 800, 800);
		/* title */
		if(!TESTING_MODE) {
			c.loadTextStyle(ui.titleTextStyle);
			c.fillText("Randomonicity", 400, 150);
			c.fillText("Survival", 400, 200);
		}
		/* buttons */
		shopButton.display();
		shopButton.mouseOver = shopButton.hasMouseOver();
		shopButton.checkForClick();
		achievementsButton.display();
		achievementsButton.mouseOver = achievementsButton.hasMouseOver();
		achievementsButton.checkForClick();
		playButton.display();
		playButton.mouseOver = playButton.hasMouseOver();
		playButton.checkForClick();
	},
	deathScreen: function() {
		c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY;
		c.fillRect(0, 0, 800, 800);
		/* title */
		c.loadTextStyle(ui.titleTextStyle);
		c.fillText("You Died", 400, 200);
		/* body text */
		c.loadTextStyle({
			font: "30px monospace",
			textAlign: "left"
		});
		var deathMessages = {
			"laser": "You were shot by a laser.",
			"acid": "You fell into a pool of acid.",
			"boulder": "You were crushed by a boulder.",
			"spinnyblades": "You were sliced in half.",
			"pirhanas": "You were bitten by a pirhana.",
			"pacmans": "You were killed by a pacman.",
			"rocket": "You were hit with a rocket.",
			"spikeballs": "You were sliced by a spikeball.",
			"spikewall": "You were impaled on a wall of spikes.",
			"laserbots": "You were zapped by a laserbot.",
			"bad guys": "The bad guys got you.",
			"aliens": "You were abducted by a UFO.",
			"fall": "You fell way too far."
		};
		if(typeof deathMessages[p.deathCause] !== "string") {
			c.fillText("You died.", 200, 300);
			console.errorOnce("Invalid player death cause of '" + p.deathCause + "'");
		}
		else {
			c.fillText(deathMessages[p.deathCause], 200, 300);
		}
		p.highScore = Math.max(p.score, p.highScore);
		c.fillText("You got a score of " + p.score + " points", 200, 350);
		c.fillText("Your highscore is " + p.highScore + " points", 200, 400);
		c.fillText("You collected " + p.coins + " coins", 200, 450);
		c.fillText("You now have " + p.totalCoins + " coins", 200, 500);
		/* buttons */
		homeFromDeath.display();
		homeFromDeath.mouseOver = homeFromDeath.hasMouseOver();
		homeFromDeath.checkForClick();
		retryButton.display();
		retryButton.mouseOver = retryButton.hasMouseOver();
		retryButton.checkForClick();
	},
	shop: function() {
		c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY;
		c.fillRect(0, 0, 800, 800);
		/* title */
		c.loadTextStyle(ui.titleTextStyle);
		c.fillText("Shop", 400, 100);
		/* coin counter */
		c.loadTextStyle({
			color: "rgb(255, 255, 0)",
			font: "20px cursive",
			textAlign: "center"
		});
		c.fillText("coins: " + p.totalCoins, 400, 150);
		/* items */
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
		homeFromShop.display();
		homeFromShop.mouseOver = homeFromShop.hasMouseOver();
		homeFromShop.checkForClick();
	},
	achievements: function() {
		c.fillStyle = COLORS.BACKGROUND_LIGHT_GRAY;
		c.fillRect(0, 0, 800, 800);
		/* title */
		c.loadTextStyle(ui.titleTextStyle);
		c.fillText("Achievements", 400, 100);
		/* achievements */
		for(var i = 0; i < achievements.length; i ++) {
			achievements[i].displayLogo();
		}
		for(var i = 0; i < achievements.length; i ++) {
			achievements[i].displayInfo();
		}
		/* home button */
		homeFromAchievements.display();
		homeFromAchievements.mouseOver = homeFromAchievements.hasMouseOver();
		homeFromAchievements.checkForClick();
	},

	titleTextStyle: {
		fillStyle: COLORS.UI_DARK_GRAY,
		font: "50px cursive",
		textAlign: "center"
	}
};

function doByTime() {
	utilities.canvas.resize();
	if(game.screen === "home") {
		ui.homeScreen();
	}
	else if(game.screen === "play") {
		game.exist();
	}
	else if(game.screen === "death") {
		ui.deathScreen();
	}
	else if(game.screen === "shop") {
		ui.shop();
	}
	else if(game.screen === "achievements") {
		ui.achievements();
	}

	for(var i = 0; i < achievements.length; i ++) {
		achievements[i].checkProgress();
	}
	/* chat messages */
	for(var i = game.chatMessages.length - 1; i >= 0; i --) {
		game.chatMessages[i].display((game.chatMessages.length - i + 1) * 40 - 40);
		if(game.chatMessages[i].time <= 0) {
			game.chatMessages.splice(i, 1);
			i --;
			continue;
		}
		if(game.screen !== "play" && !(game.chatMessages[i].col === "rgb(255, 255, 0)")) {
			game.chatMessages.splice(i, 1);
			continue;
		}
	}

	utilities.frameCount ++;
	pastWorldY = p.worldY;
	utilities.pastInputs.update();

	debugging.displayTestingModeWarning();

	document.body.style.cursor = input.mouse.cursor;
	input.mouse.cursor = "default";
};
window.setInterval(doByTime, 1000 / FPS);
