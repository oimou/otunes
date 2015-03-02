"use strict";

var path = require("path");
var express = require("express");
var app = express();

app.set("port", process.env.PORT || 34332);
app.use(express["static"](path.join(__dirname, "./public")));
app.listen(app.get("port"), function () {
    console.log("listening on port: ", app.get("port"));
});
