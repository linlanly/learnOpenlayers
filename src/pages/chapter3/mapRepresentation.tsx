import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect, useState } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl} from 'ol/control/defaults'
  let map: Map | null
export default function () {
  let [value, setValue] = useState(0)
  let isFirst = true, otherValue = 1, secondValue = 4
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
    otherValue = 3
  }, [])
  return (
    <div id="map"></div>
  )
}