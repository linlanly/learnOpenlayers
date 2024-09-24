import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'
import { get, ProjectionLike } from 'ol/proj'
import { getTopLeft, getWidth } from 'ol/extent'
import { WMTS as WMTSSource } from 'ol/source'
import { WMTS as WMTSTileGrid } from 'ol/tilegrid'

import styles from './loadWMTSMap.module.scss'

let map: Map | null

const projection = get('EPSG:3857')
const projectionExtent = projection!.getExtent()
const size = getWidth(projectionExtent) / 256
const length = 14
const resolutions = new Array(length)
const matrixIds = new Array(length)
for(let  i = 0; i < length; i++) {
  resolutions[i] = size / Math.pow(2, i)
  matrixIds[i] = i
}
const projectionLike = projection as ProjectionLike
const attribution = `Tiles © <a href="https://mrdata.usgs.gov/geology/state/" target="_blank">USGS</a>`
let wmtsLayer: TileLayer<WMTSSource> = new TileLayer({
  opacity: .7,
  source: new WMTSSource({
    attributions: attribution,
    // url: 'https://mrdata.usgs.gov/mapcache/wmts',
    url: 'http://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_Density/MapServer/WMTS/',
    // matrixSet: 'GoogleMapsCompatible',
    matrixSet: 'EPSG:3857',
    format: 'image/png',
    projection: projectionLike,
    tileGrid: new WMTSTileGrid({
      origin: getTopLeft(projectionExtent),
      resolutions,
      matrixIds
    }),
    layer: '',
    style: 'default',
    wrapX: true
  })
})
let addedWMTSLayer = false
function addOrRemoveWMTSLayer() {
  if (!map) return;
  if (addedWMTSLayer) {
    map.removeLayer(wmtsLayer)
  } else {
    map.addLayer(wmtsLayer)
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
        center: [0, 0],
        zoom: 1
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
            <input type="checkbox" name="maps" onChange={addOrRemoveWMTSLayer} />arcgisonline WMTS
          </label>
        </li>
      </ul>
    </div>
  )
}