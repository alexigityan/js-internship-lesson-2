/*

Task 3: DOM Manipulation
Show the Arena result in DOM instead of logging it in the console

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
    this.readyToHit = false;
    this.rest(6 - this.currentSpeed);
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
    if (this.currentHealth >= 15 && this.currentHealth <= 30 && !this.isInBerserkMode) {
      this.goBerserk(); 
    } else if (this.isInBerserkMode) {
      this.calmDown();
    } else if (this.currentHealth <= 0) {
      console.log(`[${this.name}] dying...`)
      clearTimeout(this.restTimer);
      this.isDead = true;
      this.isReadyToHit = false;
      this.node.classList.add('dead');
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
    this.node.classList.remove('dead');

  }
}

function battle(gladiators) {
  function getRandomOpponent(array, myIndex) {
    const opponentIndex = getRandBetween(0, array.length - 1);
    return (opponentIndex == myIndex) ? getRandomOpponent(array, myIndex) : array[opponentIndex];
  }
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
    const result = `[${gladiators[0].name}] won the battle with health x${gladiators[0].currentHealth}!`;
    console.log(result);
    displayResult(result);
  } else {
    const result = `everybody died`;
    console.log(result);
    displayResult(result);  
  }
}

let gladiators = [];

// DOM code

const gladiatorCount = document.getElementById('num-of-glads');
const getGladiators = document.getElementById('get-gladiators').addEventListener('click', () =>{
  let numOfGladiators = parseInt(gladiatorCount.value);
  gladiators = [];
  while (numOfGladiators > 0) {
    gladiators.push(new Gladiator());
    numOfGladiators--;
  }
  populateArena(gladiators);
});

const beginButton = document.getElementById('begin');
beginButton.addEventListener('click', ()=>{
  if(gladiators.length > 1) {
    start();
  } else {
    alert('We need more gladiators first!');
  }
})

function populateArena(gladiators) {
  const arena = document.getElementById('arena');
  while (arena.childNodes.length>0) {
    arena.childNodes[0].remove();
  }
  gladiators.forEach(gladiator => {
    const gladiatorNode = document.createElement('div');
    gladiator.node = gladiatorNode;
    gladiatorNode.classList.add('gladiator');
    gladiatorNode.innerText = gladiator.name;
    arena.appendChild(gladiatorNode);
  });
}

function displayResult(result) {
  document.getElementById('result').innerText = result;
}