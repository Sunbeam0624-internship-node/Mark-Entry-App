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
    
    const statement = `SELECT roll_number,student_name,group_name,email FROM students  left join course_groups on students.group_id=course_groups.group_id WHERE students.course_id =?`; 
    console.log("statement:",statement);

    db.execute(statement , [cid["course_id"]] ,
      (error, result) => {
        if(error)
          {
            console.log("error");
          }
          else {
            
            console.log("Mysql result ",result);
            response.send(utils.createResponse(error, result));
      }
        });
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
  
    const stat = `SELECT roll_number,student_name,group_name,email FROM students  left join course_groups on students.group_id=course_groups.group_id WHERE roll_number=?`;
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
  console.log("*: INside update student");
  const token = request.data;
  console.log("**: ",request.body);
  const { rolNo, studentName, email, groupName } = request.body;
  console.log("***: ", rolNo, studentName, email, groupName );

    const stat = `SELECT group_id FROM course_groups WHERE group_name= ? `;
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

router.get("/markscheme", authorizeRole(["coordinator"]) , (request , response) => {
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
  
  const statement = `SELECT theory_weightage,lab_weightage,ia1_weightage,ia2_weightage,subject_name  FROM evaluationscheme  left join subjects on evaluationscheme.subject_id=subjects.subject_id WHERE subjects.course_id =?`
  console.log("statement:",statement);

  db.execute(statement , [cid["course_id"]] ,
    (error, result) => {
      if(error)
        {
          console.log("error");
        }
        else {
          console.log("Mysql error ",error);
          console.log("Mysql result ",result);
          response.send(utils.createResponse(error, result));
}
    });
  }
  
});

      });

      router.post("/addmark", authorizeRole(["coordinator"]), (request, response) => {
        console.log("*: INside add mark");
        const token = request.data;
        console.log("**: ",request.body);
        const { Subject,theoryMark,labMark,ia1Mark,ia2Mark} = request.body;
        console.log("***: ", Subject,theoryMark,labMark,ia1Mark,ia2Mark );
      
          const stat = `SELECT subject_id FROM subjects WHERE subject_name= ? `
          console.log("stat:",stat);
          db.execute(
            stat,
            [Subject],
            (error, result) => {
                if(error)
                {
                  console.log("error");
                }
                else {
                  var sid = result[0];
                  console.log("result:",sid);
                  var result1 = sid["subject_id"];
                  console.log("#result:",result1);
            const statement = `INSERT INTO evaluationscheme (theory_weightage,lab_weightage,ia1_weightage,ia2_weightage,subject_id) values (? ,? ,? ,? ,?)`;
            console.log("statement:",statement);
           // const encryptedPassword = String(crypto.SHA256(password));
        
            db.execute(statement , [theoryMark,labMark,ia1Mark,ia2Mark,sid["subject_id"]] ,
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
