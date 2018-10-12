/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Initial Setup
var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

// Variables
var mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2
};

var starColors = ['white', 'yellow', 'red', 'blue'];
var mountColors = ['#3g4045', '#3f3d51', '#4d6174', '#414b60'];

// Event Listeners
addEventListener('mousemove', function (event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

addEventListener('resize', function () {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

// Utility Functions
function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)];
}

function distance(x1, y1, x2, y2) {
  var xDist = x2 - x1;
  var yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

//gravity
var gravity = 1;
var friction = 0.5;
var frictionEnable;
function applyGravity(particle, fictionEnable) {
  if (frictionEnable == true) {
    if (particle.y + particle.radius > innerHeight) {
      if (innerHeight - particle.radius < particle.y) particle.y = innerHeight - particle.radius;
      particle.velocity.y = -particle.velocity.y * friction;
      particle.velocity.x = particle.velocity.x * friction;
    } else {
      return particle.velocity.y += gravity;
    }
  } else {
    if (particle.y + particle.radius > innerHeight) {
      particle.velocity.y = -particle.velocity.y;
    } else {
      return particle.velocity.y += gravity;
    }
  }
}

/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

function rotate(velocity, angle) {
  var rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  };

  return rotatedVelocities;
}

/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
  var xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  var yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  var xDist = otherParticle.x - particle.x;
  var yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

    // Grab angle between the two colliding particles
    var angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

    // Store mass in var for better readability in collision equation
    var m1 = particle.mass;
    var m2 = otherParticle.mass;

    // Velocity before equation
    var u1 = rotate(particle.velocity, angle);
    var u2 = rotate(otherParticle.velocity, angle);

    // Velocity after 1d collision equation
    var v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
    var v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

    // Final velocity after rotating axis back to original location
    var vFinal1 = rotate(v1, -angle);
    var vFinal2 = rotate(v2, -angle);

    // Swap particle velocities for realistic bounce effect
    particle.velocity.x = vFinal1.x;
    particle.velocity.y = vFinal1.y;

    otherParticle.velocity.x = vFinal2.x;
    otherParticle.velocity.y = vFinal2.y;
  }
}

// Objects
function Star(x, y, radius, color) {
  var _this = this;

  this.x = x;
  this.y = y;
  this.radius = radius;
  this.origRadius = radius;
  this.color = color;
  this.minOpacity = 0;
  this.maxOpacity = 1;
  this.opacity = Math.random();
  this.change = .01;

  this.update = function () {
    this.opacity += .01;
    this.draw();
  };

  this.draw = function () {
    c.beginPath();
    c.arc(_this.x, _this.y, _this.radius, 0, Math.PI * 2, false);
    c.save();
    c.globalAlpha = .7 + .2 * Math.sin(_this.opacity);
    c.fillStyle = _this.color;
    c.fill();
    c.restore();
    c.closePath();
  };
}

function Piece(x, y, radius, color, parentVelocity) {
  this.x = x;
  this.y = y;
  this.velocity = {
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() + 0.5) * parentVelocity.y
  };
  this.opacity = 1;
  this.radius = radius;
  this.color = color;
  this.mass = 1;

  this.update = function () {

    this.opacity = this.opacity * .96;

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    this.draw();
  };

  this.draw = function () {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.save();
    c.globalAlpha = this.opacity;
    c.fillStyle = this.color;
    c.fill();
    c.restore();
    c.closePath();
  };
}

