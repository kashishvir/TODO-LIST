//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose= require("mongoose");
const app = express();
const _ =require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-kashish:4325kashish@cluster0.1yjkh.mongodb.net/todolistDB",{useNewUrlParser: true});

//now create its schema:

const itemsSchema = {
  name: String
};

const listSchema={
  name: String,
  items: [itemsSchema]
};

//mongoose model: const Item = mongoose.model{
//  "singularcollection", schemaname};
const Item = mongoose.model(
  "item",itemsSchema
);
const List = mongoose.model(
  "List",listSchema
);

const Item1 = new Item({
  name: "welcome to todo list!"
});
const Item2 = new Item({
  name: "Hit + button to add new items."
});
const Item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const allitems=[Item1,Item2,Item3];


app.get("/", function(req, res) {
  Item.find({},function(err,foundItems)
    {
      if(foundItems.length === 0){
        Item.insertMany(allitems,function(err)
        {
          if(err)
          {
            console.log(err);
          }
          else
          console.log("success!!")
        });
      res.redirect("/");}
        else{
          res.render("list", {listTitle: "Today", newListItems: foundItems});
         }
        });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
 if(listName === "Today"){
   item.save();
   res.redirect("/");
 }
 else {
   List.findOne({name: listName}, function(err,foundList){
     foundList.items.push(item);
     foundList.save();
     res.redirect("/" + listName);
   });
 }

/*  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }*/
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else
  List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}}, function(err,foundList){
    if(!err)
    {res.redirect("/"+listName);
    }
  });
});

app.get("/:customListName",function(req,res)
{  const customListName = _.capitalize(req.params.customListName);

     List.findOne({name: customListName},function(err, foundList)
    { if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: customListName,
          items: allitems
        });
        list.save();
       res.redirect("/" + customListName);
    }
     else{
        //show an existing list
        res.render("list",{listTitle: foundList.name, newListItems:foundList.items});
    }
    }
 });
});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
