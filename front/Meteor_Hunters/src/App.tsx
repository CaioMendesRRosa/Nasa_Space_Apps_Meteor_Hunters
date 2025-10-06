import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import axios from "axios";
import type { meteor, consequences } from "./interface/interfaces"
import MeteorAnimation from "./MeteorAnimation"

// --- Definições de Tipos (Adicione 'energy' à interface de consequences) ---
// Supondo que seu backend retorne a energia no objeto de consequências.
// Se ainda não o faz, você precisará adicionar este campo no retorno da sua API.
/*
  interface consequences {
    ...
    energy: string; // ou number
    ...
  }
*/


interface ControlSliderProps {
  label: string;
  value: number;
  unit: string;
}

interface ComparisonPanelProps {
  consequences: consequences;
}

// --- COMPONENTE ATUALIZADO ---
interface LongTermEffectsPanelProps {
    energyInMegatons: number;
}

const LongTermEffectsPanel: React.FC<LongTermEffectsPanelProps> = ({ energyInMegatons }) => {
    // Define um limiar para exibir efeitos globais significativos
    if (energyInMegatons < 10) {
        return null;
    }

    let scaleDescription;
    let effects: { title: string; text: string }[] = [];

    if (energyInMegatons >= 10 && energyInMegatons < 1000) {
        scaleDescription = "an event with the potential to cause regional to continental climate changes.";
        effects = [
            { title: "Aerosol Ejection", text: "Large amounts of dust and sulfur aerosols are injected into the stratosphere, affecting local and regional climate." },
            { title: "Regional Cooling", text: "Sunlight is partially blocked over a wide area, potentially causing a drop in temperature of several degrees for months." },
            { title: "Acid Rain", text: "Vaporization of sulfur-rich rocks can lead to acid rain, harming vegetation and aquatic ecosystems." },
        ];
    } else if (energyInMegatons >= 1000 && energyInMegatons < 100000) {
        scaleDescription = "an event with the potential to trigger a global 'Impact Winter.'";
        effects = [
            { title: "Massive Dust Ejection", text: "Trillions of tons of pulverized rock are launched into the stratosphere, forming a layer that encircles the planet." },
            { title: "Global Sunlight Blockage", text: "The debris layer blocks most sunlight for months or even years, resulting in darkness and extreme cold." },
            { title: "Photosynthesis Collapse", text: "Prolonged darkness leads to mass death of plants and plankton, disrupting the base of most food chains." },
            { title: "Drastic Temperature Drop", text: "Global temperatures fall sharply, potentially triggering a sudden ice age and decimating unadapted species." },
        ];
    } else { // >= 100,000 MT
        scaleDescription = "a mass extinction event with catastrophic geological consequences.";
        effects = [
            { title: "Severe Impact Winter", text: "Extreme darkness and cold for several years, leading to near-total collapse of terrestrial and marine ecosystems." },
            { title: "Global Fires", text: "Ejected material re-entering the atmosphere heats the air, causing fires in forests across the planet." },
            { title: "Mega-Tsunamis and Earthquakes", text: "The impact triggers earthquakes of magnitude 8 or higher and tsunamis hundreds of meters high that sweep across continents." },
            { title: "Ocean Chemistry Alteration", text: "Extremely acidic rain and deposition of heavy metals change ocean chemistry, causing another wave of marine extinctions." },
        ];
    }


    return (
        <div className="long-term-effects-panel">
            <h3>Long-Term Global Effects of the Impact</h3>
            <p>
                With an energy of <strong>{energyInMegatons.toFixed(2)} megatons of TNT</strong>, the impact is considered {scaleDescription} and may trigger the following effects:
            </p>
            <div className="effects-column">
                <div className="effects-header meteor-header">
                    <h4><i className="fas fa-globe-americas"></i> Climatic and Geological Consequences </h4>
                </div>
                <ul className="effects-list">
                    {effects.map((effect, index) => (
                        <li key={index}>
                            <strong>{effect.title}:</strong> {effect.text}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
// --- FIM DA ATUALIZAÇÃO ---


interface Results {
  impactEnergy: string;
  craterDiameter: string;
  deflectionStatus: 'SUCESSO' | 'FALHA';
  missDistance: string;
}

interface ResultsPanelProps {
  consequences: consequences;
  clicouEmTerra: boolean;
}

interface Threat {
  level: 'MONITORANDO' | 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRÍTICO';
  color: string;
}

const ControlSlider: React.FC<ControlSliderProps> = ({ label, value, unit }) => {
  return (
    <div className="control-group">
      <label className="control-label">{label}</label>
      <div className="slider-container">
        <div className="slider-value">
          {value.toString()} {unit}
        </div>
      </div>
    </div>
  );
}

const historicalEvents = [
  {
    name: "Tunguska (1908, Russia)",
    type: "Airburst",
    craterDiameter: 0,
    tsunamiHeight: 0,
    epicenter: 5.0,
    energy: 15, // Megatons
    description: "Airburst of ~15 MT that devastated 2,000 km² of forest."
  },
  {
    name: "Chicxulub (≈66 million years ago)",
    type: "Land Impact",
    craterDiameter: 180000, // 180 km in meters
    tsunamiHeight: 100,
    epicenter: 12,
    energy: 100000000, // 100 million Megatons
    description: "Asteroid that caused the dinosaur extinction, with energy of 100 million megatons."
  },
  {
    name: "Tsar Bomba (1961, USSR)",
    type: "Nuclear Explosion",
    craterDiameter: 0,
    tsunamiHeight: 0,
    epicenter: 7.1,
    energy: 50, // 50 Megatons
    description: "The most powerful nuclear bomb ever detonated, with destructive power of 50 megatons."
  },
  {
    name: "Sumatra Earthquake (2004)",
    type: "Earthquake/Tsunami",
    craterDiameter: 0,
    tsunamiHeight: 30,
    epicenter: 9.1,
    energy: 23000, // Equivalent seismic energy
    description: "Submarine earthquake that generated a devastating tsunami in the Indian Ocean."
  },
  {
    name: "Kobe Earthquake (1995, Japan)",
    type: "Land",
    craterDiameter: 0,
    tsunamiHeight: 0,
    epicenter: 7.3,
    energy: 2,
    description: "Magnitude 7.3 earthquake that devastated the city of Kobe, Japan."
  },
  {
    name: "Chelyabinsk Impact (2013, Russia)",
    type: "Airburst",
    craterDiameter: 0,
    tsunamiHeight: 0,
    epicenter: 2.0,
    energy: 0.5, // 500 kilotons
    description: "Meteor that exploded with ~0.5 MT energy, causing damage and injuries."
  },
  {
    name: "Valdivia Earthquake (1960, Chile)",
    type: "Land/Tsunami",
    craterDiameter: 0,
    tsunamiHeight: 25,
    epicenter: 9.5,
    energy: 200000, // Equivalent seismic energy
    description: "Largest recorded earthquake, releasing energy equivalent to 200,000 megatons."
  }
];

const filterSimilarEvents = (consequences: consequences) => {
  const craterDiameter = Number(consequences.craterDiameter);
  const tsunamiHeight = Number(consequences.tsunamiHeight);
  const epicenter = Number(consequences.epicenter);
  const energy = Number(consequences.energy);

  return historicalEvents.filter(event => {
    const craterMatch = event.craterDiameter > 0
      ? Math.abs(event.craterDiameter - craterDiameter) / event.craterDiameter <= 0.5 // Aumentei a tolerância
      : false;

    const tsunamiMatch = event.tsunamiHeight > 0
      ? Math.abs(event.tsunamiHeight - tsunamiHeight) / event.tsunamiHeight <= 0.5
      : false;

    const earthquakeMatch = event.epicenter > 0
      ? Math.abs(event.epicenter - epicenter) / event.epicenter <= 0.3
      : false;
    
    // Adicionando comparação de energia
    const energyMatch = event.energy > 0
      ? Math.abs(event.energy - energy) / event.energy <= 0.5
      : false;

    return craterMatch || tsunamiMatch || earthquakeMatch || energyMatch;
  });
};


const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ consequences }) => {
  const similarEvents = filterSimilarEvents(consequences);

  if (similarEvents.length === 0) return null;

  return (
    <div className="comparison-panel">
      <h3>Comparison with Similar Historical Events</h3>
      <ul>
        {similarEvents.map((event, i) => (
          <li key={i} className="historical-event">
            <strong>{event.name}</strong> - {event.description}
            <div>
              {event.energy > 0 && (
                <span>Energy: {event.energy} MT | </span>
              )}
              {event.craterDiameter > 0 && (
                <span>Crater: {event.craterDiameter} m | </span>
              )}
              {event.tsunamiHeight > 0 && (
                <span>Tsunami: {event.tsunamiHeight} m | </span>
              )}
              {event.epicenter > 0 && (
                <span>Magnitude: {event.epicenter}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ResultsPanel: React.FC<ResultsPanelProps> = ({ consequences, clickedOnLand }) => {
  return (
    <div className="results-panel">
      <h3>Impact Consequences</h3>
      <p>Note: 1 megaton of TNT = 1 Billion Kilograms</p>
      <div className="result-item energy-item">
        <span className="result-label">Released Energy (Megatons of TNT):</span>
        <span className="result-value">{Number(consequences.energy).toFixed(2)}</span>
      </div>
      <div className="result-item">
        <span className="result-label">Crater Diameter (Meters):</span>
        <span className="result-value">{Number(consequences.craterDiameter).toFixed(2)}</span>
      </div>
      <div className="result-item">
        <span className="result-label">Final Crater Diameter (Meters):</span>
        <span className="result-value">{Number(consequences.finalCraterDiameter).toFixed(2)}</span>
      </div>
      <div className="result-item">
        <span className="result-label">Crater Depth (Meters):</span>
        <span className="result-value">{Number(consequences.craterDepth).toFixed(2)}</span>
      </div>
      {Number(consequences.tsunamiHeight) > 0 && !clickedOnLand && (
        <div className="result-item">
          <span className="result-label">
            <strong>Ocean Impact:</strong> Wave Height Generated by Impact (Meters)
          </span>
          <span className="result-value">{Number(consequences.tsunamiHeight).toFixed(2)}</span>
        </div>
      )}
      {Number(consequences.tsunamiHeightFar) > 0.1 && !clickedOnLand && (
        <div className="result-item">
          <span className="result-label">
            Wave Height 50 km from Impact (Meters):
          </span>
          <span className="result-value">{Number(consequences.tsunamiHeightFar).toFixed(2)}</span>
        </div>
      )}
      {Number(consequences.epicenter) > 0 && clickedOnLand && (
        <div className="result-item">
          <span className="result-label">
            <strong>Land Impact:</strong> Earthquake Magnitude (Richter Scale)
          </span>
          <span className="result-value">{Number(consequences.epicenter).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};


// Componente principal
const App: React.FC = () => {
  const [meteors, setMeteors] = useState<meteor[] | undefined>();
  const [meteorSelected, setmeteorSelected] = useState<meteor | undefined>();
  const [meteorInformations, setMeteorInformations] = useState<meteor | undefined>();
  const [consequences, setConsequences] = useState<consequences | undefined>();
  const [impact, setImpact] = useState<boolean>(false);
  const [showImpacts, setShowImpacts] = useState<boolean>(false);
  const [clicouEmTerra, setClicouEmTerra] = useState<boolean>(false);

  const fetchMeteors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/allmeteors");
      const meteosSorted = response.data.data.sort((a : meteor, b : meteor) => Number(b.diameter) - Number(a.diameter));
      setMeteors(meteosSorted);
    } catch (error) {
      console.error("Erro ao buscar meteoros:", error);
    }
  };

  const handleClick = (meteor: meteor) => {
    setImpact(false);
    setmeteorSelected(meteor);
  };

  const getConsequences = useCallback(async () => {
    if (!meteorInformations) return;
    const urlApi = "http://localhost:5000/api/calcConsequences";
    const response = await axios.get(urlApi, {
      headers: {
        "diameter": meteorInformations.diameter,
        "velocity": meteorInformations.v_imp,
        "energy": meteorInformations.energy,
        "isSoil": clicouEmTerra
      }
    });
    setConsequences(response.data);
  }, [meteorInformations, clicouEmTerra]);

  useEffect(() => {
    getConsequences();
  }, [getConsequences])
  
  useEffect( () => {
    const getSpecificMeteor = async () => {
      if (!meteorSelected) return;
      const urlApi = "http://localhost:5000/api/meteor" + "?des=" + meteorSelected.des;
      const response = await axios.get(urlApi);
      setMeteorInformations(response.data.summary);
    }
    getSpecificMeteor();
  }, [meteorSelected] );

  useEffect(() => {
    fetchMeteors();
  }, []);

  return (
    <div className="container">
      <div className="control-panel">
        <div className="header">
          <div className="logo">METEOR HUNTERS</div>
          <div className="subtitle">Asteroid Impact Simulation System</div>
        </div>
        <div className="introduction">
          <h2>Welcome to METEOR HUNTERS</h2>
          <p>This application simulates the consequences of asteroid impacts monitored by <strong>NASA’s Sentry Center</strong>. Explore the data, select an asteroid, and see the impact results on land or at sea, comparing them with historical events and understanding their long-term effects.</p>
        </div>

        <h3 className="h3-meteor">Meteors Detected</h3>
        <div className="meteor-list">
          <div className="meteor-second-list">
            <ul className="meteorUl">
            {meteors && meteors.map((m, i) => (
              <li key={i}>
                <button
                  onClick={() => handleClick(m)}
                  className={`meteor-btn ${meteorSelected?.des === m.des ? 'selected' : ''}`}
                >
                  {m.des}
                </button>
              </li>
            ))}
            </ul>
          </div>
        </div>

        {meteorSelected && <div className='meteor-selected'>
            <h3>Meteor Selected</h3>
            <div className='meteor-div'>
              <div className="meteor-div-selected">
                  {meteorSelected.des}
              </div>
            </div>
        </div> }
        
        { meteorInformations &&
          <ControlSlider
            label="Asteroid Diameter"
            value={ Number((Number(meteorInformations.diameter) * 1000).toFixed(2)) }
            unit="Meters"
          /> }

        { meteorInformations &&
          <ControlSlider
            label="Impact Velocity"
            value={ Number((Number(meteorInformations.v_imp)).toFixed(2)) }
            unit="Km/s"
          /> }

        { meteorInformations && 
          <ControlSlider
            label="Potential Impact Energy"
            value={ Number(Number(meteorInformations.energy).toFixed(2)) }
            unit="Megatons"
          /> }

        {consequences && showImpacts &&
        <div>
          <ResultsPanel consequences={consequences} clicouEmTerra={clicouEmTerra} />
          <ComparisonPanel consequences={consequences} />
          <LongTermEffectsPanel energyInMegatons={Number(consequences.energy)} />
        </div>
        }
      </div>

      <div className="main-display">
        <div className="earth-display">
          <MeteorAnimation setClicouEmTerra={setClicouEmTerra} clicouEmTerra={clicouEmTerra} setShowImpacts={setShowImpacts} radius={Number(consequences?.finalCraterDiameter)} />
        </div>
      </div>
    </div>
  );
}

export default App;

