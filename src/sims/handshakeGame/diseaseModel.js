import { shufflePopulation } from "../../lib/shufflePopulation";

/* 
* Author: Mr. Hinkle
* Credits: Game Inspiration from Glass-Husain, William. “Teaching Systems Dynamics: Looking at Epidemics.”
*          Some coding refinements with help from GPT-4
* 
* What we are simulating:
* Simulates a simple infection model in which people "pair off" in each round and then have a 
* percentage chance of infecting each other.
* 
* What our model does:
* To simulate pairing off:
* - We start by shuffling the population into a new order.
* - We then move through the population by two's (each two is a partner).
* - We move their x/y coordinates so we can visually "see" them pairing in the simulation with 
*   one partner moving to the other.
* - If one partner is infected and not the other, we have a chance of infecting the other.
* 
* Note: We also keep track of people who are newly infected in each round so we can graph new infections
* separately from total infections.
* 
*/

// Default simulation parameters
export const defaultSimulationParameters = {
  infectionChance: 50,
};

// List of attributes we show on data table / graph
export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "New Infections", value: "newlyInfected" },
];


export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize, // X-coordinate within 100 units
      y: (100 * Math.floor(i / sideSize)) / sideSize, // Y-coordinate scaled similarly
      infected: false,
    });
  }
  // Infect patient zero...
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  return population;
};


const maybeInfectPerson = (person, params) => {
  if (Math.random() * 100 < params.infectionChance) {
    if (!person.infected) {
      person.infected = true;
      person.newlyInfected = true;
    }
  }
}

export const updatePopulation = (
  population,
  params
) => {
  // First, no one is newly infected any more...
  for (let p of population) {
    p.newlyInfected = false;
  }
  const shuffledPopulation = shufflePopulation(population);
  // Now that we've shuffled, let's move through the population by two's
  for (let i = 0; i < shuffledPopulation.length - 1; i += 10) {
    let personA = shuffledPopulation[i];
    let personB = shuffledPopulation[i + 1];

    // let's have them meet at person A's spot...        
    // Check if we're at the edge...
    if (personA.x < 1) {
      personA.x += Math.ceil(Math.random() * 5)
    }
    if (personA.x > 99) {
      personA.x -= Math.ceil(Math.random() * 5)
    }
    // Now move personA over slightly to make room
    personA.x -= 1; // person A moves over...
    // personB stands next to them :-)
    personB.x = personA.x + 2; // person B moves over...
    personB.y = personA.y;
    // Keep track of partners for nudging...
    personA.partner = personB;
    personB.partner = personA;

    // Now let's see if they infect each other
    if (personA.infected && !personB.infected) {
      maybeInfectPerson(personB, params);
    }
    if (personB.infected && !personA.infected) {
      maybeInfectPerson(personA, params);
    }
  }

  // We return the original population (order unchanged)
  return population;
};



/**
 * Computes statistics for the current round of the simulation, respresented as an object.
 *
 * @param {Array} population - The array representing the population, where each element is an object with an `infected` property.
 * @param {Object} lastRoundStats - The statistics from the last round, containing the number of infected people.
 * @param {number} lastRoundStats.infected - The number of infected people in the last round.
 * @param {number} round - The current round number.
 * @returns {Object} An object containing the current round number, the total number of infected people, and the number of new infections.
 * @returns {number} return.round - The current round number.
 * @returns {number} return.infected - The total number of infected people in the current round.
 * @returns {number} return.newInfections - The number of new infections in the current round.
 */
export const computeStatistics = (population, round) => {
  // Now count up the infected people this round...
  let infected = 0;
  let newlyInfected = 0;

  for (let p of population) {
    if (p.infected) {
      infected++;
    }
    if (p.newlyInfected) {
      newlyInfected++;
    }
  }

  // Return an object with both of these values
  return {
    round,
    infected,
    newlyInfected,
  };
};


