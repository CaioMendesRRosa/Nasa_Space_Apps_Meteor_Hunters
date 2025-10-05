import { useState, useRef, useCallback } from "react";
import { Viewer, Entity } from "resium";
import {
  Cartesian3,
  Color,
  Math as CesiumMath,
  Matrix4,
  Ion,
  createWorldImageryAsync,
  IonWorldImageryStyle,
  createWorldTerrainAsync,
  sampleTerrainMostDetailed,
  Viewer as CesiumViewer,
  ColorMaterialProperty,
} from "cesium";
import { Viewer as ResiumViewer } from "resium";
import * as turf from '@turf/turf';
import type { FeatureCollection } from "geojson";

// Tipo 'Boolean' corrigido para 'boolean'
interface MeteorAnimationProps {
  radius: number;
  setShowImpacts: React.Dispatch<React.SetStateAction<boolean>>;
  setClicouEmTerra: React.Dispatch<React.SetStateAction<boolean>>;
  clicouEmTerra: boolean;
}

export default function MeteorAnimation({ radius, setShowImpacts, setClicouEmTerra, clicouEmTerra }: MeteorAnimationProps) {
  const [impactPosition, setImpactPosition] = useState<Cartesian3 | null>(null);
  const [craterSize, setCraterSize] = useState<number>(5000);
  const [isReady, setIsReady] = useState(false);
  const [impactMaterial, setImpactMaterial] = useState(new ColorMaterialProperty(Color.RED.withAlpha(0.4)));

  const viewerRef = useRef<CesiumViewer | null>(null);
  const landGeoJsonRef = useRef<FeatureCollection | null>(null);
  const key = import.meta.env.VITE_cesium_Key;

  const handleRef = useCallback(async (viewerInstance: ResiumViewer | null) => {
    if (viewerInstance && viewerInstance.cesiumElement) {
      const viewer = viewerInstance.cesiumElement;
      viewerRef.current = viewer;

      try {
        Ion.defaultAccessToken = key;

        const [imageryProvider, terrainProvider, landData] = await Promise.all([
          createWorldImageryAsync({ style: IonWorldImageryStyle.AERIAL_WITH_LABELS }),
          createWorldTerrainAsync(),
          fetch('/ne_110m_land.json').then(res => res.json())
        ]);

        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(imageryProvider);
        viewer.terrainProvider = terrainProvider;
        
        landGeoJsonRef.current = landData;
        
        setIsReady(true);
        console.log("Viewer, Terreno e GeoJSON (ne_110m_land.json) prontos!");

      } catch (error) {
        console.error("Falha na configuração do Viewer ou no carregamento do GeoJSON:", error);
      }
    }
  }, []);

  // Função handleClick corrigida com variável local
  const handleClick = async (e: any) => {
    if (!isReady || !radius) return;
    const viewer = viewerRef.current;
    const landGeoJson = landGeoJsonRef.current;
    if (!viewer || !landGeoJson) return;

    const scene = viewer.scene;
    const cartesian = scene.pickPosition(e.position);
    if (!cartesian) return;

    const cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    const lon = CesiumMath.toDegrees(cartographic.longitude);
    const lat = CesiumMath.toDegrees(cartographic.latitude);

    const pontoClicado = turf.point([lon, lat]);
    
    // 1. Usa uma variável local para o resultado imediato
    let isLandClick = false;

    // 2. Atualiza a variável local
    for (const feature of landGeoJson.features) {
      if (turf.booleanPointInPolygon(pontoClicado, feature)) {
        isLandClick = true;
        break;
      }
    }
    
    // 4. Atualiza o estado pai uma única vez com o resultado final
    setClicouEmTerra(isLandClick);

    let position: Cartesian3;
    let elevation = 0;
    const size = Math.floor(radius / 2);

    // 3. Usa a variável local para a lógica condicional
    if (isLandClick) {
      console.log(`Impacto em terra! (Detectado por GeoJSON)`);
      setImpactMaterial(new ColorMaterialProperty(Color.RED.withAlpha(0.4)));

      try {
        const [updatedCartographic] = await sampleTerrainMostDetailed(scene.terrainProvider, [cartographic]);
        elevation = updatedCartographic.height;
      } catch (error) {
        console.error("Erro ao obter a elevação do terreno:", error);
      }
      position = Cartesian3.fromDegrees(lon, lat, elevation);

    } else {
      console.log(`Impacto na água! (Detectado por GeoJSON)`);
      setImpactMaterial(new ColorMaterialProperty(Color.CYAN.withAlpha(0.5)));
      
      elevation = 0;
      position = Cartesian3.fromDegrees(lon, lat, elevation);
    }

    setShowImpacts(true);
    setImpactPosition(position);
    setCraterSize(size);

    const cameraDistance = size * 5;
    const duration = Math.min(Math.max(size * 0.0004, 2), 6);
    const cameraDestination = Cartesian3.fromDegrees(lon, lat, elevation + cameraDistance);

    viewer.camera.flyTo({
      destination: cameraDestination,
      orientation: {
        direction: Cartesian3.normalize(Cartesian3.subtract(position, cameraDestination, new Cartesian3()), new Cartesian3()),
        up: Cartesian3.UNIT_Z,
      },
      duration,
      complete: () => viewer.camera.lookAtTransform(Matrix4.IDENTITY),
    });
  };

  return (
    <Viewer
      full
      ref={handleRef}
      onClick={handleClick}
      style={{ cursor: isReady ? 'crosshair' : 'wait' }}
      animation={false}
      timeline={false}
      baseLayerPicker={false}
      sceneModePicker={false}
      homeButton={false}
      navigationHelpButton={false}
      infoBox={false}
      selectionIndicator={false}
      skyBox={false}
      skyAtmosphere={false}
      backgroundColor={Color.BLACK}
      geocoder={true}
      creditsDisplay={false}
    >
      {impactPosition && (
        <>
          <Entity
            name="Impacto"
            position={impactPosition}
            ellipse={{
              semiMinorAxis: craterSize,
              semiMajorAxis: craterSize,
              material: impactMaterial,
            }}
          />
          <Entity
            name="Brilho"
            position={impactPosition}
            point={{
              color: Color.YELLOW,
              pixelSize: 15,
              outlineColor: Color.RED,
              outlineWidth: 3,
            }}
          />
        </>
      )}
    </Viewer>
  );
}