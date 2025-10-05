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
        scaleDescription = "um evento com potencial para causar alterações climáticas regionais a continentais.";
        effects = [
            { title: "Ejeção de Aerossóis", text: "Grande quantidade de poeira e aerossóis de enxofre são lançados na estratosfera, afetando o clima local e regional." },
            { title: "Resfriamento Regional", text: "A luz solar é parcialmente bloqueada em uma vasta área, podendo causar uma queda de temperatura de alguns graus por meses." },
            { title: "Chuvas Ácidas", text: "A vaporização de rochas ricas em enxofre pode levar à formação de chuvas ácidas, prejudicando a vegetação e ecossistemas aquáticos." },
        ];
    } else if (energyInMegatons >= 1000 && energyInMegatons < 100000) {
        scaleDescription = "um evento com potencial para desencadear um 'Inverno de Impacto' global.";
         effects = [
            { title: "Ejeção Massiva de Poeira", text: "Trilhões de toneladas de rocha pulverizada são lançadas na estratosfera, formando uma camada que envolve o planeta." },
            { title: "Bloqueio Solar Global", text: "A camada de detritos bloqueia a maior parte da luz solar por meses, talvez anos, resultando em escuridão e frio intensos." },
            { title: "Colapso da Fotossíntese", text: "A escuridão prolongada leva à morte em massa de plantas e plâncton, quebrando a base da maioria das cadeias alimentares." },
            { title: "Queda Drástica de Temperatura", text: "As temperaturas globais caem drasticamente, podendo iniciar uma era do gelo repentina e dizimar espécies não adaptadas." },
        ];
    } else { // >= 100,000 MT
        scaleDescription = "um evento de extinção em massa, com consequências geológicas catastróficas.";
        effects = [
            { title: "Inverno de Impacto Severo", text: "Escuridão e frio extremos por vários anos, levando a um colapso quase total dos ecossistemas terrestres e marinhos." },
            { title: "Incêndios Globais", text: "Material ejetado reentrando na atmosfera aquece o ar a ponto de causar incêndios em florestas por todo o planeta." },
            { title: "Mega-Tsunamis e Terremotos", text: "O impacto desencadeia terremotos de magnitude superior ou igual a 8 e tsunamis com centenas de metros de altura que varrem continentes." },
            { title: "Alteração da Química Oceânica", text: "Chuvas extremamente ácidas e a deposição de metais pesados alteram a química dos oceanos, causando outra onda de extinções marinhas." },
        ];
    }

    return (
        <div className="long-term-effects-panel">
            <h3>Efeitos Globais do Impacto a Longo Prazo</h3>
            <p>
                Com uma energia de <strong>{energyInMegatons.toFixed(2)} megatoneladas de TNT</strong>, o impacto é considerado {scaleDescription} e pode desencadear os seguintes efeitos:
            </p>
            <div className="effects-column">
                <div className="effects-header meteor-header">
                    <h4><i className="fas fa-globe-americas"></i> Consequências Climáticas e Geológicas</h4>
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
    name: "Tunguska (1908, Rússia)",
    type: "Explosão Aérea",
    craterDiameter: 0,
    tsunamiHeight: 0,
    epicenter: 5.0,
    energy: 15, // Megatons
    description: "Explosão aérea de ~15 MT que devastou 2.000 km² de floresta."
  },
  {
    name: "Chicxulub (≈66 milhões de anos)",
    type: "Impacto Terrestre",
    craterDiameter: 180000, // Corrigido para 180km em metros
    tsunamiHeight: 100,
    epicenter: 12,
    energy: 100000000, // 100 Milhões de Megatons
    description: "Meteoro que causou a extinção dos dinossauros, com energia de 100 milhões de megatoneladas."
  },
  {
    name: "Bomba Tsar (1961, URSS)",
    type: "Explosão Nuclear",
    craterDiameter: 0,
    tsunamiHeight: 0,
    epicenter: 7.1,
    energy: 50, // 50 Megatons
    description: "A mais potente bomba nuclear já detonada, com poder destrutivo de 50 megatoneladas."
  },
  {
    name: "Terremoto de Sumatra (2004)",
    type: "Terremoto/Tsunami",
    craterDiameter: 0,
    tsunamiHeight: 30,
    epicenter: 9.1,
    energy: 23000, // Energia sísmica equivalente
    description: "Terremoto submarino que gerou tsunami devastador no Oceano Índico."
  },
  {
    name: "Terremoto de Kobe (1995, Japão)",
    type: "Terrestre",
    craterDiameter: 0,
    tsunamiHeight: 0,
    epicenter: 7.3,
    energy: 2,
    description: "Terremoto de magnitude 7.3 que devastou a cidade de Kobe, no Japão."
  },
  {
    name: "Impacto de Chelyabinsk (2013, Rússia)",
    type: "Explosão Aérea",
    craterDiameter: 0,
    tsunamiHeight: 0,
    epicenter: 2.0,
    energy: 0.5, // 500 Kilotons
    description: "Meteoro que explodiu com energia de ~0.5 MT, causando danos e ferimentos."
  },
  {
    name: "Terremoto de Valdivia (1960, Chile)",
    type: "Terrestre/Tsunami",
    craterDiameter: 0,
    tsunamiHeight: 25,
    epicenter: 9.5,
    energy: 200000, // Energia sísmica equivalente
    description: "Maior terremoto registrado, liberando energia equivalente a 200.000 megatoneladas."
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
      <h3>Comparativo com Eventos Históricos Semelhantes</h3>
      <ul>
        {similarEvents.map((event, i) => (
          <li key={i} className="historical-event">
            <strong>{event.name}</strong> - {event.description}
            <div>
              {event.energy > 0 && (
                <span>Energia: {event.energy} MT | </span>
              )}
              {event.craterDiameter > 0 && (
                <span>Cratera: {event.craterDiameter} m | </span>
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

const ResultsPanel: React.FC<ResultsPanelProps> = ({ consequences, clicouEmTerra }) => {
  return (
    <div className="results-panel">
      <h3>Consequências do Impacto</h3>
      <div className="result-item energy-item">
        <span className="result-label">Energia Liberada (Megatoneladas de TNT):</span>
        <span className="result-value">{Number(consequences.energy).toFixed(2)} </span>
      </div>
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
          <div className="logo">ASTROIMPACTS</div>
          <div className="subtitle">Sistema de Simulação de Impactos de Asteróides</div>
        </div>
        <div className="introduction">
          <h2>Bem-vindo ao ASTROIMPACTS</h2>
          <p>Esta aplicação simula as consequências de impactos de asteroides monitorados pelo <strong>Centro Sentry da NASA</strong>. Explore os dados, selecione um meteoro e veja os resultados do impacto em terra ou no mar, comparando-os com eventos históricos e entendendo seus efeitos a longo prazo.</p>
        </div>

        <h3 className="h3-meteor">Meteoros Detectados</h3>
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

        { meteorInformations && 
        <ControlSlider
          label="Energia de Impacto Potencial"
          value={Number(Number(meteorInformations.energy).toFixed(2))}
          unit="Megatoneladas"
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

