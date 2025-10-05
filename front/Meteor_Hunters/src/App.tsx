// src/App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import './App.css'; // O CSS não muda
import axios from "axios";
import type { meteor, consequences } from "./interface/interfaces"

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
  results: Results;
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
const ResultsPanel: React.FC<ResultsPanelProps> = ({ results }) => {
  return (
    <div className="results-panel">
      <div className="result-item">
        <span className="result-label">Energia de Impacto:</span>
        <span className="result-value">{results.impactEnergy}</span>
      </div>
      <div className="result-item">
        <span className="result-label">Diâmetro da Cratera:</span>
        <span className="result-value">{results.craterDiameter}</span>
      </div>
      <div className="result-item">
        <span className="result-label">Status da Deflexão:</span>
        <span className="result-value">{results.deflectionStatus}</span>
      </div>
      <div className="result-item">
        <span className="result-label">Distância de Desvio:</span>
        <span className="result-value">{results.missDistance}</span>
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

  const calculateTrajectory = useCallback(() => {
    setIsSimulating(false);

    const mass = Math.pow(diameter / 100, 3) * 2000;
    const energy = 0.5 * mass * Math.pow(velocity * 1000, 2) / 1e15;
    const craterDiameter = Math.pow(energy, 0.25) * 50;
    const deflected = deflection >= 1.5;
    const missDistance = deflected ? deflection * 10000 : 0;

    setResults({
      impactEnergy: `${energy.toFixed(2)} TJ`,
      craterDiameter: `${craterDiameter.toFixed(0)} metros`,
      deflectionStatus: deflected ? 'SUCESSO' : 'FALHA',
      missDistance: `${missDistance.toFixed(0)} km`,
    });

    let newThreat: Threat;
    if (energy > 100) newThreat = { level: 'CRÍTICO', color: '#ff4444' };
    else if (energy > 10) newThreat = { level: 'ALTO', color: '#ffa500' };
    else if (energy > 1) newThreat = { level: 'MODERADO', color: '#ffff00' };
    else newThreat = { level: 'BAIXO', color: '#00ff88' };
    setThreat(newThreat);
    
    setIsDeflected(deflected);

    setTimeout(() => {
        setIsSimulating(true);
    }, 100);
  }, [diameter, velocity, deflection]);

  const fetchMeteors = async () => {

    try {
      const response = await axios.get("http://localhost:5000/api/allmeteors");
      console.log(response.data.data);
      setMeteors(response.data.data);
      console.log(response.data);
    } catch (error) {
      console.error("Erro ao buscar meteoros:", error);
    }
  };


  const handleClick = (meteor: meteor) => {
      console.log("Meteor selecionado:", meteor);
      
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
          <div className="logo">🛡️ ASTROGUARD</div>
          <div className="subtitle">Sistema de Deflexão de Asteroides</div>
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

        <button className="calculate-btn" onClick={calculateTrajectory}>
          🚀 CALCULAR TRAJETÓRIA
        </button>

        {results && <ResultsPanel results={results} />}
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
          <div className="earth-map">
            <div className="continent continent-1"></div>
            <div className="continent continent-2"></div>
            <div className="continent continent-3"></div>
          </div>
          
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
                ✅ DEFLEXÃO BEM-SUCEDIDA - TERRA PROTEGIDA
            </div>
        )}
      </div>
    </div>
  );
}

export default App;