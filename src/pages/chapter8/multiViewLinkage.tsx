import 'ol/ol.css'
import { Map, View } from 'ol'
import { OSM, XYZ, TileImage } from 'ol/source'
import { Tile as TileLayer, WebGLTile } from 'ol/layer'
import { useEffect, useState } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './multiViewLinkage.module.scss'

let canvasMap: Map | null
let domMap: Map | null
let webglMap: Map | null

function detectWebGL() {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  if (gl && gl instanceof WebGLRenderingContext) {
    return true
  }
  return false
}

export default function () {
  const [showNotify, setShowNotify] = useState(true)
  
  useEffect(() => {
    canvasMap = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [
        new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) })
      ],
      view: new View({
        center: [12723048, 3575638],
        zoom: 2,
        minZoom: 2
      }),
      target: 'canvasMap'
    })
    canvasMap.addControl(new Attribution({
      collapsible: true
    }))

    domMap = new Map({
      layers: [new TileLayer({
        source: new XYZ({
          url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=get_your_own_D6rA4zTHduk6KOKTXzGB',
          tileSize: 512,
          maxZoom: 20,
        })
      })],
      view: canvasMap.getView(),
      target: 'domMap'
    })

    setShowNotify(!detectWebGL())
    if (!showNotify) {
      webglMap = new Map({
        layers: [new WebGLTile({
          source: new TileImage({
            url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=get_your_own_D6rA4zTHduk6KOKTXzGB',
            attributions: ['<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ',
              '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>']
          })
        })],
        view: canvasMap.getView(),
        target: 'WebglMap'
      })
    }
  }, [])

  return (
    <ul className={styles['map-list']}>
      <li className={styles['container']}>
        <label>Canvas</label>
        <div id="canvasMap" className={styles['map']}></div>
      </li>
      <li className={styles['container']}>
        <label>DOM</label>
        <div id="domMap" className={styles['map']}></div>
      </li>
      <li className={styles['container']}>
        <label>WebGL </label>
        <div id="WebglMap" className={styles['map']}>
          {
            showNotify ?
              <div className='alert alert-error'>
                This map requires a browser that supports
                <a href="http://get.webgl.org/">WebGL</a>
              </div> : <></>
          }
        </div>
      </li>
    </ul>
  )
}