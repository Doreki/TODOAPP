const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
var db;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.nn1apzs.mongodb.net/?retryWrites=true&w=majority', (err, client) => {

if(err) return console.log(err);

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
  resp.render('index.ejs');
});

app.get('/write', (req, resp) => {
  resp.render('write.ejs');
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
    resp.status(200).send({ message : '성공했습니다.'});
  })
});

app.get('/detail/:id', (req, resp) => {
  
    db.collection('post').findOne({_id: parseInt(req.params.id)}, (err, result)=>{
      if(result == null) {
        resp.send('해당 게시물이 없습니다.');
      } else {
        console.log(result);
        resp.render('detail.ejs', { data : result});
      }
    });
})

app.get('/edit/:id', (req,resp) => {
  db.collection('post').findOne({_id : parseInt(req.params.id)}, (err,result) => {
    if(result == null) {
      resp.send('해당 게시글이 존재하지 않습니다.');      
    } else {
      console.log(result);
      resp.render('edit.ejs', { post : result});
    }
  });
})

app.put('/edit', (req,resp) => {
  db.collection('post').updateOne({_id :parseInt(req.body.id)},{ $set : {title:req.body.title, date: req.body.date }},(err,result) => {
    console.log('수정완료');
    resp.redirect('/list');
  })
})