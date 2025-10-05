// src/App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import axios from "axios";
import type { meteor, consequences } from "./interface/interfaces"
import MeteorAnimation from "./MeteorAnimation"

// --- Definições de Tipos Corrigidas ---
interface ControlSliderProps {
  label: string;
  value: number; // Corrigido: Number -> number
  unit: string;
}

interface ComparisonPanelProps {
  consequences: consequences;
}

interface Results {
  impactEnergy: string;
  craterDiameter: string;
  deflectionStatus: 'SUCESSO' | 'FALHA';
  missDistance: string;
}

interface ResultsPanelProps {
  consequences: consequences;
  clicouEmTerra: boolean; // Corrigido: Boolean -> boolean
}

interface Threat {
  level: 'MONITORANDO' | 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRÍTICO';
  color: string;
}

// --- Componentes (sem alterações, exceto nas props) ---

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

// ... (componente historicalEvents e filterSimilarEvents não mudam)
const historicalEvents = [
  {
    name: "Tunguska (1908, Rússia)",
    type: "Explosão Aérea",
    craterDiameter: 0,
    tsunamiHeight: 0,
    epicenter: 5.0,
    description: "Explosão aérea de um meteoro de ~50m de diâmetro que devastou 2.000 km² de floresta."
  },
  {
    name: "Chicxulub (≈66 milhões de anos)",
    type: "Impacto Terrestre",
    craterDiameter: 18000,
    tsunamiHeight: 100,
    epicenter: 12,
    description: "Meteoro que causou a extinção dos dinossauros, craterou 180 km de diâmetro."
  },
  {
    name: "Terremoto de Sumatra (2004)",
    type: "Terremoto/Tsunami",
    craterDiameter: 0,
    tsunamiHeight: 30,
    epicenter: 9.1,
    description: "Terremoto submarino que gerou tsunami devastador no Oceano Índico."
  },
  {
    name: "Terremoto de Kobe (1995, Japão)",
    type: "Terrestre",
    craterDiameter: 0,
    tsunamiHeight: 0,
    epicenter: 7.3,
    description: "Terremoto de magnitude 7.3 que devastou a cidade de Kobe, no Japão."
  },
  {
    name: "Impacto de Chelyabinsk (2013, Rússia)",
    type: "Explosão Aérea",
    craterDiameter: 0,
    tsunamiHeight: 0,
    epicenter: 2.0,
    description: "Meteoro de ~20 metros que explodiu na atmosfera causando danos e ferimentos."
  },
  {
    name: "Terremoto de Valdivia (1960, Chile)",
    type: "Terrestre/Tsunami",
    craterDiameter: 0,
    tsunamiHeight: 25,
    epicenter: 9.5,
    description: "Maior terremoto registrado na história, gerou tsunami devastador."
  }
];

const filterSimilarEvents = (consequences: consequences) => {
  const craterDiameter = Number(consequences.craterDiameter);
  const tsunamiHeight = Number(consequences.tsunamiHeight);
  const epicenter = Number(consequences.epicenter);

  return historicalEvents.filter(event => {
    const craterMatch = event.craterDiameter > 0
      ? Math.abs(event.craterDiameter - craterDiameter) / craterDiameter <= 0.3
      : false;

    const tsunamiMatch = event.tsunamiHeight > 0
      ? Math.abs(event.tsunamiHeight - tsunamiHeight) / tsunamiHeight <= 0.3
      : false;

    const earthquakeMatch = event.epicenter > 0
      ? Math.abs(event.epicenter - epicenter) / epicenter <= 0.3
      : false;

    return craterMatch || tsunamiMatch || earthquakeMatch;
  });
};


