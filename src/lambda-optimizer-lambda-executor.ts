import { Lambda } from 'aws-sdk';

export function handler(event: any, context: any, callback: Function) {
    try {
        const qualifier = event[`config${event.memory}`].qualifier

        const lambda = new Lambda();

        const request = lambda.invoke({
            FunctionName: event.function,
            Qualifier: qualifier,
            LogType: 'Tail',
            Payload: event.payload || JSON.stringify({}),
        });

        request.on('complete', (response) => {
            const logs = Buffer
                .from(response.httpResponse.headers['x-amz-log-result'], 'base64')
                .toString();
            const report = logs.split('\n').filter(string => string.startsWith('REPORT'))[0];
            const durationReport = report
                .split('\t')
                .filter(string => string.startsWith('Billed Duration:'))[0];
            const duration = Number(durationReport.split(' ')[2]) / 100;
            console.log(duration);
            callback(null, duration)
        }).send();
    } catch (e) {
        callback(e);
    }
};