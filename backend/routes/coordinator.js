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
  router.get("/showstudent", authorizeRole(["coordinator"]) , (request , response) => {
    var cid=0;
    const token = request.data;
    console.log("token:",token);
    console.log("*: INside show student");
    const courseName = token.course_name;
    const stat = `SELECT course_id FROM courses WHERE course_name= ? `;
  console.log("stat:",stat);
  db.execute(
    stat,
    [courseName],
    (error, result) => {
        if(error)
        {
          console.log("error");
        }
        else {
          var cid = result[0];
          console.log("result:",cid);
          var result1 = cid["course_id"];
          console.log("#result:",result1);
    const statement = `SELECT roll_number , student_name , email FROM students WHERE course_id =?`; 
    console.log("statement:",statement);
   // const encryptedPassword = String(crypto.SHA256(password));

    db.execute(statement , [cid["course_id"]] ,
      (error, result) => {
        console.log("Mysql error ",error);
        console.log("Mysql result ",result);
        response.send(utils.createResponse(error, result));
      }
    );
  }
  });
  });
  module.exports = router;
