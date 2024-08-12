import 'ol/ol.css'
import { Feature, Map, View } from 'ol'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { useEffect, ChangeEvent } from "react"

import { Attribution } from 'ol/control'
import { defaults as defaultsControl } from 'ol/control/defaults'
import { GPX, GeoJSON, KML } from 'ol/format'
import { Circle, Style, Stroke, Fill } from 'ol/style'
import { FeatureLike } from 'ol/Feature'

import styles from './loadBasicMaps.module.scss'
import { Geometry } from 'ol/geom'

let map: Map | null
let vectorLayer: VectorLayer<Feature> | null

function changeMapType(data: ChangeEvent<HTMLSelectElement>) {
  loadArcGISMap(data.target.value)
}

function loadArcGISMap(type: string) {
  let dataurl, center, zoom, formatType
  if (!map) return;
  switch (type) {
    case 'geojson':
      dataurl = 'src/assets/json/geojson.json'
      center = [0, 0]
      zoom = 2
      formatType = new GeoJSON()
      break;
    case 'kml':
      dataurl = 'src/assets/kml/2012-02-10.kml'
      center = [839429.8463461736, 5860255.853963373]
      zoom = 10
      formatType = new KML()
      break;
    case 'gpx':
      dataurl = 'src/assets/gpx/fells_loop.gpx'
      center = [-7916041.528716288, 5228379.045749711]
      zoom = 12
      formatType = new GPX()
      break;
  }
  if (dataurl && formatType) {
    loadVectData(dataurl, formatType)
    const view = map.getView()
    view.setCenter(center)
    view.setZoom(zoom as number)
  }
}

function loadVectData(dataUrl: string, formatType: GPX | KML | GeoJSON) {
  if (!map) return;
  if (vectorLayer !== null) {
    map.removeLayer(vectorLayer)
  }
  const vectorSource = new VectorSource({
    url: dataUrl,
    format: formatType
  })
  vectorLayer = new VectorLayer({
    source: vectorSource,
    style: styleFunction
  })
  map.addLayer(vectorLayer)
}

function styleFunction(feature: FeatureLike) {
  const image = new Circle({
    radius: 5,
    fill: undefined,
    stroke: new Stroke({
      color: 'red',
      width: 1
    })
  })

  type styleInfo = {
    [key: string]: Array<Style>,
  }
  const styles: styleInfo = {
    'Point': [new Style({
      image
    })],
    'LineString': [new Style({
      stroke: new Stroke({
        color: 'green',
        width: 1
      })
    })],
    'MultiLineString': [new Style({
      stroke: new Stroke({
        color: 'green',
        width: 1
      })
    })],
    'MultiPoint': [new Style({
      image
    })],
    'MultiPolygon': [new Style({
      stroke: new Stroke({
        color: 'yellow',
        width: 1
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 0, .1)'
      })
    })],
    'Polygon': [new Style({
      stroke: new Stroke({
        color: 'blue',
        lineDash: [4],
        width: 3
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 255, 0.1)'
      })
    })],
    'GeometryCollection': [new Style({
      stroke: new Stroke({
        color: 'magenta',
        width: 2
      }),
      fill: new Fill({
        color: 'magenta'
      }),
      image: new Circle({
        radius: 10,
        fill: undefined,
        stroke: new Stroke({
          color: 'magenta'
        })
      })
    })],
    'Circle': [new Style({
      stroke: new Stroke({
        color: 'red',
        width: 2
      }),
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.2)'
      })
    })]
  }

  if (!feature) {
    return undefined
  }
  const geometry = feature.getGeometry()
  if (!geometry) {
    return undefined
  }
  const geometryInfo = geometry as Geometry
  return styles[geometryInfo.getType()]
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
        center: [0, 0],
        zoom: 1
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
    loadArcGISMap('geojson')
  })
  return (
    <div id="map" className={styles['map-box']}>
      <div className={styles['menu']}>
        <label className={styles['checkbox']} htmlFor="dataType">请选择加载的数据类型</label>
        <select name='dataType' onChange={changeMapType}>
          <option value="geojson">geojson</option>
          <option value="kml">kml</option>
          <option value="gpx">gpx</option>
        </select>
      </div>
    </div>
  )
}