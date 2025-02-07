import * as React from 'react'
import { Connector, useConnect } from 'wagmi'
import {Button} from '@/components/ui/button'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors';

export function WalletOptions() {
  const { connectors, connect } = useConnect()

  return (<div className="flex flex-col space-y-4 font-semibold">
    {connectors.map((connector) => (
        <button className="bg-white px-8 py-2 text-black rounded-lg" key={connector.uid} onClick={() => connect({ connector })}>
        {connector.name}
        </button>
    ))}
  </div>)
}

export function ConnectButton(){
    const { connectors, connect } = useConnect()

    return(
        <Button className="w-3/4 bg-white text-lg text-black rounded-lg m-4" onClick={() => connect({ connector: connectors[1] })}>Connect Wallet</Button>
    )


}