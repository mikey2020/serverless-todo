import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { updateTodo } from '../../businessLogic/todos'
import { parseUserId } from '../../auth/utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger("updateTodoLogger")

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  logger.info("Updating Todo")
  logger.info("Update Todo body", updatedTodo)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const updatedItem = await updateTodo(updatedTodo, todoId, userId);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      updatedItem
    })
  };
}
