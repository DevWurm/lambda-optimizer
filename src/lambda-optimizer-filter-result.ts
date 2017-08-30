export function handler(event: any, context: any, callback: Function) {
   callback(null, {
       memory: event.memory,
       averageDuration: Number(event.duration),
       pricePerExecution: Number(event.result),
    });
}