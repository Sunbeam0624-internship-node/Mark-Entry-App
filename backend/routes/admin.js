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

  router.get("/showcourse", authorizeRole(["admin"]) , (request , response) => {
    console.log("*: INside show course");
    const statement = `SELECT course_name , description FROM courses`; 
    console.log("statement:",statement);
    db.execute(
      statement,
      (error, result) => {
        response.send(utils.createResponse(error, result));
      }
    );
  });

  router.post("/showallstudent", authorizeRole(["admin"]), (request, response) => {
    console.log("*: INside show all student");
    const token = request.data;
    console.log("**: ",request.body);
    const { course} = request.body;
    console.log("***: ", course );
  
      const stat = `SELECT course_id FROM courses WHERE course_name= ? `
      console.log("stat:",stat);
      db.execute(
        stat,
        [course],
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
        const statement = `SELECT roll_number,student_name,course_name,email FROM students join courses on students.course_id=courses.course_id WHERE students.course_id =?`;
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
  router.post("/getstudent", authorizeRole(["admin"]) , (request , response) => {
    console.log("@@@$$$");
    var cid=0;
    const  rollNo  = request.body;
    console.log("rollNo:",rollNo);
    console.log("*: INside getstudent ");
  
    const stat = `SELECT roll_number,student_name,email,course_name FROM students  left join courses on students.course_id=courses.course_id WHERE roll_number=?`;
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
router.post("/updateStudent", authorizeRole(["admin"]), (request, response) => {
  console.log("*: INside update all student");
  const token = request.data;
  console.log("**: ",request.body);
  const { rolNo, studentName, email, course1 } = request.body;
  console.log("***: ", rolNo, studentName, email, course1 );

    const stat = `SELECT course_id FROM courses WHERE course_name= ? `;
    console.log("stat:",stat);
    db.execute(
      stat,
      [course1],
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
      const statement = `UPDATE students SET roll_number = ?, student_name= ?, email=?, course_id=? WHERE roll_number = ?`; 
      console.log("statement:",statement);
     // const encryptedPassword = String(crypto.SHA256(password));
  
      db.execute(statement , [rolNo,studentName, email,cid["course_id"], rolNo] ,
        (error, result) => {
          console.log("Mysql error ",error);
          console.log("Mysql result ",result);
          response.send(utils.createResponse(error, result));
        }
      );
    }
    });
  
});
  router.get("/showallstaff", authorizeRole(["admin"]) , (request , response) => {
    console.log("*: INside show all staff");
    const statement = `SELECT employee_number,staff_name,email,role,course_name FROM staff`; 
    console.log("statement:",statement);
    db.execute(
      statement,
      (error, result) => {
        response.send(utils.createResponse(error, result));
      }
    );
  });

  router.post("/updateStaff", authorizeRole(["admin"]), (request, response) => {
    console.log("*: INside update staff");
    console.log("**: ",request.body);
    const { email,course ,role } = request.body;
    console.log("***: ", email,course , role );
  

    const statement = `UPDATE staff SET  role= ?, course_name=? WHERE email = ? `;
  
  
    
  
    db.execute(
      statement,
      [role,course,email],
      (error, result) => {
        console.log("result:",result);
        response.send(utils.createResponse(error, result));
      }
    );
  });

  router.post("/showsubject", authorizeRole(["admin"]), (request, response) => {
    console.log("*: INside show subject");
    const token = request.data;
    console.log("**: ",request.body);
    const { course} = request.body;
    console.log("***: ", course );
  
      const stat = `SELECT course_id FROM courses WHERE course_name= ? `
      console.log("stat:",stat);
      db.execute(
        stat,
        [course],
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
        const statement = `SELECT subject_name FROM subjects WHERE course_id=?`;
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

  router.post("/addsubject", authorizeRole(["admin"]), (request, response) => {
    console.log("*: INside add subject");
    const token = request.data;
    console.log("**: ",request.body);
    const { course,subject1} = request.body;
    console.log("***: ", course,subject1 );
  
      const stat = `SELECT course_id FROM courses WHERE course_name= ? `
      console.log("stat:",stat);
      db.execute(
        stat,
        [course],
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
        const statement = `INSERT INTO subjects (subject_name,course_id) VALUES (?,?) `;
        console.log("statement:",statement);
       // const encryptedPassword = String(crypto.SHA256(password));
    
        db.execute(statement , [subject1,cid["course_id"]] ,
          (error, result) => {
            console.log("Mysql error ",error);
            console.log("Mysql result ",result);
            response.send(utils.createResponse(error, result));
          }
        );
      }
      });
    
  });

  router.post("/showallgroups", authorizeRole(["admin"]), (request, response) => {
    console.log("*: INside show all groups");
    const token = request.data;
    console.log("**: ",request.body);
    const { course} = request.body;
    console.log("***: ", course );
  
      const stat = `SELECT course_id FROM courses WHERE course_name= ? `
      console.log("stat:",stat);
      db.execute(
        stat,
        [course],
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
        const statement = `SELECT group_name FROM course_groups WHERE course_id=?`;
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
  router.post("/addgroup", authorizeRole(["admin"]), (request, response) => {
    console.log("*: INside add group");
    const token = request.data;
    console.log("**: ",request.body);
    const { course,group} = request.body;
    console.log("***: ", course,group );
  
      const stat = `SELECT course_id FROM courses WHERE course_name= ? `
      console.log("stat:",stat);
      db.execute(
        stat,
        [course],
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
        const statement = `INSERT INTO course_groups (group_name,course_id) VALUES (?,?) `;
        console.log("statement:",statement);
       // const encryptedPassword = String(crypto.SHA256(password));
    
        db.execute(statement , [group,cid["course_id"]] ,
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