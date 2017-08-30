export function handler(event: any, context: any, callback: Function) {
    callback(null, event.duration / event.totalRepetitions);
}