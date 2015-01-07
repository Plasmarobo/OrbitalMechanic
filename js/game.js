var assetQueue = ["earth", "station", "ship_nose", "ship_body", "ship_engine", "ship_particle", "metal_floor"];
var assets = {};
var planets = {};
var station = {"systems": [], "wires": [], "pipes": [],  "floor": [], "walls": []};

var credit = 2500;

var parts = {
	"Metal Floor": {
		asset: "metal_floor",
		placement_offset: 0,
		conductive: true,
		layer: "floor",
		energy_resistance: 10,
		physical_resistance: 5,
		path_cost: 1,
		max_integrity: 100, //Max health
		leak_threshold: 50, //Start leaking atmo at this integrity
		leak_rate: 1, // Leak this much atmo per "threashold"
		cost: 10
	},
	"Metal Wall": {
		asset: "metal_wall",
		placement_offset: 16,
		conductive: false,
		layer: "walls",
		energy_resistance: 20,
		physical_resistance: 10,
		path_cost: 100,
		max_integrity: 100,
		leak_threshold: 25,
		leak_rate: 5,
		cost: 10
	}
};

var effects = {};
var eventQueue = [];
var game = {};

document.addEventListener("DOMContentLoaded", function(event) { 
  initializeGame();
  //gameLoop();
});
document.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
  game.window.width = window.innerWidth;
  game.window.height = window.innerHeight;   

  game.width = game.context.canvas.clientWidth;
  game.height = game.context.canvas.clientHeight;  
}

function initializeGame()
{
	game.window =  document.getElementById("game_window");
	game.context = game.window.getContext("2d");
	resizeCanvas();
	game.width = game.context.canvas.clientWidth;
	game.height = game.context.canvas.clientHeight;

	game.scale = game.width / 1920;
	clear();
	game.context.drawRotated = DrawRotated.bind(game.context);
	game.gravityscale = 1;
	game.timescale = 1;
	game.runtime = (function()
	{
	  return Date.now()-this.starttime;
	}).bind(game);
	game.delta = (function()
	{
	  return Date.now() - this.framestart;
	}).bind(game);
	game.framestart = Date.now();
	game.frameend = Date.now();
	game.starttime = Date.now();
	game.frametimeweight = 0.4;
	game.frametimeaverage = 0;
	//Will load all assets
	startLoader();
	loadAsset(assetQueue.shift());
};

function clear()
{
  game.context.fillStyle = "rgb(0,0,0)";
  game.context.fillRect(0, 0, game.width, game.height);
}

function doFrame()
{
	clear();
	var tick = game.delta();
	game.framestart = Date.now();
	for(var planet in planets)
	{
		planets[planet].update(tick);
	}
	while(eventQueue.length > 0)
	{
	  var event = eventQueue.shift();
	  event.callback(event.parameters);
	}
	
	game.frameend = Date.now();
	game.frametimeaverage = ((1.0 - game.frametimeweight) * game.frametimeaverage) + ((game.frameend - game.framestart) * game.frametimeweight);

	game.context.fillStyle = "rgb( 255, 255, 255)";
	game.context.fillText("FPS " + 1000.0/game.frametimeaverage, 10.0, 10); 
	if ((game.frametimeaverage) < 1000.0/70.0)
	{
		setTimeout(doFrame, 1000/70);
	}
	else
	{
	    doFrame();
	}
		
};



function loadPlanet(name, asset_name)
{
	planets[name] = {};
	planets[name].rotation = 0.0;
	planets[name].image = assets[asset_name];
	planets[name].name = name;
	planets[name].gravity = 10;
	planets[name].radius = assets[asset_name].height/2;
	planets[name].offset_angle = Math.random() % (Math.PI * 2);
	planets[name].update = function(tick)
	{
	    eventQueue.push({callback: function(parameters){
            parameters.planet.rotation += (tick / 24000);
            drawPlanet(parameters.planet, 200, 200);
        }, parameters: {planet: planets[name]}});
	};
};

function startGame()
{
  loadPlanet("earth", "earth");
  doFrame();
};

function startLoader()
{
  game.assetCount = assetQueue.length;
  updateLoader();
};

function updateLoader()
{
	clear();
	var progress = game.assetCount - assetQueue.length;
	//Get scale, should be about 80% of screen space by 10%
	var width = game.width * (4/5);
	var height = game.height / 10;
	game.context.fillStyle = "rgb(255, 255, 255)";
	game.context.fillRect((game.width/2)-(width/2)-1,(game.height/2)-(height/2)-1, width+1, height+1);
	game.context.fillStyle = "rgb(0, 196, 0)";
	game.context.fillRect((game.width/2)-(width/2), (game.height/2)-(height/2), width * (progress/game.assetCount),height);
};

function loadAsset(name)
{
  var imageObj = new Image();
    imageObj.onload = function() {
     if(assetQueue.length > 0)
	  {
		updateLoader();
		loadAsset(assetQueue.shift());
	  }else{
	    startGame();  
	  }
	};
    imageObj.src = "img/" + name + ".png";
	assets[name] = imageObj;
};

function drawPlanet(planet, x, y)
{
	var displacement_factor = (planet.rotation);
	
	var displacement = planet.image.width * displacement_factor;
	
	var x_displacement = Math.floor(displacement * Math.cos(planet.offset_angle));
	var y_displacement = displacement * Math.sin(planet.offset_angle);
	if (x_displacement >= planet.image.width)
	{
		planet.rotation = 0;
	}

	game.context.save();
 
	game.context.translate(x+game.width/2, y+game.height/2);
	game.context.beginPath();
    game.context.arc(0, 0, planet.radius, 0, Math.PI * 2, false);
    // Clip to the current path
    game.context.clip();
	game.context.rotate(planet.offset_angle);
    
	game.context.drawImage(planet.image, x_displacement-(planet.radius), -planet.image.height/2);
	game.context.drawImage(planet.image, x_displacement-(planet.image.width+planet.radius), -planet.image.height/2);
	
	// Undo the clipping
    game.context.restore();
	
	
};

function listParts()
{
};

function placePart(part)
{
};

function queueBuild(part)
{
};



function DrawRotated(image, x, y, angle) { 
 
	this.save(); 
	this.translate(x+game.width/2, y+game.height/2);
	this.rotate(angle);
	this.drawImage(image, -(image.width/2), -(image.height/2));
	this.restore(); 
}