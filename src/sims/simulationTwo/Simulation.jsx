import React, { useEffect, useState } from "react";
import {
  createPopulation,
  updatePopulation,
  computeStatistics,
  trackedStats,
  defaultSimulationParameters,
} from "./diseaseModel";
import { renderChart } from "../../lib/renderChart";
import { renderTable } from "../../lib/renderTable";

let boxSize = 500; // World box size in pixels
let maxSize = 1000; // Max number of icons we render (we can simulate big populations, but don't render them all...)

/**
 * Renders a subset of the population as a list of patients with emojis indicating their infection status.
 */
// Updating the renderPatients function to include rats and death/immune statuses

const renderPatients = (population, rats) => {
  let amRenderingSubset = population.length > maxSize;
  const popSize = population.length + rats.length; // Include rats in the total population
  if (popSize > maxSize) {
    population = population.slice(0, maxSize); // Limit rendered population
  }

  function renderEmoji(p) {
    if (p.infected) {
      return "🤢"; // Sick person
    } else if (p.immune) {
      return "😎"; // Immune person
    } else {
      return "😀"; // Healthy person
    }
  }

  function renderRatEmoji(rat) {
    return "🐀"; // Infected rat emoji
  }

  function renderSubsetWarning() {
    if (amRenderingSubset) {
      return (
        <div className="subset-warning">
          Only showing {maxSize} ({((maxSize * 100) / popSize).toFixed(2)}%) of{" "}
          {popSize} patients...
        </div>
      );
    }
  }

  return (
    <>
      {renderSubsetWarning()}
      {rats.map((rat) => (
        <div key={rat.id} className="rat">
          {renderRatEmoji(rat)} {/* Display infected rats */}
        </div>
      ))}
      {population.map((p) => (
        <div
          key={p.id}
          data-patient-id={p.id}
          data-patient-x={p.x}
          data-patient-y={p.y}
          className="patient"
          style={{
            transform: `translate(${(p.x / 100) * boxSize}px, ${
              (p.y / 100) * boxSize
            }px)`,
          }}
        >
          {renderEmoji(p)} {/* Display emojis for humans */}
        </div>
      ))}
    </>
  );
};

const Simulation = () => {
  const [popSize, setPopSize] = useState(20);
  const [population, setPopulation] = useState(createPopulation(popSize * popSize));
  const [rats, setRats] = useState(createRats(defaultSimulationParameters.ratPopulation));
  const [diseaseData, setDiseaseData] = useState([]);
  const [lineToGraph, setLineToGraph] = useState("infected");
  const [autoMode, setAutoMode] = useState(false);
  const [simulationParameters, setSimulationParameters] = useState(defaultSimulationParameters);

  const runTurn = () => {
    let newPopulation = updatePopulation([...population], rats, simulationParameters);
    setPopulation(newPopulation);
    let newStats = computeStatistics(newPopulation, diseaseData.length);
    setDiseaseData([...diseaseData, newStats]);
  };

  const resetSimulation = () => {
    setPopulation(createPopulation(popSize * popSize));
    setRats(createRats(simulationParameters.ratPopulation));
    setDiseaseData([]);
  };

  useEffect(() => {
    if (autoMode) {
      setTimeout(runTurn, 500);
    }
  }, [autoMode, population, rats]);

  return (
    <div>
      <section className="top">
        <h1>Black Plague Simulation</h1>
        <button onClick={runTurn}>Next Turn</button>
        <button onClick={() => setAutoMode(true)}>AutoRun</button>
        <button onClick={() => setAutoMode(false)}>Stop</button>
        <button onClick={resetSimulation}>Reset Simulation</button>

        <label>
          Rat Population:
          <input
            type="range"
            min="10"
            max="500"
            value={simulationParameters.ratPopulation}
            onChange={(e) =>
              setSimulationParameters({
                ...simulationParameters,
                ratPopulation: parseInt(e.target.value),
              })
            }
          />
        </label>
      </section>

      <section className="side-by-side">
        {renderChart(diseaseData, lineToGraph, setLineToGraph, trackedStats)}

        <div className="world">
          <div
            className="population-box"
            style={{ width: boxSize, height: boxSize }}
          >
            {renderPatients(population, rats)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Simulation;
