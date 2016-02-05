// Utilities
String.prototype.leftpad = function(len, ch) {
	var str = this;
	if (arguments.length == 1) ch = " ";
	while (str.length < len) str = ch + str;
	return str;
}

String.prototype.rightpad = function(len, ch) {
	var str = this;
	if (arguments.length == 1) ch = " ";
	while (str.length < len) str = str + ch;
	return str;
}

// Constants
var GAMEMODE = {
	SPLASH : 0,
	DEMO   : 1,
	GAME   : 2,
};

var KEYCODE = {
	SHIFT : 16,
	CTRL  : 17,
	SPACE : 32,
	LEFT  : 37,
	UP    : 38,
	RIGHT : 39,
	DOWN  : 40,
	A     : 65,
	D     : 68,
	G     : 71,
	H     : 72,
	J     : 74,
	S     : 83,
	W     : 87,
	Y     : 89,
};

var INPUTMASK = {
	L   : 0x00001,
	U   : 0x00010,
	R   : 0x00100,
	D   : 0x01000,
	A   : 0x10000,
};

var INPUT = {
	NA  : 0,
	L   : INPUTMASK.L,
	U   : INPUTMASK.U,
	R   : INPUTMASK.R,
	D   : INPUTMASK.D,
	A   : INPUTMASK.A,
	UR  : INPUTMASK.U | INPUTMASK.R,
	UL  : INPUTMASK.U | INPUTMASK.L,
	DR  : INPUTMASK.D | INPUTMASK.R,
	DL  : INPUTMASK.D | INPUTMASK.L,
	LA  : INPUTMASK.L | INPUTMASK.A,
	RA  : INPUTMASK.R | INPUTMASK.A,
	UA  : INPUTMASK.U | INPUTMASK.A,
	DA  : INPUTMASK.D | INPUTMASK.A,
	URA : INPUTMASK.U | INPUTMASK.R | INPUTMASK.A,
	ULA : INPUTMASK.U | INPUTMASK.L | INPUTMASK.A,
	DRA : INPUTMASK.D | INPUTMASK.R | INPUTMASK.A,
	DLA : INPUTMASK.D | INPUTMASK.L | INPUTMASK.A,
};


var anim_walk = new animation(1,[35, 36, 37, 38, 39, 40], //ANIMATION FRAMES
			      [0, 0, 0, 0, 0, 0],  // MIN RANGE
			      [0, 0, 0, 0, 0, 0]); // MAX RANGE
var anim_idle = new animation(2,[35],[0],[0]);
var anim_headbutt = new animation(2,[1, 2, 1],[0, 0, 0],[0, 100, 0]);
var anim_kick_high = new animation(3,[4, 5, 6],[0, 0, 0],[0, 0, 100]);
var anim_fall = new animation(4,[7, 8, 9],[0, 0, 0],[0, 0, 0]);
var anim_rise = new animation(5,[10, 11, 12],[0, 0, 0],[0, 0, 0]);
var anim_cartwheel = new animation(6,[21, 22, 23, 24, 25, 26],[0, 0, 0, 0, 0, 0],
				   [0, 0, 0, 0, 0, 0]);
