import {
  Fragment,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useDispatch } from 'react-redux'

import { upsetPool, upsetPools } from 'app/model/pools.controller'
import { AppDispatch } from 'app/model'
import { useLucid } from 'app/hooks/useLucid'
import TokenProvider from 'shared/tokenProvider'

// Watch id
let watchId = 0
const tokenProvider = new TokenProvider()

const PoolWatcher: FunctionComponent = (props) => {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch<AppDispatch>()
  const lucid = useLucid()

  // First-time fetching
  const fetchData = useCallback(async () => {
    try {
      let pools = await lucid.getPools()
      await tokenProvider.all()
      await dispatch(upsetPools(pools)).unwrap()
    } catch (er) {
      return window.notify({
        type: 'error',
        description: 'Cannot fetch data of pools',
      })
    } finally {
      setLoading(false)
    }
  }, [dispatch, lucid])

  // Watch account changes
  const watchData = useCallback(async () => {
    if (watchId) return console.warn('Already watched')
    watchId = lucid.watch((er: string | null, re) => {
      if (er) return console.error(er)
      if (re) return dispatch(upsetPool({ address: re.address, data: re.data }))
    }, [])
  }, [dispatch, lucid])

  useEffect(() => {
    fetchData()
    watchData()
    // Unwatch (cancel socket)
    return () => {
      ;(async () => {
        try {
          await lucid.unwatch(watchId)
        } catch (er) {}
      })()
      watchId = 0
    }
  }, [fetchData, lucid, watchData])

  if (loading) return <div>Loading</div>
  return <Fragment>{props.children}</Fragment>
}

export default PoolWatcher
