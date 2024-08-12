import 'ol/ol.css'
import { Feature, Map, View } from 'ol'
import { OSM, TileArcGISRest, XYZ, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { useEffect, ChangeEvent } from "react"

import {Attribution, MousePosition} from 'ol/control'
import { defaults as defaultsControl } from 'ol/control/defaults'
import { EsriJSON } from 'ol/format'
import { tile } from 'ol/loadingstrategy'
import { createXYZ } from 'ol/tilegrid'
import { fromLonLat } from 'ol/proj'

import styles from './loadBasicMaps.module.scss'
import axios from 'axios'
import { createStringXY } from 'ol/coordinate'

let useAricGIS = false
let map: Map | null

let osmLayer = new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) })
let currentArc = 'MapServer'

function changeMapType(data: ChangeEvent<HTMLSelectElement>) {
  currentArc = data.target.value
  loadArcGISMap()
}

function loadArcGISMap() {
  if (!map) return;
  const layers = map.getLayers()
  if (layers !== null) {
    for (let i = 0, length = layers.getLength(); i < length; i++) {
      map.removeLayer(layers.item(i))
    }
  }
  if (!useAricGIS) {
    map.addLayer(osmLayer)
    return
  }

  let arcGISSource: TileArcGISRest | VectorSource | null, arcGISLayers
  switch (currentArc) {
    case "MapServer":
      arcGISSource = new TileArcGISRest({
        url: 'https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/USA/MapServer'
      })
      arcGISLayers = new TileLayer({
        source: arcGISSource,
        extent: [-13884991, 2870341, -7455066, 6338219]
      })
      map.addLayer(arcGISLayers)
      setMapView([-10997148, 4569099], 5)
      break;
    case 'arcgisOnline':
      const attribution = 'Tiles &copy; <a href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/Mapserver">ArcGIS</a>'
      arcGISLayers = new TileLayer({
        source: new XYZ({
          attributions: [attribution],
          url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/Mapserver/tile/{z}/{y}/{x}'
        })
      })
      map.addLayer(arcGISLayers)
      setMapView(fromLonLat([-121.1, 47.5]), 7)
      break;
    case 'RestFeatureService':
      const serviceUrl = 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/FeatureServer/'
      let layer = '0'
      const esrijsonFormat = new EsriJSON()
      arcGISSource = new VectorSource({
        loader: (extent, resolution, projection) => {
          let data = {
            xmin: extent[0],
            ymin: extent[1],
            xmax: extent[2],
            ymax: extent[3],
            spatialReference: {
              wkid: 102100
            }
          }
          let dataStr = JSON.stringify(data)
          const url = serviceUrl +
            layer +
            '/query/?f=json&' +
            'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
            encodeURIComponent(dataStr) +
            '&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*' +
            '&outSR=102100';

          axios.post(url).then(res => {
            if (res.status === 200 && res.data) {
              const features = esrijsonFormat.readFeatures(res.data, {
                featureProjection: projection
              })
              if (arcGISSource && features.length > 0) {
                (arcGISSource as VectorSource).addFeatures(features)
              }
            } else {
              console.error('获取数据失败，请重试')
            }
          })
        },
        strategy: tile(createXYZ({ tileSize: 512 }))
      })
      arcGISLayers = new VectorLayer({
        source: arcGISSource
      })
      map.addLayer(arcGISLayers)
      setMapView(fromLonLat([-121.1, 47.5]), 5)
      break;
  }
}

function setMapView(center: Array<number>, zoom: number) {
  if (!map) return;
  const view = map.getView()
  view.setCenter(center)
  view.setZoom(zoom)
}
export default function () {
  useEffect(() => {
    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326',
      className: 'custom-mouse-position',
      target: 'mouse-position',
    })
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }).extend([mousePositionControl]),
      layers: [],
      view: new View({
        center: [0, 0],
        zoom: 1
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
    loadArcGISMap()
  })
  return (
    <div id="map" className={styles['map-box']}>
      <div className={styles['menu']}>
        <label className='checkbox' htmlFor="maps">
          <input type="checkbox" name="maps" value="arcgis" onChange={() => {
            useAricGIS = !useAricGIS
            loadArcGISMap()
            }} />ArcGIS地图
        </label>
        <select onChange={changeMapType}>
          <option value="MapServer">MapServer在线瓦片数据</option>
          <option value="arcgisOnline">arcgisOnline在线瓦片数据</option>
          <option value="RestFeatureService">ArcGIS REST Feature Service</option>
        </select>
      </div>
      <div id="mouse-position" className={styles['position-info'] + ' test-mouse-position'}></div>
    </div>
  )
}