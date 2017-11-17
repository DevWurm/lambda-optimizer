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
        "Default": `Cleanup${priceClass.memory}`
      },
      [`Execution${priceClass.memory}`]: {
        "Type": "Task",
        "Resource": "${LambdaExecutor.Arn}",
        "ResultPath": "$.lastDuration",
        "TimeoutSeconds": 299,
        "Catch": [ {
           "ErrorEquals": ["States.Timeout"],
           "ResultPath": "$.error-info",
           "Next": `TimedOutCleanup${priceClass.memory}`
        }],
        "Next": `PostExecution${priceClass.memory}`
      },
      [`PostExecution${priceClass.memory}`]: {
        "Type": "Task",
        "Resource": "${PostExecution.Arn}",
        "Next": `ExecutionChoice${priceClass.memory}`
      },
      [`Cleanup${priceClass.memory}`]: {
        "Type": "Task",
        "Resource": "${Cleanup.Arn}",
        "ResultPath": `$.cleanupResult`,
        "Next": `AnalyzeResults${priceClass.memory}`,
      },
      [`AnalyzeResults${priceClass.memory}`]: {
        "Type": "Task",
        "Resource": "${AnalyzeResults.Arn}",
        "End": true,
      },
      [`TimedOutCleanup${priceClass.memory}`]: {
        "Type": "Task",
        "Resource": "${Cleanup.Arn}",
        "ResultPath": `$.cleanupResult`,
        "Next": `TimedOut${priceClass.memory}`,
      },
      [`TimedOut${priceClass.memory}`]: {
        "Type": "Pass",
        "Result": {timeout: true},
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