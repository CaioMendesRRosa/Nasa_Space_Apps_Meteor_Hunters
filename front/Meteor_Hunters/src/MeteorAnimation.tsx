import { useState, useRef, useEffect } from "react";
import { Viewer, Entity } from "resium";
import { Cartesian3, Color, Math as CesiumMath, Matrix4, Ion } from "cesium";
import { createWorldImageryAsync, IonResource, IonImageryProvider, SceneMode, IonWorldImageryStyle   } from "cesium";
import { sampleTerrainMostDetailed, createWorldTerrainAsync, Cartographic } from "cesium";

interface MeteorAnimationProps {
  radius: number, // usa 'number' (com n minúsculo), não 'Number'
  setShowImpacts: React.Dispatch<React.SetStateAction<Boolean>>;
}

export default function MeteorAnimation({ radius, setShowImpacts }: MeteorAnimationProps) {
  const [impactPosition, setImpactPosition] = useState<Cartesian3 | null>(null);
  const [craterSize, setCraterSize] = useState<number>(5000);
  const viewerRef = useRef<any>(null);
  const key = import.meta.env.VITE_cesium_Key;

  useEffect(() => {
  Ion.defaultAccessToken = key;

  (async () => {
    const imageryProvider = await createWorldImageryAsync({
      style: IonWorldImageryStyle.AERIAL_WITH_LABELS,
    });

    viewerRef.current?.cesiumElement.imageryLayers.removeAll();
    viewerRef.current?.cesiumElement.imageryLayers.addImageryProvider(imageryProvider);
  })();
}, []);

  useEffect(() => {
    Ion.defaultAccessToken = key;
  }, []);

  const handleClick = async (e: any) => {

    if (!radius) return;

    const viewer = viewerRef.current?.cesiumElement;
    const scene = viewer?.scene;
    if (!scene) return;

    const cartesian = scene.pickPosition(e.position);
    if (!cartesian) return;

    const cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    const lon = CesiumMath.toDegrees(cartographic.longitude);
    const lat = CesiumMath.toDegrees(cartographic.latitude);

    const terrainProvider = await createWorldTerrainAsync();
    const [terrainSample] = await sampleTerrainMostDetailed(terrainProvider, [
      new Cartographic(cartographic.longitude, cartographic.latitude),
    ]);
    const terrainHeight = terrainSample.height ?? 0;

    const isWater = terrainHeight < 0; 

    console.log(isWater)

    // --- Cratera ---
    const position = Cartesian3.fromDegrees(lon, lat, 0);
    const size = Math.floor(radius/2);

    setShowImpacts(true);

    setImpactPosition(position);
    setCraterSize(size);

    const cameraDistance = size * 5;
    const duration = Math.min(Math.max(size * 0.0004, 2), 6);

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(lon, lat, cameraDistance),
      orientation: {
        direction: Cartesian3.normalize(
          Cartesian3.subtract(position, Cartesian3.fromDegrees(lon, lat, cameraDistance), new Cartesian3()),
          new Cartesian3()
        ),
        up: Cartesian3.UNIT_Z,
      },
      duration,
      complete: () => {
        viewer.camera.lookAtTransform(Matrix4.IDENTITY); // volta ao controle normal
      },
    });
  };

  return (
    <Viewer
      full
      ref={viewerRef}
      onClick={handleClick}
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
      creditsDisplay={false} // remove logo do Cesium corretamente
    >
      {impactPosition && (
        <>
          <Entity
            name="Cratera"
            position={impactPosition}
            ellipse={{
              semiMinorAxis: craterSize,
              semiMajorAxis: craterSize,
              material: Color.RED.withAlpha(0.4),
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
