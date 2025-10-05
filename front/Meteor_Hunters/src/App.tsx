// src/App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import './App.css'; // O CSS não muda
import axios from "axios";
import type { meteor, consequences } from "./interface/interfaces"
import MeteorAnimation from "./MeteorAnimation"

// --- Definições de Tipos (TypeScript) ---

// Tipos para as props do componente de slider
interface ControlSliderProps {
  label: string;
  value: Number;
  unit: string;
}

// Tipo para o objeto de resultados
interface Results {
  impactEnergy: string;
  craterDiameter: string;
  deflectionStatus: 'SUCESSO' | 'FALHA';
  missDistance: string;
}

// Tipos para as props do painel de resultados
interface ResultsPanelProps {
  consequences: consequences;
}

// Tipo para o objeto de nível de ameaça
interface Threat {
  level: 'MONITORANDO' | 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRÍTICO';
  color: string;
}


// --- Componentes ---

// Componente para um único controle de slider, agora com props tipadas
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

// Componente para o painel de resultados, com props tipadas
const ResultsPanel: React.FC<ResultsPanelProps> = ({ consequences : consequences }) => {
  return (
    <div className="results-panel">
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
      <div className="result-item">
        <span className="result-label">Altura da onda gerada no impacto (Metros):</span>
        <span className="result-value">{Number(consequences.tsunamiHeight).toFixed(2)}</span>
      </div>
      { Number(consequences.tsunamiHeightFar) > 0.1 &&
      <div className="result-item">
        <span className="result-label">Altura da onda a 50Km (Metros): </span>
        <span className="result-value">{Number(consequences.tsunamiHeightFar).toFixed(2)}</span>
      </div> }
      <div className="result-item">
        <span className="result-label">Magnitude do terremoto (Escala Richter):</span>
        <span className="result-value">{Number(consequences.epicenter).toFixed(2)}</span>
      </div>
    </div>
  );
}

// Componente principal
const App: React.FC = () => {
  // O estado agora é tipado para maior segurança
  const [diameter, setDiameter] = useState<number>(100);
  const [velocity, setVelocity] = useState<number>(20);
  const [deflection, setDeflection] = useState<number>(2.0);
  const [results, setResults] = useState<Results | null>(null);
  const [threat, setThreat] = useState<Threat>({ level: 'MONITORANDO', color: '#ffa500' });
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isDeflected, setIsDeflected] = useState<boolean>(false);
  const [meteors, setMeteors] = useState<meteor[] | undefined>();
  const [meteorSelected, setmeteorSelected] = useState<meteor | undefined>();
  const [meteorInformations, setMeteorInformations] = useState<meteor | undefined>();
  const [consequences, setConsequences] = useState<consequences | undefined>();
  const [impact, setImpact] = useState<Boolean>(false);
  const [showImpacts, setShowImpacts] = useState<Boolean>(false);

  const calculateTrajectory = useCallback(() => {

    setImpact(true);

  }, [diameter, velocity, deflection]);

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
          "energy": meteorInformations.energy
        }
      });

      console.log("abc", response.data);

      setConsequences(response.data);
  }

  useEffect ( () => {
    console.log("cheguei");
    getConsequences();
  }, [meteorInformations])
  
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
    const timer = setTimeout(() => {
      calculateTrajectory();
    }, 1000);
    fetchMeteors();
    return () => clearTimeout(timer);
  }, [calculateTrajectory]);

  return (
    <div className="container">
      <div className="control-panel">
        <div className="header">
          <div className="logo">ASTROIMPACTS</div>
          <div className="subtitle">Sistema de Simulação de Impactos de Asteróides</div>
        </div>

        <div className="meteor-list">
          <h3 className="h3-meteor">Meteoros Detectados</h3>
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
            <div className="meteor-div-selected">
                  {meteorSelected.des}
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

        {consequences && showImpacts && <ResultsPanel consequences={consequences} />}
      </div>

      <div className="main-display">
        <div className="grid-overlay"></div>
        <div className="status-indicator">
          <div className="status-text">Nível de Ameaça</div>
          <div className="threat-level" style={{ color: threat.color }}>
            {threat.level}
          </div>
        </div>

        <div className="earth-display">
          <MeteorAnimation setShowImpacts={setShowImpacts} radius={Number(consequences?.craterDiameter)} />
          
          {isSimulating && (
            <>
              <div className="trajectory-original"></div>
              <div className="impact-point"></div>
              <div className="crater-area"></div>
              {isDeflected && <div className="trajectory-deflected active"></div>}
            </>
          )}
        </div>

        {isSimulating && isDeflected && (
            <div className="mitigation-success show">
              
            </div>
        )}
      </div>
    </div>
  );
}

export default App;