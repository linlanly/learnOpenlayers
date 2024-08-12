import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'
import ScaleLine from 'ol/control/ScaleLine'

export default function () {
  const isFirst = true
  useEffect(() => {
    const saleLineControl = new ScaleLine({
      units: 'metric'
    })
    const map = new Map({
      controls: defaultsControl({
        attribution: false
      }).extend([saleLineControl]),
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

  }, [isFirst])
  return (
    <div id="map"></div>
  )
}