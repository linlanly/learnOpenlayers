import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import GeoJSON from 'ol/format/GeoJSON.js';
import KML from 'ol/format/KML'
import { OSM, Vector as VectorSource, XYZ } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer, Layer } from 'ol/layer.js';

// import geojsonData from '@/assets/json/geojson.json';

import { useEffect, useState } from "react"
import styles from'./layerControl.module.scss'

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'

let map: Map | null;
const currentZoom: number = 8;
const center: Array<number> = [876970.8463461736, 5859807.853963373]

interface layerInfo {
  name: string,
  layer: Layer
}

const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
const layerArr: Array<layerInfo> = [
  {
    name: '世界地图（OSM瓦片)',
    layer: new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) })
  },
  {
    name: '世界地图（XYZ瓦片)',
    layer: new TileLayer({
      source: new XYZ({
        attributions,
        url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=get_your_own_D6rA4zTHduk6KOKTXzGB',
        tileSize: 512,
        maxZoom: 20,
      })
    })
  },
  {
    name: '形状（Json格式矢量图)',
    layer: new VectorLayer({
      source: new VectorSource({
        url: 'src/assets/json/geojson.json',
        format: new GeoJSON()
      })
    })
  },
  {
    name: '形状（KML格式矢量图)',
    layer: new VectorLayer({
      source: new VectorSource({
        url: 'src/assets/kml/2012-02-10.kml',
        format: new KML({
          extractStyles: false
        })
      })
    })
  }
]

const changeVisibleForLayer = (item: layerInfo) => {
  let visible = item.layer.getVisible()
  item.layer.setVisible(!visible)
}

export default function () {
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: layerArr.map(item => item.layer),
      view: new View({
        center: center,
        zoom: currentZoom,
        minZoom: 1,
        maxZoom: 12
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
  }, [])
  const [layersVisible, setLayersVisible] = useState([true, true, true, true])
  const changeVisible = (index: number, data: layerInfo) => {
    const newArr = [...layersVisible]
    newArr[index] = !newArr[index]
    setLayersVisible(newArr)
    changeVisibleForLayer(data)
  }
  return (
    <div className={styles['layer-control-panel']}>
      <div id="map"></div>
      <div className={styles['layer-control']}>
        <div className={styles['title']}>图层列表</div>
        <ul className={styles['layer-tree']}>
          {layerArr.map((item, index) => <li key={item.name}><input type='checkbox' checked={layersVisible[index]} onChange={() => changeVisible(index, item)} /> {item.name}</li>)}
        </ul>
      </div>
    </div>
  )
}