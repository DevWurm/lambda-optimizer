export function generateWorkflow(classes: PriceClass[]): object {
  const priceClassExecution = (priceClass: PriceClass) => ({
    "StartAt": `InitializeState${priceClass.memory}`,
    "States": {
      [`InitializeState${priceClass.memory}`]: {
        "Type": "Pass",
        "Result": priceClass.memory,
        "ResultPath": `$.memory`,
        "Next": `ExecutionChoice${priceClass.memory}`
      },
      [`ExecutionChoice${priceClass.memory}`]: {
        "Type": "Choice",
        "Choices": [
          {
            "Variable": "$.repetitions",
            "NumericGreaterThan": 0,
            "Next": `Execution${priceClass.memory}`
          }
        ],
        "Default": `Average${priceClass.memory}`
      },
      [`Execution${priceClass.memory}`]: {
        "Type": "Task",
        "Resource": "${LambdaExecutor.Arn}",
        "ResultPath": "$.lastDuration",
        "Next": `SumUp${priceClass.memory}`
      },
      [`SumUp${priceClass.memory}`]: {
        "Type": "Task",
        "Resource": "${SumDuration.Arn}",
        "ResultPath": "$.duration",
        "Next": `DecrementRepetions${priceClass.memory}`
      },
      [`DecrementRepetions${priceClass.memory}`]: {
        "Type": "Task",
        "Resource": "${DecrementRepetitions.Arn}",
        "ResultPath": "$.repetitions",
        "Next": `ExecutionChoice${priceClass.memory}`
      },
      [`Average${priceClass.memory}`]: {
        "Type": "Task",
        "Resource": "${AverageDuration.Arn}",
        "ResultPath": "$.duration",
        "Next": `Price${priceClass.memory}`
      },
      [`Price${priceClass.memory}`]: {
        "Type": "Task",
        "Resource": "${MultiplyWithPrice.Arn}",
        "ResultPath": "$.result",
        "Next": `Cleanup${priceClass.memory}`,
      },
      [`Cleanup${priceClass.memory}`]: {
        "Type": "Task",
        "Resource": "${Cleanup.Arn}",
        "ResultPath": `$.cleanupResult`,
        "Next": `FilterResult${priceClass.memory}`,
      },
      [`FilterResult${priceClass.memory}`]: {
        "Type": "Task",
        "Resource": "${FilterResult.Arn}",
        "End": true,
      },
    }
  });

  return {
    "Comment": "An workflow for measuring lambda execution times to optimize lambda costs",
    "StartAt": "PreInitialize",
    "States": {
      "PreInitialize": {
        "Type": "Pass",
        "Result": JSON.stringify(classes),
        "ResultPath": "$.classes",
        "Next": "Initialize",
      },
      "Initialize": {
        "Type": "Task",
        "Resource": "${Initialize.Arn}",
        "Next": "Parallel"
      },
      "Parallel": {
        "Type": "Parallel",
        "Branches": classes.map(priceClassExecution),
        "Next": "SortResults",
      },
      "SortResults": {
        "Type": "Task",
        "Resource": "${SortResults.Arn}",
        "End": true,
      },
    }
  }


}

export interface PriceClass {
  readonly memory: number,
  readonly price: number,
}