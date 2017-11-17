export function handler(event: any, context: any, callback: Function) {
    callback(null, Object.assign(event, {repetitions: event.repetitions -1, duration: event.duration + event.lastDuration}));
}