const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ consequences }) => {
  const similarEvents = filterSimilarEvents(consequences);

  if (similarEvents.length === 0) return null;

  return (
    <div className="comparison-panel">
      <h3>Comparativo com Eventos Históricos Semelhantes</h3>
      <ul>
        {similarEvents.map((event, i) => (
          <li key={i} className="historical-event">
            <strong>{event.name}</strong> - {event.description}
            <div>
              {event.craterDiameter > 0 && (
                <span>Cratera: {event.craterDiameter} m | </span>
              )}
              {event.tsunamiHeight > 0 && (
                <span>Altura do tsunami: {event.tsunamiHeight} m | </span>
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

const ResultsPanel: React.FC<ResultsPanelProps> = ({ consequences, clicouEmTerra }) => {
  return (
    <div className="results-panel">
      <h3>Consequências do Impacto</h3>
      <div className="result-item">
        <span className="result-label">Diâmetro da Cratera (Metros):</span>
        <span className="result-value">{Number(consequences.craterDiameter).toFixed(2)}</span>
      </div>
      <div className="result-item">
        <span className="result-label">Diâmetro final da Cratera (Metros):</span>
        <span className="result-value">{Number(consequences.finalCraterDiameter).toFixed(2)}</span>
      </div>
      <div className="result-item">
        <span className="result-label">Profundidade da Cratera (Metros):</span>
        <span className="result-value">{Number(consequences.craterDepth).toFixed(2)}</span>
      </div>
      {Number(consequences.tsunamiHeight) > 0 && !clicouEmTerra && (
        <div className="result-item">
          <span className="result-label">
            <strong>Impacto no Mar:</strong> Altura da onda gerada pelo impacto (Metros)
          </span>
          <span className="result-value">{Number(consequences.tsunamiHeight).toFixed(2)}</span>
        </div>
      )}
      {Number(consequences.tsunamiHeightFar) > 0.1 && !clicouEmTerra && (
        <div className="result-item">
          <span className="result-label">
            Altura da onda a 50Km do impacto (Metros):
          </span>
          <span className="result-value">{Number(consequences.tsunamiHeightFar).toFixed(2)}</span>
        </div>
      )}
      {Number(consequences.epicenter) > 0 && clicouEmTerra && (
        <div className="result-item">
          <span className="result-label">
            <strong>Impacto em Terra Firme:</strong> Magnitude do terremoto (Escala Richter)
          </span>
          <span className="result-value">{Number(consequences.epicenter).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

// Componente principal
const App: React.FC = () => {
  // ... (outros estados)
  const [meteors, setMeteors] = useState<meteor[] | undefined>();
  const [meteorSelected, setmeteorSelected] = useState<meteor | undefined>();
  const [meteorInformations, setMeteorInformations] = useState<meteor | undefined>();
  const [consequences, setConsequences] = useState<consequences | undefined>();

  // --- Estados Corrigidos ---
  const [impact, setImpact] = useState<boolean>(false);
  const [showImpacts, setShowImpacts] = useState<boolean>(false);
  const [clicouEmTerra, setClicouEmTerra] = useState<boolean>(false);

  // ... (resto das suas funções e useEffects não mudam)
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
      console.log("Meteor selecionado:", meteor);

      setImpact(false);
      
      setmeteorSelected(meteor);
  };

  const getConsequences = async () => {

      if (!meteorInformations) return;

      console.log("Chegou aqui agora");

      const urlApi = "http://localhost:5000/api/calcConsequences";

      const response = await axios.get(urlApi, {
        headers: {
          "diameter": meteorInformations.diameter,
          "velocity": meteorInformations.v_imp,
          "energy": meteorInformations.energy,
          "isSoil": clicouEmTerra
        }
      });

      console.log("abc", response.data);

      setConsequences(response.data);
  }

  useEffect ( () => {
    console.log("cheguei");
    getConsequences();
  }, [meteorInformations, clicouEmTerra])
  
  useEffect( () => {
    const getSpecificMeteor = async () => {

      if (!meteorSelected) return;

      const urlApi = "http://localhost:5000/api/meteor" + "?des=" + meteorSelected.des;

      const response = await axios.get(urlApi);

      setMeteorInformations(response.data.summary);

      console.log("oi", response.data.summary);
    }

    getSpecificMeteor();}, [meteorSelected] );


  useEffect(() => {
    fetchMeteors();
  }, []);

  return (
    <div className="container">
      <div className="control-panel">
        <div className="header">
          <div className="logo">ASTROIMPACTS</div>
          <div className="subtitle">Sistema de Simulação de Impactos de Asteróides</div>
        </div>
        <div className="introduction">
          <h2>Bem-vindo ao ASTROIMPACTS</h2>
          <p>
            O <strong>Centro Sentry da NASA</strong> é um sistema automatizado que monitora asteroides e cometas próximos da Terra (NEOs) para identificar possíveis riscos de impacto. Ele calcula com precisão as órbitas desses corpos celestes, ajudando cientistas e autoridades a se prepararem para qualquer ameaça.
          </p>
          <p>
            Nesta aplicação, os <strong>meteoros listados</strong> representam objetos detectados e monitorados pelo Sentry. Você pode explorar cada meteoro, ver suas características e simular os possíveis impactos na Terra, incluindo tamanho da cratera, tsunami e magnitude de terremoto.
          </p>
        </div>

        <h3 className="h3-meteor">Meteoros Detectados</h3>
        <div className="meteor-list">
          <div className="meteor-second-list">
            <ul className="meteorUl">
            {meteors && meteors.map((m, i) => (
              <li key={i}>
                <button
                  onClick={() => handleClick(m)}
                  className="meteor-btn"
                >
                  {m.des}
                </button>
              </li>
            ))}
          </ul>
          </div>
        </div>

        {meteorSelected && <div className='meteor-selected'>
            <h3>Meteoro Selecionado</h3>
            <div className='meteor-div'>
              <div className="meteor-div-selected">
                  {meteorSelected.des}
              </div>
            </div>
            
        </div> }
          { meteorInformations && 
        <ControlSlider
          label="Diâmetro do Asteroide"
          value={ Number((Number(meteorInformations.diameter) * 1000).toFixed(2))}
          unit="Metros"
        /> }

        { meteorInformations && 
        <ControlSlider
          label="Velocidade de Impacto"
          value={Number((Number(meteorInformations.v_imp)).toFixed(2))}
          unit="Km/s"
        /> }

        {consequences && showImpacts && 
        <div>
          <ResultsPanel consequences={consequences} clicouEmTerra={clicouEmTerra} /> 
          <ComparisonPanel consequences={consequences} />
        </div>
        }
      </div>

      <div className="main-display">
        {/* ... (outros elementos visuais não mudam) */}
        <div className="earth-display">
          <MeteorAnimation setClicouEmTerra={setClicouEmTerra} clicouEmTerra={clicouEmTerra} setShowImpacts={setShowImpacts} radius={Number(consequences?.craterDiameter)} />
        </div>
      </div>
    </div>
  );
}

export default App;