
import { setImageIndex } from '@/store/satelliteCloundChartSlice'
import { CloseOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import styles from './showSatelliteCloundChart.module.scss'

let imgInterval
let imgIndex = 0
export default function () {
  const [show, setShow] = useState(false)
  const [imgList ,setImgList] = useState([])
  const [imgSrc, setImgSrc] = useState('')
  const store = useSelector(state => {
    return state.satelliteCloundChartStore.value
  })

  const dispatch = useDispatch()
  
  useEffect(() => {
    setImgList(store.imgList)
  }, [store.imgList])

  useEffect(() => {
    if (store.index !== -1 && store.interval === 0 && imgList[store.index]) {
      setImgSrc(imgList[store.index].name)
      setShow(true)
    }
    console.log('image index')
  }, [store.index])

  useEffect(() => {
    imgIndex = 0
    if (imgInterval) {
      clearInterval(imgInterval)
      imgInterval = null
    }
    if (imgList.length > 0 && store.interval) {
      setShow(true)
      imgInterval = setInterval(() => {
        if (imgIndex < imgList.length) {
          imgIndex++
          if (imgList[imgIndex]) {
            setImgSrc(imgList[imgIndex].name)
          }
        } else {
          imgIndex = 0
        }
        dispatch(setImageIndex(imgIndex))
      }, store.interval * 1000)
    }
  }, [store.interval])
  return show ? <div className={styles['image-panle']}>
    <img src={`/waterConservancy/gxsl/api/v0.1/common/img/getImg/${imgSrc}`} />
    <CloseOutlined onClick={()=> {setShow(false)}} className={styles['btn-close']} />
  </div> : <></>
}