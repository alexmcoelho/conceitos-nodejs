const express = require("express");
const cors = require("cors");
const { uuid } = require("uuidv4");
const { celebrate, Joi } = require('celebrate');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

app.get("/repositories", (_, response) => {
  return response.json(repositories);
});

app.post(
  "/repositories", 
  celebrate({
      body: Joi.object().keys({
          title: Joi.string().required(),
          url: Joi.string().required().regex(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/),
          techs: Joi.array().items(Joi.string().required())
      })
  }, {
      abortEarly: false
  }),
  (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };
  repositories.push(repository);

  return response.json(repository);
});

app.put(
  "/repositories/:id", 
  celebrate({
      body: Joi.object().keys({
          title: Joi.string(),
          url: Joi.string().regex(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/),
          techs: Joi.array().items(Joi.string()),
          likes: Joi.number()
      })
  }, {
      abortEarly: false
  }),
  (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const index = repositories.findIndex(repository => repository.id === id);
  if(index < 0) {
    return response.status(400).send();
  }
  repositories[index] = { ...repositories[index], title, url, techs };

  return response.json(repositories[index]);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const index = repositories.findIndex(repository => repository.id === id);
  if(index < 0) {
    return response.status(400).send();
  }
  repositories.splice(index, 1);
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repository = repositories.find(repository => repository.id === id);
  if(!repository) {
    return response.status(400).send();
  }

  repository.likes++;

  return response.json(repository);
});

module.exports = app;
