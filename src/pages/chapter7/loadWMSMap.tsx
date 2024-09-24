import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect, ChangeEvent } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './loadWMTSMap.module.scss'
import { Image as ImageLayer } from 'ol/layer'
import { ImageWMS, TileWMS } from 'ol/source'
import { get } from 'ol/proj'
import { getWidth } from 'ol/extent'
import { TileGrid } from 'ol/tilegrid'

let map: Map | null

function changeWMS(data: ChangeEvent<HTMLInputElement>) {
  let value = data.target.value
  loadWMSMap(value)
}

let wmsLayer:ImageLayer<ImageWMS> | TileLayer<TileWMS> | null

function loadWMSMap(type: string) {
  if (wmsLayer && map) {
    map.removeLayer(wmsLayer)
  }
  switch (type) {
    case 'img':
      wmsLayer = new ImageLayer({
        extent: [-13884991, 2870341, -7455066, 6338219],
        source: new ImageWMS({
          url: 'https://ahocevar.com/geoserver/wms',
          params: {
            'LAYERS': 'topp:states'
          },
          serverType: 'geoserver'
        })
      })
      break;
    case 'tile':
      wmsLayer = new TileLayer({
        source: new TileWMS({
          url: 'https://ahocevar.com/geoserver/ne/wms',
          params: {
            'LAYERS': 'ne:ne_10m_admin_0_countries',
            'TILED': true
          },
          serverType: 'geoserver'
        })
      })
      break;
    case 'tilegrid':
      const projExtent = get('EPSG:3857')!.getExtent()
      const startResolution = getWidth(projExtent) / 256
      let length = 22
      const resolutions = new Array(length)
      for (let i = 0; i < length; i++) {
        resolutions[i] = startResolution / Math.pow(2, i)
      }
      const tileGrid = new TileGrid({
        extent: [-13884991, 2870341, -7455066, 6338219],
        resolutions,
        tileSize: [512, 256]
      })
      wmsLayer = new TileLayer({
        source: new TileWMS({
          url: 'https://ahocevar.com/geoserver/wms',
          params: {
            'LAYERS': 'topp:states',
            'TILED': true
          },
          serverType: 'geoserver',
          tileGrid
        })
      })
      break;
    default:
      break;
  }
  map?.addLayer(wmsLayer!)
}

let typeList = [
  {
    label: 'image WMS',
    value: 'img'
  },
  {
    label: 'tiled WMS',
    value: 'tile'
  },
  {
    label: 'tile grid 512*256 WMS',
    value: 'tilegrid'
  }
]
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
        center: [0, 0],
        zoom: 1
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
  }, [])
  return (
    <div id="map" className={styles['map-box']}>
      <ul className={styles['menu']}>
        {
          typeList.map(item =>
            <li key={item.value}>
              <label htmlFor="">
                <input type="radio" name="maps" value={item.value} onChange={changeWMS} />{item.label}
              </label>
            </li>)
        }
      </ul>
    </div>
  )
}