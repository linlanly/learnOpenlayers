import 'ol/ol.css'
import { Feature, Map, View } from 'ol'
import { OSM, Vector as VectorSource, XYZ } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { useEffect } from "react"

import { Attribution } from 'ol/control'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './featuresStyle.module.scss'
import { LineString, Point, Polygon } from 'ol/geom'
import { Circle, Fill, Stroke, Style } from 'ol/style'
import { Select, Modify } from 'ol/interaction'

let map: Map | null

class ModifyObj {
  select: null | Select = null
  modify: null | Modify = null
  init() {
    this.select = new Select()
    map?.addInteraction(this.select)
    this.modify = new Modify({
      features: this.select.getFeatures()
    })
    map?.addInteraction(this.modify)
    this.setEvents()
  }
  setEvents() {
    if (this.select) {
      const selectFeatures = this.select.getFeatures()
      this.select.on('change:active', function () {
        selectFeatures.forEach(selectFeatures.remove)
      })
    }
  }
  setActive(active: boolean) {
    if (this.select) {
      this.select.setActive(active)
    }
    if (this.modify) {
      this.modify.setActive(active)
    }
  }
}
export default function () {

  let osmSource = new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' })

  let pointFeature = new Feature({
    geometry: new Point([0, 0]),
    name: 'Point Feature'
  })
  let lineFeature = new Feature({
    geometry: new LineString([[1e7, 1e6], [1e6, 3e6]]),
    name: 'Line Feature'
  })
  let polygonFeature = new Feature({
    geometry: new Polygon([[[1e6, -1e6], [1e6, 1e6], [3e6, 1e6], [3e6, -1e6], [1e6, -1e6]]]),
    name: 'Polygon Feature'
  })

  let vectorSource = new VectorSource({
    features: [pointFeature, lineFeature, polygonFeature]
  })
  let vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2
      }),
      image: new Circle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33'
        })
      })
    })
  })
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
            maxZoom: 20
          })
        }),
        vectorLayer
      ],
      view: new View({
        center: [0, 0],
        zoom: 3
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))

    const modifyInfo = new ModifyObj()
    modifyInfo.init()
    modifyInfo.setActive(true)
  }, [])
  return (
    <div id="map" className={styles['map-box']}></div>
  )
}