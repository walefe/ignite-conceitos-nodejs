const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUserInDatabase = users.some((user) => user.username === username);

  if (!findUserInDatabase) {
    return response.status(400).json({error: 'User not exists!'})
  }

  request.username = username;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const findUserInDatabase = users.some((user) => user.username === username);

  if (findUserInDatabase) {
    return response.status(400).json({error: 'User alredy exists!'})
  }
  
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const userTodos = users.find(user => username === user.username )

  return response.json(userTodos.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;
  const userTodos = users.find(user => username === user.username );

  const createTodo =  {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  userTodos.todos.push(createTodo)

  return response.status(201).json(createTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;
  const { id } = request.params;

  const findUser = users.find(user => username === user.username );
  const findTodo = findUser.todos.find(todo => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({error: 'This todo not exists'});
  }

  const todoIndex = findUser.todos.findIndex(todo => todo.id === id);

  const updateTodo = {
    ...findTodo,
    title,
    deadline
  }

  findUser.todos.splice(todoIndex, 1, updateTodo);

  return response.status(200).json(updateTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const findUser = users.find(user => username === user.username );
  const findTodo = findUser.todos.find(todo => todo.id === id);
  
  if (!findTodo) {
    return response.status(404).json({error: 'This todo not exists'});
  }
  
  const todoIndex = findUser.todos.findIndex(todo => todo.id === id);
  
  const updatedTodo = {
    ...findTodo,
    done: findTodo.done ? false : true,
  }
  
  findUser.todos.splice(todoIndex, 1, updatedTodo);

  return response.status(200).json(updatedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const findUser = users.find(user => username === user.username );
  const findTodo = findUser.todos.find(todo => todo.id === id);
  
  if (!findTodo) {
    return response.status(404).json({error: 'This todo not exists'});
  }
  
  const todoIndex = findUser.todos.findIndex(todo => todo.id === id);

  findUser.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;