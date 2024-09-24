import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import {OSM, Vector as VectorSource} from 'ol/source'
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'
import { useEffect } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './loadWMTSMap.module.scss'
import { tile } from 'ol/loadingstrategy'
import { createXYZ } from 'ol/tilegrid'
import { GeoJSON } from 'ol/format'
import { Stroke, Style } from 'ol/style'

let map: Map | null

const geojsonFormat = new GeoJSON()
const vectorSource = new VectorSource({
  format: geojsonFormat,
  url: function(extent) {
    return `https://ahocevar.com/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=osm:water_areas&outputFormat=application/json&srsname=EPSG:3857&bbox=${extent.join(',')},EPSG:3857`
  },
  strategy: tile(createXYZ({
    maxZoom: 19
  }))
})
const wfsLayer = new VectorLayer({
  source: vectorSource,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(0, 0, 255, 1)',
      width: 2
    })
  })
})
let addedWMTSLayer = false
function addOrRemoveWMTSLayer() {
  if (!map) return;
  if (addedWMTSLayer) {
    map.removeLayer(wfsLayer)
  } else {
    map.addLayer(wfsLayer)
  }
  addedWMTSLayer = !addedWMTSLayer
}
export default function () {
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [
        new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) })
      ],
      view: new View({
        center: [-8908887.277395891, 5381918.072437216],
        zoom: 12,
        maxZoom: 19,
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
  }, [])
  return (
    <div id="map" className={styles['map-box']}>
      <ul className={styles['menu']}>
        <li>
          <label htmlFor="">
            <input type="checkbox" name="maps" onChange={addOrRemoveWMTSLayer} />arcgisonline WFS
          </label>
        </li>
      </ul>
    </div>
  )
}