export function handler(event: any, context: any, callback: Function) {
    const price = event[`config${event.memory}`].price;
    const averageDuration = event.duration / event.totalRepetitions;

    callback(null, {
        memory: event.memory,
        averageDuration,
        pricePerExecution: averageDuration * price,
    })
}