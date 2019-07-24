//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin_sai:Pilipda123@cluster0-2mljg.mongodb.net/todolistDB", {
  useNewUrlParser: true
});


let Schema = mongoose.Schema;
let itemsSchema = new Schema({
  name: String
});
let Item = mongoose.model("Item", itemsSchema);


let listSchema = new Schema({
  name: String,
  items: [itemsSchema]
})
let List = mongoose.model("List", listSchema)

let item1 = new Item({
  name: "Grocery shopping"
});
let item2 = new Item({
  name: "Recharge AIS"
});
let item3 = new Item({
  name: "Finish this course"
});

let defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {
  Item.find({}, function(error, results) {
    if (results.length === 0) {
      Item.insertMany(defaultItems, function(error) {
        if (error) {
          console.log(error);
        } else {
          console.log("Successfully inserted items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: results });
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem
  const listName = req.body.list

  let newItem = new Item({
    name: itemName
  })

  if(listName === "Today"){
    newItem.save()
    res.redirect("/")
  }else{
    List.findOne({name:listName}, function(error, list_found){
      list_found.items.push(newItem)
      list_found.save()
      res.redirect("/"+listName)
    })
  }
  

});
app.post("/delete", function(req, res) {

  const itemID = req.body.checkbox
  const listTitle = req.body.list

  if(listTitle === "Today"){
    Item.findByIdAndRemove(itemID, function(error, body){
      if(error){
        console.log(error)
      }else{
        console.log("Successfully removed item "+body)
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate({name:listTitle}, {$pull:{items:{_id:itemID}}}, function(error, foundItem){
      if(!error){
        res.redirect("/"+listTitle)
      }
    })
  }

});

app.get("/:customlistName", function(req, res) {
  const customlistName = _.capitalize(req.params.customlistName)
  List.findOne({name:customlistName}, function(error, listName){
    if(!error){
      if(!listName){
        // Create new list
        const list = new List({
          name: customlistName,
          items: defaultItems
        })
        list.save()
        res.redirect("/"+customlistName)
      }else{
        //Print found list
        res.render("list", { listTitle: listName.name, newListItems: listName.items });
      }
    }
  })
});

app.get("/work", function(req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
