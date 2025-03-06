import { shufflePopulation } from "../../lib/shufflePopulation";

/* Update this code to simulate a simple disease model! */

/* For this simulation, you should model a *real world disease* based on some real information about it.
*
* Options are:
* - Mononucleosis, which has an extremely long incubation period.
*
* - The flu: an ideal model for modeling vaccination. The flu evolves each season, so you can model
    a new "season" of the flu by modeling what percentage of the population gets vaccinated and how
    effective the vaccine is.
* 
* - An emerging pandemic: you can model a new disease (like COVID-19) which has a high infection rate.
*    Try to model the effects of an intervention like social distancing on the spread of the disease.
*    You can model the effects of subclinical infections (people who are infected but don't show symptoms)
*    by having a percentage of the population be asymptomatic carriers on the spread of the disease.
*
* - Malaria: a disease spread by a vector (mosquitoes). You can model the effects of the mosquito population
    (perhaps having it vary seasonally) on the spread of the disease, or attempt to model the effects of
    interventions like bed nets or insecticides.
*
* For whatever illness you choose, you should include at least one citation showing what you are simulating
* is based on real world data about a disease or a real-world intervention.
*/

/**
 * Authors: Sadie
 * 
 * What we are simulating: A real world disease
 * 
 * What we are attempting to model from the real world: The Black Plague
 * 
 * What we are leaving out of our model:
 * 
 * What elements we have to add: Infected rats that infect people with the Plague
 * 
 * What parameters we will allow users to "tweak" to adjust the model: Modify rat population
 * 
 * In plain language, what our model does: My model will simulate the Black Plague by adding infected rats which get people sick who eventually die
 * 
 */


// Default parameters -- any properties you add here
// will be passed to your disease model when it runs.

export const defaultSimulationParameters = {
  // Add any parameters you want here with their initial values
  //  -- you will also have to add inputs into your jsx file if you want
  // your user to be able to change these parameters.
};

/* Creates your initial population. By default, we *only* track whether people
are infected. Any other attributes you want to track would have to be added
as properties on your initial individual. 

For example, if you want to track a disease which lasts for a certain number
of rounds (e.g. an incubation period or an infectious period), you would need
to add a property such as daysInfected which tracks how long they've been infected.

Similarily, if you wanted to track immunity, you would need a property that shows
whether people are susceptible or immune (i.e. succeptibility or immunity) */
// Adding rat population logic and infection spread logic

// Default parameters -- we'll allow users to control the rat population
export const defaultSimulationParameters = {
  ratPopulation: 100, // Control rat population
  infectionRate: 0.1, // Infection rate between humans
  deathRate: 0.45, // Average death rate (Black Plague: 30%-60%)
  immunityRate: 0.1, // Chance for a human to gain immunity after infection
};

// Create population logic (for humans)
export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize,
      y: (100 * Math.floor(i / sideSize)) / sideSize,
      infected: false,
      immune: false,
      daysInfected: 0, // Track days infected
    });
  }

  // Infect patient zero
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  return population;
};

// Create rats logic
export const createRats = (ratPopulation = 100) => {
  const rats = [];
  for (let i = 0; i < ratPopulation; i++) {
    rats.push({
      id: `rat-${i}`,
      infected: true, // Rats are always infected
    });
  }
  return rats;
};

// Update the population each round
export const updatePopulation = (population, rats, params) => {
  const newPopulation = population.map((person) => {
    if (person.infected) {
      person.daysInfected += 1;
      if (person.daysInfected > 10) {
        // Chance to recover or die after being infected for more than 10 rounds
        if (Math.random() < params.immunityRate) {
          person.immune = true; // Person gains immunity
          person.infected = false; // No longer infected
        } else if (Math.random() < params.deathRate) {
          person.infected = false; // Person dies
        }
      }
    } else {
      // Chance to be infected by humans (infection rate) or by rats
      if (Math.random() < params.infectionRate) {
        if (Math.random() < 0.5) {
          // Infection from rats
          if (Math.random() < 0.5) {
            person.infected = true; // Rat infects human
          }
        } else {
          // Infection from humans
          const randomNeighbor = population[Math.floor(Math.random() * population.length)];
          if (randomNeighbor.infected) {
            person.infected = true;
          }
        }
      }
    }
    return person;
  });

  return newPopulation;
};

// Track stats
export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "Total Immune", value: "immune" },
  { label: "Total Dead", value: "dead" },
];

// Compute stats for display
export const computeStatistics = (population, round) => {
  let infected = 0;
  let immune = 0;
  let dead = 0;

  for (let p of population) {
    if (p.infected) infected += 1;
    if (p.immune) immune += 1;
    if (!p.infected && p.daysInfected > 10) dead += 1; // Dead people
  }

  return { round, infected, immune, dead };
};



