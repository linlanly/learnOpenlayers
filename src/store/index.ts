import {configureStore} from '@reduxjs/toolkit'
import typeSlice from './typeSlice'
import realTimeWaterSituationSlice from './realTimeWaterSituationSlice'
import realTimeRainfallSituationSlice from './realTimeRainfallSituationSlice'
import typhoonPathSlice from './typhoonPathSlice'
import satelliteCloundChartSlice from './satelliteCloundChartSlice'

export default configureStore({
  reducer: {
    typeStore: typeSlice,
    realTimeWaterSituationStore: realTimeWaterSituationSlice,
    realTimeRainfallSituationStore: realTimeRainfallSituationSlice,
    typhoonPathStore: typhoonPathSlice,
    satelliteCloundChartStore: satelliteCloundChartSlice
  }
})