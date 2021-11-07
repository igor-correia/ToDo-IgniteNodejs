const express = require('express');
const cors = require('cors');
const { v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const flag = users.some(user => user.username === username);
  
  if (!flag) response.status(404).json({"error": "usuário indisponível"});
  
  const user = users.find(user => user.username === username);

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  for (element of users) {
    if (element.username === username) response.status(400).json({"error": "usuário indisponível"});
  };

  const costumer = {
    id: v4(),
    name,
    username,
    todos: []
  };

  users.push(costumer);

  return response.status(201).send(costumer);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.send(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
      id: v4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) response.status(404).json({"error": "todo inexistente"});

  todo.title = title;
  todo.deadline = deadline;

  return response.send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) response.status(404).json({"error": "todo inexistente"});

  todo.done = true;

  return response.send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params; 
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) response.status(404).json({"error": "todo inexistente"});

  index = user.todos.indexOf(todo);

  user.todos.splice(index, 1);

  return response.status(204).send();
});

module.exports = app;