import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { networkStateContractConfig, tokenContractConfig } from '@/utils/wagmiContractConfig';
import { useState } from 'react';


export default function PayAgent(){
    const {address} = useAccount();
    const allowanceConfig = {
        ...tokenContractConfig,
        functionName: 'allowance',
        args: [address, '0xCEa14b51d4E2811b7799fF29A6B6b532f5B27A87'], // Replace with the wallet address you want to query
    }

    const { data: hash, error, isPending: paymentPending, writeContract} = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({hash,})

    const [amount, setAmount] = useState(10*10**18);

    async function acceptTask(){
        writeContract({
            ...networkStateContractConfig,
            functionName: 'acceptTask',
            args: [1],
        })
    }

    return <div className="bg-gray-500 w-full h-32 tex-black rounded-lg my-2">
        <button className="text-black" onClick={()=>{acceptTask()}}>Accept Task</button> :
        
        {paymentPending && "Confirming Tx"}
        {error && `Error: ${error.message}`}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
        
        
        
        {paymentPending? <div>Loading...</div>: error? <div>Error: {error.message}</div>:
        <div className="text-black">Tx Hash: {hash?.toString()}</div>}
    </div>
}