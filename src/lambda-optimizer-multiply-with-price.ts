export function handler(event: any, context: any, callback: Function) {
    const price = event[`config${event.memory}`].price;
    callback(null, event.duration * price);
}