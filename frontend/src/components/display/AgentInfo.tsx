import { csvToList, truncateAddress, formatNumber} from '@/utils/formatData';

export function AverageFeedback({data}: {data: any}){
    if(data === undefined) return "Loading...";
    if (csvToList(data.toString())[1] === 0) return "0.00";
    return formatNumber(
        (csvToList(data.toString())[1] as number) / (csvToList(data.toString())[3] as number), 2
    );
}

export function TaskCompleted({data}: {data: any}){
    if(data === undefined) return "Loading...";
    return csvToList(data.toString())[2] as number; 
}

export function TotalSpend({data}: {data: any}){
    if(data === undefined) return "Loading...";
    if (csvToList(data.toString())[4] === 0) return "0.00";
    return formatNumber((csvToList(data.toString())[4] as number / 10**18), 2);
}

export function TotalEarned({data}: {data: any}){
    if(data === undefined) return "Loading...";
    if (csvToList(data.toString())[5] === 0) return "0.00";
    return formatNumber((csvToList(data.toString())[5] as number / 10**18), 2);
}
