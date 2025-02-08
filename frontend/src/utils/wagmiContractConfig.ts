import NetworkState from "./NetworkState.json"
import USA from "./USA.json"

export const networkStateContractConfig = {
    address: '0xCEa14b51d4E2811b7799fF29A6B6b532f5B27A87',
    abi: NetworkState.abi,
} as const

export const tokenContractConfig = {
    address: '0x2EF308295579A58E1B95cD045B7af2f9ec7931f8',
    abi: USA.abi,
} as const