import { Lambda } from 'aws-sdk';

export async function handler(event: any, context: any, callback: Function) {
    try {
        const lambda = new Lambda();
        const referenceLambda: string = event.function;
        const qualifier = event[`config${event.memory}`].qualifier

        await lambda.deleteFunction({ FunctionName: referenceLambda, Qualifier: qualifier }).promise();

        callback(null, 'OK');
    } catch (e) {
        callback(e);
    }
}

interface PriceClass {
    readonly memory: number,
    readonly price: number,
}