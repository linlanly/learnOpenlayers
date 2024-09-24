import 'ol/ol.css'
import {Map, Graticule, View} from 'ol'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'
import { Vector as VectorSource } from 'ol/source'


import MousePosition from 'ol/control/MousePosition'
import { format } from 'ol/coordinate'

import styles from './projectionTransformation.module.scss'
import { Vector as VectorLayer } from 'ol/layer'
import { TopoJSON } from 'ol/format'
import { get, Projection } from 'ol/proj'
import { register } from 'ol/proj/proj4'

import proj4 from 'proj4'

proj4.defs('ESRI:53009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs')
register(proj4)

let map: Map | null

let transformMap: Map | null
const vectorLayer = new VectorLayer({
  source: new VectorSource({
    url: 'src/assets/json/world-countries.json',
    format: new TopoJSON({layers: ['countries']})
  })
})



const sphereMollweideProjection = new Projection({
  code: 'ESRI:53009',
  extent: [-9009954.605703328, -9009954.605703328, 9009954.605703328, 9009954.605703328],
  worldExtent: [-179, -90, 179, 90]
})

function projectionChange() {
  if (!transformMap) {
    const mousePositionControl = new MousePosition({
      coordinateFormat: function(coordiante) {
        return coordiante ? format(coordiante, '{x} {y}', 4) : '鼠标位置坐标'
      },
      projection: 'EPSG:53009',
      className: 'custom-mouse-position',
      target: 'mouse-position',
    })
    transformMap = new Map({
      controls: defaultsControl({
        attribution: false
      }).extend([mousePositionControl]),
      layers: [
        new VectorLayer({
          source: new VectorSource({
            url: 'src/assets/json/world-countries.json',
            format: new TopoJSON({layers: ['countries']})
          })
        }),
        new Graticule()
      ],
      target: 'map2',
      view: new View({
        projection: sphereMollweideProjection,
        resolutions: [65536, 32768, 16384, 8192, 4096, 2048],
        center: [9699311.8182, 4101870.4608],
        zoom: 0
      })
    })
  }
}
export default function () {
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [
        new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) }),
        vectorLayer
      ],
      view: new View({
        projection: get('EPSG: 3857')!,
        resolutions: [65536, 32768, 16384, 8192, 4096, 2048],
        center: [-5000005, 44],
        zoom: 0
      }),
      target: 'map1'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
  }, [])
  return (
    <div className={styles['panel']}>
      <div className={styles['active']}>
        <label className='title' htmlFor='projection'>
          地图投影转换演示：<button id="projection" onClick={projectionChange}>投影转换</button>
        </label>
      </div>
      <ul className={styles['map-list']}>
        
      <li className={styles['container']}>
        <label>投影坐标系（EPSG:3857）</label>
        <div id="map1" className={styles['map']}></div>
      </li>
      <li className={styles['container']}>
        <label>投影坐标系（EPSG:53009）</label>
        <div id="map2" className={styles['map']}></div>
      </li>
      </ul>
    </div>
  )
}