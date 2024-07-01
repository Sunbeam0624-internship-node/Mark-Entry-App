const express = require("express");
const router = express.Router();
const db = require("../db");
const utils = require("../utils");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { validateToken } = require("../middlewares/AuthMiddleware");
const authorizeRole = require("../middlewares/AuthorizeRole");

const verifyToken = (request, response, next) => {
    const token = request.headers["token"];
    if (!token) {
      return response
        .status(401)
        .send(utils.createErrorResponse("Missing token"));
    }
    jwt.verify(token, config.SECRET_KEY, (error, decoded) => {
      if (error) {
        return response
          .status(401)
          .send(utils.createErrorResponse("Invalid token"));
      }
      request.decoded = decoded;
      next();
    });
  };

  router.post("/showcourse", authorizeRole(["admin"]), (request, response) => {
    console.log("*: INside show course");
    console.log("**: ",request.body);
    const { course , description } = request.body;
    console.log("***: ", course , description );
  

    const statement = `INSERT INTO courses
      (course_name , description)
      VALUES (?, ?)`;
  
  
    
  
    db.execute(
      statement,
      [course , description],
      (error, result) => {
        response.send(utils.createResponse(error, result));
      }
    );
  });
  module.exports = router;