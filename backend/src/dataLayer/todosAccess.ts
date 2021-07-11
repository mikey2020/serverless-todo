import * as AWS  from 'aws-sdk';
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

export class TodoAccess {

    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todosTable = process.env.TODOS_TABLE) {
    }
  
    async getAllTodos(): Promise<TodoItem[]> {
      console.log('Getting all todos')
  
      const result = await this.docClient.scan({
        TableName: this.todosTable
      }).promise();
  
      const items = result.Items;
      return items as TodoItem[];
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
      await this.docClient.put({
        TableName: this.todosTable,
        Item: todo
      }).promise()
  
      return todo;
    }

    async updateTodo(todo: TodoUpdate, todoId): Promise<TodoUpdate> {
      await this.docClient.update({
        TableName: this.todosTable,
        Key: { todoId: todoId},
        UpdateExpression: "set #todoName=:r, dueDate=:p, done=:a",
        ExpressionAttributeValues:{
            ":r":  todo.name,
            ":p": todo.dueDate,
            ":a": todo.done
        },
        ExpressionAttributeNames: {
          "#todoName": "name"
        },
        ReturnValues:"UPDATED_NEW"
      }).promise()
  
      return todo;
    }

}