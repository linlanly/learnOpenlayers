import { createSlice } from '@reduxjs/toolkit'
import 'react-redux'

const dataDefault = {
  imgList: [],
  index: -1,
  interval: 0
}

export const dataSlice = createSlice({
  name: 'type',
  initialState: {
    value: dataDefault
  },
  reducers: {
    setImageList(state, action) {
      state.value.imgList = action.payload
    },
    setImageIndex(state, action) {
      state.value.index = action.payload
    },
    setIntervalInfo(state, action) {
      state.value.interval = action.payload
    },
  }
})

export const {setImageList, setImageIndex, setIntervalInfo} = dataSlice.actions
export default dataSlice.reducer