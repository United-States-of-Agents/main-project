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
    const {data: allowance} = useReadContract(allowanceConfig as any);

    const { data: approvalHash, writeContract: approveToken} = useWriteContract();

    const { data: hash, error, isPending: paymentPending, writeContract} = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({hash,})

    const [amount, setAmount] = useState(10*10**18);

    async function addAllowance(){
        approveToken({
            ...tokenContractConfig,
            functionName: 'approve',
            args: ['0xCEa14b51d4E2811b7799fF29A6B6b532f5B27A87', amount*100*10**18],
        })
    }

    async function pay(amount:number){
        writeContract({
            ...networkStateContractConfig,
            functionName: 'payAgent',
            args: ['0x74EF2a3c2CC1446643Ab59e5b65dd86665521F1c', amount*10**18],
        })
    }

    return <div className="bg-gray-500 w-full h-32 tex-black rounded-lg my-2">
        {amount< Number(allowance)? 
            <button className="text-black" onClick={()=>{pay(10)}}>Pay Agent</button> :
            <button className="text-black" onClick={addAllowance}>Add Allowance</button>
        }

        <div className="text-black">Allowance: {allowance?.toString()}</div>
        
        {paymentPending && "Confirming Tx"}
        {error && `Error: ${error.message}`}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
        
        
        
        {paymentPending? <div>Loading...</div>: error? <div>Error: {error.message}</div>:
        <div className="text-black">Tx Hash: {hash?.toString()}</div>}
    </div>
}