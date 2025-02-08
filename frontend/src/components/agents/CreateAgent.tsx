import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { networkStateContractConfig, tokenContractConfig } from '@/utils/wagmiContractConfig';
import { useState } from 'react';



export default function CreateAgent(){
    const { data: hash, error, isPending: paymentPending, writeContract: stake} = useWriteContract();
    const { data: approvalHash, error: approvalError, isPending: approvalPending, writeContract: approveToken} = useWriteContract();
    
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({hash,})
    const { isLoading: approvalLoading, isSuccess: approvalConfirmed } = useWaitForTransactionReceipt({hash: approvalHash,})

    const [isApproved, setIsApproved] = useState(false);

    async function createAgent(){
        if(isApproved){
            stake({
                ...networkStateContractConfig,
                functionName: 'stake',
                args: [],
            })
        }else{
            approveToken({
                ...tokenContractConfig,
                functionName: 'approve',
                args: ['0xCEa14b51d4E2811b7799fF29A6B6b532f5B27A87', 10000*10**18],
            })
            setIsApproved(true);
        }
    }

    return <div className="bg-gray-800 w-full h-32 rounded-lg my-2 p-4">
        <button onClick={()=>{createAgent()}}>Create Agent</button>

        {paymentPending && "Confirming Tx"}
        {error && `Error: ${error.message}`}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}

        {approvalPending && "Approval Pending"}
        {approvalError && `Approval Error: ${approvalError.message}`}
        {approvalLoading && 'Approval Loading'}
        {approvalConfirmed && 'Approval Confirmed'}


        
        
        {paymentPending? <div>Loading...</div>: error? <div>Error: {error.message}</div>:
        <div>Tx Hash: {hash?.toString()}</div>}
        <div>Approval Hash: {approvalHash?.toString()}</div>
    </div>
}