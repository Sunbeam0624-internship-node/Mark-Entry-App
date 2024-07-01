const express = require("express");
const router = express.Router();
const db = require("../db");
const utils = require("../utils");
const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { validateToken } = require("../middlewares/AuthMiddleware");
const authorizeRole = require("../middlewares/AuthorizeRole");

const TABLE_NAME = config.STUDENT_TABLE_NAME;
const SUBJECT_TABLE = config.SUBJECT_TABLE_NAME;
const COURSE_TABLE = config.COURSE_TABLE_NAME;
const GROUP_TABLE = config.GROUP_TABLE_NAME;
const STUDENT_TABLE = config.STUDENT_TABLE_NAME;
const MARKS_ENTRY_TABLE = config.MARK_ENTER_TABLE_NAME;
const NEW_MARK_ENTRY_TABLE = config.MARK_ENTRY_TABLE_2;

// Token verification middleware
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

// REGISTER API
router.post("/register", (request, response) => {
  console.log("*: INside student register");
  console.log("**: ",request.body);
  const { rollNo, studentName, email, password, } = request.body;
  console.log("***: ", rollNo, studentName, email, password,);

  // create a sql statement
  // const statement = `INSERT INTO ${TABLE_NAME} 
  //   (rollNo, studentName, email, password)
  //   VALUES (?, ?, ?, ?)`;
  const statement = `INSERT INTO students 
    (roll_number, student_name, email, password)
    VALUES (?, ?, ?, ?)`;


  // encrypt the password
  const encryptedPassword = String(crypto.SHA256(password));

  db.execute(
    statement,
    [rollNo, studentName, email, encryptedPassword],
    (error, result) => {
      response.send(utils.createResponse(error, result));
    }
  );
});

// LOGIN API
router.post("/login", (request, response) => {
  // Destructuring email and password from the request body
  const { email, password } = request.body;

  console.log("email + password ", email, password);

  const statement = `SELECT student_id, roll_number, student_name, email 
      FROM students 
      WHERE email = ? AND password = ?`;

  console.log("statement ", statement);

  // Encrypting the provided
  const encryptedPassword = String(crypto.SHA256(password));

  // Executing the SQL query with user-provided email and encrypted password
  db.execute(statement, [email, encryptedPassword], (error, users) => {
    if (error) {
      response.send(utils.createErrorResponse(error));
    } else {
      if (users.length === 0) {
        response.send(utils.createErrorResponse("user not found!"));
      } else {
        const student = users[0];
        console.log("After response from mysql: ",student);


        // Creating a payload with user information for JWT token
        const payload = {
          student_id: student["student_id"],
          email: student["email"],
          roll_number: student["roll_number"],
          student_name: student["student_name"],
          role: "students",  //yete role apan set kela ahe....
        };

        console.log("Check Student payload ", payload);

        // Generating a JWT token with the payload and a secret key
        const token = jwt.sign(payload, config.SECRET_KEY);

        response.send(
          utils.createSuccessResponse({
            token,
            // username: user["username"], or
            student_name: student.student_name,
          })
        );
      }
    }
  });
});

//!OLD SHOW MAKRS API
router.post("/show-marks", authorizeRole(["student"]), (request, response) => {
  const { student_id } = request.body; // Assuming the student_id is provided in the request body

  const query = ` 
  SELECT 
  Students.roll_number,
  Students.student_name,
  Students.student_name, 
  Course_Groups.group_name, 
  Subjects.subject_name, 
  Courses.course_name, 
  MarksEntry.theory,
  MarksEntry.lab,
  MarksEntry.IA1,
  MarksEntry.IA2
  FROM MarksEntry
  INNER JOIN Students ON MarksEntry.student_id = Students.student_id
  INNER JOIN Course_Groups ON MarksEntry.group_id = Course_Groups.group_id
  INNER JOIN Subjects ON MarksEntry.subject_id = Subjects.subject_id
  INNER JOIN Courses ON Course_Groups.course_id = Courses.course_id
  WHERE MarksEntry.student_id = ?`;
  // console.log("query ", query);
  // console.log("student_id", student_id);

  db.execute(query, [student_id], (error, results) => {
    if (error) {
      response.status(500).send(utils.createErrorResponse(error));
    } else {
      response.send(utils.createSuccessResponse(results));
    }
  });
});

// SHOW STUDENT MARKS
router.get(
  "/show-student-mark/:id",
  authorizeRole(["student"]),
  (request, response) => {
    const { id } = request.params;
    console.log("id ", id);

    // Query to fetch student marks
    const query = `
    SELECT
      c.course_name,
      s.subject_name,
      g.group_name,
      st.student_name,
      me.theory,
      me.lab,
      me.ia1,
      me.ia2,
      me.approved
    FROM
      ${MARKS_ENTRY_TABLE} me
    JOIN ${COURSE_TABLE} c ON me.course_id = c.course_id
    JOIN ${SUBJECT_TABLE} s ON me.subject_id = s.subject_id
    JOIN ${GROUP_TABLE} g ON me.group_id = g.group_id
    JOIN ${STUDENT_TABLE} st ON me.student_id = st.student_id
    WHERE
      me.student_id = ?`;

    // Execute the query
    db.execute(query, [id], (error, results) => {
      if (error) {
        console.error("Error fetching student marks:", error);
        response.status(500).send(utils.createErrorResponse(error.message));
      } else {
        response.send(utils.createSuccessResponse(results));
      }
    });
  }
);

router.get(
  "/show-student-mark2/:id",
  authorizeRole(["student"]),
  (request, response) => {
    const { id } = request.params;
    console.log("id ", id);

    // Query to fetch student marks
    const query = `
    SELECT
      c.course_name,
      s.subject_name,
      g.group_name,
      st.student_name,
      MAX(CASE WHEN me.type = 'Theory' AND me.theory IS NOT NULL THEN me.theory END) AS theory,
      MAX(CASE WHEN me.type = 'Lab' AND me.lab IS NOT NULL THEN me.lab END) AS lab,
      MAX(CASE WHEN me.type = 'IA1' AND me.ia1 IS NOT NULL THEN me.ia1 END) AS ia1,
      MAX(CASE WHEN me.type = 'IA2' AND me.ia2 IS NOT NULL THEN me.ia2 END) AS ia2
    FROM
      ${NEW_MARK_ENTRY_TABLE} me
    JOIN ${COURSE_TABLE} c ON me.course_id = c.course_id
    JOIN ${SUBJECT_TABLE} s ON me.subject_id = s.subject_id
    JOIN ${GROUP_TABLE} g ON me.group_id = g.group_id
    JOIN ${STUDENT_TABLE} st ON me.student_id = st.student_id
    WHERE
      me.student_id = ? AND me.approved = 0
    GROUP BY
      c.course_name, s.subject_name, g.group_name, st.student_name`;

    // Execute the query
    db.execute(query, [id], (error, results) => {
      if (error) {
        console.error("Error fetching student marks:", error);
        response.status(500).send(utils.createErrorResponse(error.message));
      } else {
        response.send(utils.createSuccessResponse(results));
      }
    });
  }
);

module.exports = router;
