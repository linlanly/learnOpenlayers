import { createSlice } from '@reduxjs/toolkit'
import 'react-redux'

const typeDefault = {
  typhoonPathList: [],
}

export const typhoonPathSlice = createSlice({
  name: 'type',
  initialState: {
    value: typeDefault
  },
  reducers: {
    setTyphoonPathList(state, action) {
      state.value.typhoonPathList = action.payload
    }
  }
})

export const {setTyphoonPathList} = typhoonPathSlice.actions
export default typhoonPathSlice.reducer