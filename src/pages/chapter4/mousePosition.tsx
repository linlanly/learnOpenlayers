import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect } from "react"
import styles from './mousePosition.module.scss'

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'
import MousePosition from 'ol/control/MousePosition'
import { format, createStringXY } from 'ol/coordinate'

export default function () {
  const isFirst = true
  useEffect(() => {
    const mousePositionControl = new MousePosition({
      coordinateFormat: function(coordiante) {
        return coordiante ? format(coordiante, '{x} {y}', 4) : '鼠标位置坐标'
      },
      projection: 'EPSG:4326',
      className: 'custom-mouse-position',
      target: 'mouse-position',
      placeholder: `&nbsp;
        <span style="color:purple">hihi</span>
        <br />
        <input type="radio" />openlayers`
    })
    const map = new Map({
      controls: defaultsControl({
        attribution: false
      }).extend([mousePositionControl]),
      layers: [
        new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) })
      ],
      view: new View({
        center: [12000000, 4000000],
        zoom: 8
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))

  }, [isFirst])
  return (
    <div id="map" className={styles['map-box']}>
      <div id="mouse-position" className={styles['position-info'] + ' test-mouse-position'}></div>
    </div>
  )
}