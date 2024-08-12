import 'ol/ol.css'
import { Map, View } from 'ol'
import { OSM, XYZ } from 'ol/source'
import { Tile as TileLayer } from 'ol/layer'
import { useEffect } from "react"

import { Attribution } from 'ol/control'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './mapExport.module.scss'

let map: Map | null
let osmSource = new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' })

function exportMap() {
  let doc = document.getElementById('map')
  if (!doc) return;
  let canvasList = doc.getElementsByTagName('canvas')
  if (canvasList.length < 1) return;
  let canvasDoc = canvasList[0]

  let a = document.createElement('a')
  a.download = 'map.png'
  a.href = canvasDoc.toDataURL('image/png')
  a.click()
}

export default function () {
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [
        new TileLayer({ source: osmSource }),
        new TileLayer({
          source: new XYZ({
            url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=get_your_own_D6rA4zTHduk6KOKTXzGB',
            tileSize: 512,
            maxZoom: 20,
            crossOrigin: 'anonymous'
          })
        })
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
      <button onClick={exportMap}>地图导出</button>
    </div>
  )
}