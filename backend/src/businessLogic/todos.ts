import * as uuid from 'uuid';
import { TodoAccess } from '../dataLayer/todosAccess';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { parseUserId } from '../auth/utils';

const todoAccess = new TodoAccess()

export async function getAllTodos(): Promise<TodoItem[]> {
  return todoAccess.getAllTodos();
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString()
  })
}

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  userId: string
): Promise<TodoUpdate> {

  return await todoAccess.updateTodo({
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: false,
  },
  todoId, userId)
}

export async function updateTodoAttachment(
  attachmentUrl: string,
  todoId: string,
  userId: string
) {
 await todoAccess.updateTodoAttachment(
  attachmentUrl,
  todoId,
  userId,
 )
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<{}> {
  return await todoAccess.deleteTodo(todoId, userId)
}

export async function getTodo(
  todoId: string,
  userId: string
): Promise<{}> {
  return await todoAccess.getTodo(todoId, userId)
}

