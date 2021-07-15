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

      // const result = await this.docClient.query({
      //   Key: { todoId, userId }
      // }).promise()
  
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

    async updateTodo(todo: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
      await this.docClient.update({
        TableName: this.todosTable,
        Key: { todoId, userId},
        ExpressionAttributeNames: {
          "#todo_name": "name"
        },
        UpdateExpression: "set #todo_name=:r, dueDate=:p, done=:a",
        ExpressionAttributeValues:{
            ":r": todo.name,
            ":p": todo.dueDate,
            ":a": todo.done
        },
        ReturnValues:"UPDATED_NEW"
      }).promise()
  
      return todo;
    }

    async updateTodoAttachment(attachmentUrl: string, todoId: string, userId: string) {
      await this.docClient.update({
        TableName: this.todosTable,
        Key: { todoId, userId},
        UpdateExpression: "set attachmentUrl=:url",
        ExpressionAttributeValues:{
            ":url": attachmentUrl,
        },
        ReturnValues:"UPDATED_NEW"
      }).promise()
    }

    async deleteTodo(todoId: string, userId: string): Promise<{}> {
      let result;
      try {
        result = await this.docClient.delete({
          TableName: this.todosTable,
          Key: { todoId, userId},
        }).promise()
      } catch(err) {
        result = err
      }
      return result
    }

    async getTodo(todoId: string, userId: string): Promise<TodoItem> {
      console.log('Getting todo')
      const result = await this.docClient.get({
        TableName: this.todosTable,
        Key: { todoId, userId}
      }).promise();
      console.log("item", result)
      
      const item = result.Item;
      return item as TodoItem;
    }

}