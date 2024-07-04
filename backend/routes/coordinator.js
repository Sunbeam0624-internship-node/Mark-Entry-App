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
    
    const statement = `SELECT roll_number , student_name , email , group_name as name FROM course_groups join students on students.group_id=course_groups.group_id WHERE students.course_id =?`; 
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

  router.get("/show-groups", authorizeRole(["coordinator"]) , (request , response) => {
    var cid=0;
    const token = request.data;
    console.log("token:",token);
    console.log("*: INside show ");
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
    const statement = `SELECT group_name FROM course_groups WHERE course_id =?`; 
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

  router.post("/add-groups", authorizeRole(["coordinator"]) , (request , response) => {
    var cid=0;
    const token = request.data;
    const groupName=request.body;
    console.log("token:",token);
    console.log("*: INside show ");
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
    const statement = `INSERT INTO course_groups (group_name, course_id) values (? ,?)`; 
    console.log("statement:",statement);
   // const encryptedPassword = String(crypto.SHA256(password));

    db.execute(statement , [groupName["groupName"],cid["course_id"]] ,
      (error, result) => {
        console.log("Mysql error ",error);
        console.log("Mysql result ",result);
        response.send(utils.createResponse(error, result));
      }
    );
  }
  });
  });

  router.post("/getstudent", authorizeRole(["coordinator"]) , (request , response) => {
    console.log("@@@$$$");
    var cid=0;
    const  rollNo  = request.body;
    console.log("rollNo:",rollNo);
    console.log("*: INside getstudent ");
  
    const stat = `SELECT roll_number, student_name  ,group_id , email FROM students WHERE roll_number= ? `;
  console.log("stat:",stat);
  db.execute(
    stat,
    [rollNo["rollNo"]],
    (error, result) => {
      console.log("Mysql error ",error);
      console.log("Mysql result ",result);
      response.send(utils.createResponse(error, result));
      
  });
});

router.post("/updateStudent", authorizeRole(["coordinator"]), (request, response) => {
  console.log("*: INside update course");
  const token = request.data;
  console.log("**: ",request.body);
  const { rolNo, studentName, email, groupName } = request.body;
  console.log("***: ", course , description );

    const stat = `SELECT group_id FROM courses_groups WHERE group_name= ? `;
    console.log("stat:",stat);
    db.execute(
      stat,
      [groupName],
      (error, result) => {
          if(error)
          {
            console.log("error");
          }
          else {
            var gid = result[0];
            console.log("result:",gid);
            var result1 = gid["group_id"];
            console.log("#result:",result1);
      const statement = `UPDATE students SET roll_number = ?, student_name= ?, group_id=?, email=? WHERE roll_number = ?`; 
      console.log("statement:",statement);
     // const encryptedPassword = String(crypto.SHA256(password));
  
      db.execute(statement , [rolNo,studentName, gid["group_id"],email, rolNo] ,
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
