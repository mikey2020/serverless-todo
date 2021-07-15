import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk';
import { parseUserId } from '../../auth/utils';
import { updateTodoAttachment } from '../../businessLogic/todos';
const XAWS = AWSXRay.captureAWS(AWS);

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.UPLOADS_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  console.log(todoId)
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const url = getUploadUrl(todoId)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`;
  try {
    await updateTodoAttachment(attachmentUrl, todoId, userId)
  } catch (e) {
    console.log(e)
  }
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}
