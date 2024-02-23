# recipe-api
### Introduction
This project provides a rest API for a recipe application, in which users can share their recipes, save recipes as favourites and follow other users.
### API Endpoints
| HTTP Verbs | Endpoints | Action |
| --- | --- | --- |
| POST | /auth/signup | To sign up a new user account |
| POST | /auth/login | To login an existing user account |
| GET | /users | To retrieve all users |
| GET | /users/:id | To retrieve details of a single user |
| DELETE | /users/:id | To delete a single user |
| GET | /users/:id/followings | To retrieve all followings of a single user |
| POST | /users/:id/followings | To create a new following |
| DELETE | /users/:id/followings/:otherUserId | To delete a single following |
| GET | /users/:id/followers | To retrieve all followers of a single user |
| GET | /users/:id/likes | To retrieve all likes of a single user |
| POST | /users/:id/likes | To create a new like |
| DELETE | /users/:id/likes/:recipeId | To delete a single like |
| GET | /categories | To retrieve all categories |
| POST | /categories | To create a new category |
| DELETE | /categories/:id | To delete a single category |
| GET | /recipes | To retrieve all recipes |
| GET | /recipes/:id | To retrieve details of a single recipe |
| PATCH | /recipes/:id | To edit the details of a single recipe |
| POST | /recipes | To create a new recipe |
| DELETE | /recipes/:id | To delete a single recipe |
### Technologies Used
* [NodeJS](https://nodejs.org/) This is a cross-platform runtime environment built on Chrome's V8 JavaScript engine used in running JavaScript codes on the server. It allows for installation and managing of dependencies and communication with databases.
* [ExpressJS](https://www.expresjs.org/) This is a NodeJS web application framework.
* [MongoDB](https://www.mongodb.com/) This is a free open source NOSQL document database with scalability and flexibility. Data are stored in flexible JSON-like documents.
* [Mongoose ODM](https://mongoosejs.com/) This makes it easy to write MongoDB validation by providing a straight-forward, schema-based solution to model to application data.
