import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { account } from '@senswap/sen-js'
import { PoolData } from 'app/lib'

/**
 * Interface & Utility
 */

export type PoolsState = Record<string, PoolData>

/**
 * Store constructor
 */

const NAME = 'pools'
const initialState: PoolsState = {}

/**
 * Actions
 */

export const upsetPool = createAsyncThunk<
  PoolsState,
  { address: string; data: PoolData },
  { state: any }
>(`${NAME}/upsetPool`, async ({ address, data }) => {
  if (!account.isAddress(address)) throw new Error('Invalid pool address')
  if (!data) throw new Error('Data is empty')
  return { [address]: data }
})

export const upsetPools = createAsyncThunk<
  PoolsState,
  PoolsState,
  { state: any }
>(`${NAME}/upsetPools`, async (pools) => {
  return pools
})

/**
 * Usual procedure
 */

const slice = createSlice({
  name: NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    void builder
      .addCase(
        upsetPools.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      )
      .addCase(
        upsetPool.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      ),
})

export default slice.reducer
