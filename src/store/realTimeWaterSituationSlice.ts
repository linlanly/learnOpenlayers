import { createSlice } from '@reduxjs/toolkit'
import 'react-redux'

const typeDefault = {
  riverList: [],
  reservoirList: [],
  waterConservancyInfo: ''
}

export const realTimeWaterSituationSlice = createSlice({
  name: 'type',
  initialState: {
    value: typeDefault
  },
  reducers: {
    setRiver(state, action) {
      state.value.riverList = action.payload
    },
    setReservoir(state, action) {
      state.value.reservoirList = action.payload
    },
    setWaterConservancyInfo(state, action) {
      state.value.waterConservancyInfo = action.payload
    },
  }
})

export const {setRiver, setReservoir, setWaterConservancyInfo} = realTimeWaterSituationSlice.actions
export default realTimeWaterSituationSlice.reducer