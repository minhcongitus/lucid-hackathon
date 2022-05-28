import { CSSProperties, useCallback, useEffect, useState } from 'react'
import { account } from '@senswap/sen-js'
import { useMint } from '@senhub/providers'

import './index.less'

type MintAddresses = [mint_a: string, mint_b: string]

type StableAvatarProps = {
  mintAddresses: MintAddresses
  style?: CSSProperties
  size?: number
}

const StableAvatar = ({
  mintAddresses,
  style,
  size = 24,
}: StableAvatarProps) => {
  const [avatars, setAvatars] = useState<(string | undefined)[]>([])
  const { tokenProvider } = useMint()

  const deriveAvatar = useCallback(
    async (address: string) => {
      const token = await tokenProvider.findByAddress(address)
      if (token?.logoURI) return token.logoURI
      return undefined
    },
    [tokenProvider],
  )

  const getMintAvatar = useCallback(async () => {
    const [mint_a, mint_b] = mintAddresses
    if (!account.isAddress(mint_a) || !account.isAddress(mint_b))
      return setAvatars([])

    const avatars = await Promise.all(mintAddresses.map(deriveAvatar))
    return setAvatars(avatars)
  }, [deriveAvatar, mintAddresses])

  useEffect(() => {
    getMintAvatar()
  }, [getMintAvatar])

  const [avatar_a, avatar_b] = avatars

  return (
    <div
      className="luci-avatar"
      style={{ width: size, height: size, ...style }}
    >
      <div className="luci-avatar-half">
        {avatar_b && <img src={avatar_b} alt="avatar_b" />}
      </div>
      {avatar_a && (
        <img className="luci-avatar-full" src={avatar_a} alt="avatar_a" />
      )}
    </div>
  )
}

export default StableAvatar
