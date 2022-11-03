const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');


var db;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.nn1apzs.mongodb.net/?retryWrites=true&w=majority', (err, client) => {

if(err) return console.log(에러);

db = client.db('todoapp');

app.listen(8080, () => {
  console.log('listening on 8080');
  });

// db.collection('post').insertOne({이름 : 'John' , _id : 100}, (err,result) => {
//   console.log('저장완료');
// });



})



app.get('/pet', (req, resp) => {
  resp.send('펫용품 쇼핑할 수 있는 페이지입니다.');
});

app.get('/beauty', (req, resp) => {
  resp.send('뷰티용품 쇼핑 페이지임');
});

app.get('/', (req, resp) => {
  resp.sendFile(__dirname + '/index.html');
});

app.get('/write', (req, resp) => {
  resp.sendFile(__dirname + '/write.html');
});

app.post('/add', (req,resp) => {
  resp.send('전송완료');
  db.collection('counter').findOne({name : 'totalPosts'}, (err,result) => {
    console.log(result.totalPosts);
    const totalCount = result.totalCount;

    db.collection('post').insertOne({_id:totalCount+1, title:req.body.title, date:req.body.date},(err,result) => {
      console.log("todo 저장완료");
      db.collection('counter').updateOne({name:'totalPosts'},{ $inc : {totalCount:1}},(err, result) => {
          if(err) {return console.log(err)}
      })
    });

  });
});

app.get('/list', (req,resp) => {

  db.collection('post').find().toArray((err, result) => {
    console.log(result);
    resp.render('list.ejs', {posts : result});
  });

});

app.delete('/delete', (req, resp) => {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  db.collection('post').deleteOne(req.body, (err,result) => {
    console.log('삭제완료');
  })
})