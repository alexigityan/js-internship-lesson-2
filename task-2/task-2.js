/*

Task 2: Asynchronous Rome Battle

There are X gladiators with the following properties
Health - 80-100 (with step=1)
Power - 2-5 (with step=0.1)
Speed - 1-5 (with step=0.001). 1 means 5 second and 5 means the 1-second interval between each attack
Name - (use faker.js to generate random names)

All gladiators start fighting at the same time. 
Each gladiator hits random gladiator on his turn where his opponent’s health decreases 
by the amount of gladiator’s power. 
Whenever any of gladiator dies (health <=0) the battle stops and 
everybody waits for Caesar’s decision: 

“Finish him” (gladiator leaves the arena) or “Live” (gladiator recovers and get +50 health points). 

After that battle continues. The attack speed of gladiators decreases with their health with 
following formula speed = initial_speed * (health/initial_health). 

When gladiator’s health is in range of 15 - 30 they get furious and their speed triples.

Write a Javascript program to emulate gladiators’ battle. 
Each attack should be logged in the console like the following line

[Roman Vinchi x 40] hits [Frank Smith x 10] with power 3.2
When some of the gladiators is dying log
[Roman Vinchi] dying
When Caesar makes a decision
Caesar showed :+1:|:-1: to [Roman Vinchi]
When there is a winner log to the console
[Frank Smith] won the battle with health x28

The program should run when calling start() function in the console.

*/

function getRandBetween(min, max, step) {
  return (Math.random() * (max - min) + min).toFixed(Math.log10(1/step));
}

function* createGameLoop() {
  while (true) {
    yield battle(gladiators);
  }
}

const gameLoop = createGameLoop();

let gameTimer;

function start() {
  gameTimer = setInterval(()=>gameLoop.next(), 1);
} 

function pause() {
  clearInterval(gameTimer);
}

class Gladiator {
  constructor() {
    this.name = faker.name.findName();
    this.initialHealth = getRandBetween(80,100,1);
    this.currentHealth = this.initialHealth;
    this.power = getRandBetween(2,5,0.1);
    this.initialSpeed = getRandBetween(1,5,0.001);
    this.currentSpeed = this.initialSpeed;
    this.isInBerserkMode = false;
    this.isReadyToHit = true;
    this.isDead = false;
    this.restTimer = null;
  }

  hit(anotherGladiator) {
    console.log(`[${this.name} x ${this.currentHealth}] hits [${anotherGladiator.name} x ${anotherGladiator.currentHealth}] with power ${this.power}`);
    this.isReadyToHit = false;
    this.rest(6000 - this.currentSpeed * 1000);
    return new Promise((survived, died) => {
      anotherGladiator.takeDamage(this.power);
      if (anotherGladiator.isDead) {
        died(anotherGladiator);
      } else {
        survived();
      }
    });
  }

  takeDamage(damage) {
    this.currentHealth = Math.round(this.currentHealth - damage);
    this.currentSpeed = this.initialSpeed * (this.currentHealth / this.initialHealth);
    
    if (this.isInBerserkMode)
      this.currentSpeed *= 3;

    if (this.currentHealth >= 15 && this.currentHealth <= 30 && !this.isInBerserkMode) {
      this.goBerserk(); 
    } else if ((this.currentHealth < 15 || this.currentHealth > 30) && this.isInBerserkMode) {
      this.calmDown();
    } else if (this.currentHealth <= 0) {
      console.log(`[${this.name}] dying...`)
      clearTimeout(this.restTimer);
      this.isDead = true;
      this.isReadyToHit = false;
    }
  }

  rest(time) {
    this.restTimer = setTimeout(this.getReadyToHit.bind(this), time);
  }

  getReadyToHit() {
    this.isReadyToHit = true;
  }

  goBerserk() {
    console.log(`${this.name} goes BERSERK!!!`);
    this.currentSpeed *= 3;
    this.isInBerserkMode = true;
  }

  calmDown() {
    this.currentSpeed /= 3;
    this.isInBerserkMode = false;
  }

  revive() {
    this.isDead = false;
    this.isReadyToHit = true;
    this.currentHealth = 50;
  }
}

function getRandomOpponent(array, myIndex) {
  const opponentIndex = getRandBetween(0, array.length - 1);
  return (opponentIndex == myIndex) ? getRandomOpponent(array, myIndex) : array[opponentIndex];
}

function battle(gladiators) {
  const hits = [];
  gladiators.forEach( (gladiator, i) => {
    if(gladiator.isReadyToHit) {
      hits.push(gladiator.hit(getRandomOpponent(gladiators, i)));
    }
  });
  Promise.all(hits)
    .catch(deadGladiator => {
      pause();
      decideFate(deadGladiator);
    })   
}

function decideFate(gladiator) {
  if (Math.random() < 0.5) {
    console.log(`Caesar showed :+1: to [${gladiator.name}]`);
    gladiator.revive();
  } else {
    console.log(`Caesar showed :-1: to [${gladiator.name}]`);
    const index = gladiators.indexOf(gladiator);
    gladiators.splice(index, 1);
  }
  if(gladiators.length > 1) {
    start();
  } else if (gladiators.length === 1) {
    console.log(`[${gladiators[0].name}] won the battle with health x${gladiators[0].currentHealth}!`);
  } else {
    console.log('everybody died.');
  }
}

const g1 = new Gladiator();
const g2 = new Gladiator();
const g3 = new Gladiator();

const gladiators = [g1, g2, g3];

