var fs = require("fs");

var formattedDate = function() {
var m_names = new Array("January", "February", "March",
"April", "May", "June", "July", "August", "September",
"October", "November", "December");

var d = new Date();
var curr_date = d.getDate();
var curr_month = d.getMonth();
var curr_year = d.getFullYear();
var date = curr_date + "-" + m_names[curr_month]
+ "-" + curr_year;

return date;
}

var today = formattedDate();

var Item = function(obj) {
  for(prop in obj) {
    this[prop] = obj[prop];
  }
};

var conf = {
  folder : "api/",
  filetype : ".json",
  filePath : function(file){
    return this.folder + file + this.filetype;
  }
}

var API = function() {
  this.items = {};
  for(obj in arguments) {
      this.items[arguments[obj]] = [];
  }
}

API.prototype.start = function() {
  this.files = this.files || [];
  if(this.files.length <= 0) {
    for(obj in this.items) {
      if(typeof this.items[obj] !== "function" && obj !== "files")this.files.push(obj);
    }
  }
  this.items = this.checkFile();
}

API.prototype.checkFile = function(callback) {
  var fileToCheck = this.files;
  var items = this.items;
  fs.exists(__dirname + "/api", function(apiExists){
    if(apiExists) {
      console.log("api exists");
    } else {
      fs.mkdir("api/", function(){
        console.log("api created");
      });
    }
    fileToCheck.forEach(function(file){
      fs.exists(__dirname + "/" + conf.filePath(file), function(fileExists){
        if(fileExists) {
          console.log("api/" + file + " exists");
            fs.readFile(conf.filePath(file), "utf8", function(err, data){
              if(err)throw err;
              items[file] = JSON.parse(data);
            });
        } else {
          console.log("Created api/" + file);
          fs.writeFile(conf.filePath(file), JSON.stringify(items[file]), "utf8", function(err){
              if(err)throw err;
          });
        }
      });
    });
  });
  return items;
}

API.prototype.writeFile = function(type, items) {
  items = items || this.items;
  fs.writeFile(conf.filePath(type), JSON.stringify(items[type]), "utf8", function(err){
    if(err)throw err;
  })
}

API.prototype.writePost = function(desc, file) {
  var postsFile = __dirname + "/_posts/" + desc.title + ".md";
  console.log(desc);
  fs.writeFile(postsFile, "{{" + JSON.stringify(desc) + "}}" + "\n" + file, "utf8", function(err){
    if(err)throw err;
  });
}

API.prototype.addItem = function(item) {
  var data = new Item(item);
  var items = this.items;
  for(prop in items) {
    if(data.type === prop ) {
      data.id = items[data.type].length;
      data.createdOn = formattedDate();
      this.items[data.type].push(data);
      this.writeFile(data.type);
    }
  }
}

API.prototype.deleteItem = function(itemType, itemId) {
  var items = this.items;
  if(itemType) {
    if(items[itemType][itemId]) {
      var id = itemId;
      items[itemType].splice(id, 1);
      for(var i = id; i < items[itemType].length; i++) {
        items[itemType][i].id = i;
      }
      this.writeFile(itemType, items);
    } else {
      console.log('not an item');
    }
  } else {
    console.log('Missing the item Type');
  }
}

API.prototype.modifyItem = function(itemType, itemId, item) {
  var items = this.items;
  if(item) {
    items[itemType][itemId] = item;
    if(!item.id)item.id = itemId;
    this.writeFile(itemType, items);
  } else {
    console.log("no modification specified, you must enter an object");
  }
}


module.exports = API;
