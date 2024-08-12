import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect } from "react"
import styles from './overviewMap.module.scss'

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'
import OverviewMap from 'ol/control/OverviewMap'

export default function () {
  const isFirst = true
  useEffect(() => {
    const overviewMapControl = new OverviewMap({
      className: 'ol-overviewmap ol-custom-overviewmap',
      layers: [
        new TileLayer({
          source: new OSM({
            url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
          })
        })
      ],
      collapsed: false,
      collapseLabel: '\u00BB',
      label: '\u00AB'
    })
    const map = new Map({
      controls: defaultsControl({
        attribution: false
      }).extend([overviewMapControl]),
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
    <div id="map" className={styles['map-box']}></div>
  )
}