function Particle(x, y, radius, color) {
  var _this2 = this;

  this.x = x;
  this.y = y;
  this.velocity = {
    x: (Math.random() - 0.5) * 20,
    y: (Math.random() + 0.5) * 3
  };
  this.radius = radius;
  this.color = color;
  this.mass = 1;

  var pieces = void 0;

  this.update = function (particles) {

    //other particle collisions
    for (var i = 0; i < particles.length; i++) {
      if (_this2 === particles[i]) continue;
      if (distance(_this2.x, _this2.y, particles[i].x, particles[i].y) - _this2.radius * 2 < 0) {
        // resolveCollision(this, particles[i]);
      }
    }

    //wall collisions
    if (_this2.x - _this2.radius <= 0 || _this2.x + _this2.radius >= innerWidth) _this2.velocity.x = -_this2.velocity.x;

    //Ground Collision
    if (_this2.y + _this2.radius >= innerHeight) {
      _this2.radius -= _this2.radius / 2;
      if (pieces == undefined) pieces = [];
      if (pieces != undefined) _this2.spawnPieces();
      if (_this2.radius <= 1) _this2.reset();
    }

    //particle movement
    _this2.x += _this2.velocity.x;
    _this2.y += _this2.velocity.y;

    _this2.draw();
  };
  this.reset = function () {
    this.x = randomIntFromRange(radius, canvas.width - radius);
    this.y = -radius;
    this.radius = radius * (Math.random() + .2);
    this.velocity.x = (Math.random() - 0.5) * 40;
    this.velocity.y = (Math.random() + 0.5) * 5;
    pieces = [];
  };

  this.draw = function () {
    c.beginPath();
    c.arc(_this2.x, _this2.y, _this2.radius, 0, Math.PI * 2, false);
    c.fillStyle = _this2.color;
    c.fill();
    c.strokeStyle = _this2.color;
    c.stroke();
    c.closePath();

    if (pieces != undefined) {
      //Draw all falling stars
      pieces.forEach(function (piece) {
        applyGravity(piece, frictionEnable);
        piece.update(pieces);
      });
    }
  };

  this.spawnPieces = function () {
    // pieces = [];
    for (var i = 0; i < 6; i++) {
      pieces.push(new Piece(this.x, this.y, 1, 'white', this.velocity));
    }
  };
}

//Mountain
function Mountain(base, height, xOffset, color) {
  var _this3 = this;

  this.base = base;
  this.height = height;
  this.xOffset = xOffset;
  this.color = color;

  this.draw = function () {
    c.beginPath();
    c.fillStyle = _this3.color;
    c.moveTo(_this3.xOffset + _this3.base / 2, innerHeight - _this3.height);
    c.lineTo(_this3.xOffset + _this3.base, innerHeight);
    c.lineTo(_this3.xOffset, innerHeight);
    c.lineTo(_this3.xOffset + _this3.base / 2, innerHeight - _this3.height);
    c.fill();
  };
}

// Implementation

var particles = void 0;
var mountains = void 0;
var stars = void 0;

function init() {
  particles = [];
  mountains = [];
  stars = [];

  var base = canvas.width / 2;
  var height = base - base * 4 / 7;
  var xOffset = innerWidth / 2 - base / 2;
  // ['#494f66', '#3c404f', '#272930', '#242535', '#202133']
  var color = randomColor(mountColors);
  mountains.push(new Mountain(base * 1.5, height * 1.5, xOffset - base / 6 * 1.5, '#3c404f'));
  mountains.push(new Mountain(base, height, xOffset - base / 2, '#272930'));
  mountains.push(new Mountain(base, height, xOffset + base / 2, '#272930'));

  for (var i = 0; i <= 350; i++) {
    var radius = 1;
    var x = randomIntFromRange(radius, canvas.width - radius);
    var y = randomIntFromRange(radius, canvas.height - radius);
    var _color = randomColor(starColors);

    if (i !== 0) {
      for (var j = 0; j < stars.length; j++) {
        if (distance(x, y, stars[j].x, stars[j].y) - radius * 2 < 0) {
          x = randomIntFromRange(radius, canvas.width - radius);
          y = randomIntFromRange(radius, canvas.height - radius);

          j = -1;
        }
      }
    }
    stars.push(new Star(x, y, radius, _color));
  }

  for (var _i = 0; _i <= 1; _i++) {
    var _radius = 15;
    var _x = randomIntFromRange(_radius, canvas.width - _radius);
    var _y = randomIntFromRange(_radius, -(canvas.height - _radius));

    if (_i !== 0) {
      for (var _j = 0; _j < particles.length; _j++) {
        if (distance(_x, _y, particles[_j].x, particles[_j].y) - _radius * 2 < 0) {
          _x = randomIntFromRange(_radius, canvas.width - _radius);
          _y = randomIntFromRange(_radius, canvas.height - _radius);

          _j = -1;
        }
      }
    }

    particles.push(new Particle(_x, _y, _radius, 'white'));
  }
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  //Draw all stars
  stars.forEach(function (star) {
    star.update();
  });

  //Draw all mountains
  mountains.forEach(function (mountain) {
    mountain.draw();
  });

  //friction enable/disable
  // frictionEnable = false;
  frictionEnable = true;

  //Draw all falling stars
  particles.forEach(function (particle) {
    applyGravity(particle, frictionEnable);
    particle.update(particles);
  });
}

init();
animate();

/***/ })
/******/ ]);
//# sourceMappingURL=canvas.bundle.js.map