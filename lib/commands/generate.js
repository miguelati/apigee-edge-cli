var normalizedPath = require("path").join(__dirname, "commands");

console.log(normalizedPath);
/*
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./routes/" + file);
});*/