var anim_jump = new animation(7,[13, 14, 14, 14, 13],[0, 0, 0, 0, 0],[0, 0, 0, 0, 0]);
var anim_jumpkick = new animation(8,[13, 14, 15, 15, 13],[0, 0, 0, 0, 0],[0, 0, 100, 100, 0]);
var anim_punch = new animation(9,[19, 20],[0, 0],[0, 100]);
var anim_kick = new animation(10,[28, 29, 30, 31],[0, 0, 0, 0],[0, 0, 0, 0]);
var anim_low_kick = new animation(11,[0],[0],[0]);
var anim_sweep = new animation(12,[16, 17, 18],[0, 0, 0],[0, 0, 0]);
var anim_block = new animation(13,[0],[0],[0]);
var anim_splitkick = new animation(14,[32, 33, 34, 33, 32],[0, 0, 0, 0, 0],[0, 0, 0, 0, 0]);
var anim_sit_punch = new animation(15,[0],[0],[0]);
var anim_demo = new animation(16,
		[0, 0, 0, 0, 21, 22, 23, 24, 25, 26, 35, 35, 1, 2, 1, 35, 4, 5, 6, 35, 35, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
var anim_sweep_back = anim_sweep;
var anim_punch_back = anim_punch;
var anim_kick_high_back = anim_kick_high;
var anim_knocked_out = new animation(17,[9],[0],[0]);
var anim_startidle = new animation(18,[0],[0],[0]);

var ACTION = {
	walk : function(game, pid, dir) {
		game.players[pid].direction = dir;
	},
};

function animation(mid, frameData, minData, maxData)
{
	this.frames = frameData;
	this.min_ranges = minData;
	this.max_ranges = maxData;
	this.id = mid;
}

function Player(id, xpos, img)	// img , xpos, playerkeys 
{
	this.step = function() {
		this.counter++;
		if (this.anim == anim_walk) {
			this.x += this.speed * this.direction;
		}

		if (this.counter >= (this.anim.frames.length)) {
			this.setAnim(this.nextAnim);
		}
		this.frameX = this.spriteWidth * parseInt(this.anim.frames[this.counter] % 7);
		this.frameY = this.spriteHeight * parseInt(this.anim.frames[this.counter] / 7);
		this.currentframe = this.counter;
	}
	this.render = function(ctx) {
		ctx.drawImage(this.spriteSheet,
				this.frameX, this.frameY, this.spriteWidth, this.spriteHeight,
				this.x, this.y, this.spriteWidth, this.spriteHeight);
	}
	this.reset = function() {
		this.anim = anim_startidle;
		this.nextAnim = anim_startidle;
		this.counter = 0;
		this.step();
		this.counter = 0;
	}
	this.setAnim = function(nanim) {
		this.counter = 0;
		if (this.health == 0) {
			this.anim = anim_knocked_out;
			this.nextAnim = anim_knocked_out;
		} else if (this.anim == anim_startidle && nanim == anim_idle) {
			this.anim = anim_startidle;
		} else {
			this.anim = nanim;
			this.nextAnim = anim_idle;
		}
	}
	this.init = function() {
		this.x = xpos;
		this.y = 100;
		this.id = id;
		this.currentframe = 0;
		this.counter = 0;
		this.anim = anim_demo;
		this.health = 6;
		this.spriteSheet = img;
		this.direction = 1;
		this.score = 0;
		this.speed = 1;
		this.frameX = 0;
		this.frameY = 0;
		this.nextAnim = anim_demo;
		this.spriteWidth = parseInt(this.spriteSheet.width / 7);
		this.spriteHeight = parseInt(this.spriteSheet.height / 6);
	}

	this.init();
}

var joystick = [0, 0, 0, 0, 0, 0];
var SPLASH_DELAY = 5;

function GRE()
{
	this.loadImage = function(name) {
		var image = new Image();
		image.src = name;
		return image;
	}

	this.reconfigure = function() {
		var scale = 1;

		if (window.innerWidth / 320 < window.innerHeight / 200) {
			scale = window.innerWidth / 320;
		} else {
			scale = window.innerHeight / 200;
		}

		this.canvas.width = 320 * scale;
		this.canvas.height = 200 * scale;
		this.canvas.style.position = "fixed";
		this.canvas.style.left = (window.innerWidth - this.canvas.width) / 2 + "px";
		this.canvas.style.top = (window.innerHeight - this.canvas.height) / 2 + "px";

		if (typeof this.context.imageSmoothingEnabled !== 'undefined')
			this.context.imageSmoothingEnabled = false;
		else if (typeof this.context.webkitImageSmoothingEnabled !== 'undefined')
			this.context.webkitImageSmoothingEnabled = false;
		this.context.scale(scale, scale);
	}

	this.clear = function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	this.blitImage = function(img) {
		this.context.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
	}

	this.init = function() {
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.imageCount = 0;
		this.IMAGE = {
			BLUE   : this.loadImage("gfx/ikplayer_blue.png"),
			RED    : this.loadImage("gfx/ikplayer_red.png"),
			WHITE  : this.loadImage("gfx/ikplayer_white.png"),
			BG     : this.loadImage("gfx/ikback.png"),
			SPLASH : this.loadImage("gfx/iksplash.png"),
		};
	}

	this.init();
}

var gre = new GRE();
window.onload = function() {
	window.onresize = function() { gre.reconfigure(); }
	document.body.appendChild(gre.canvas);
	var game = new Game(gre);

	//add touch listener
	var touchable = 'createTouch' in document;
	if (touchable) {
		gre.canvas.addEventListener('touchstart', onTouchStart, false);
		gre.canvas.addEventListener('touchmove', onTouchMove, false);
		gre.canvas.addEventListener('touchend', onTouchEnd, false);
	}

	//add keyboard listener
	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keypress', onKeyPress, false);
	document.addEventListener('keyup', onKeyUp, false);

	setInterval(function() { game.step() }, 1000 / 10);
}

var keyConversion = [
	{ key: KEYCODE.LEFT,  mask: INPUTMASK.L, pid: 0 },
	{ key: KEYCODE.UP,    mask: INPUTMASK.U, pid: 0 },
	{ key: KEYCODE.RIGHT, mask: INPUTMASK.R, pid: 0 },
	{ key: KEYCODE.DOWN,  mask: INPUTMASK.D, pid: 0 },
	{ key: KEYCODE.SHIFT, mask: INPUTMASK.A, pid: 0 },

	{ key: KEYCODE.A,     mask: INPUTMASK.L, pid: 1 },
	{ key: KEYCODE.W,     mask: INPUTMASK.U, pid: 1 },
	{ key: KEYCODE.D,     mask: INPUTMASK.R, pid: 1 },
	{ key: KEYCODE.S,     mask: INPUTMASK.D, pid: 1 },
	{ key: KEYCODE.CTRL,  mask: INPUTMASK.A, pid: 1 },

	{ key: KEYCODE.G,     mask: INPUTMASK.L, pid: 2 },
	{ key: KEYCODE.Y,     mask: INPUTMASK.U, pid: 2 },
	{ key: KEYCODE.J,     mask: INPUTMASK.R, pid: 2 },
	{ key: KEYCODE.H,     mask: INPUTMASK.D, pid: 2 },
	{ key: KEYCODE.SPACE, mask: INPUTMASK.A, pid: 2 },
];

function keyUpdate(keyCode, bSet)
{
	for (var i = 0; i < keyConversion.length; ++i) {
		if (keyConversion[i].key != keyCode)
			continue;

		if (bSet)
			joystick[keyConversion[i].pid] |= keyConversion[i].mask;
		else
			joystick[keyConversion[i].pid] &= ~keyConversion[i].mask;
		return;
	}
}

function onKeyDown(event)
{
	event.preventDefault();
	keyUpdate(event.keyCode, true);
}

function onKeyPress(event)
{
	// Prevent the browser from doing its default thing (scroll, zoom)
	event.preventDefault();
}

function onKeyUp(event)
{
	event.preventDefault();
	keyUpdate(event.keyCode, false);
}

function onTouchStart(event)
{
	//do stuff
}

function onTouchMove(event)
{
	// Prevent the browser from doing its default thing (scroll, zoom)
	event.preventDefault();
}

function onTouchEnd(event)
{
	//do stuff
}

var inputActions = [
	{ mask: INPUT.NA,  anim: anim_idle,            },
	{ mask: INPUT.L,   anim: anim_walk,           action: ACTION.walk, aparam: -1 },
	{ mask: INPUT.U,   anim: anim_jump,            },
	{ mask: INPUT.R,   anim: anim_walk,           action: ACTION.walk, aparam: 1 },
	{ mask: INPUT.D,   anim: anim_sweep,           },
	{ mask: INPUT.A,   anim: anim_idle,            },
	{ mask: INPUT.UR,  anim: anim_punch,           },
	{ mask: INPUT.UL,  anim: anim_punch_back,      },
	{ mask: INPUT.DR,  anim: anim_low_kick,        },
	{ mask: INPUT.DL,  anim: anim_sit_punch,       },
	{ mask: INPUT.LA,  anim: anim_cartwheel,       },
	{ mask: INPUT.RA,  anim: anim_kick,            },
	{ mask: INPUT.UA,  anim: anim_jumpkick,        },
	{ mask: INPUT.DA,  anim: anim_sweep_back,      },
	{ mask: INPUT.URA, anim: anim_headbutt,        },
	{ mask: INPUT.ULA, anim: anim_splitkick,       },
	{ mask: INPUT.DRA, anim: anim_kick_high,       },
	{ mask: INPUT.DLA, anim: anim_kick_high_back,  },
];

function input(game, iplayer)
{
	for (var i = 0; i < inputActions.length; ++i) {
		if (inputActions[i].mask != joystick[iplayer])
			continue;

		if (typeof inputActions[i].action === 'function')
			inputActions[i].action(game, iplayer, inputActions[i].aparam);

		return inputActions[i].anim;
	}
	return anim_idle;
}

function Game(gre)
{
	this.init = function() {
		this.frameCounter = 0;
		this.frameTime = 0;
		this.gameState = GAMEMODE.SPLASH;
		this.players = new Array(
			new Player(0,   0, gre.IMAGE.BLUE),
			new Player(1,  60, gre.IMAGE.RED),
			new Player(2, 120, gre.IMAGE.WHITE),
			new Player(3, 180, gre.IMAGE.RED),
			new Player(4, 240, gre.IMAGE.BLUE)
		);
		gre.reconfigure();
	}

	this.step = function() {
		this.frameTime++;
		this.frameCounter++;

		this.render();

		switch (this.gameState) {
		case GAMEMODE.SPLASH:
			if (this.frameTime > SPLASH_DELAY)
				this.gameState = GAMEMODE.DEMO;
			break;
		case GAMEMODE.DEMO:
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].step();
				this.players[i].nextAnim = anim_demo;
			}
			if (joystick[0] != 0) {
				this.gameState = GAMEMODE.GAME;
				for (var i = 0; i < this.players.length; i++) {
					this.players[i].reset();
				}
			}
			break;
		case GAMEMODE.GAME:
			for (var i = 0; i < this.players.length; i++) {
				if ((this.players[i].anim == anim_idle || this.players[i].anim == anim_startidle)
				    && this.players[i].counter < 100)
					this.players[i].nextAnim = input(this, i);
				this.players[i].step();

			}
			for (var i = 0; i < this.players.length; i++) {
				var range =
				    (this.players[i].anim.max_ranges[this.players[i].counter] / 100) *
				    this.players[i].spriteWidth;
				if (range > 0) {
					for (var j = 0; j < this.players.length; j++) {
						var dist = Math.abs(this.players[i].x - this.players[j].x);
						var inHitRange = false;
                        var pointA = this.players[i].x + (range * this.players[i].direction) ;
                        var pointB = this.players[i].x;
                        var pointC = this.players[i].x;
                        if( pointA > pointC ){
                            pointB = pointA;
                            pointA = pointC;
                        }
                        if( pointA < this.players[j].x && pointB > this.players[j].x ){
                            inHitRange = true;
                        }
                        
                        if (dist > 0 && inHitRange && i != j
						    && this.players[j].anim != anim_fall
						    && this.players[j].anim != anim_knocked_out) {
							this.players[j].nextAnim = anim_fall;
							this.players[j].health = Math.max(this.players[j].health - 1, 0);
							this.players[j].counter = 100;
							this.players[i].score += 200;
						}
					}
				}
			}
			break;
		}

	}

	this.render = function() {
		switch (this.gameState) {
		case GAMEMODE.SPLASH:
			gre.blitImage(gre.IMAGE.SPLASH);
			break;
		case GAMEMODE.DEMO:
			if (joystick[0] != 0) {
				gre.clear();
				break;
			}
			gre.blitImage(gre.IMAGE.BG);
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].render(gre.context);
			}
			this.drawStatus(gre.context);
			break;

		case GAMEMODE.GAME:
			gre.blitImage(gre.IMAGE.BG);
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].render(gre.context);
			}
			this.drawStatus(gre.context);
			break;

		default:
			break;
		}
	}

	this.drawHealth = function(ctx, health, x, y, color) {
		for (var i = 0; i < 6; i++) {
			ctx.fillStyle = (i >= (6 - health)) ? color : "#777";
			off = x + 8 * i;
			ctx.fillRect(off + 0, y + 1, 7, 4);
			ctx.fillRect(off + 1, y + 0, 5, 1);
			ctx.fillRect(off + 1, y + 5, 5, 1);
		}
	}

	this.drawStatus = function(c) {
		c.clearRect(0, 0, gre.canvas.width, 20);
		c.font = "" + 6 + "pt C64 Pro Mono";
		// "LV"
		c.fillStyle = "#f0f";
		c.fillText("LV", 224, 8 * 1);
		// Mode
		c.fillStyle = "#f0f";
		c.fillText("DEMO", 256, 8 * 1);
		// Timer
		c.fillStyle = "#aaf";
		c.fillText("21".leftpad(2), 304, 8 * 1);
		// White Score
		this.drawHealth(c, this.players[2].health, 0, 2, "#fff");
		c.fillStyle = "#fff";
		c.fillText(this.players[2].score.toString().leftpad(6), 0, 8 * 2);
		// Red Score
		this.drawHealth(c, this.players[1].health, 80, 2, "#faa");
		c.fillStyle = "#faa";
		c.fillText(this.players[1].score.toString().leftpad(6), 80, 8 * 2);
		// Blue Score
		this.drawHealth(c, this.players[0].health, 160, 2, "#aaf");
		c.fillStyle = "#aaf";
		c.fillText(this.players[0].score.toString().leftpad(6), 160, 8 * 2);
		// Level
		c.fillStyle = "#f0f";
		c.fillText("1".leftpad(2, "0"), 224, 8 * 2);
		// Color
		c.fillStyle = "#fff";
		c.fillText("WHITE".leftpad(5), 256, 8 * 2);
	}

	this.init();
}
