import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';

import { deleteTodo, getTodo } from '../../businessLogic/todos';
import { parseUserId } from '../../auth/utils';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  console.log(todoId)
  // TODO: Remove a TODO item by id
  if(!todoExists(todoId, userId)){
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: "Todo does not exist"
      })
    };
  }

  const deletedItem = await deleteTodo(todoId, userId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      deletedItem
    })
  };
}

const todoExists = async (todoId: string, userId: string) => {
  const result = await getTodo(todoId, userId)
  console.log("result", result)
  return !!result
}
