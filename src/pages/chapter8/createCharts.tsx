import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import { Vector as VectorSource, OSM } from 'ol/source'
import { Tile as TileLayer } from 'ol/layer'
import { ChangeEvent, useEffect } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './hotSpots.module.scss'
import { Circle, Fill, Stroke, Style } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'
import { Feature, Overlay } from 'ol'
import { Polygon } from 'ol/geom'
import { notification} from 'antd';

import HighCharts, { SeriesAreaOptions, SeriesColumnOptions, SeriesLineOptions, SeriesPieOptions } from 'highcharts'
import Highcharts3d from 'highcharts/highcharts-3d';
Highcharts3d(HighCharts)

import FeatrureTable from '@/utils/featuresTable'
const featureTable = new FeatrureTable()

let map: Map | null
let popup: Overlay | null

const typeList = [
  {
    label: '2D柱状图',
    key: 'column',
  },
  {
    label: '3D柱状图',
    key: 'column3D',
  },
  {
    label: '折线图',
    key: 'line',
  },
  {
    label: '区域折线图',
    key: 'area',
  },
  {
    label: '2D饼图',
    key: 'pie',
  },
  {
    label: '3D饼图',
    key: 'pie3D',
  },
]

let flashFeature

const flashStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 102, 0, .2)'
  }),
  stroke: new Stroke({
    color: '#cc3300',
    width: 2
  }),
  image: new Circle({
    radius: 7,
    fill: new Fill({
      color: '#cc3300'
    })
  })
})

const vectSource = new VectorSource({})
const vectLayer = new VectorLayer({
  source: vectSource,
  style: flashFeature,
  opacity: .5
})

interface dataObj {
  [key: string]: string | number
}

interface resultOjb {
  code: number,
  msg: string,
  data: Array<dataObj> | undefined
}

let chartType = 'column'

function changeChartType(data: ChangeEvent<HTMLSelectElement>) {
  if (!map) return;
  const overLayers = map.getOverlays()
  overLayers.clear()
  selectRegData()
  chartType = data.target.value
}

function selectRegData() {
  featureTable.get().then((res) => {
    let result = res as resultOjb
    if (result.code === 200) {
      showRegCallBack(result.data!)
    } else {
      notification['error']({
        message: result.msg
      })
    }
  })
}

function showRegCallBack(data: Array<dataObj>) {
  for (let i = 0; i < data.length; i++) {
    const feature = new Feature({
      geometry: new Polygon(JSON.parse(data[i].geom as string)),
      name: data[i].name,
      id: data[i].id
    })
    vectSource.addFeature(feature)

    const fGeomtry = feature.getGeometry()
    const fExtent = fGeomtry!.getExtent()
    const centerX = fExtent[0] + (fExtent[2] - fExtent[0]) / 2
    const centerY = fExtent[1] + (fExtent[3] - fExtent[1]) / 2
    const center = [centerX, centerY]
    addCharts(data[i], center)
  }
}

function addCharts(item: dataObj, coordinate: Array<number>) {
  const mapContainer = document.getElementById('map')
  const elementDiv = document.createElement('div')
  elementDiv.id = `chart${item.id}`
  elementDiv.className = 'chart'
  elementDiv.style.width = '300px'
  elementDiv.style.height = '200px'
  mapContainer?.append(elementDiv)
  const newOverLayer = new Overlay({
    element: elementDiv,
    positioning: 'bottom-center'
  })
  newOverLayer.setPosition(coordinate)
  map?.addOverlay(newOverLayer)

  const typeStr = chartType.endsWith('3D') ? chartType.split('3D')[0] : chartType
  const option = {
    chart: {
      renderTo: elementDiv.id,
      type: typeStr,
      options3d: {
        enabled: !!chartType.endsWith('3D'),
        alpha: typeStr === 'pie' ? 60 : 15,
        beta: 15,
        depth: 50,
        viewDistance: 25
      }
    },
    xAxis: {
      type: 'category'
    },
    yAxis: {
      title: {
        enabled: false
      }
    },
    tooltip: {
      headerFormat: '<b>{point.key}</b><br>',
      pointFormat: 'Cars sold: {point.y}'
    },
    title: {
      text: item.name + '近四年招生人数',
      align: 'left'
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      column: {
        depth: 25
      },
      pie: {
        depth: 25
      }
    },
    series: [{
      type: typeStr,
      data: [2021, 2022, 2023, 2024].map(year => ({name: `${year}年`, y: item[`year${year}`] as number})),
      colorByPoint: true
    }]
  }
  HighCharts.chart(option as any)
}

export default function () {
  featureTable.open("chartInfo")

  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) }), vectLayer],
      view: new View({
        center: [-8908887.277395891, 5381918.072437216],
        zoom: 2,
        maxZoom: 19,
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))

    let element = document.getElementById('popup')
    popup = new Overlay({
      element: element!,
      positioning: 'bottom-center',
      stopEvent: false
    })
    map.addOverlay(popup)
  }, [])
  return (
    <div id="map" className={styles['map-box']}>
      <div className={styles['menu']}>
        <label>统计图类型</label>
        <select onChange={changeChartType}>
          {typeList.map(typeItem => <option key={typeItem.key} value={typeItem.key}>{typeItem.label}</option>)}
        </select>
        <button onClick={selectRegData}>加载统计图</button>
      </div>
    </div>
  )
}