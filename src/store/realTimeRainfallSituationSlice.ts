import { createSlice } from '@reduxjs/toolkit'
import 'react-redux'

const typeDefault = {
  rainfallList: [],
  rainfallInfo: {}
}

export const realTimeRainfallSituationSlice = createSlice({
  name: 'type',
  initialState: {
    value: typeDefault
  },
  reducers: {
    setRainfallList(state, action) {
      state.value.rainfallList = action.payload
    },
    setRainfallInfo(state, action) {
      state.value.rainfallInfo = action.payload
    },
  }
})

export const {setRainfallList, setRainfallInfo} = realTimeRainfallSituationSlice.actions
export default realTimeRainfallSituationSlice.reducer