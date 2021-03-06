import {PriceClass, generateWorkflow} from './generate-workflow';

export function generateTemplate(sourceTemplate: any, priceClasses: PriceClass[]): any {
    sourceTemplate.Resources.LambdaOptimizer.Properties.DefinitionString["Fn::Sub"] =  JSON.stringify(generateWorkflow(priceClasses));
    return sourceTemplate;
}