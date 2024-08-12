import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect } from "react"
import styles from './zoomSlider.module.scss'

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl} from 'ol/control/defaults'
import ZoomSlider from 'ol/control/ZoomSlider'
import ZoomToExtent from 'ol/control/ZoomToExtent'
export default function () {
  useEffect(() => {
    const map = new Map({
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
    map.addControl(new ZoomSlider())
    map.addControl(new ZoomToExtent({
      extent: [13100000, 4290000, 13200000, 5210000]
    }))
  })
  return (
    <div id="map" className={styles['zoom-slider-style']}></div>
  )
}