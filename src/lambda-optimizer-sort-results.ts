export function handler(event: any, context: any, callback: Function) {
    callback(null, event.sort(({pricePerExecution: ppe1}: any, {pricePerExecution: ppe2}: any) => ppe1 === ppe2 ? 0 : (ppe1 < ppe2 ? -1 : 1)));
 }