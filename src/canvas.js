// Initial Setup
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

// Variables
const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

const starColors = ['white','yellow','red','blue']
const mountColors = ['#3g4045', '#3f3d51', '#4d6174', '#414b60']

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX
    mouse.y = event.clientY
})

addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

    init()
})

// Utility Functions
function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)]
}

function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1
    const yDist = y2 - y1

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

//gravity
var gravity = 1;
var friction = 0.5;
var frictionEnable;
function applyGravity(particle, fictionEnable) {
  if(frictionEnable == true){
    if(particle.y + particle.radius > innerHeight){
      if(innerHeight - particle.radius < particle.y) particle.y = innerHeight - (particle.radius);
      particle.velocity.y = -particle.velocity.y * friction;
      particle.velocity.x = particle.velocity.x * friction;
    } else {
      return particle.velocity.y += gravity;
    }
  }
  else {
    if(particle.y + particle.radius > innerHeight){
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
    const rotatedVelocities = {
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
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

// Objects
function Star(x,y,radius, color) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.origRadius = radius;
  this.color = color;
  this.minOpacity = 0;
  this.maxOpacity = 1;
  this.opacity = Math.random();
  this.change = .01;


  this.update = function(){
    this.opacity += .01
    this.draw();
  }

  this.draw = () => {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.save();
      c.globalAlpha = .7 + (.2 * Math.sin(this.opacity));
      c.fillStyle = this.color;
      c.fill();
      c.restore();
      c.closePath();
  }
}

function Piece(x,y,radius,color, parentVelocity) {
  this.x = x;
  this.y = y;
  this.velocity = {
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() + 0.5) * parentVelocity.y
  }
  this.opacity = 1;
  this.radius = radius;
  this.color = color;
  this.mass = 1;

  this.update = function (){

    this.opacity = this.opacity * .96;

    this.x += this.velocity.x;
    this.y += this.velocity.y;


    this.draw();
  }

  this.draw = function() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.save();
    c.globalAlpha = this.opacity;
    c.fillStyle = this.color;
    c.fill();
    c.restore();
    c.closePath();
  }
}

function Particle(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.velocity = {
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() + 0.5) * 3
    }
    this.radius = radius;
    this.color = color;
    this.mass = 1;

    let pieces;

    this.update = particles => {

        //other particle collisions
        for(let i = 0; i < particles.length; i++){
          if (this === particles[i]) continue;
          if (distance(this.x, this.y, particles[i].x, particles[i].y) - this.radius * 2 < 0){
            // resolveCollision(this, particles[i]);
          }
        }

        //wall collisions
        if(this.x - this.radius <= 0 || this.x + this.radius >= innerWidth) this.velocity.x = -this.velocity.x;

        //Ground Collision
        if(this.y + this.radius >= innerHeight){
          this.radius -= this.radius/2;
          if(pieces == undefined) pieces = [];
          if(pieces != undefined) this.spawnPieces();
          if(this.radius <= 1) this.reset();
        }

        //particle movement
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.draw();
    }
    this.reset = function() {
      this.x = randomIntFromRange(radius, canvas.width - radius);
      this.y = -radius;
      this.radius = radius * (Math.random() + .2);
      this.velocity.x = (Math.random() - 0.5) * 40;
      this.velocity.y = (Math.random() + 0.5) * 5;
      pieces = [];
    }

    this.draw = () => {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.strokeStyle = this.color;
        c.stroke();
        c.closePath();

        if(pieces != undefined) {
          //Draw all falling stars
          pieces.forEach(piece => {
            applyGravity(piece, frictionEnable);
            piece.update(pieces);
          });
        }
    }

    this.spawnPieces = function(){
      // pieces = [];
      for(let i = 0; i < 6; i++){
          pieces.push(new Piece(this.x, this.y, 1, 'white', this.velocity));
      }
    }
}

//Mountain
function Mountain(base, height, xOffset, color){
    this.base = base;
    this.height = height;
    this.xOffset = xOffset;
    this.color = color;

    this.draw = () => {
      c.beginPath();
      c.fillStyle = this.color;
      c.moveTo(this.xOffset + this.base/2,innerHeight - this.height);
      c.lineTo(this.xOffset + this.base, innerHeight);
      c.lineTo(this.xOffset, innerHeight);
      c.lineTo(this.xOffset + this.base/2,innerHeight - this.height);
      c.fill();

    }
}

// Implementation

let particles;
let mountains;
let stars;

function init() {
      particles = [];
      mountains = [];
      stars = [];

        var base = canvas.width/2;
        var height = base - base * 4/7;
        var xOffset = innerWidth/2 - base/2;
        // ['#494f66', '#3c404f', '#272930', '#242535', '#202133']
        var color = randomColor(mountColors);
        mountains.push(new Mountain(base * 1.5, height * 1.5, xOffset - base/6*1.5, '#3c404f'));
        mountains.push(new Mountain(base, height, xOffset - base/2, '#272930'));
        mountains.push(new Mountain(base, height, xOffset + base/2, '#272930'));


      for (let i = 0; i <= 350; i++){
        const radius = 1;
        let x = randomIntFromRange(radius, canvas.width - radius);
        let y = randomIntFromRange(radius, canvas.height - radius);
        const color = randomColor(starColors);

        if(i !== 0) {
          for(let j = 0; j < stars.length; j++){
            if(distance(x, y, stars[j].x, stars[j].y) - radius * 2 < 0) {
              x = randomIntFromRange(radius, canvas.width - radius);
              y = randomIntFromRange(radius, canvas.height - radius);

              j = -1;
            }
          }
        }
        stars.push(new Star(x, y, radius, color));
      }

      for (let i = 0; i <= 0; i++){
        const radius = 15;
        let x = randomIntFromRange(radius, canvas.width - radius);
        let y = randomIntFromRange(radius, -(canvas.height - radius));

        if(i !== 0) {
          for(let j = 0; j < particles.length; j++){
            if(distance(x, y, particles[j].x, particles[j].y) - radius * 2 < 0) {
              x = randomIntFromRange(radius, canvas.width - radius);
              y = randomIntFromRange(radius, canvas.height - radius);

              j = -1;
            }
          }
        }

        particles.push(new Particle(x, y, radius, 'white'));
      }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)

    //Draw all stars
    stars.forEach(star => {
      star.update();
    })

    //Draw all mountains
    mountains.forEach(mountain => {
      mountain.draw();
    })

    //friction enable/disable
    // frictionEnable = false;
    frictionEnable = true;

    //Draw all falling stars
    particles.forEach(particle => {
      applyGravity(particle, frictionEnable);
      particle.update(particles);
    });


}

init();
animate();
