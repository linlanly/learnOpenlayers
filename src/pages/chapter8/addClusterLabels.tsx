import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'
import { Cluster, Vector as VectorSource } from 'ol/source'

import styles from './addClusterLabels.module.scss'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Fill, Circle, Stroke, Style, Text } from 'ol/style'

let map: Map | null

const count = 10000
const features = new Array(count)

const e = 4500000
for(let i = 0; i < count; ++i) {
  const coordinate = [2 * e * Math.random() - e, 2 * e * Math.random() - e]
  features[i] = new Feature(new Point(coordinate))
}

const source = new VectorSource({
  features
})

const clusterSource = new Cluster({
  distance: 40,
  source
})

type styleCacheInfo = {
  [key: string]: Array<Style>
}
const styleCache: styleCacheInfo = {}
const clusters = new VectorLayer({
  source: clusterSource,
  style: function(feature) {
    const size = feature.get('features').length
    let style = styleCache[size]
    if (!style) {
      style = [new Style({
        image: new Circle({
          radius: 10,
          stroke: new Stroke({
            color: '#fff'
          }),
          fill: new Fill({
            color: '#3399cc'
          })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#fff'
          })
        })
      }),new Style({
        image: new Circle({
          radius: 20,
          stroke: new Stroke({
            color: 'purple'
          }),
          fill: new Fill({
            color: 'yellow'
          })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: 'red'
          })
        })
      })]
      styleCache[size] = style
    }
    return style
  }
})

function addFeatures() {
  const currentFeatures = clusterSource.getSource()?.getFeatures()
  if (currentFeatures?.length === 0) {
    clusterSource.getSource()?.addFeatures(features)
    map?.addLayer(clusters)
  }
}

function removeFeatures() {
  clusterSource.getSource()?.clear()
  map?.removeLayer(clusters)
}

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
        center: [11910000, 3860000],
        zoom: 4
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))

    map.addLayer(clusters)
  }, [])
  return (
    <div id="map" className={styles['map-box']}>
      <div className={styles['menu']}>
        <button onClick={addFeatures}>添加聚合标注</button>
        <button onClick={removeFeatures}>移除聚合标注</button>
      </div>
    </div>
  )
}