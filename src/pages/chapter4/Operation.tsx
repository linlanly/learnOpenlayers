import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect } from "react"
import styles from './Operation.module.scss'

import { defaults as defaultsControl} from 'ol/control/defaults'
import {fromLonLat} from 'ol/proj'

let map: Map | null;
const currentZoom: number = 8;
const center: Array<number> = [12950000, 4860000]
const rotation: number = Math.PI / 6

function setZoomBefore(data: number) {
  if (map instanceof Map) {
    let currentZoom = map.getView().getZoom() || 1
    map.getView().setZoom(currentZoom + data)
  }
}
function zoomOut() {
  setZoomBefore(-1)
}

function zoomIn() {
  setZoomBefore(1)
}

function panto() {
  if (map instanceof Map) {
    map.getView().setCenter(fromLonLat([114.31667, 30.51667]))
  }
}

function restore() {
  if (map instanceof Map) {
    const view = map.getView()
    view.setCenter(center)
    view.setZoom(currentZoom)
    view.setRotation(rotation)
  }
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
        center: center,
        zoom: currentZoom,
        minZoom: 6,
        maxZoom: 12,
        rotation: rotation
      }),
      target: 'map'
    })
  })
  return (
    <div className={styles['operation-panel']}>
      <div id="map"></div>
      <div className={styles['menu']}>
        <button onClick={zoomOut} title="单击缩小">单击缩小</button>
        <button onClick={zoomIn} title="单击放大">单击放大</button>
        <button onClick={panto} title="平移到【武汉】">平移到【武汉】</button>
        <button onClick={restore} title="复位">复位</button>
      </div>      
    </div>
  )
}