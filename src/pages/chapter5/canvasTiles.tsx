import 'ol/ol.css'
import { Map, View } from 'ol'
import { OSM, TileDebug } from 'ol/source'
import { Tile as TileLayer } from 'ol/layer'
import { useEffect } from "react"

import { Attribution } from 'ol/control'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './loadBasicMaps.module.scss'

let map: Map | null
let osmSource = new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' })

export default function () {
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [
        new TileLayer({ source: osmSource }),
        new TileLayer({ source: new TileDebug({ projection: 'EPSG:3857', tileGrid: osmSource.getTileGrid()! }) })
      ],
      view: new View({
        center: [12900000, 4900000],
        zoom: 8
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
  })
  return (
    <div id="map" className={styles['map-box']}>
    </div>
  )
}