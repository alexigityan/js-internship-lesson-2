/*

Task 1: Basic Javascript
Create a class Person with the following properties (name, age). 
After creating an instance the age of a person should be incremented by 1 every second. 
Create 4 instances of a person and push them to an array. 
Write a function that checks every second the age of each person in the array 
and removes a person from the array whenever age >=40. 
Create another function that pushes to the array every 2-second new instance of a person 
with a random age between 1 and 50 and random name.

*/

const MAX_AGE = 40;

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
    this.timer = setInterval(this.increaseAge.bind(this), 1000);
  }

  increaseAge() {
    this.age++;
  }

  stopAging() {
    clearInterval(this.timer);
  }
}

const bob = new Person('Bob', 21);
const bub = new Person('Bub', 23);
const bibo = new Person('Bibo', 37);
const bubo = new Person('Bubo', 33);

let house = [bob, bub, bibo, bubo];

function checkAges(house) {
  return house.filter(person => {
    if (person.age < MAX_AGE) {
      console.log(`${person.name} is ${person.age} years old.`);
      return true;
    } else {
      console.log(`${person.name} leaves us...`);
      person.stopAging();
      return false;
    }
  });
}

const timerOfDoom = setInterval(() => {
  if (house.length > 0) {
    house = checkAges(house);
  } else {
    clearInterval(timerOfDoom);
    console.log('The house is all empty now...');
  }
}, 1000);

const timerOfNewLife = setInterval(() => {
    const randomAge = getRandBetween(0,50);
    const randomName = getRandName();
    house.push(new Person(randomName, randomAge));
}, 2000);

function getRandBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandName(length = 4) {
  let name = '';
  while (name.length < length - 1) {
    name += String.fromCharCode(getRandBetween(97,122));
  }
  name = String.fromCharCode(getRandBetween(65, 90)) + name;
  return name;
}

