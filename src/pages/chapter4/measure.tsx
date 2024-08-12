import 'ol/ol.css'
import { Overlay, Feature, Map, View, MapBrowserEvent } from 'ol'
import { OSM, Vector } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { useEffect, ChangeEvent } from "react"
import styles from './measure.module.scss'

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'
import { Style, Fill, Stroke, Circle } from 'ol/style'
import { Type } from 'ol/geom/Geometry'
import { Polygon, LineString } from 'ol/geom'
import { getArea, getLength, getDistance } from 'ol/sphere'
import { unByKey } from 'ol/Observable'
import { EventsKey } from 'ol/events'
import Draw, { DrawEvent } from 'ol/interaction/Draw'
import { Coordinate } from 'ol/coordinate'
import {transform} from 'ol/proj'

let map: Map | null;
let draw: Draw | null;
let useGeodesic = false
let sketch: Feature | null

const source = new Vector()
const vector = new VectorLayer({
  source,
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2
    })
  })
})


let measureTooltipElement: HTMLElement | null
let measureTooltip: Overlay | null
function createMeasureTooltip() {
  if (measureTooltipElement) {
    (measureTooltipElement.parentNode as HTMLElement).removeChild(measureTooltipElement)
  }
  measureTooltipElement = document.createElement('div')
  measureTooltipElement.className = 'tooltip tooltip-measure'
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  })
  map && map.addOverlay(measureTooltip)
}


let helpTooltipElement: HTMLElement | null
let helpTooltip: Overlay | null
function createHelpTooltip() {
  if (helpTooltipElement) {
    (helpTooltipElement.parentNode as HTMLElement).removeChild(helpTooltipElement)
  }
  helpTooltipElement = document.createElement('div')
  helpTooltipElement.className = 'tooltip hidden'
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  })
  map && map.addOverlay(helpTooltip)
}

function changeMeasureType(event: ChangeEvent) {
  map && draw && map.removeInteraction(draw)
  const targetDoc = event.target
  const value = (targetDoc as HTMLSelectElement).value
  addInteraction(value)
}

function addInteraction(type: string) {
  let styleType = type === 'area' ? 'Polygon' : 'LineString'
  draw = new Draw({
    source,
    type: styleType as Type,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2
      }),
      image: new Circle({
        radius: 5,
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.7)'
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        })
      })
    })
  })
  map && map.addInteraction(draw)

  createMeasureTooltip()
  createHelpTooltip()

  let listener: EventsKey | null;
  draw.on('drawstart', (event: DrawEvent) => {
    sketch = event.feature
    let tooltipCoord: Coordinate | null
    let geometry = sketch.getGeometry()
    if (geometry) {
      listener = geometry.on('change', (gevent) => {
        const geom = gevent.target
        let output
        if (geom instanceof Polygon) {
          output = formatArea(geom)
          tooltipCoord = geom.getInteriorPoint().getCoordinates()
        } else if (geom instanceof LineString) {
          output = formatLength(geom)
          tooltipCoord = geom.getLastCoordinate()
        }
        if (measureTooltipElement) {
          measureTooltipElement.innerHTML = output || ''
        }
        measureTooltip && measureTooltip.setPosition(tooltipCoord as Coordinate)
      })
    }
  })
  draw.on('drawend', () => {
    if (measureTooltipElement) {
      measureTooltipElement.className = 'tooltip tooltip-static'
    }

    measureTooltip && measureTooltip.setOffset([0, -7])
    sketch = null
    measureTooltipElement = null
    createMeasureTooltip()
    listener && unByKey(listener)
  })
}

let continuePolygonMsg = 'Click to continue drawing the polygon'
let continueLineMsg = 'Click to continue drawing the line'
function pointerMoveHandler(event: MapBrowserEvent<UIEvent>) {
  if (event.dragging) {
    return;
  }
  let helpMsg = 'Click to start drawing'
  if (sketch) {
    const geom = sketch.getGeometry()
    if (geom instanceof Polygon) {
      helpMsg = continuePolygonMsg
    } else if (geom instanceof LineString) {
      helpMsg = continueLineMsg
    }
  }
  if (helpTooltipElement) {
    helpTooltipElement.innerHTML = helpMsg
  }

  helpTooltip && helpTooltip.setPosition(event.coordinate)
}

function formatLength(line: LineString) {
  let length
  if (useGeodesic) {
    const sourceProj = (map as Map).getView().getProjection()

    // length = 0
    // const coordinates = line.getCoordinates()
    // for(let i = 0, ii = coordinates.length - 1; i < ii; ++i) {
    //   const c1 = transform(coordinates[i], sourceProj, 'EPSG:4326')
    //   const c2 = transform(coordinates[i + 1], sourceProj, 'EPSG:4326')
    //   length += getDistance(c1, c2)
    // }

    const geom = line.clone().transform(sourceProj, 'EPSG:4326')
    length = getLength(geom, { radius: 6378137, projection: 'EPSG:4326' })
  } else {
    length = getLength(line)
  }
  let output
  if (length > 100) {
    output = Math.round(length * 100 / 1000) / 100 + '  ' + 'km'
  } else {
    output = Math.round(length * 100) / 100 + '  ' + 'm'
  }
  return output
}


function formatArea(polygon: Polygon) {
  let area = getArea(polygon)
  if (useGeodesic) {
    const sourceProj = (map as Map).getView().getProjection()
    const geom = polygon.clone().transform(sourceProj, 'EPSG:4326')
    area = getArea(geom, { radius: 6378137, projection: 'EPSG:4326' })
  } else {
    area = getArea(polygon)
  }
  let output
  if (area > 100000) {
    output = Math.round(area * 100 / 1000000) / 100 + '  ' + 'km<sup>2</sup>'
  } else {
    output = Math.round(area * 100) / 100 + '  ' + 'm<sup>2</sup>'
  }
  return output
}


export default function () {
  const isFirst = true
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [
        new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) })
      ],
      view: new View({
        center: [12000000, 4000000],
        zoom: 8
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))

    map.addLayer(vector)
    map.on('pointermove', pointerMoveHandler)
    addInteraction('length')
  }, [isFirst])
  return (
    <div id="map" className={styles['map-box']}>
      <div className={styles['menu']}>
        <label>Geometry type &nbsp;</label>
        <select id="type" onChange={(data) => changeMeasureType(data)}>
          <option value="length">Length</option>
          <option value="area">Area</option>
        </select>
        <label className={styles['checkbox']}>
          <input type='checkbox' id="geodesic" onChange={() => { useGeodesic = !useGeodesic }} /> use geodesic measures
        </label>
      </div>
    </div>
  )
}