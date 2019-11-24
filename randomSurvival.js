const FPS = 60;
const TESTING_MODE = true;

var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
var frameCount = 0;

var timeToEvent = -5;
var p;

var utilities = {
	canvas: {
		/*
		Utilities related to drawing on the canvas.
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
		},
		displayTextOverLines: function(text, x, y, width, lineHeight) {
			var lines = [text];
			/* Split text into multiple lines */
			for(var i = 0; i < lines.length; i ++) {
				var currentLine = lines[i];
				while(c.measureText(currentLine).width > width) {
					forLoop: for(var j = currentLine.length; j > 0; j --) {
						if(currentLine.substring(j, j + 1) == " ") {
							var nextLine = lines[i + 1];
							if(nextLine === undefined) {
								console.log("this line is the last")
								nextLine = "";
							}
							movedWord = currentLine.substring(j + 1, Infinity);
							movedWord = movedWord.trim();
							currentLine = currentLine.substring(0, j);
							nextLine = movedWord + " " + nextLine;
							console.log("next line: " + nextLine);
							lines[i] = currentLine;
							lines[i + 1] = nextLine;
							console.log(lines[i + 1]);
							break forLoop;
						}
					}
					currentLine = lines[i];
					console.log(lines);
				}
			}
			/* Display the split text */
			var lineY = y;
			for(var i = 0; i < lines.length; i ++) {
				c.fillText(lines[i], x, lineY);
				lineY += lineHeight;
			}
		},
		nauseate: function(obj) {
			/*
			For when the player has the nausea effect. Displays two copies of 'obj' around it.
			*/
			if(p.nauseated > 0) {
				var offsetX = p.nauseaOffsetArray[p.nauseaOffset].x;
				var offsetY = p.nauseaOffsetArray[p.nauseaOffset].y;
				var posBefore = obj.x + ", " + obj.y;
				obj.x += p.nauseaOffsetArray[p.nauseaOffset].x;
				obj.y += p.nauseaOffsetArray[p.nauseaOffset].y;
				obj.display();
				obj.x -= 2 * p.nauseaOffsetArray[p.nauseaOffset].x;
				obj.y -= 2 * p.nauseaOffsetArray[p.nauseaOffset].y;
				obj.display();
				obj.x += p.nauseaOffsetArray[p.nauseaOffset].x;
				obj.y += p.nauseaOffsetArray[p.nauseaOffset].y;
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
	}
};
var input = {
	mouse: {
		x: 0,
		y: 0,
		pressed: false,
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
Array.prototype.removeAll = function(item) {
	for(var i = 0; i < this.length; i ++) {
		if(this[i] === item) {
			this.splice(i, 1);
			i --;
		}
	}
};
Math.dist = function(x1, y1, x2, y2) {
	return Math.hypot(x1 - x2, y1 - y2);
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
	var m = Math.abs(y1 - y2) / Math.abs(x1 - x2);
	var linearPoints = [];
	if(x1 < x2) {
		if(y1 < y2) {
			var Y = y1;
			for(var X = x1; X < x2; X ++) {
				Y += m;
				linearPoints.push({x: X, y: Y});
			}
		}
		else if(y2 < y1) {
			var Y = y2;
			for(var X = x2; X > x1; X --) {
				Y += m;
				linearPoints.push({x: X, y: Y});
			}
		}
	}
	else if(x2 < x1) {
		if(y1 < y2) {
			var Y = y1;
			for(var X = x1; X > x2; X --) {
				Y += m;
				linearPoints.push({x: X, y: Y});
			}
		}
		else if(y2 < y1) {
			var Y = y2;
			for(var X = x2; X < x1; X ++) {
				Y += m;
				linearPoints.push({x: X, y: Y});
			}
		}
	}
	return linearPoints;
};

function Player() {
	/* Location + velocity */
	this.x = 400;
	this.y = 300;
	this.velX = 0;
	this.velY = 0;
	this.worldY = 0;
	this.onScreen = "home";
	this.mouseHand = false;
	/* Player animation properties */
	this.legs = 5;
	this.legDir = 1;
	/* Effect properties */
	this.confused = 0;
	this.blinded = 0;
	this.nauseated = 0;
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
	/* Achievement properties */
	this.eventsSurvived = [];
	this.survivedLaser = true;
	this.survivedAcid = true;
	this.survivedBoulders = true;
	this.survivedBlades = true;
	this.survivedPacmans = true;
	this.survivedFish = true;
	this.survivedRockets = true;
	this.survivedSpikeballs = true;
	this.survivedSpikewalls = false;
	this.survivedShuffle = true;
	this.survivedConfusion = true;
	this.survivedNausea = true;
	this.survivedBlindness = true;
	this.repeatedEvent = false;
	this.previousEvent = "nothing";
	this.numRecords = 0;
	this.gonePlaces = false;
	this.beenGhost = false;
	this.canExtendJump = true;
	this.timeExtended = 0;
};
Player.prototype.display = function() {
	/*
	The player is a rectangle. 10 wide, 46 tall. (this.x, this.y) is at the middle of the top of the rectangle.
	*/
	if(this.invincible < 0 || frameCount % 2 === 0) {
		c.lineWidth = 5;
		c.lineCap = "round";
		/* head */
		c.fillStyle = "#000000";
		c.save();
		c.translate(this.x, this.y);
		c.scale(1, 1.2);
		c.beginPath();
		c.arc(0, 12, 10, 0, 2 * Math.PI);
		c.fill();
		c.restore();
		/* body */
		c.strokeStyle = "#000000";
		c.beginPath();
		c.moveTo(this.x, this.y + 12);
		c.lineTo(this.x, this.y + 36);
		c.stroke();
		/* legs */
		c.beginPath();
		c.moveTo(this.x, this.y + 36);
		c.lineTo(this.x - this.legs, this.y + 46);
		c.moveTo(this.x, this.y + 36);
		c.lineTo(this.x + this.legs, this.y + 46);
		c.stroke();
		/* leg animations */
		if(input.keys[37] || input.keys[39]) {
			this.legs += this.legDir;
			if(this.legs >= 5) {
				this.legDir = -0.5;
			}
			else if(this.legs <= -5) {
				this.legDir = 0.5;
			}
		}
		/* arms */
		c.beginPath();
		c.moveTo(this.x, this.y + 26);
		c.lineTo(this.x + 10, this.y + 36);
		c.moveTo(this.x, this.y + 26);
		c.lineTo(this.x - 10, this.y + 36);
		c.stroke();
		c.lineCap = "butt";
	}
};
Player.prototype.update = function() {
	this.confused --;
	this.blinded --;
	this.nauseated --;
	this.invincible --;
	this.nauseaOffset ++;
	if(this.nauseaOffset >= 190) {
		this.nauseaOffset = 0;
	}
	if(this.confused === 0 || this.blinded === 0 || this.nauseated === 0) {
		addEffects();
	}
	if(this.confused === 0) {
		this.surviveEvent("confusion");
	}
	if(this.nauseated === 0) {
		this.surviveEvent("nauesea");
	}
	if(this.blinded === 0) {
		this.surviveEvent("blindness");
	}
	/* walking */
	if(this.confused < 0) {
		if(input.keys[37]) {
			this.velX -= speedIncreaser.equipped ? 0.2 : 0.1;
		}
		else if(input.keys[39]) {
			this.velX += speedIncreaser.equipped ? 0.2 : 0.1;
		}
	}
	else {
		if(input.keys[37]) {
			this.velX += speedIncreaser.equipped ? 0.2 : 0.1;
		}
		else if(input.keys[39]) {
			this.velX -= speedIncreaser.equipped ? 0.2 : 0.1;
		}
	}
	this.x += this.velX;
	this.y += this.velY;
	/* jumping */
	var jumpedThisFrame = false;
	if(input.keys[38] && this.velY === 0) {
		this.velY = -6;
		jumpedThisFrame = true;
	}
	/* gravity */
	this.velY += 0.1;
	/* Collisions */
	if(intangibilityTalisman.upgrades >= 1) {
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
	if(this.x < 10 && !(intangibilityTalisman.equipped && input.keys[40] && intangibilityTalisman.upgrades >= 1)) {
		this.velX = 1;
	}
	if(this.x > 790 && !(intangibilityTalisman.equipped && input.keys[40] && intangibilityTalisman.upgrades >= 1)) {
		this.velX = -1;
	}
	/* movement cap */
	if(this.velX > 3 && !speedIncreaser.equipped) {
		this.velX = 3;
	}
	else if(this.velX < -3 && !speedIncreaser.equipped) {
		this.velX = -3;
	}
	if(this.velX < -4.5 && (!speedIncreaser.equipped || speedIncreaser.upgrades < 2)) {
		this.velX = -4.5;
	}
	else if(this.velX > 4.5 && (!speedIncreaser.equipped || speedIncreaser.upgrades < 2)) {
		this.velX = 4.5;
	}
	if(this.velX > 6) {
		this.velX = 6;
	}
	else if(this.velX < -6) {
		this.velX = -6;
	}
	if(this.velY > 6) {
		this.velY = 6;
	}
	/* high jumping */
	if(this.canExtendJump && input.keys[38] && this.timeExtended < 40 && doubleJumper.equipped) {
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
	if(doubleJumper.equipped && doubleJumper.upgrades >= 1) {
		if(this.velY !== 0 && !this.hasDoubleJumped && input.keys[38] && !utilities.pastInputs.keys[38] && !jumpedThisFrame) {
			this.velY = -6;
			this.hasDoubleJumped = true;
			if(doubleJumper.upgrades >= 2) {
				this.canExtendJump = true;
				this.timeExtended = 0;
			}
			if(this.velX > 3 || this.velX < -3) {
				this.gonePlaces = true;
			}
			doubleJumpParticles.push(new DoubleJumpParticle(this.x, this.y + 46));
		}
	}
};
Player.prototype.die = function(cause) {
	if(this.invincible < 0) {
		if(secondLife.equipped && this.numRevives > 0) {
			this.numRevives --;
			this.invincible = (secondLife.upgrades >= 1) ? FPS * 2 : FPS;
		}
		else {
			this.onScreen = "death";
			this.deathCause = cause;
			this.totalCoins += this.coins;
		}
	}
	else if(this.y + 46 > 800) {
		this.y = 800 - 46;
		if(input.keys[39]) {
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
Player.prototype.reset = function() {
	timeToEvent = FPS;
	this.score = 0;
	this.coins = 0;
	this.x = 400;
	this.y = 300;
	this.velX = 0;
	this.velY = 0;
	this.worldY = 0;
	coins = [];
	lasers = [];
	explosions = [];
	acidY = 850;
	boulders = [];
	rockParticles = [];
	spinnyBlades = [];
	pirhanas = [];
	dots = [];
	pacmans = [];
	fireParticles = [];
	rockets = [];
	spikewalls = [];
	this.nauseated = -5;
	this.confused = -5;
	this.blinded = -5;
	spikeballs = [];
	chatMessages = [];
	currentEvent = "starting";
	this.invincible = 0;
	this.usedRevive = false;
	platforms = [new Platform(0, 215, 160, 20), new Platform(800 - 160, 215, 160, 20), new Platform(320, 390, 160, 20), new Platform(0, 565, 160, 20), new Platform(800 - 160, 565, 160, 20)];
	this.coins = 0;
	if(!TESTING_MODE) {
		addEffects();
	}
	if(secondLife.equipped) {
		this.numRevives = (secondLife.upgrades >= 2) ? 2 : 1;
	}
	else {
		this.numRevives = 0;
	}
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
	this.y += p.worldY;
	/* Collisions */
	const COLLISION_BUFFER = 6;
	var collidesWithTop = false;
	if(!(input.keys[40] && intangibilityTalisman.equipped)) {
		/* Top */
		if(p.x + 5 >= this.x && p.x - 5 <= this.x + this.w && p.y + 46 >= this.y && p.y + 46 <= this.y + Math.max(/*COLLISION_BUFFER*/10, p.velY) + this.velY + 2) {
			collidesWithTop = true;
		}
		/* Bottom */
		if(p.x + 5 >= this.x && p.x - 5 <= this.x + this.w && p.y - COLLISION_BUFFER <= this.y + this.h && p.y >= this.y + this.h) {
			p.velY = Math.max(1, p.velY);
			p.y = Math.max(this.y + this.h, p.y);
		}
		/* Left */
		if(p.y - 5 < this.y + this.h && p.y + 46 + COLLISION_BUFFER > this.y + this.h && p.x + 5 > this.x && p.x + 5 < this.x + (this.w / 2)) {
			p.velX = Math.min(this.velX - 1, p.velX);
			p.x = Math.min(p.x, this.x - 5);
		}
		/* Right */
		if(p.y - 5 < this.y + this.h && p.y + 46 + COLLISION_BUFFER > this.y + this.h && p.x - 5 < this.x + this.w && p.x - 5 > this.x + (this.w / 2)) {
			p.velX = Math.max(this.velX + 1, p.velX);
			p.x = Math.max(p.x, this.x + this.w + 5);
		}
	}

	this.x += this.velX;
	this.y += this.velY;

	if(collidesWithTop) {
		p.velY = Math.min(p.velY, 0);
		p.y = Math.min(this.y - 46, p.y);
		p.hasDoubleJumped = false;
		p.canExtendJump = true;
		p.timeExtended = 0;
		p.x += this.velX;
		p.y = this.y - 46;
	}

	if(this.x + 2 > this.destX && this.x - 2 < this.destX && this.y + 2 > this.destY && this.y - 2 < this.destY) {
		this.velX = 0;
		this.velY = 0;
		this.x = this.origX;
		this.y = this.origY;
	}
	this.y -= p.worldY;
};
Platform.prototype.display = function() {
	c.globalAlpha = this.opacity;
	this.y += p.worldY;
	c.fillStyle = "#646464";
	if(p.y - 5 > this.y && p.y + 46 + 6 < this.y + this.h && TESTING_MODE) {
		c.fillStyle = "rgb(0, 0, 255)";
	}
	c.fillRect(this.x, this.y, this.w, this.h);
	this.y -= p.worldY;
	c.globalAlpha = 1;
};
var platforms = [new Platform(0, 215, 160, 20), new Platform(800 - 160, 215, 160, 20), new Platform(320, 390, 160, 20), new Platform(0, 565, 160, 20), new Platform(800 - 160, 565, 160, 20)]; // platforms are centered at y=400, 255, and 565.

function DollarIcon() {
	/*
	This is for the dollar icons that fall from the sky when you hover over the shop button.
	*/
	this.x = Math.random() * 100 + 225;
	this.y = 450;
};
DollarIcon.prototype.display = function() {
	c.fillStyle = "#646464";
	c.font = "20px cursive";
	c.fillText("$", this.x, this.y);
	this.y += 5;
};
var dollarIcons = [];
function Button(x, y, whereTo, icon) {
	this.x = x;
	this.y = y;
	this.whereTo = whereTo;
	this.icon = icon;
	this.mouseOver = false;
	this.r = 0;
	this.rDir = 0;
	this.doorX = 0;
	this.mousedOverBefore = false;
};
Button.prototype.display = function() {
	if(this.icon === "play") {
		/* button outline */
		c.strokeStyle = "#646464";
		c.lineWidth = 5;
		c.beginPath();
		c.arc(this.x, this.y, 75, 0, 2 * Math.PI);
		c.stroke();
		/* small triangle (mouse is not over) */
		if(!this.mouseOver) {
			c.fillStyle = "#646464";
			c.beginPath();
			c.moveTo(this.x - 15, this.y - 22.5);
			c.lineTo(this.x - 15, this.y + 22.5);
			c.lineTo(this.x + 30, this.y);
			c.fill();
		}
		/* big triangle (mouse is over) */
		else {
			c.fillStyle = "#646464";
			c.beginPath();
			c.moveTo(this.x - 20, this.y - 30);
			c.lineTo(this.x - 20, this.y + 30);
			c.lineTo(this.x + 40, this.y);
			c.fill();
		}
	}
	else if(this.icon === "question") {
		/* button outline */
		c.strokeStyle = "#646464";
		c.lineWidth = 5;
		c.beginPath();
		c.arc(this.x, this.y, 50, 0, 2 * Math.PI);
		c.stroke();
		/* question mark */
		c.fillStyle = "#646464";
		c.textAlign = "center";
		c.save();
		c.translate(this.x, this.y);
		c.rotate(this.r);
		c.fillText("?", 0, 15);
		c.restore();
		if(this.mouseOver && this.r < 0.5) {
			this.r += 0.05;
		}
		if(!this.mouseOver && this.r > 0) {
			this.r -= 0.05;
		}
	}
	else if(this.icon === "gear") {
		/* button outline */
		c.strokeStyle = "#646464";
		c.lineWidth = 5;
		c.beginPath();
		c.arc(this.x, this.y, 50, 0, 2 * Math.PI);
		c.stroke();
		/* gear body */
		c.fillStyle = "#646464";
		c.beginPath();
		c.arc(this.x, this.y, 20, 0, 2 * Math.PI);
		c.fill();
		/* gear prongs */
		for(var r = 0; r < 2 * Math.PI; r += (2 * Math.PI) / 9) {
			c.save();
			c.translate(this.x, this.y);
			c.rotate(r + this.r);
			c.fillRect(-5, -28, 10, 28);
			c.restore();
		}
		if(this.mouseOver) {
			this.r += 0.05;
		}
	}
	else if(this.icon === "dollar") {
		/* button outline */
		c.strokeStyle = "#646464";
		c.lineWidth = 5;
		c.beginPath();
		c.arc(this.x, this.y, 50, 0, 2 * Math.PI);
		c.stroke();
		/* dollar sign */
		c.fillStyle = "#646464";
		c.font = "50px cursive";
		c.fillText("$", this.x, this.y + 15);
		/* dollar sign animation */
		if(this.mouseOver && frameCount % 10 === 0) {
			dollarIcons.push(new DollarIcon());
		}
		if(dollarIcons.length > 0) {
			for(var x = this.x - 70; x < this.x + 70; x ++) {
				for(var y = this.y - 70; y < this.y + 70; y ++) {
					if(Math.dist(x, y, this.x, this.y) > 52.5) {
						c.fillStyle = "#C8C8C8";
						c.fillRect(x, y, 1, 1);
					}
				}
			}
			var g = c.createRadialGradient(this.x, this.y, 52, this.x, this.y, 53);
			g.addColorStop(0, "rgba(200, 200, 200, 0)");
			g.addColorStop(1, "rgba(200, 200, 200, 255)");
			c.fillStyle = g;
			c.fillRect(this.x - 70, this.y - 70, 140, 140);
		}
	}
	else if(this.icon === "trophy") {
		/* rays of light */
		if(this.mouseOver) {
			this.r += 1;
			if(this.r > 50) {
				this.r = 0;
			}
			c.strokeStyle = "#AAAAAA";
			c.beginPath();
			c.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
			c.stroke();
			for(var r = 0; r < 2 * Math.PI; r += (2 * Math.PI) / 8) {
				c.save();
				c.translate(this.x, this.y);
				c.rotate(r);
				c.fillStyle = "#C8C8C8";
				c.beginPath();
				c.moveTo(0, 0);
				c.lineTo(-10, -50);
				c.lineTo(10, -50);
				c.fill();
				c.restore();
			}
		}
		/* button outline */
		c.strokeStyle = "#646464";
		c.lineWidth = 5;
		c.beginPath();
		c.arc(this.x, this.y, 50, 0, 2 * Math.PI);
		c.stroke();
		/* trophy base */
		c.fillStyle = "#646464";
		c.beginPath();
		c.arc(this.x, this.y + 23, 13, -3.14159, 0);
		c.fill();
		/* trophy support */
		c.fillRect(this.x - 5, this.y - 2, 10, 20);
		/* trophy cup */
		c.beginPath();
		c.save();
		c.translate(this.x, this.y - 22);
		c.scale(1, 1.5);
		c.arc(0, 0, 20, 0, 3.14159);
		c.restore();
		c.fill();
	}
	else if(this.icon === "house") {
		/* button outline */
		c.strokeStyle = "#646464";
		c.beginPath();
		c.arc(this.x, this.y, 50, 0, 2 * Math.PI);
		c.stroke();
		/* house icon */
		c.fillStyle = "#646464";
		c.fillRect(this.x - 20, this.y - 15, 15, 35);
		c.fillRect(this.x - 20, this.y - 15, 40, 15);
		c.fillRect(this.x + 5, this.y - 15, 15, 35);
		c.beginPath();
		c.moveTo(this.x - 30, this.y - 10);
		c.lineTo(this.x + 30, this.y - 10);
		c.lineTo(this.x, this.y - 30);
		c.fill();
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
		/* button outline */
		c.strokeStyle = "#646464";
		c.beginPath();
		c.arc(this.x, this.y, 50, 0, 2 * Math.PI);
		c.stroke();
		/* retry icon */
		c.save();
		c.translate(this.x, this.y);
		if(this.mouseOver) {
			c.rotate(0.5 * Math.PI);
		}
		c.beginPath();
		c.arc(0, 0, 30, 0.5 * Math.PI, 2 * Math.PI);
		c.stroke();
		c.beginPath();
		c.moveTo(15, 0);
		c.lineTo(45, 0);
		c.lineTo(30, 20);
		c.fill();
		c.restore();
	}
	this.mousedOverBefore = this.mouseOver;
};
Button.prototype.hasMouseOver = function() {
	return Math.hypot(input.mouse.x - this.x, input.mouse.y - this.y) < ((this.icon === "play") ? 75 : 50);
};
Button.prototype.checkForClick = function() {
	if(this.mouseOver && input.mouse.pressed && !utilities.pastInputs.mouse.pressed) {
		p.onScreen = this.whereTo;
		if(this.icon === "retry" || this.icon === "play") {
			p.reset();
		}
	}
};
var playButton = new Button(400, 400, "play", "play");
var shopButton = new Button(275, 500, "shop", "dollar");
var achievementsButton = new Button(525, 500, "achievements", "trophy");
var homeFromDeath = new Button(266, 650, "home", "house");
var homeFromShop = new Button(75, 75, "home", "house");
var homeFromAcs = new Button(75, 75, "home", "house");
var retryButton = new Button(533, 650, "play", "retry");
var currentEvent = "starting";

function DoubleJumpParticle(x, y) {
	this.x = x;
	this.y = y;
	this.size = 2;
	this.op = 1;
};
DoubleJumpParticle.prototype.display = function() {
	c.globalAlpha = this.op;
	c.strokeStyle = "#FFFF00";
	c.lineWidth = 5;
	c.beginPath();
	c.save();
	c.translate(this.x, this.y + p.worldY);
	c.scale(this.size, 1);
	c.arc(0, 0, 5, 0, 2 * Math.PI);
	c.stroke();
	c.restore();
	this.size += 0.1;
	this.op -= 0.02;
	c.globalAlpha = 1;
};
var doubleJumpParticles = [];
function ShopItem(x, y, name, description, price) {
	this.x = x;
	this.y = y;
	this.name = name;
	this.description = description;
	this.price = price;
	this.infoOp = 0;
	this.mouseOver = false;
	this.bought = false;
	this.equipped = false;
	this.origX = x;
	this.origY = y;
	this.upgrades = 0;
	this.showingPopup = false;
};
ShopItem.prototype.displayLogo = function(size) {
	if(size === 1) {
		this.x = this.origX;
		this.y = this.origY;
	}
	c.save();
	c.translate(this.x, this.y);
	c.scale(size, size);
	c.strokeStyle = "#646464";
	c.fillStyle = "#C8C8C8";
	c.lineWidth = 5;
	c.beginPath();
	c.arc(0, 0, 75, 0, 2 * Math.PI);
	c.stroke();
	if(size !== 1) {
		c.fill();
	}
	c.beginPath();
	c.fillStyle = (this.equipped) ? "#646464" : "#C8C8C8";
	c.strokeStyle = "#646464";
	c.arc(50, -50, 20, 0, 2 * Math.PI);
	if(this.bought && this.name !== "Box of Storage") {
		c.fill();
		c.stroke();
		c.fillStyle = (this.equipped) ? "#C8C8C8" : "#646464";
		c.textAlign = "center";
		c.font = "bold 20px monospace";
		c.fillText(this.upgrades + 1, 50, -45);
	}
	if(this.name === "Piggy Bank of Money") {
		c.save();
		c.translate(10, 0);
		/* body */
		c.fillStyle = (this.bought) ? "#DFA0AB" : "#646464";
		c.beginPath();
		c.arc(0, 0, 30, 30, 0, 2 * Math.PI);
		c.fill();
		/* legs */
		c.fillRect(0 - 20, 0, 15, 35);
		c.fillRect(0 + 5, 0, 15, 35);
		/* head */
		c.beginPath();
		c.arc(0 - 40, 0 - 10, 20, 0, 2 * Math.PI);
		c.fill();
		/* chin */
		c.beginPath();
		c.moveTo(0 - 40, 0 + 10);
		c.lineTo(0, 0 + 20);
		c.lineTo(0, 0);
		c.fill();
		/* head - whitespace */
		c.fillStyle = "#C8C8C8";
		c.beginPath();
		c.arc(0 - 50, 0 - 20, 20, 0, 2 * Math.PI);
		c.fill();
		/* coin slot - whitespace */
		c.strokeStyle = "#C8C8C8";
		c.beginPath();
		c.arc(0, 0, 20, 1.5 * Math.PI - 0.6, 1.5 * Math.PI + 0.6);
		c.stroke();
		c.restore();
	}
	else if(this.name === "Boots of Speediness") {
		/* boots */
		c.fillStyle = (this.bought) ? "#00DF00" : "#646464";
		c.fillRect(0 - 10, 0 + 46, 20, 5);
		c.fillRect(0 + 30, 0 + 46, 20, 5);
		/* stickman body + limbs */
		c.strokeStyle = (this.bought) ? "#000000" : "#646464";
		c.beginPath();
		c.moveTo(0 - 10, 0 - 10);
		c.lineTo(0 + 10, 0 + 10);
		c.lineTo(0 - 10, 0 + 30);
		c.lineTo(0 + 10, 0 + 50);
		c.moveTo(0 + 10, 0 + 10);
		c.lineTo(0 + 50, 0 + 50);
		c.moveTo(0 + 10, 0 - 30);
		c.lineTo(0 - 30, 0 + 10);
		c.lineTo(0 - 50, 0 - 10);
		c.moveTo(0 + 10, 0 - 30);
		c.lineTo(0 + 30, 0 - 10);
		c.stroke();
		/* stickman head */
		c.beginPath();
		c.fillStyle = (this.bought) ? "#000000" : "#646464";
		c.arc(0 - 17, 0 - 17, 10, 0, 2 * Math.PI);
		c.fill();
	}
	else if(this.name === "Potion of Jumpiness") {
		/* potion */
		c.fillStyle = (this.bought) ? "#FFFF00" : "#646464";
		c.beginPath();
		c.moveTo(0 - 5 - 4, 0 + 4);
		c.lineTo(0 + 5 + 4, 0 + 4);
		c.lineTo(0 + 25, 0 + 20);
		c.lineTo(0 - 25, 0 + 20);
		c.fill();
		/* beaker body */
		c.strokeStyle = (this.bought) ? "#000000" : "#646464";
		c.beginPath();
		c.moveTo(0 - 5, 0 - 20);
		c.lineTo(0 - 5, 0);
		c.lineTo(0 - 5 - 20, 0 + 20);
		c.lineTo(0 + 25, 0 + 20);
		c.lineTo(0 + 5, 0);
		c.lineTo(0 + 5, 0 - 20);
		c.stroke();
		/* beaker opening */
		c.beginPath();
		c.arc(0, 0 - 27, 10, 0, 2 * Math.PI);
		c.stroke();
	}
	else if(this.name === "Talisman of Intangibility") {
		c.fillStyle = "#646464";
		c.beginPath();
		c.arc(0, 0, 30, 0, 2 * Math.PI);
		c.fill();
		/* gemstone */
		c.fillStyle = (this.bought) ? "#000080" : "#C8C8C8";
		c.beginPath();
		c.moveTo(0 - 6, 0 - 12);
		c.lineTo(0 + 6, 0 - 12);
		c.lineTo(0 + 15, 0);
		c.lineTo(0 + 6, 0 + 12);
		c.lineTo(0 - 6, 0 + 12);
		c.lineTo(0 - 15, 0);
		c.lineTo(0 - 6, 0 - 12);
		c.fill();
		/* necklace threads */
		c.strokeStyle = (this.bought) ? "rgb(138, 87, 0)" : "#646464";
		c.beginPath();
		c.moveTo(0 - 5, 0 - 29);
		c.lineTo(0 - 15, 0 - 75);
		c.stroke();
		c.beginPath();
		c.moveTo(0 + 5, 0 - 29);
		c.lineTo(0 + 15, 0 - 75);
		c.stroke();
	}
	else if(this.name === "Skull of Reanimation") {
		c.fillStyle = (this.bought) ? "#FFFFFF" : "#646464";
		/* skull */
		c.beginPath();
		c.arc(0, 0, 30, 0, 2 * Math.PI);
		c.fill();
		/* skull chin */
		c.fillRect(0 - 15, 0 + 20, 30, 20);
		/* eyes - whitespace */
		c.fillStyle = "#C8C8C8";
		c.beginPath();
		c.arc(0 - 13, 0 - 10, 7, 0, 2 * Math.PI);
		c.arc(0 + 13, 0 - 10, 7, 0, 2 * Math.PI);
		c.fill();
		/* mouth */
		c.fillRect(0 - 2, 0 + 20, 4, 20);
		c.fillRect(0 - 10, 0 + 20, 4, 20);
		c.fillRect(0 + 6, 0 + 20, 4, 20);
	}
	else if(this.name === "Box of Storage") {
		c.fillStyle = (this.bought) ? "rgb(138, 87, 0)" : "#646464";
		/* front face */
		c.beginPath();
		c.fillRect(0 - 30, 0 - 10, 40, 40);
		c.fill();
		/* top face */
		c.beginPath();
		c.moveTo(0 - 30, 0 - 12);
		c.lineTo(0 + 10, 0 - 12);
		c.lineTo(0 + 40, 0 - 40);
		c.lineTo(0, 0 - 40);
		c.fill();
		/* right face */
		c.beginPath();
		c.moveTo(0 + 12, 0 - 10);
		c.lineTo(0 + 12, 0 + 30);
		c.lineTo(0 + 42, 0);
		c.lineTo(0 + 42, 0 - 40);
		c.fill();
		/* lines separating lid from box - whitespace */
		c.strokeStyle = "#C8C8C8";
		c.lineWidth = 2;
		c.beginPath();
		c.moveTo(0 - 30, 0 - 5);
		c.lineTo(0 + 10, 0 - 5);
		c.stroke();
		c.beginPath();
		c.moveTo(0 + 10, 0 - 3);
		c.lineTo(0 + 42, 0 - 35);
		c.stroke();
		c.lineWidth = 5;
	}
	c.restore();
	this.mouseOver = false;
	if(Math.dist(input.mouse.x, input.mouse.y, this.x, this.y) <= 75) {
		this.mouseOver = true;
	}
	if(this.x >= 500 && this.infoOp > 0 && input.mouse.x > this.x - 335 && input.mouse.x < this.x - 85 && input.mouse.y > this.y - 100 && input.mouse.y < this.y + 100) {
		this.mouseOver = true;
	}
	if(this.x <= 500 && this.infoOp > 0 && input.mouse.x > this.x + 85 && input.mouse.x < this.x + 335 && input.mouse.y > this.y - 100 && input.mouse.y < this.y + 100) {
		this.mouseOver = true;
	}
	if(this.x <= 500 && this.infoOp > 0 && input.mouse.x > this.x && input.mouse.x < this.x + 100 && input.mouse.y > this.y - 75 && input.mouse.y < this.y + 75) {
		this.mouseOver = true;
	}
	if(this.x >= 500 && this.infoOp > 0 && input.mouse.x < this.x && input.mouse.x > this.x - 100 && input.mouse.y > this.y - 75 && input.mouse.y < this.y + 75) {
		this.mouseOver = true;
	}
	/* prevent conflicts between shop items when mousing over */
	if(this.name === "Boots of Speediness" && (coinDoubler.infoOp > 0 || doubleJumper.infoOp > 0)) {
		this.mouseOver = false;
	}
	if(this.name === "Potion of Jumpiness" && (speedIncreaser.infoOp > 0 || coinDoubler.infoOp > 0)) {
		this.mouseOver = false;
	}
	if(this.name === "Skull of Reanimation" && (intangibilityTalisman.infoOp > 0 || secondItem.infoOp > 0)) {
		this.mouseOver = false;
	}
	if(this.name === "Piggy Bank of Money" && doubleJumper.infoOp > 0) {
		this.mouseOver = false;
	}
	if(this.name === "Box of Storage" && (secondLife.infoOp > 0 || intangibilityTalisman.infoOp > 0)) {
		this.mouseOver = false;
	}
	if(this.name === "Talisman of Intangibility" && secondItem.infoOp > 0) {
		this.mouseOver = false;
	}
	if(this.mouseOver) {
		this.infoOp = (this.infoOp < 1) ? this.infoOp + 0.1 : 1;
	}
	else {
		this.infoOp = (this.infoOp > 0) ? this.infoOp - 0.1 : 0;
	}
	c.restore();
};
ShopItem.prototype.displayInfo = function() {
	c.globalAlpha = (this.infoOp > 0) ? this.infoOp : 0;
	if(this.name !== "Potion of Jumpiness" && this.name !== "Box of Storage") {
		c.fillStyle = "#646464";
		c.beginPath();
		c.moveTo(this.x + 75, this.y);
		c.lineTo(this.x + 85, this.y + 10);
		c.lineTo(this.x + 85, this.y - 10);
		c.fill();
		c.fillRect(this.x + 85, this.y - 100, 250, 200);
		/* title */
		c.fillStyle = "#C8C8C8";
		c.font = "20px monospace";
		c.textAlign = "left";
		if(this.name === "Talisman of Intangibility") {
			c.font = "17px monospace";
		}
		c.fillText(this.name, this.x + 95, this.y - 80);
		c.font = "20px monospace";
		/* line */
		c.strokeStyle = "#C8C8C8";
		c.beginPath();
		c.moveTo(this.x + 90, this.y - 70);
		c.lineTo(this.x + 330, this.y - 70);
		c.stroke();
		/* description - manual line break insertion */
		switch(this.name) {
			case "Piggy Bank of Money":
				c.fillText("With this amazing", this.x + 95, this.y - 50);
				c.fillText("piggy bank, twice as", this.x + 95, this.y - 30);
				c.fillText("many coins will", this.x + 95, this.y - 10);
				c.fillText("appear in game.", this.x + 95, this.y + 10);
				break;
			case "Boots of Speediness":
				c.fillText("These speedy boots", this.x + 95, this.y - 50);
				c.fillText("make you run twice", this.x + 95, this.y - 30);
				c.fillText("as fast.", this.x + 95, this.y - 10);
				break;
			case "Talisman of Intangibility":
				c.fillText("Walk through", this.x + 95, this.y - 50);
				c.fillText("everything with this", this.x + 95, this.y - 30);
				c.fillText("magical talisman.", this.x + 95, this.y - 10);
				c.fillText("Press [down] to use.", this.x + 95, this.y + 10);
				break;
			case "Skull of Reanimation":
				c.fillText("Come back from the", this.x + 95, this.y - 50);
				c.fillText("dead! This ancient", this.x + 95, this.y - 30);
				c.fillText("skull grants you an", this.x + 95, this.y - 10);
				c.fillText("extra life each game.", this.x + 95, this.y + 10);
				break;
		}
		/* button 1 */
		if(this.upgrades < 2) {
			c.strokeRect(this.x + 95, this.y + 60, 230, 30);
		}
		c.textAlign = "center";
		if(!this.bought) {
			c.fillText("Buy - $" + this.price, this.x + 210, this.y + 80);
		}
		else if(this.upgrades < 2) {
			c.fillText("Upgrade - $" + this.price, this.x + 210, this.y + 80);
		}
		else if(this.upgrades >= 2) {
			c.fillText("Fully upgraded", this.x + 210, this.y + 80);
		}
		if(input.mouse.x > this.x + 95 && input.mouse.x < this.x + 325 && input.mouse.y > this.y + 60 && input.mouse.y < this.y + 90 && input.mouse.pressed && !utilities.pastInputs.mouse.pressed && this.infoOp >= 1  && this.x < 500 && this.infoOp > 0) {
			if(this.upgrades < 2) {
				if(p.totalCoins > this.price) {
					if(!this.bought) {
						this.bought = true;
						this.price = 10; // all of the items first upgrade costs 10
					}
					else {
						this.showingPopup = true;
					}
					p.totalCoins -= this.price;
				}
			}
		}
		/* button 2 */
		if(this.bought) {
			c.strokeRect(this.x + 95, this.y + 20, 230, 30);
			c.textAlign = "center";
			c.fillText((this.equipped) ? "Unequip" : "Equip", this.x + 210, this.y + 40);
			if(input.mouse.x > this.x + 95 && input.mouse.x < this.x + 325 && input.mouse.y > this.y + 20 && input.mouse.y < this.y + 50 && input.mouse.pressed && !utilities.pastInputs.mouse.pressed && this.infoOp > 0) {
				if(!this.equipped) {
					if(p.itemsEquipped < 1) {
						this.equipped = true;
						p.itemsEquipped ++;
					}
				}
				else {
					this.equipped = false;
					p.itemsEquipped --;
				}
			}
		}
	}
	else {
		c.fillStyle = "#646464";
		c.beginPath();
		c.moveTo(this.x - 75, this.y);
		c.lineTo(this.x - 85, this.y + 10);
		c.lineTo(this.x - 85, this.y - 10);
		c.fill();
		c.fillRect(this.x - 335, this.y - 100, 250, 200);
		/* title */
		c.fillStyle = "#C8C8C8";
		c.font = "20px monospace";
		c.textAlign = "left";
		c.fillText(this.name, this.x - 325, this.y - 80);
		c.font = "20px monospace";
		/* line */
		c.strokeStyle = "#C8C8C8";
		c.beginPath();
		c.moveTo(this.x - 90, this.y - 70);
		c.lineTo(this.x - 330, this.y - 70);
		c.stroke();
		/* description */
		switch(this.name) {
			case "Box of Storage":
				c.fillText("Are your hands full?", this.x - 325, this.y - 50);
				c.fillText("Carry an extra item", this.x - 325, this.y - 30);
				c.fillText("from the shop with", this.x - 325, this.y - 10);
				c.fillText("you each game.", this.x - 325, this.y + 10);
				break;
			case "Potion of Jumpiness":
				c.fillText("Drink this potion to", this.x - 325, this.y - 50);
				c.fillText("be able to double", this.x - 325, this.y - 30);
				c.fillText("jump!", this.x - 325, this.y - 10);
		}
		/* button 1 */
		c.textAlign = "center";
		if(this.bought && this.name !== "Box of Storage") {
			c.strokeRect(this.x - 325, this.y + 20, 230, 30);
			c.fillText((this.equipped) ? "Unequip" : "Equip", this.x - 210, this.y + 40);
		}
		if(input.mouse.x > this.x - 325 && input.mouse.x < this.x - 95 && input.mouse.y > this.y + 20 && input.mouse.y < this.y + 50 && this.bought && input.mouse.pressed && !utilities.pastInputs.mouse.pressed && this.infoOp > 0 && this.name !== "Box of Storage") {
			if(!this.equipped) {
				if(p.itemsEquipped < 1) {
					this.equipped = true;
					p.itemsEquipped ++;
				}
			}
			else {
				this.equipped = false;
				p.itemsEquipped --;
			}
		}
		/* button 2 */
		if(this.name !== "Box of Storage" || !this.bought) {
			if(this.upgrades < 2) {
				c.strokeRect(this.x - 325, this.y + 60, 230, 30);
			}
			if(!this.bought) {
				c.fillText("Buy - $" + this.price, this.x - 210, this.y + 80);
			}
			else if(this.upgrades < 2) {
				c.fillText("Upgrade - $" + this.price, this.x - 210, this.y + 80);
			}
			else {
				c.fillText("Fully Upgraded", this.x - 210, this.y + 80);
			}
			if(input.mouse.x > this.x - 325 && input.mouse.x < this.x - 95 && input.mouse.y > this.y + 60 && input.mouse.y < this.y + 90 && input.mouse.pressed && !utilities.pastInputs.mouse.pressed && p.totalCoins >= this.price && this.upgrades < 2 && this.infoOp > 0) {
				p.totalCoins -= this.price;
				if(!this.bought) {
					this.bought = true;
					if(this.name === "Box of Storage") {
						p.itemsEquipped --;
					}
				}
				else {
					this.showingPopup = true;
				}
			}
		}
	}
	c.globalAlpha = 1;
};
ShopItem.prototype.displayPopup = function() {
	if(this.showingPopup) {
		coinDoubler.infoOp = -0.5;
		speedIncreaser.infoOp = -0.5;
		doubleJumper.infoOp = -0.5;
		intangibilityTalisman.infoOp = -0.5;
		secondLife.infoOp = -0.5;
		secondItem.infoOp = -0.5;
		c.fillStyle = "#646464";
		c.fillRect(250, 250, 300, 300);
		/* title */
		c.fillStyle = "#C8C8C8";
		c.textAlign = "left";
		c.fillText("Upgrade Item", 260, 270);
		/* line */
		c.beginPath();
		c.strokeStyle = "#C8C8C8";
		c.moveTo(260, 280);
		c.lineTo(540, 280);
		c.stroke();
		/* upgrade description */
		switch(this.name) {
			case "Piggy Bank of Money":
				if(this.upgrades === 0) {
					c.fillText("Current Level:", 260, 300);
					c.fillText("● 2x coin multiplier", 260, 320);
					c.fillText("Upgraded Level:", 260, 360);
					c.fillText("● 2x coin multiplier", 260, 380);
					c.fillText("● Weak coin magnet", 260, 400);
				}
				if(this.upgrades === 1) {
					c.fillText("Current Level:", 260, 300);
					c.fillText("● 2x coin multiplier", 260, 320);
					c.fillText("● Weak coin magnet", 260, 340);
					c.fillText("Upgraded Level:", 260, 380);
					c.fillText("● 2x coin multiplier", 260, 400);
					c.fillText("● Strong coin magnet", 260, 420);
				}
				break;
			case "Boots of Speediness":
				if(this.upgrades === 0) {
					c.fillText("Current Level:", 260, 300);
					c.fillText("● 1.5x max speed", 260, 320);
					c.fillText("Upgraded Level:", 260, 360);
					c.fillText("● 1.5x max speed", 260, 380);
					c.fillText("● 2x acceleration", 260, 400);
				}
				if(this.upgrades === 1) {
					c.fillText("Current Level:", 260, 300);
					c.fillText("● 1.5x max speed", 260, 320);
					c.fillText("● 2x acceleration", 260, 340);
					c.fillText("Upgraded Level:", 260, 380);
					c.fillText("● 2x max speed", 260, 400);
					c.fillText("● 2x acceleration", 260, 420);
				}
				break;
			case"Potion of Jumpiness":
				if(this.upgrades === 0) {
					c.fillText("Current Level:", 260, 300);
					c.fillText("● High jumping", 260, 320);
					c.fillText("Upgraded Level:", 260, 360);
					c.fillText("● High jumping", 260, 380);
					c.fillText("● Low double jumping", 260, 400);
				}
				else if(this.upgrades === 1) {
					c.fillText("Current Level:", 260, 300);
					c.fillText("● High jumping", 260, 320);
					c.fillText("● Low double jumping", 260, 340);
					c.fillText("Upgraded Level:", 260, 380);
					c.fillText("● High jumping", 260, 400);
					c.fillText("● High double jumping", 260, 420);
				}
				break;
			case "Talisman of Intangibility":
				if(this.upgrades === 0) {
					c.fillText("Current Level:", 260, 300);
					c.fillText("● Intangibility", 260, 320);
					c.fillText("Upgraded Level:", 260, 360);
					c.fillText("● Intangibility", 260, 380);
					c.fillText("● Screen edge wrap", 260, 400);
				}
				if(this.upgrades === 1) {
					c.fillText("Current Level:", 260, 300);
					c.fillText("● Intangibility", 260, 320);
					c.fillText("● Screen edge wrap", 260, 340);
					c.fillText("Upgraded Level:", 260, 380);
					c.fillText("● Intangibility", 260, 400);
					c.fillText("● Screen edge wrap", 260, 420);
					c.fillText("● Coin intangibility", 260, 440);
					c.fillText("exception", 260, 460);
				}
				break;
			case "Skull of Reanimation":
				if(this.upgrades === 0) {
					c.fillText("Current Level:", 260, 300);
					c.fillText("● 1 extra life", 260, 320);
					c.fillText("● Short invincibility", 260, 340);
					c.fillText("time after revival", 260, 360);
					c.fillText("Upgraded Level:", 260, 400);
					c.fillText("● 1 extra life", 260, 420);
					c.fillText("● Long invincibility", 260, 440);
					c.fillText("time after revival", 260, 460);
				}
				else if(this.upgrades === 1) {
					c.fillText("Current Level:", 260, 300);
					c.fillText("● 1 extra life", 260, 320);
					c.fillText("● Long invincibility", 260, 340);
					c.fillText("time after revival", 260, 360);
					c.fillText("Upgraded Level:", 260, 400);
					c.fillText("● 2 extra lives", 260, 420);
					c.fillText("● Long invincibility", 260, 440);
					c.fillText("time after revival", 260, 460);
				}
				break;
		}
		/* button 1 */
		c.strokeRect(260, 470, 280, 30);
		c.textAlign = "center";
		c.fillText("Close", 400, 490);
		if(input.mouse.x > 260 && input.mouse.x < 540 && input.mouse.y > 470 && input.mouse.y < 500 && input.mouse.pressed && !utilities.pastInputs.mouse.pressed) {
			this.showingPopup = false;
		}
		/* button 2 */
		c.strokeRect(260, 510, 280, 30);
		c.fillText("Upgrade - $" + this.price, 400, 530);
		if(input.mouse.x > 260 && input.mouse.x < 540 && input.mouse.y > 510 && input.mouse.y < 540 && input.mouse.pressed && !utilities.pastInputs.mouse.pressed) {
			if(p.totalCoins > this.price) {
				p.totalCoins -= this.price;
				this.upgrades ++;
				this.showingPopup = false;
				if(this.name === "Piggy Bank of Money" || this.name === "Skull of Reanimation" || this.name === "Talisman of Intangibility") {
					this.price = 15;
				}
			}
		}
	}
};
var coinDoubler = new ShopItem(800 / 4, 800 / 3, "Piggy Bank of Money", "With this amazing piggy bank, twice as many coins will appear in game.", 5);
var speedIncreaser = new ShopItem(800 / 4 * 2, 800 / 3, "Boots of Speediness", "These speedy boots make you run extremely fast.", 10);
var doubleJumper = new ShopItem(800 / 4 * 3, 800 / 3, "Potion of Jumpiness", "Drink this potion to be able to jump higher and double jump!", 10);
var intangibilityTalisman = new ShopItem(800 / 4, 800 / 3 * 2, "Talisman of Intangibility", "Walk through walls, floors, and enemies with this magical talisman. Press down to use.", 10);
var secondLife = new ShopItem(800 / 4 * 2, 800 / 3 * 2, "Skull of Reanimation", "Come back from the dead! This ancient skull grants you extra lives each game.", 15);
if(TESTING_MODE && false) {
	secondLife.bought = true;
	secondLife.equipped = true;
	secondLife.upgrades = 2;
}
var secondItem = new ShopItem(800 / 4 * 3, 800 / 3 * 2, "Box of Storage", "Are your hands full? Carry an extra shop item with you each run.", 15);

function Achievement(x, y, name) {
	this.x = x;
	this.y = y;
	this.name = name;
	this.infoOp = 0;
	this.progress = 0;
};
Achievement.prototype.displayLogo = function() {
	/* background circle */
	c.fillStyle = "#C8C8C8";
	c.strokeStyle = "#646464";
	c.beginPath();
	c.arc(this.x, this.y, 50, 0, 2 * Math.PI);
	c.fill();
	c.stroke();
	if(this.name === "I Survived") {
		/* rays of light */
		for(var r = 0; r < 2 * Math.PI; r += 2 * Math.PI / 6) {
			c.fillStyle = (this.progress === 100) ? "#FF8000" : "#C8C8C8";
			c.save();
			c.translate(this.x, this.y);
			c.rotate(r);
			c.beginPath();
			c.arc(0, 0, 47, -0.2, 0.2);
			c.lineTo(0, 0);
			c.fill();
			c.restore();
		}
		/* stickman */
		c.beginPath();
		c.strokeStyle = (this.progress === 100) ? "#000000" : "#646464";
		c.moveTo(this.x - 20, this.y + 25);
		c.lineTo(this.x - 20, this.y + 10);
		c.lineTo(this.x + 20, this.y + 10);
		c.lineTo(this.x + 20, this.y + 25);
		c.moveTo(this.x, this.y + 10);
		c.lineTo(this.x, this.y - 10);
		c.moveTo(this.x - 20, this.y - 30);
		c.lineTo(this.x - 20, this.y - 10);
		c.lineTo(this.x + 20, this.y - 10);
		c.lineTo(this.x + 20, this.y - 30);
		c.stroke();
		c.fillStyle = (this.progress === 100) ? "#000000" : "#646464";
		c.beginPath();
		c.arc(this.x, this.y - 17, 10, 0, 2 * Math.PI);
		c.fill();
	}
	else if(this.name === "Survivalist") {
		c.fillStyle = (this.progress === 100) ? "#FF0000" : "#646464";
		c.beginPath();
		c.moveTo(this.x - 30, this.y);
		c.lineTo(this.x + 30, this.y);
		c.lineTo(this.x, this.y + 30);
		c.fill();
		c.beginPath();
		c.arc(this.x - 15, this.y, 15, Math.PI, 2 * Math.PI);
		c.fill();
		c.beginPath();
		c.arc(this.x + 15, this.y, 15, Math.PI, 2 * Math.PI);
		c.fill();
	}
	else if(this.name === "Extreme Survivalist") {
		/* left heart */
		c.save();
		c.translate(this.x - 20, this.y);
		c.scale(0.5, 0.5);
		c.fillStyle = (this.progress === 100) ? "#FF0000" : "#646464";
		c.beginPath();
		c.moveTo(-30, 0);
		c.lineTo(30, 0);
		c.lineTo(0, 30);
		c.fill();
		c.beginPath();
		c.arc(-15, 0, 15, Math.PI, 2 * Math.PI);
		c.fill();
		c.beginPath();
		c.arc(15, 0, 15, Math.PI, 2 * Math.PI);
		c.fill();
		c.restore();
		/* right heart */
		c.save();
		c.translate(this.x + 20, this.y);
		c.scale(0.5, 0.5);
		c.fillStyle = (this.progress === 100) ? "#FF0000" : "#646464";
		c.beginPath();
		c.moveTo(-30, 0);
		c.lineTo(30, 0);
		c.lineTo(0, 30);
		c.fill();
		c.beginPath();
		c.arc(-15, 0, 15, Math.PI, 2 * Math.PI);
		c.fill();
		c.beginPath();
		c.arc(15, 0, 15, Math.PI, 2 * Math.PI);
		c.fill();
		c.restore();
	}
	else if(this.name === "What are the Odds") {
		/* front face */
		c.fillStyle = (this.progress === 100) ? "#0080FF" : "#646464";
		c.fillRect(this.x - 20 - 6, this.y - 10 + 6, 30, 30);
		/* top face */
		c.beginPath();
		c.moveTo(this.x - 20 - 6, this.y - 12 + 6);
		c.lineTo(this.x + 10 - 6, this.y - 12 + 6);
		c.lineTo(this.x + 30 - 6, this.y - 32 + 6);
		c.lineTo(this.x + 0 - 6, this.y - 32 + 6);
		c.fill();
		/* right face */
		c.beginPath();
		c.moveTo(this.x + 12 - 6, this.y - 10 + 6);
		c.lineTo(this.x + 12 - 6, this.y + 20 + 6);
		c.lineTo(this.x + 32 - 6, this.y + 6);
		c.lineTo(this.x + 32 - 6, this.y - 30 + 6);
		c.fill();
		/* die 1 - whitespace */
		c.fillStyle = "#C8C8C8";
		c.save();
		c.translate(this.x  - 1, this.y - 15);
		c.scale(1, 0.75);
		c.beginPath();
		c.arc(0, 0, 5, 0, 2 * Math.PI);
		c.fill();
		c.restore();
		/* die 2 - whitespace */
		c.save();
		c.translate(this.x + 12, this.y - 3);
		c.scale(0.75, 1);
		c.beginPath();
		c.arc(0, 0, 5, 0, 2 * Math.PI);
		c.fill();
		c.restore();
		c.save();
		c.translate(this.x + 21, this.y + 3);
		c.scale(0.75, 1);
		c.beginPath();
		c.arc(0, 0, 5, 0, 2 * Math.PI);
		c.fill();
		c.restore();
		/* die 3 - whitespace */
		c.beginPath();
		c.arc(this.x - 21, this.y + 4, 5, 0, 2 * Math.PI);
		c.fill();
		c.beginPath();
		c.arc(this.x - 1, this.y + 18, 5, 0, 2 * Math.PI);
		c.fill();
		c.arc(this.x - 10, this.y + 11, 5, 0, 2 * Math.PI);
		c.fill();

	}
	else if(this.name === "Moneybags") {
		c.fillStyle = (this.progress === 100) ? "#FFFF00" : "#646464";
		c.font = "bold 40px monospace";
		c.textAlign = "center";
		c.fillText("$", this.x, this.y + 12);
	}
	else if(this.name === "Extreme Moneybags") {
		c.fillStyle = (this.progress === 100) ? "#FFFF00" : "#646464";
		c.font = "bold 40px monospace";
		c.textAlign = "center";
		c.fillText("$$", this.x, this.y + 12);
	}
	else if(this.name === "Improvement") {
		c.fillStyle = (this.progress === 100) ? "#008000" : "#646464";
		c.font = "bold 50px monospace";
		c.textAlign = "center";
		c.fillText("+", this.x, this.y + 12);
	}
	else if(this.name === "Places to Be") {
		c.lineWidth = 2;
		c.setLineDash([2, 2]);
		c.beginPath();
		c.moveTo(this.x, this.y - 10);
		c.lineTo(this.x, this.y + 10);
		c.lineTo(this.x + 10, this.y + 20);
		c.moveTo(this.x, this.y + 10);
		c.lineTo(this.x - 10, this.y + 20);
		c.moveTo(this.x, this.y - 10);
		c.lineTo(this.x + 10, this.y);
		c.moveTo(this.x, this.y - 10);
		c.lineTo(this.x - 10, this.y);
		c.stroke();
		c.beginPath();
		c.arc(this.x, this.y - 15, 5, 0, 2 * Math.PI);
		c.stroke();
		c.setLineDash([]);
		c.lineWidth = 5;
	}
	else if(this.name === "Ghost") {
		c.save();
		c.translate(0, 5);
		c.fillStyle = (this.progress === 100) ? "#FFFFFF" : "#646464";
		c.fillRect(this.x - 15, this.y - 15, 30, 30);
		c.beginPath();
		c.arc(this.x, this.y - 15, 15, Math.PI, 2 * Math.PI);
		c.fill();
		/* wavy bits */
		c.beginPath();
		c.arc(this.x - 12, this.y + 15, 3, 0, Math.PI);
		c.fill();
		c.beginPath();
		c.arc(this.x, this.y + 15, 3, 0, Math.PI);
		c.fill();
		c.beginPath();
		c.arc(this.x + 12, this.y + 15, 3, 0, Math.PI);
		c.fill();
		/* wavy bits - whitespace */
		c.fillStyle = "#C8C8C8";
		c.beginPath();
		c.arc(this.x - 6, this.y + 15, 3, Math.PI, 2 * Math.PI);
		c.fill();
		c.beginPath();
		c.arc(this.x + 6, this.y + 15, 3, Math.PI, 2 * Math.PI);
		c.fill();
		/* eyes - whitespace */
		c.beginPath();
		c.arc(this.x - 7, this.y - 10, 5, 0, 2 * Math.PI);
		c.fill();
		c.beginPath();
		c.arc(this.x + 7, this.y - 10, 5, 0, 2 * Math.PI);
		c.fill();
		c.restore();
	}
};
Achievement.prototype.displayInfo = function() {
	c.globalAlpha = (this.infoOp > 0) ? this.infoOp : 0;
	if(this.x < 450) {
		/* info box */
		c.fillStyle = "#646464";
		c.beginPath();
		c.moveTo(this.x + 50, this.y);
		c.lineTo(this.x + 60, this.y - 10);
		c.lineTo(this.x + 60, this.y + 10);
		c.fill();
		c.fillRect(this.x + 60, this.y - 100, 250, 200);
		/* title */
		c.fillStyle = "#C8C8C8";
		c.font = "20px monospace";
		c.textAlign = "left";
		c.fillText(this.name, this.x + 70, this.y - 80);
		/* line */
		c.strokeStyle = "#C8C8C8";
		c.beginPath();
		c.moveTo(this.x + 65, this.y - 70);
		c.lineTo(this.x + 305, this.y - 70);
		c.stroke();
		/* description */
		switch(this.name) {
			case "I Survived":
				c.fillText("Survive all of the", this.x + 70, this.y - 50);
				c.fillText("events.", this.x + 70, this.y - 30);
				break;
			case "Survivalist":
				c.fillText("Achieve a score of", this.x + 70, this.y - 50);
				c.fillText("10 points or higher.", this.x + 70, this.y - 30);
				break;
			case "What are the Odds":
				c.fillText("Experience the same", this.x + 70, this.y - 50);
				c.fillText("event twice in a", this.x + 70, this.y - 30);
				c.fillText("row.", this.x + 70, this.y - 10);
				break;
			case "Moneybags":
				c.fillText("Buy something from", this.x + 70, this.y - 50);
				c.fillText("the shop.", this.x + 70, this.y - 30);
				break;
			case "Improvement":
				c.fillText("Beat your record", this.x + 70, this.y - 50);
				c.fillText("5 times.", this.x + 70, this.y - 30);
				break;
			case "Places to Be":
				c.fillText("[???]", this.x + 70, this.y - 50);
				break;
		}
		/* progress */
		c.strokeRect(this.x + 70, this.y + 60, 230, 30);
		if(this.progress === 100) {
			c.textAlign = "center";
			c.fillText("Achieved", this.x + 175, this.y + 80);
			c.textAlign = "left";
		}
		else {
			c.textAlign = "center";
			c.fillText("Progress: " + this.progress + "%", this.x + 175, this.y + 80);
			c.textAlign = "left";
		}
	}
	else {
		/* info box */
		c.fillStyle = "#646464";
		c.beginPath();
		c.moveTo(this.x - 50, this.y);
		c.lineTo(this.x - 60, this.y - 10);
		c.lineTo(this.x - 60, this.y + 10);
		c.fill();
		c.fillRect(this.x - 310, this.y - 100, 250, 200);
		/* title */
		c.fillStyle = "#C8C8C8";
		c.font = "20px monospace";
		c.textAlign = "left";
		c.fillText(this.name, this.x - 300, this.y - 80);
		/* line */
		c.strokeStyle = "#C8C8C8";
		c.beginPath();
		c.moveTo(this.x - 65, this.y - 70);
		c.lineTo(this.x - 305, this.y - 70);
		c.stroke();
		/* description */
		switch(this.name) {
			case "Extreme Survivalist":
				c.fillText("Achieve a score of", this.x - 300, this.y - 50);
				c.fillText("20 points or higher.", this.x - 300, this.y - 30);
				break;
			case "Extreme Moneybags":
				c.fillText("Buy everything in", this.x - 300, this.y - 50);
				c.fillText("the shop.", this.x - 300, this.y - 30);
				break;
			case "Ghost":
				c.fillText("[???]", this.x - 300, this.y - 50);
		}
		/* progress */
		c.strokeRect(this.x - 300, this.y + 60, 230, 30);
		if(this.progress === 100) {
			c.textAlign = "center";
			c.fillText("Achieved", this.x - 175, this.y + 80);
			c.textAlign = "left";
		}
		else {
			c.textAlign = "center";
			c.fillText("Progress: " + this.progress + "%", this.x - 175, this.y + 80);
			c.textAlign = "left";
		}
	}
	c.globalAlpha = 1;
	/* fading in */
	if(Math.dist(this.x, this.y, input.mouse.x, input.mouse.y) <= 50) {
		this.infoOp = (this.infoOp < 1) ? this.infoOp + 0.1 : 1;
	}
	else {
		this.infoOp = (this.infoOp > 0) ? this.infoOp - 0.1 : 0;
	}
};
Achievement.prototype.checkProgress = function() {
	switch(this.name) {
		case "I Survived":
			this.progress = (p.eventsSurvived.length / theEvents.length) * 100;
			break;
		case "Survivalist":
			var theHighscore = p.score > p.highScore ? p.score : p.highScore;
			this.progress = theHighscore * 10;
			this.progress = this.progress > 100 ? 100 : this.progress;
			break;
		case "Extreme Survivalist":
			var theHighscore = p.score > p.highScore ? p.score : p.highScore;
			this.progress = theHighscore * 5;
			this.progress = this.progress > 100 ? 100 : this.progress;
			break;
		case "What are the Odds":
			this.progress = (p.repeatedEvent) ? 100 : 0;
			break;
		case "Moneybags":
			if(coinDoubler.bought || speedIncreaser.bought || doubleJumper.bought || intangibilityTalisman.bought || secondLife.bought || secondItem.bought) {
				this.progress = 100;
			}
			else {
				this.progress = 0;
			}
			break;
		case "Extreme Moneybags":
			this.progress = 0;
			if(coinDoubler.bought) {
				this.progress += 100 / 6;
			}
			if(speedIncreaser.bought) {
				this.progress += 100 / 6;
			}
			if(doubleJumper.bought) {
				this.progress += 100 / 6;
			}
			if(intangibilityTalisman.bought) {
				this.progress += 100 / 6;
			}
			if(secondLife.bought) {
				this.progress += 100 / 6;
			}
			if(secondItem.bought) {
				this.progress += 100 / 6;
			}
			break;
		case "Improvement":
			this.progress = p.numRecords * 20;
			break;
		case "Places to Be":
			this.progress = p.gonePlaces ? 100 : 0;
			break;
		case "Ghost":
			this.progress = p.beenGhost ? 100 : 0;
			break;
	}
	this.progress = Math.ceil(this.progress * 10) / 10;
	this.progress = Math.min(this.progress, 100);
	if(this.progress >= 100 && this.previousProgress < 100) {
		chatMessages.push(new ChatMessage("Achievement Earned: " + this.name, "#FFFF00"));
	}
	this.previousProgress = this.progress;
}
var ac1 = new Achievement(200, 200, "I Survived");
var ac2 = new Achievement(400, 200, "Survivalist");
var ac3 = new Achievement(600, 200, "Extreme Survivalist");
var ac4 = new Achievement(200, 400, "What are the Odds");
var ac5 = new Achievement(400, 400, "Moneybags");
var ac6 = new Achievement(600, 400, "Extreme Moneybags");
var ac7 = new Achievement(200, 600,  "Improvement");
var ac8 = new Achievement(400, 600, "Places to Be");
var ac9 = new Achievement(600, 600, "Ghost");

function Coin(x, y, timeToAppear, indestructible) {
	this.x = x;
	this.y = y;
	this.spin = -1;
	this.spinDir = 0.05;
	this.timeToAppear = timeToAppear || 0;
	this.age = 0;
	this.indestructible = indestructible || false;
};
Coin.prototype.display = function() {
	if(this.age > this.timeToAppear) {
		c.fillStyle = "#FFFF00";
		c.save();
		c.translate(this.x, this.y + p.worldY);
		c.scale(this.spin, 1);
		c.beginPath();
		c.arc(0, 0, 20, 0, 2 * Math.PI);
		c.fill();
		c.restore();
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
};
var coins = [];
function ChatMessage(msg, col) {
	this.msg = msg;
	this.col = col;
	this.time = 120;
};
ChatMessage.prototype.display = function(y) {
	c.fillStyle = this.col;
	c.textAlign = "right";
	c.font = "20px monospace";
	c.fillText(this.msg, 790, y);
	this.time --;
};
var chatMessages = [];
/* laser event */
function Explosion(x, y) {
	this.x = x;
	this.y = y;
	this.size = 0;
	this.width = 10;
	this.opacity = 1;
};
Explosion.prototype.display = function() {
	c.strokeStyle = "#FF8000";
	c.globalAlpha = this.opacity;
	c.lineWidth = this.width;
	c.beginPath();
	c.arc(this.x, this.y + p.worldY, this.size, 0, 2 * Math.PI);
	c.stroke();
	c.globalAlpha = 1;
	c.lineWidth = 5;
};
Explosion.prototype.update = function() {
	this.size ++;
	this.width += 0.5;
	this.opacity -= 0.01;
	if((Math.dist(this.x, this.y + p.worldY, p.x - 10, p.y) <= this.size || Math.dist(this.x, this.y + p.worldY, p.x + 10, p.y) <= this.size || Math.dist(this.x, this.y + p.worldY, p.x - 10, p.y + 46) <= this.size || Math.dist(this.x, this.y + p.worldY, p.x + 10, p.y + 45) <= this.size) && !(input.keys[40] && intangibilityTalisman.equipped)) {
		p.die("laser");
	}
};
var explosions = [];
function Laser() {
	this.x = Math.random() * 800;
	this.y = Math.random() * 800;
	this.numMoves = 0;
	this.timeInLocation = 0;
	this.numBlinks = 0;
	this.timeSinceBlink = 0;
	this.blinking = false;
};
Laser.prototype.display = function() {
	c.strokeStyle = "#FF0000";
	c.beginPath();
	c.arc(this.x, this.y + p.worldY, 50, 0, 2 * Math.PI);
	c.moveTo(this.x, this.y + p.worldY - 60);
	c.lineTo(this.x, this.y + p.worldY - 40);
	c.moveTo(this.x + 60, this.y + p.worldY);
	c.lineTo(this.x + 40, this.y + p.worldY);
	c.moveTo(this.x, this.y + p.worldY + 60);
	c.lineTo(this.x, this.y + p.worldY + 40);
	c.moveTo(this.x - 60, this.y + p.worldY);
	c.lineTo(this.x - 40, this.y + p.worldY);
	c.stroke();
};
Laser.prototype.update = function() {
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
			explosions.push(new Explosion(this.x, this.y));
		}
	}
};
var lasers = [];
/* rising acid event */
var acidY = 850;
var acidRise = 0;
/* boulders event */
function Boulder(x, y, velX) {
	this.x = x;
	this.y = y;
	this.velX = velX;
	this.velY = 0;
	this.numBounces = 0;
};
Boulder.prototype.display = function() {
	c.fillStyle = "#646464";
	c.beginPath();
	c.arc(this.x, this.y, 50, 0, 2 * Math.PI);
	c.fill();
};
Boulder.prototype.update = function() {
	this.x += this.velX;
	this.y += this.velY;
	this.velY += 0.1;
	for(var i = 0; i < platforms.length; i ++) {
		if(this.x + 50 > platforms[i].x && this.x - 50 < platforms[i].x + platforms[i].w && this.y + 50 > platforms[i].y && this.y + 50 < platforms[i].y + 10) {
			this.numBounces ++;
			if(this.numBounces === 1) {
				this.velY = -4;
			}
			if(this.numBounces === 2) {
				this.velY = -3;
			}
			if(this.numBounces === 3) {
				this.velY = -2;
			}
		}
	}
	if((Math.dist(this.x, this.y, p.x - 5, p.y) <= 50 || Math.dist(this.x, this.y, p.x + 5, p.y) <= 50 || Math.dist(this.x, this.y, p.x - 5, p.y + 46) <= 50 || Math.dist(this.x, this.y, p.x + 5, p.y + 46) <= 50) && !(input.keys[40] && intangibilityTalisman.equipped)) {
		p.die("boulder");
	}
};
function RockParticle(x, y) {
	this.x = x;
	this.y = y;
	this.velX = Math.random(-5, 5);
	this.velY = Math.random(-1, -2);
};
RockParticle.prototype.display = function() {
	c.fillStyle = "#646464";
	c.beginPath();
	c.arc(this.x, this.y, 10, 0, 2 * Math.PI);
	c.fill();
};
RockParticle.prototype.update = function() {
	this.x += this.velX;
	this.y += this.velY;
	this.velY += 0.1;
	this.velX *= 0.96;
};
var rockParticles = [];
var boulders = [];
/* spinny blades event */
function SpinnyBlade(x, y) {
	this.x = x;
	this.y = y;
	this.r = 0.5 * Math.PI;
	this.numRevolutions = 0;
	this.opacity = 0;
};
SpinnyBlade.prototype.display = function() {
	c.fillStyle = "#D7D7D7";
	c.globalAlpha = this.opacity;
	c.save();
	c.translate(this.x, this.y + p.worldY);
	c.rotate(this.r);
	c.beginPath();
	c.moveTo(-5, 0);
	c.lineTo(5, 0);
	c.lineTo(0, -80);
	c.fill();
	c.beginPath();
	c.moveTo(-5, 0);
	c.lineTo(5, 0);
	c.lineTo(0, 80);
	c.fill();
	c.restore();
	c.globalAlpha = 1;
};
SpinnyBlade.prototype.update = function() {
	if(pastWorldY !== p.worldY || this.endPointArray === undefined) {
		this.endPointArray = Math.findPointsCircular(this.x, this.y + p.worldY, 80);
	}
	if(this.opacity >= 1) {
		this.r += 0.02;
	}
	if(this.r > 2 * Math.PI) {
		this.r -= 2 * Math.PI;
	}
	if(this.r > 0.5 * Math.PI - 0.01 && this.r < 0.5 * Math.PI + 0.01 && this.opacity >= 1) {
		this.numRevolutions ++;
	}
	if(this.opacity < 1 && this.numRevolutions < 2) {
		this.opacity += 0.05;
	}
	if(this.opacity > 0 && this.numRevolutions >= 2) {
		this.opacity -= 0.05;
	}
	var spinPercent = this.r / (2 * Math.PI);
	var ep1 = this.endPointArray[Math.floor(spinPercent * this.endPointArray.length)];
	var ep2 = this.endPointArray[Math.floor((spinPercent + ((spinPercent < 0.5) ? 0.5 : -0.5)) * this.endPointArray.length)];
	var bladeArray = Math.findPointsLinear(ep1.x, ep1.y, ep2.x, ep2.y);
	for(var i = 0; i < bladeArray.length; i ++) {
		if(bladeArray[i].x > p.x - 5 && bladeArray[i].x < p.x + 5 && bladeArray[i].y > p.y && bladeArray[i].y < p.y + 46 && !(input.keys[40] && intangibilityTalisman.equipped)) {
			p.die("spinnyblades");
		}
	}
};
var spinnyBlades = [];
/* jumping pirhanas event */
function Pirhana(x) {
	this.x = x;
	this.y = 850;
	this.velY = -10;
	this.scaleY = 1;
	this.mouth = 1; // 1 = open, 0 = closed
	this.mouthVel = 0;
};
Pirhana.prototype.display = function() {
	c.fillStyle = "#008000";
	c.save();
	c.translate(this.x, this.y);
	c.scale(1, this.scaleY);
	c.beginPath();
	c.arc(0, 0, 25, 0, Math.PI);
	c.fill();
	c.beginPath();
	c.arc(0, 0, 25, -0.5 * Math.PI + this.mouth, 0.5 * Math.PI + this.mouth);
	c.fill();
	c.beginPath();
	c.arc(0, 0, 25, 0.5 * Math.PI - this.mouth, -0.5 * Math.PI - this.mouth);
	c.fill();
	c.beginPath();
	c.moveTo(0, 12);
	c.lineTo(-25, 37);
	c.lineTo(25, 37);
	c.fill();
	c.restore();
};
Pirhana.prototype.update = function() {
	this.y += this.velY;
	this.velY += 0.1;
	if(this.scaleY > -1 && this.velY > 0) {
		this.scaleY -= 0.1;
	}
	this.mouth += this.mouthVel;
	if(Math.dist(this.x, this.y, p.x, p.y) < 100 && this.mouthVel === 0) {
		this.mouthVel = -0.05;
	}
	if(this.mouth <= 0) {
		this.mouthVel = 0.1;
	}
	if(this.mouth > 1) {
		this.mouthVel = 0;
		this.mouth = 1;
	}
	if(p.x + 5 > this.x - 25 && p.x - 5 < this.x + 25 && p.y + 46 > this.y - 25 && p.y < this.y + 37 && !(input.keys[40] && intangibilityTalisman.equipped)) {
		p.die("pirhanas");
	}
};
var pirhanas = [];
/* giant pacman event */
function Dot(x, y, timeToAppear) {
	this.x = x;
	this.y = y;
	this.timeToAppear = timeToAppear;
};
Dot.prototype.display = function() {
	if(this.timeToAppear <= 0) {
		c.fillStyle = "#FFFFFF";
		c.beginPath();
		c.arc(this.x, this.y, 20, 0, 2 * Math.PI);
		c.fill();
	}
};
Dot.prototype.update = function() {
	this.timeToAppear --;
};
var dots = [];
function Pacman(x, y, velX) {
	this.x = x;
	this.y = y;
	this.velX = velX;
	this.mouth = 1;
	this.mouthVel = -0.01;
};
Pacman.prototype.display = function() {
	c.fillStyle = "#FFFF00";
	c.save();
	c.translate(this.x, this.y);
	c.rotate(this.r);
	c.beginPath();
	c.arc(0, 0, 200, 0, Math.PI);
	c.fill();
	c.beginPath();
	c.arc(0, 0, 200, -0.5 * Math.PI + this.mouth, 0.5 * Math.PI + this.mouth);
	c.fill();
	c.beginPath();
	c.arc(0, 0, 200, 0.5 * Math.PI - this.mouth, -0.5 * Math.PI - this.mouth);
	c.fill();
	c.restore();
};
Pacman.prototype.update = function() {
	if(this.velX > 0) {
		this.r = 0.5 * Math.PI;
	}
	else {
		this.r = -0.5 * Math.PI;
	}
	this.x += this.velX;
	this.mouth += this.mouthVel;
	if(this.mouth <= 0) {
		this.mouthVel = 0.01;
	}
	else if(this.mouth >= 1) {
		this.mouthVel = -0.01;
	}
	if((Math.dist(this.x, this.y, p.x - 5, p.y) <= 200 || Math.dist(this.x, this.y, p.x + 5, p.y) <= 200 || Math.dist(this.x, this.y, p.x - 5, p.y + 46) <= 200 || Math.dist(this.x, this.y, p.x + 5, p.y + 46) <= 200) && !(input.keys[40] && intangibilityTalisman.equipped)) {
		p.die("pacmans");
	}
};
var pacmans = [];
/* rocket event */
function FireParticle(x, y) {
	this.x = x;
	this.y = y;
	this.velX = Math.random();
	this.velY = Math.random();
	this.opacity = 0.75;
	this.color = Math.random() * 20 + 100;
	this.size = 10;
};
FireParticle.prototype.display = function() {
	c.globalAlpha = this.opacity;
	c.fillStyle = "rgb(255, " + this.color + ", 0)";
	c.beginPath();
	if(this.size > 0) {
		c.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
	}
	c.fill();
	c.globalAlpha = 1;
	this.opacity -= 0.01;
	this.size -= 0.5;
	this.x += this.velX;
	this.y += this.velY;
};
var fireParticles = [];
function Rocket(x, y, velX) {
	this.x = x;
	this.y = y;
	this.velX = velX;
};
Rocket.prototype.display = function() {
	c.fillStyle = "#646464";
	if(this.velX > 0) {
		c.fillRect(this.x, this.y, 50, 20);
		/* tip */
		c.beginPath();
		c.moveTo(this.x + 50, this.y);
		c.lineTo(this.x + 100, this.y + 10);
		c.lineTo(this.x + 50, this.y + 20);
		c.fill();
		/* top back spike */
		c.beginPath();
		c.moveTo(this.x, this.y);
		c.lineTo(this.x - 50, this.y - 5);
		c.lineTo(this.x, this.y + 10);
		c.fill();
		/* bottom back spike */
		c.beginPath();
		c.moveTo(this.x, this.y + 20);
		c.lineTo(this.x - 50, this.y + 25);
		c.lineTo(this.x, this.y + 10);
		c.fill();
	}
	else {
		c.fillRect(this.x - 50, this.y, 50, 20);
		/* tip */
		c.beginPath();
		c.moveTo(this.x - 50, this.y);
		c.lineTo(this.x - 100, this.y + 10);
		c.lineTo(this.x - 50, this.y + 20);
		c.fill();
		/* top backspike */
		c.beginPath();
		c.moveTo(this.x, this.y);
		c.lineTo(this.x + 50, this.y - 5);
		c.lineTo(this.x, this.y + 10);
		c.fill();
		/* bottom backspike */
		c.beginPath();
		c.moveTo(this.x, this.y + 20);
		c.lineTo(this.x + 50, this.y + 25);
		c.lineTo(this.x, this.y + 10);
		c.fill();
	}
};
Rocket.prototype.update = function() {
	this.x += this.velX;
	if(frameCount % 1 === 0) {
		fireParticles.push(new FireParticle(this.x, this.y + 10));
	}
	if(this.velX > 0) {
		if(p.x + 5 > this.x - 50 && p.x - 5 < this.x + 100 && p.y + 46 > this.y && p.y < this.y + 10 && !(input.keys[40] && intangibilityTalisman.equipped)) {
			p.die("rocket");
		}
	}
	else {
		if(p.x + 5 > this.x - 100 && p.x - 5 < this.x + 50 && p.y + 46 > this.y && p.y < this.y + 10 && !(input.keys[40] && intangibilityTalisman.equipped)) {
			p.die("rocket");
		}
	}
};
var rockets = [];
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
};
Spikeball.prototype.display = function() {
	c.globalAlpha = this.opacity;
	/* spike "ball" */
	c.fillStyle = "#646464";
	c.strokeStyle = "#646464";
	c.beginPath();
	c.arc(this.x, this.y, 12, 0, 2 * Math.PI);
	c.fill();
	/* spikes */
	c.fillStyle = "#646464";
	for(var r = 0; r < 2 * Math.PI; r += 2 * Math.PI / 10) {
		c.save();
		c.translate(this.x, this.y);
		c.rotate(r + this.r);
		c.beginPath();
		c.moveTo(-10, -10);
		c.lineTo(0, -30);
		c.lineTo(10, -10);
		c.fill();
		c.restore();
	}
	c.globalAlpha = 1;
};
Spikeball.prototype.display = function() {
	c.fillStyle = "rgb(150, 150, 155)";
	c.globalAlpha = this.opacity;
	var movedTo = false;
	c.save();
	c.translate(this.x, this.y + p.worldY);
	c.rotate(this.r);
	for(var degrees = 0; degrees < 360; degrees += 18) {
		if(degrees % 36 === 0) {
			var point = Math.rotateDegrees(0, -30, degrees);
		}
		else {
			var point = Math.rotateDegrees(0, -20, degrees);
		}
		if(!movedTo) {
			c.moveTo(point.x, point.y);
			movedTo = true;
		}
		else {
			c.lineTo(point.x, point.y);
		}
	}
	c.fill();
	c.restore();
	c.globalAlpha = 1;
};
Spikeball.prototype.update = function() {
	this.r += 0.1;
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
	/* platform + wall collisions */
	if(this.age > 20) {
		for(var i = 0; i < platforms.length; i ++) {
			if(this.x + 30 > platforms[i].x && this.x - 30 < platforms[i].x + platforms[i].w && this.y + 30 > platforms[i].y && this.y + 30 < platforms[i].y + 6) {
				this.velY = -this.velY;
			}
			if(this.x + 30 > platforms[i].x && this.x - 30 < platforms[i].x + platforms[i].w && this.y - 30 < platforms[i].y + platforms[i].h && this.y - 30 > platforms[i].y + platforms[i].h - 6) {
				this.velY = -this.velY;
			}
			if(this.y + 30 > platforms[i].y && this.y - 30 < platforms[i].y + platforms[i].h && this.x + 30 > platforms[i].x && this.x + 30 < platforms[i].x + 6) {
				this.velX = -this.velX;
			}
			if(this.y + 30 > platforms[i].y && this.y - 30 < platforms[i].y + platforms[i].h && this.x - 30 < platforms[i].x + platforms[i].w && this.x - 30 > platforms[i].x + platforms[i].w - 6) {
				this.velX = -this.velX;
			}
		}
		if(this.x + 30 > 800 || this.x - 30 < 0) {
			this.velX = -this.velX;
		}
		if(this.y - 30 < 0 || this.y + 30 > 800) {
			this.velY = -this.velY;
		}
	}
	/* player collisions */
	if((Math.dist(this.x, this.y, p.x - 5, p.y) <= 30 || Math.dist(this.x, this.y, p.x + 5, p.y) <= 30 || Math.dist(this.x, this.y, p.x - 5, p.y + 46) <= 30 || Math.dist(this.x, this.y, p.x + 5, p.y + 46) <= 30) && this.age > 20 && !(input.keys[40] && intangibilityTalisman.equipped)) {
		p.die("spikeballs");
	}
};
var spikeballs = [];
/* spike wall event */
function Spikewall(x) {
	this.fastSpeed = 10;
	this.slowSpeed = 2;
	this.x = x;
	this.velX = (x < 400) ? this.fastSpeed : -this.fastSpeed;
};
Spikewall.prototype.display = function() {
	c.strokeStyle = "#D7D7D7";
	c.fillStyle = "#646464";
	if(this.velX === this.fastSpeed || this.velX === -this.slowSpeed) {
		c.fillRect(this.x - 800, 0, 800, 800);
		c.strokeRect(this.x - 800, 0, 800, 800);
		for(var y = 0; y < 800; y += 40) {
			c.fillStyle = "#D7D7D7";
			c.beginPath();
			c.moveTo(this.x, y);
			c.lineTo(this.x, y + 40);
			c.lineTo(this.x + 20, y + 20);
			c.fill();
		}
	}
	else {
		c.fillRect(this.x, 0, 800, 800);
		for(var y = 0; y < 800; y += 40) {
			c.fillStyle = "#D7D7D7";
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
	if(this.velX === this.fastSpeed && this.x > 250) {
		this.velX = -this.slowSpeed;
		coins.push(new Coin(80, (Math.random() < 0.5) ? 175 : 525));
	}
	if(this.velX === -this.fastSpeed && this.x < 550) {
		this.velX = this.slowSpeed;
		coins.push(new Coin(720, (Math.random() < 0.5) ? 175 : 525));
	}
	if(this.velX === -this.fastSpeed || this.velX === this.slowSpeed) {
		if(p.x + 5 > this.x && !(input.keys[40] && intangibilityTalisman.equipped)) {
			p.die("spike wall");
		}
	}
	if(this.velX === this.fastSpeed || this.velX === -this.slowSpeed && !(input.keys[40] && intangibilityTalisman.equipped)) {
		if(p.x - 5 < this.x) {
			p.die("spike wall");
		}
	}
};
var spikewalls = [];
/* lasting effects (blindness, confusion, nausea) */
function removeEffects() {
	theEvents.removeAll("blindness");
	theEvents.removeAll("confusion");
	theEvents.removeAll("nausea");
};
function addEffects() {
	if(!theEvents.includes("blindness")) {
		theEvents.push("blindness");
	}
	if(!theEvents.includes("confusion")) {
		theEvents.push("confusion");
	}
	if(!theEvents.includes("nausea")) {
		theEvents.push("nausea");
	}
};
/* generic event selection + running */
var theEvents = ["laser", "acid", "boulder", "spinnyblades", "pirhanas", "pacmans", "rockets", "spikeballs", "block shuffle", "spike wall", "confusion", "blindness", "nausea"];
theEvents = TESTING_MODE ? ["block shuffle"] : theEvents;

/* game */
function addEvent() {
	p.score ++;
	var eventIndex = Math.floor(Math.random() * theEvents.length);
	currentEvent = theEvents[eventIndex];
	if(currentEvent === p.previousEvent) {
		p.repeatedEvent = true;
	}
	p.previousEvent = currentEvent;
	if(p.score === p.highScore + 1) {
		p.numRecords ++;
		chatMessages.push(new ChatMessage("New Record!", "#0000FF"));
	}
	if(currentEvent === "laser") {
		lasers.push(new Laser());
		chatMessages.push(new ChatMessage("Laser incoming!", "#FF8000"));
	}
	if(currentEvent === "acid") {
		acidRise = -2;
		platforms.push(new Platform(320, 40, 160, 20));
		platforms.push(new Platform(0, -135, 160, 20));
		platforms.push(new Platform(800 - 160, -135, 160, 20));
		platforms.push(new Platform(320, -310, 160, 20));
		platforms.push(new Platform(0, -485, 160, 20));
		platforms.push(new Platform(800 - 160, -485, 160, 20));
		for(var i = 0; i < platforms.length; i ++) {
			if(platforms[i].y <= 210) {
				platforms[i].opacity = 0;
			}
		}
		coins.push(new Coin(400, 0, 0, true));
		chatMessages.push(new ChatMessage("The tides are rising...", "#FF8000"));
	}
	if(currentEvent === "boulder") {
		var chooser = Math.random();
		chatMessages.push(new ChatMessage("Boulder incoming!", "#FF8000"));
		if(chooser < 0.5) {
			boulders.push(new Boulder(850, 100, -3));
		}
		else {
			boulders.push(new Boulder(-50, 100, 3));
		}
	}
	if(currentEvent === "spinnyblades") {
		chatMessages.push(new ChatMessage("Spinning blades are appearing", "#FF8000"));
		for(var i = 0; i < platforms.length; i ++) {
			spinnyBlades.push(new SpinnyBlade(platforms[i].x + 80, platforms[i].y + 10));
		}
	}
	if(currentEvent === "pirhanas") {
		chatMessages.push(new ChatMessage("Jumping pirhanas incoming!", "#FF8000"));
		/* fancy algorithm to make sure none of the pirhanas are touching */
		var doneIt = false;
		while(!doneIt) {
			pirhanas = [];
			pirhanas.push(new Pirhana(Math.random() * 700 + 50));
			pirhanas.push(new Pirhana(Math.random() * 700 + 50));
			pirhanas.push(new Pirhana(Math.random() * 700 + 50));
			doneIt = true;
			for(var i = 0; i < pirhanas.length; i ++) {
				/* check if they collide */
				for(var j = 0; j < pirhanas.length; j ++) {
					if(i !== j && Math.abs(pirhanas[i].x - pirhanas[j].x) < 75) {
						doneIt = false;
					}
				}
			}
		}
	}
	if(currentEvent === "pacmans") {
		chatMessages.push(new ChatMessage("Pacmans incoming!", "#FF8000"));
		var coinNum = Math.round(Math.random() * 11 + 1) * 60;
		coinNum = 7 * 60;
		for(var x = 0; x < 800; x += 60) {
			if(x === coinNum) {
				coins.push(new Coin(x, 200, x * 0.25));
			} else {
				dots.push(new Dot(x, 200, x * 0.25));
			}
			dots.push(new Dot(800 - x, 600, x * 0.25));
		}
		pacmans.push(new Pacman(-200, 200, 1.5));
		pacmans.push(new Pacman(1000, 600, -1.5));
	}
	if(currentEvent === "rockets") {
		chatMessages.push(new ChatMessage("Rocket incoming!", "#FF8000"));
		if(p.x > 400) {
			rockets.push(new Rocket(-50, p.y, 6));
		}
		else {
			rockets.push(new Rocket(850, p.y, -6));
		}
	}
	if(currentEvent === "spikeballs") {
		chatMessages.push(new ChatMessage("Spikeballs incoming!", "#FF8000"));
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
			spikeballs.push(new Spikeball(velocity.x, velocity.y));
		}
	}
	if(currentEvent === "block shuffle") {
		chatMessages.push(new ChatMessage("The blocks are shuffling", "#FF8000"));
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
	if(currentEvent === "spike wall") {
		var spikeWallDistance = 1500;
		if(Math.random() < 0.5) {
			spikewalls.push(new Spikewall(-spikeWallDistance));
			chatMessages.push(new ChatMessage("Spike wall incoming from the left!", "#FF8000"));
		}
		else {
			spikewalls.push(new Spikewall(800 + spikeWallDistance));
			chatMessages.push(new ChatMessage("Spike wall incoming from the right!", "#FF8000"));
		}
	}
	if(currentEvent === "confusion") {
		timeToEvent = FPS * 3;
		p.confused = FPS * 15;
		chatMessages.push(new ChatMessage("You have been confused", "#00FF00"));
		removeEffects();
	}
	if(currentEvent === "blindness") {
		timeToEvent = FPS * 3;
		p.blinded = FPS * 15;
		chatMessages.push(new ChatMessage("You have been blinded", "#00FF00"));
		removeEffects();
	}
	if(currentEvent === "nausea") {
		timeToEvent = FPS * 3;
		p.nauseated = FPS * 15;
		chatMessages.push(new ChatMessage("You have been nauseated", "#00FF00"));
		removeEffects();
	}
};
function runEvent() {
	if(p.invincible !== 0 && TESTING_MODE && false) {
		p.invincible = Infinity;
	}
	/* coins */
	for(var i = 0; i < coins.length; i ++) {
		coins[i].display();
		coins[i].update();
		if(p.x + 5 > coins[i].x - 20 && p.x - 5 < coins[i].x + 20 && p.y + 46 > coins[i].y + p.worldY - 20 && p.y < coins[i].y + 20 + p.worldY && coins[i].age > coins[i].timeToAppear && !(intangibilityTalisman.equipped && input.keys[40] && intangibilityTalisman.upgrades < 2)) {
			coins.splice(i, 1);
			p.coins += (coinDoubler.equipped) ? 2 : 1;
			continue;
		}
		if(coinDoubler.equipped && coinDoubler.upgrades === 1 && Math.dist(coins[i].x, coins[i].y, p.x, p.y) < 200 && coins[i].age > coins[i].timeToAppear) {
			coins[i].x += (p.x - coins[i].x) / 10;
			coins[i].y += (p.y - coins[i].y) / 10;
		}
		if(coinDoubler.equipped && coinDoubler.upgrades === 2 && coins[i].age > coins[i].timeToAppear) {
			coins[i].x += (p.x - coins[i].x) / 10;
			coins[i].y += (p.y - coins[i].y) / 10;
		}
		utilities.canvas.nauseate(coins[i]);
	}
	/* lasers */
	for(var i = 0; i < lasers.length; i ++) {
		if(!lasers[i].blinking) {
			lasers[i].display();
			utilities.canvas.nauseate(lasers[i]);
		}
		lasers[i].update();
		if(lasers[i].numBlinks > 6) {
			coins.push(new Coin(lasers[i].x, lasers[i].y));
			lasers.splice(i, 1);
			continue;
		}
	}
	for(var i = 0; i < explosions.length; i ++) {
		explosions[i].display();
		utilities.canvas.nauseate(explosions[i]);
		explosions[i].update();
		if(explosions[i].opacity <= 0) {
			explosions.splice(i, 1);
			p.surviveEvent("laser");
			addEvent();
		}
	}
	/* acid */
	for(var x = 0; x < 800; x ++) {
		var brightness = Math.random() * 30;
		c.fillStyle = "rgb(" + brightness + ", 255, " + brightness + ")";
		c.fillRect(x, acidY + p.worldY + Math.sin(x / 10) * 10 * Math.sin(frameCount / 10), 1, 800);
	}
	if(p.y + 46 > acidY + p.worldY && !(input.keys[40] && intangibilityTalisman.equipped)) {
		p.die("acid");
	}
	if(acidY < 850 && currentEvent !== "acid") {
		acidY ++;
	}
	if(p.invincible && p.y > acidY + p.worldY) {
		p.velY = Math.min(-5, p.velY);
		if(input.keys[38]) {
			p.velY = Math.min(-8.5, p.velY);
		}
	}
	if(currentEvent === "acid") {
		if(acidY < 600) {
			p.worldY -= acidRise;
			p.y -= acidRise;
		}
		if(acidY > -100) {
			acidY += acidRise;
		}
		else {
			console.log("ending acid event");
			acidY += 700;
			acidRise = 1;
			p.worldY -= 700;
			for(var i = 0; i < coins.length; i ++) {
				if(!coins[i].indestructible) {
					coins.splice(i, 1);
					i --;
					continue;
				}
				else {
					coins[i].y += 700;
				}
			}
			for(var i = 0; i < platforms.length; i ++) {
				if(platforms[i].y <= 210) {
					platforms.splice(i, 1);
					i --;
					continue;
				}
			}
			if(TESTING_MODE && false) {
				console.log("removed most events");
				theEvents = ["pacmans"];
			}
			currentEvent = "waiting";
		}
	}
	else if(currentEvent === "waiting") {
		if(p.worldY > 0) {
			p.worldY --;
			p.y --;
		}
		else if(p.worldY < 0) {
			p.worldY ++;
			p.y ++;
		}
		if(p.worldY < 3 && p.worldY > -3) {
			p.worldY = 0;
			if(acidRise >= 0) {
				addEvent();
			}
		}
		p.surviveEvent("acid");
	}
	/* boulders */
	for(var i = 0; i < boulders.length; i ++) {
		boulders[i].display();
		utilities.canvas.nauseate(boulders[i]);
		boulders[i].update();
		if((boulders[i].velX < 0 && boulders[i].x < 50) || (boulders[i].velX > 0 && boulders[i].x > 750)) {
			for(var j = 0; j < 10; j ++) {
				rockParticles.push(new RockParticle(Math.random() * 20 + boulders[i].x, Math.random() * 20 + boulders[i].y));
			}
			coins.push(new Coin(boulders[i].x, boulders[i].y));
			boulders.splice(i, 1);
			p.surviveEvent("boulder");
			continue;
		}
	}
	for(var i = 0; i < rockParticles.length; i ++) {
		rockParticles[i].display();
		utilities.canvas.nauseate(rockParticles[i]);
		rockParticles[i].update();
		if(rockParticles[i].y > 850) {
			rockParticles.splice(i, 1);
			continue;
		}
	}
	if(currentEvent === "boulder" && boulders.length === 0 && rockParticles.length === 0) {
		addEvent();
	}
	/* spinnyblades */
	for(var i = 0; i < spinnyBlades.length; i ++) {
		spinnyBlades[i].display();
		utilities.canvas.nauseate(spinnyBlades[i]);
		spinnyBlades[i].update();
		if(spinnyBlades[i].opacity <= 0 && spinnyBlades[i].numRevolutions >= 2) {
			spinnyBlades.splice(i, 1);
			p.surviveEvent("spinnyblades");
		}
	}
	if(currentEvent === "spinnyblades" && spinnyBlades.length <= 0) {
		addEvent();
	}
	/* pirhanas */
	for(var i = 0; i < pirhanas.length; i ++) {
		pirhanas[i].display();
		utilities.canvas.nauseate(pirhanas[i]);
		pirhanas[i].update();
		if(pirhanas[i].y > 850 && pirhanas[i].velY > 0) {
			pirhanas.splice(i, 1);
		}
	}
	if(currentEvent === "pirhanas" && pirhanas.length <= 0) {
		addEvent();
		p.surviveEvent("pirhanas");
	}
	/* pacmans */
	for(var i = 0; i < dots.length; i ++) {
		dots[i].update();
		dots[i].display();
		utilities.canvas.nauseate(dots[i]);
		if(dots[i].y === 200 && dots[i].x < pacmans[0].x - 20) {
			dots.splice(i, 1);
			continue;
		}
		if(dots[i].y === 600 && dots[i].x > pacmans[1].x + 20) {
			dots.splice(i, 1);
			continue;
		}
	}
	for(var i = 0; i < pacmans.length; i ++) {
		pacmans[i].display();
		pacmans[i].update();
		if((pacmans[i].x > 1200 && pacmans[i].velX > 0) || (pacmans[i].x < -200 && pacmans[i].velX < 0)) {
			pacmans.splice(i, 1);
		}
	}
	if(currentEvent === "pacmans" && pacmans.length === 0) {
		addEvent();
		p.surviveEvent("pacmans");
	}
	/* rockets */
	for(var i = 0; i < fireParticles.length; i ++) {
		fireParticles[i].display();
		utilities.canvas.nauseate(fireParticles[i]);
		if(fireParticles[i].size <= 0) {
			fireParticles.splice(i, 1);
		}
	}
	for(var i = 0; i < rockets.length; i ++) {
		rockets[i].display();
		utilities.canvas.nauseate(rockets[i]);
		rockets[i].update();
		if(rockets[i].x < -100 || rockets[i].x > 900) {
			rockets.splice(i, 1);
			addEvent();
			p.surviveEvent("rockets");
			continue;
		}
		if(rockets[i].x > 398 && rockets[i].x < 402) {
			coins.push(new Coin(rockets[i].x, rockets[i].y + 5));
		}
	}
	/* spikeballs */
	for(var i = 0; i < spikeballs.length; i ++) {
		spikeballs[i].display();
		utilities.canvas.nauseate(spikeballs[i]);
		spikeballs[i].update();
		if(spikeballs[i].opacity <= 0) {
			spikeballs.splice(i, 1);
			continue;
		}
	}
	if(currentEvent === "spikeballs" && spikeballs.length === 0) {
		addEvent();
		p.surviveEvent("spikeballs");
	}
	/* block shuffles */
	var allStopped = true;
	for(var i = 0; i < platforms.length; i ++) {
		platforms[i].update();
		if(platforms[i].velX !== 0 || platforms[i].velY !== 0) {
			allStopped = false;
		}
	}
	if(allStopped && currentEvent === "block shuffle") {
		addEvent();
		p.surviveEvent("block shuffle");
	}
	/* spike walls */
	for(var i = 0; i < spikewalls.length; i ++) {
		spikewalls[i].display();
		utilities.canvas.nauseate(spikewalls[i]);
		spikewalls[i].update();
		if((spikewalls[i].velX < 0 && spikewalls[i].x < -50) || (spikewalls[i].velX > 0 && spikewalls[i].x > 850)) {
			spikewalls.splice(i, 1);
			addEvent();
			p.surviveEvent("spike walls");
			continue;
		}
	}
	/* blindness */
	if(p.blinded > 0) {
		/* fill in large area for framerate issues */
		c.fillStyle = "#000000";
		c.fillRect(p.x - 800, p.y - 950, 1600, 800);
		c.fillRect(p.x - 800, p.y + 150, 1600, 1600);
		c.fillRect(p.x - 950, p.y - 800, 800, 1600);
		c.fillRect(p.x + 150, p.y - 800, 800, 1600);
		c.globalAlpha = 1;
		var gradient = c.createRadialGradient(p.x, p.y, 50, p.x, p.y, 150);
		gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
		gradient.addColorStop(1, "rgba(0, 0, 0, 255)");
		c.fillStyle = gradient;
		c.fillRect(p.x - 151, p.y - 151, 302, 302);
	}
};
function doByTime() {
	if(TESTING_MODE && false) {
		for(var i = 0; i < platforms.length; i ++) {
			if(platforms[i].x === 800 - 160 && platforms[i].y === 215) {
				platforms[i].destX = -Infinity;
			}
		}
	}
	p.mouseHand = false;
	utilities.canvas.resize();
	if(p.onScreen === "home") {
		/* background + erase previous frame */
		c.fillStyle = "#C8C8C8";
		c.fillRect(0, 0, 800, 800);
		/* title */
		c.font = "50px cursive";
		c.fillStyle = "#646464";
		c.textAlign = "center";
		// c.fillText("Randomonicity", 400, 150);
		// c.fillText("Survival", 400, 200);
		/* buttons */
		for(var i = 0; i < dollarIcons.length; i ++) {
			dollarIcons[i].display();
			if(dollarIcons[i].y >= 545) {
				dollarIcons.splice(i, 1);
				i --;
			}
		}
		shopButton.display();
		shopButton.mouseOver = shopButton.hasMouseOver();
		shopButton.checkForClick();
		achievementsButton.display();
		achievementsButton.mouseOver = achievementsButton.hasMouseOver();
		achievementsButton.checkForClick();
		playButton.display();
		playButton.mouseOver = playButton.hasMouseOver();
		playButton.checkForClick();
	}
	if(p.onScreen === "play") {
		c.fillStyle = "#C8C8C8";
		c.fillRect(0, 0, 800, 800);
		/* player */
		p.display();
		utilities.canvas.nauseate(p);
		p.update();
		for(var i = 0; i < doubleJumpParticles.length; i ++) {
			doubleJumpParticles[i].display();
			if(doubleJumpParticles[i].op <= 0) {
				doubleJumpParticles.splice(i, 1);
				continue;
			}
		}
		/* arena */
		for(var i = 0; i < platforms.length; i ++) {
			platforms[i].display();
			utilities.canvas.nauseate(platforms[i]);
		}
		/* random events */
		if(currentEvent === "starting" && timeToEvent <= 0) {
			addEvent();
		}
		runEvent();
		timeToEvent --;
		if(timeToEvent === 0) {
			addEvent();
		}
		if(p.y + 46 >= 800 && acidY + p.worldY > 820) {
			p.die("fall");
		}
		/* shop status effect indicators */
		var hasOne = false;
		if(coinDoubler.equipped) {
			coinDoubler.x = 100 * (hasOne ? 2 : 1);
			coinDoubler.y = 75;
			coinDoubler.displayLogo(0.5);
			hasOne = true;
		}
		if(speedIncreaser.equipped) {
			speedIncreaser.x = 100 * (hasOne ? 2 : 1);
			speedIncreaser.y = 75;
			speedIncreaser.displayLogo(0.5);
			hasOne = true;
		}
		if(doubleJumper.equipped) {
			doubleJumper.x = 100 * (hasOne ? 2 : 1);
			doubleJumper.y = 75;
			doubleJumper.displayLogo(0.5);
			hasOne = true;
		}
		if(intangibilityTalisman.equipped) {
			intangibilityTalisman.x = 100 * (hasOne ? 2 : 1);
			intangibilityTalisman.y = 75;
			intangibilityTalisman.displayLogo(0.5);
			hasOne = true;
		}
		if(secondLife.equipped) {
			secondLife.x = 100 * (hasOne ? 2 : 1);
			secondLife.y = 75;
			secondLife.displayLogo(0.5);
			hasOne = true;
		}
		/* score + coins */
		c.fillStyle = "#646464";
		c.font = "20px monospace";
		c.textAlign = "left";
		c.fillText("Score: " + p.score, 10, 790);
		c.textAlign = "right";
		c.fillText("Coins: " + p.coins, 790, 790);
	}
	if(p.onScreen === "death") {
		c.fillStyle = "#C8C8C8";
		c.fillRect(0, 0, 800, 800);
		/* title */
		c.fillStyle = "#646464";
		c.font = "50px cursive";
		c.textAlign = "center";
		c.fillText("You Died", 400, 200);
		/* body text */
		c.font = "30px monospace";
		c.textAlign = "left";
		switch(p.deathCause) {
			case "laser":
				c.fillText("You were shot by a laser", 200, 300);
				break;
			case "acid":
				c.fillText("You fell into a pool of acid", 200, 300);
				break;
			case "boulder":
				c.fillText("You were crushed by a boulder", 200, 300);
				break;
			case "spinnyblades":
				c.fillText("You were sliced in half", 200, 300);
				break;
			case "pirhanas":
				c.fillText("You were bitten by a pirhana", 200, 300);
				break;
			case "pacmans":
				c.fillText("You were killed by a pacman", 200, 300);
				break;
			case "rocket":
				c.fillText("You were hit with a rocket", 200, 300);
				break;
			case "spikeball":
				c.fillText("You were taken out by a spikeball", 200, 300);
				break;
			case "spike wall":
				c.fillText("You were impaled on a wall of spikes", 200, 300);
				break;
			case "fall":
				c.fillText("You fell way too far", 200, 300);
				break;
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

	}
	if(p.onScreen === "shop") {
		c.fillStyle = "#C8C8C8";
		c.fillRect(0, 0, 800, 800);
		/* title */
		c.font = "50px cursive";
		c.fillStyle = "#646464";
		c.textAlign = "center";
		c.fillText("Shop", 400, 100);
		/* coin counter */
		c.font = "20px cursive";
		c.fillStyle = "rgb(255, 255, 0)";
		c.fillText("coins: " + p.totalCoins, 400, 150);
		/* items */
		coinDoubler.displayLogo(1);
		speedIncreaser.displayLogo(1);
		doubleJumper.displayLogo(1);
		intangibilityTalisman.displayLogo(1);
		secondLife.displayLogo(1);
		secondItem.displayLogo(1);

		coinDoubler.displayInfo();
		speedIncreaser.displayInfo();
		doubleJumper.displayInfo();
		intangibilityTalisman.displayInfo();
		secondLife.displayInfo();
		secondItem.displayInfo();

		coinDoubler.displayPopup();
		speedIncreaser.displayPopup();
		doubleJumper.displayPopup();
		intangibilityTalisman.displayPopup();
		secondLife.displayPopup();
		/* home button */
		homeFromShop.display();
		homeFromShop.mouseOver = homeFromShop.hasMouseOver();
		homeFromShop.checkForClick();
	}
	if(p.onScreen === "achievements") {
		c.fillStyle = "#C8C8C8";
		c.fillRect(0, 0, 800, 800);
		/* title */
		c.fillStyle = "#646464";
		c.font = "50px cursive";
		c.textAlign = "center";
		c.fillText("Achievements", 400, 100);
		/* achievements */
		var achievements = [ac1, ac2, ac3, ac4, ac5, ac6, ac7, ac8, ac9];
		for(var i = 0; i < achievements.length; i ++) {
			achievements[i].displayLogo();
		}
		for(var i = 0; i < achievements.length; i ++) {
			achievements[i].displayInfo();
		}
		/* home button */
		homeFromAcs.display();
		homeFromAcs.mouseOver = homeFromAcs.hasMouseOver();
		homeFromAcs.checkForClick();
	}
	ac1.checkProgress();
	ac2.checkProgress();
	ac3.checkProgress();
	ac4.checkProgress();
	ac5.checkProgress();
	ac6.checkProgress();
	ac7.checkProgress();
	ac8.checkProgress();
	ac9.checkProgress();
	/* chat messages */
	for(var i = chatMessages.length - 1; i >= 0; i --) {
		chatMessages[i].display((chatMessages.length - i + 1) * 40 - 40);
		if(chatMessages[i].time <= 0) {
			chatMessages.splice(i, 1);
			continue;
		}
		if(p.onScreen !== "play" && !(chatMessages[i].col === "#FFFF00")) {
			chatMessages.splice(i, 1);
			continue;
		}
	}
	frameCount ++;
	pastWorldY = p.worldY;
	utilities.pastInputs.update();
	/*  debug */
	c.textAlign = "left";
};
window.setInterval(doByTime, 1000 / FPS);
