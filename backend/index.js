const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const utils = require("./utils");
const config = require("./config");
const jwt = require("jsonwebtoken");
const authorizeRole= require("./middlewares/AuthorizeRole");

const port = config.PORT_NO;

console.log(port);

// create a new express application
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

// return version
app.get("/version", (req, res) => res.send(utils.createSuccessResponse("1.0")));

// configure protected routes
app.use((request, response, next) => {
  const skipUrls = [
    "/student/login",
    "/student/register",
    "/staff/login",
    "/staff/register",
  ];

  if (skipUrls.includes(request.url)) {
    
    // If the request URL is in skipUrls, skip token verification
    next();
  } else {
    // Check if Authorization header exists
    if (!request.headers.authorization) {
      response
        .status(401)
        .send(utils.createErrorResponse("missing authorization header"));
      return;
    }
    console.log("*: ",request.headers.authorization);
    // Extract the token from the Authorization header
    const token = request.headers.authorization.split(" ")[1];

    console.log("backend token", token);

    if (!token) {
      response.status(401).send(utils.createErrorResponse("missing token"));
      return;
    } else {
      try {
        // Verify the token
        console.log("**")
        const payload = jwt.verify(token, config.SECRET_KEY);
        console.log("for show courses: ",payload);
        request.data = payload;
        next();
      } catch (ex) {
        // Handle invalid token
        console.log("ex", ex);

        response.status(401).send(utils.createErrorResponse("invalid token"));
        return;
      }
    }
  }
});

// add Routes

const studentRoutes = require("./routes/student");

const staffRoutes = require("./routes/staff");

const showCourseRoutes= require("./routes/admin");


app.use("/student", studentRoutes);

app.use("/staff", staffRoutes);

app.use("/admin", showCourseRoutes);

app.listen(port, () => console.log(`App listening on port ${port}!`));
