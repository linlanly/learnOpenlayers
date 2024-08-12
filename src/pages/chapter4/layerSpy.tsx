import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import { BingMaps, OSM, XYZ } from 'ol/source'
import TileLayer from 'ol/layer/Tile'
import { useEffect } from "react"

import { fromLonLat } from 'ol/proj'
import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'
import { Pixel } from 'ol/pixel'

const key = 'AlEoTLTlzFB6Uf4Sy-ugXcRO21skQO7K8eObA5_L-8d20rjqZJLs2nkO1RMjGSPN'
// const roads = new TileLayer({ preload: Infinity, source: new BingMaps({ key, imagerySet: 'RoadOnDemand' }) })
// const imagery = new TileLayer({ preload: Infinity, source: new BingMaps({ key, imagerySet: 'Aerial' }) })

const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
const roads = new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) })
const imagery = new TileLayer({
  source: new XYZ({
    attributions,
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=get_your_own_D6rA4zTHduk6KOKTXzGB',
    tileSize: 512,
    maxZoom: 20,
  })
})

const styles = [
  'RoadOnDemand',
  'Aerial',
  'AerialWithLabelsOnDemand',
  'CanvasDark',
  'OrdnanceSurvey',
]

const layers = styles.map(type => new TileLayer({
  visible: true,
  preload: Infinity,
  source: new BingMaps({
    key,
    imagerySet: type
  })
}))

let map: Map | null;
let radius = 75
window.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowUp') {
    radius = Math.min(radius + 5, 150)
    map && map.render()
  } else if (event.key === 'ArrowDown') {
    radius = Math.max(radius - 5, 25)
    map && map.render()
  }
})
let mousePosition: Pixel | undefined
export default function () {
  const isFirst = true
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [roads, imagery],
      view: new View({
        center: fromLonLat([-109, 46.5]),
        zoom: 6,
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
    map.on('pointermove', event => {
      mousePosition = map?.getEventPixel(event.originalEvent)
      map?.render()
    })

    const mapDoc = document.getElementById('map')
    mapDoc?.addEventListener('mouseleave', () => {
      mousePosition = undefined
      map?.render()
    })

    imagery.on('prerender', event => {
      const ctx = event.context
      const context = ctx as CanvasRenderingContext2D
      const pixelRatio = event.frameState?.pixelRatio || 0
      context.save()
      context.beginPath()
      if (mousePosition) {
        context.arc(mousePosition[0] * pixelRatio, mousePosition[1] * pixelRatio, radius * pixelRatio, 0, 2 * Math.PI)
        context.lineWidth = 5 * pixelRatio
        context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
        context.stroke()
      }
      context.clip()
    })
    imagery.on('postrender', event => {
      const ctx = event.context
      const context = ctx as CanvasRenderingContext2D
      context.restore()
    })
  }, [isFirst])
  return (
    <div id="map"></div>
  )
}