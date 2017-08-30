import { Lambda } from 'aws-sdk';

export async function handler(event: any, context: any, callback: Function) {
    try {
        const lambda = new Lambda();
        const referenceLambda: string = event.function;
        const classes: PriceClass[] = JSON.parse(event.classes);

        const newState = Object.assign(
            {},
             event,
             {
                "duration": 0,
                "totalRepetitions": event.repetitions,
             }
        );
        
        for (const priceClass of classes) {
            const version = (await lambda.publishVersion({FunctionName: referenceLambda}).promise()).Version as string;

            await lambda.updateFunctionConfiguration({
                FunctionName: referenceLambda, MemorySize: priceClass.memory
            }).promise()

            newState[`config${priceClass.memory}`] = {
                qualifier: version,
                price: priceClass.price
            };
        }

        callback(null, newState);
    } catch (e) {
        callback(e);
    }
}

interface PriceClass {
    readonly memory: number,
    readonly price: number,
}