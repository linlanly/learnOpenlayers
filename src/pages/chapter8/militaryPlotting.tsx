import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import { OSM } from 'ol/source'
import { Tile as TileLayer } from 'ol/layer'
import { useEffect } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './militaryPlotting.module.scss'

import olPlot from 'ol-plot'
import 'ol-plot/dist/ol-plot.css'
import { transform } from 'ol/proj'
import { Fill, Stroke, Style } from 'ol/style'

let map: Map | null
let olPlotObj: olPlot | null

const typeList = [
  { key: "TextArea", label: "测试文本标绘" },
  { key: "Point", label: "测试画点" },
  { key: "Polyline", label: "测试画线" },
  { key: "Curve", label: "测试画曲线" },
  { key: "Arc", label: "测试画弓形" },
  { key: "Circle", label: "测试画圆" },

  { key: "FreeHandLine", label: "测试画自由线" },
  { key: "RectAngle", label: "测试画矩形" },
  { key: "RectInclined1", label: "测试斜矩形1" },
  { key: "RectInclined2", label: "测试斜矩形2" },
  { key: "Ellipse", label: "测试椭圆" },
  { key: "Lune", label: "测试弓形" },
  { key: "Sector", label: "测试画扇形" },
  { key: "ClosedCurve", label: "测试画闭合曲面" },
  { key: "Polygon", label: "测试多边形" },
  { key: "FreePolygon", label: "测试自由面" },
  { key: "GatheringPlace", label: "测试集结地" },

  { key: "DoubleArrow", label: "测试双箭头" },
  { key: "StraightArrow", label: "测试细直箭头" },
  { key: "FineArrow", label: "测试粗单尖头箭头" },
  { key: "AttackArrow", label: "测试进攻方向" },
  { key: "AssaultDirection", label: "测试粗单直箭头" },
  { key: "TailedAttackArrow", label: "测试进攻方向（尾）" },
  { key: "SquadCombat", label: "测试分队战斗行动" },
  { key: "TailedSquadCombat", label: "测试分队战斗行动（尾）" },

  { key: "RectFlag", label: "测试矩形标志旗" },
  { key: "TriangleFlag", label: "测试三角标志旗" },
  { key: "CurveFlag", label: "测试曲线标志旗" },

  { key: "getFeatures", label: "获取标绘图层上的所有要素", type: 'getFeatures' },
]


function getFeatures() {
  const features = olPlotObj?.plotUtils.getFeatures()
  olPlotObj?.plotUtils.removeAllFeatures()
  olPlotObj?.plotEdit.deactivate()
  olPlotObj?.plotUtils.addFeatures(features)
}

function activate(key: string) {
  if (!olPlotObj || !map) return;
  olPlotObj.plotEdit.deactivate()
  olPlotObj.plotDraw.activate(key)
}

export default function () {
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) })],
      view: new View({
        center: transform([-93.27, 44.98], 'EPSG:4326', 'EPSG:3857'),
        zoom: 3,
        maxZoom: 19,
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
    olPlotObj = new olPlot(map, {
      zoomToExtent: true,
    })

    map.on('click', (event) => {
      const feature = map?.forEachFeatureAtPixel(event.pixel, (feature) => feature)
      if (feature && feature.get('isPlot') && !olPlotObj?.plotDraw.isDrawing()) {
        olPlotObj?.plotEdit.activate(feature)
      } else {
        olPlotObj?.plotEdit.deactivate()
      }
    })

    function onDrawEnd(event) {
      const shapeStyle = new Style({
        fill: new Fill({
          color: 'red'
        }),
        stroke: new Stroke({
          width: 3,
          color: 'purple'
        })
      })
      const feature = event.feature
      feature.setStyle(shapeStyle)
      olPlotObj?.plotEdit.activate(feature)
    }

    let isActive = true
    map.on('click', (e) => {
      if (isActive) return;
    })

    olPlotObj.plotDraw.on('drawStart', (e) => {
      isActive = true
    })

    olPlotObj.plotDraw.on('drawEnd', (e) => {
      isActive = false
    })

    olPlotObj.plotDraw.on('drawStart')

    olPlotObj.plotDraw.on('drawEnd', onDrawEnd)

    olPlotObj.on('activePlotChange', (e) => {
      console.log('acitve', e)
    })
    olPlotObj.on('deactivatePlot', (e) => {
      console.log('deacitve', e)
    })

    // olPlotObj.on('activeTextArea', (e) => {
    //   const style = e.overlay.getStyle()
    // })
    // olPlotObj.on('deactiveTextArea', (e) => {
    //   const style = e.overlay.getStyle()
    // })
  }, [])
  return (
    <div id="map" className={styles['map-box']}>
      <div className={styles['menu']}>
        {typeList.map(typeItem => <button key={typeItem.key} onClick={() => {
          if (typeItem.type === 'getFeatures') {
            getFeatures()
          } else {
            activate(typeItem.key)
          }
        }}>{typeItem.label}</button>)}
      </div>
    </div>
  )
}