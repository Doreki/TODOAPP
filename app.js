require('dotenv').config();
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
MongoClient.connect(process.env.DB_URL, (err, client) => {

if(err) return console.log(err);

db = client.db('todoapp');

app.listen(process.env.PORT, () => {
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

app.get('/list', (req,resp) => {

  db.collection('post').find().toArray((err, result) => {
    console.log(result);
    resp.render('list.ejs', {posts : result});
  });

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
});

const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const { route } = require('./routes/shop.js');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req,resp) => {
  resp.render('login.ejs')
});

app.post('/login', passport.authenticate('local', {
  failureRedirect : '/fail'
}), (req,resp) => {
  resp.redirect('/')
});

app.get('/mypage', isLogin, (req,resp) => {
  console.log(req.user);
  resp.render('mypage.ejs', {user : req.user});
});

function isLogin(req, resp, next) {
  if(req.user){
    next();
  } else {
    resp.send('로그인 안하셨는데요?');
  }
}

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, (id, pw, done) => {
  console.log(id, pw);
  db.collection('login').findOne({ id: id }, function (err, result) {
    if (err) return done(err)

    if (!result) return done(null, false, { message: '존재하지않는 아이디요' })
    if (pw == result.pw) {
      return done(null, result)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

passport.serializeUser((user, done) => {
  done(null, user.id)
});

passport.deserializeUser((id, done) => {
  db.collection('login').findOne({id:id}, (err,result) => {
    done(null, result);
  });
});

app.delete('/delete', (req, resp) => {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);

  const deleteData = {_id : req.body._id, writer : req.user._id};

  db.collection('post').deleteOne(deleteData, (err,result) => {
    console.log('삭제완료');
    if(err) console.log(err);
    resp.status(200).send({ message : '성공했습니다.'});
  })
});

app.post('/register',(req,resp) => {
  db.collection('login').insertOne( {id : req.body.id, pw : req.body.pw}, (err,result) => {
    resp.redirect('/');
  });
});

app.post('/add', (req,resp) => {
  resp.send('전송완료');
  db.collection('counter').findOne({name : 'totalPosts'}, (err,result) => {
    const totalCount = result.totalCount;
    console.log(req.user);
    
    db.collection('login').findOne({_id : req.user._id} ,(err,result) => {
      const posts = {_id:totalCount+1, title:req.body.title, date:req.body.date, writer : result.id, writerId : result._id};
      db.collection('post').insertOne(posts,(err,result) => {
        db.collection('counter').updateOne({name:'totalPosts'},{ $inc : {totalCount:1}},(err, result) => {
            if(result) {return console.log(result)};
        })
      });
    });
  });
});

app.get('/search', (req,resp) => {
  console.log(req.query.value);
  const searchCondition = [
    {
      $search: {
        index: 'titleSearch',
        text : {
          query: req.query.value,
          path: 'title'
        }
      }
    },
    // { $project : {title:1,_id:0, score: {$meta: "searchScore"}}},
    { $sort : {_id : -1}},
    { $limit: 10}
  ]
  
  db.collection('post').aggregate(searchCondition).toArray((err,result) => {
    console.log(result);
    resp.render('search-list',{posts : result});
  });
})

app.use('/shop', require('./routes/shop.js'));

app.use('/board', require('./routes/board'));

let multer = require('multer');
const storage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null, './public/image')
  },
  filename : (req,file,cb) => {
    cb(null, file.originalname)
  }
});

const upload = multer({storage: storage});

app.get('/upload', (req,resp) => {
  resp.render('upload.ejs')
});

app.post('/upload', upload.single('profile'), (req, resp) => {
  resp.send('업로드완료');
})

app.get('/image/:imageName', (req,resp) => {
  resp.sendFile(__dirname + '/public/image/'+req.params.imageName)
})

const{ ObjectId } = require('mongodb');
app.post('/chat',(req,resp) => {
  console.log(req.body);
    db.collection('chatroom').insertOne({
      title:"채팅",
      member: [ObjectId(req.body.chatedUser), req.user._id],
      date: new Date()
    })
    resp.send('채팅방이 만들어졌습니다.');
})

app.get('/chat', (req,resp) => {

  db.collection('chatroom').find({member:req.user._id}).toArray((err,result) => {
    console.log(result);
    resp.render('chat.ejs', {chats : result});
  });
})

app.post('/message',isLogin, (req,resp) => {
  const message = {
    parent : req.body.parent,
    content : req.body.content,
    userId : req.user._id, 
    date : new Date()
  }
  db.collection('message').insertOne(message).then(() => {
    console.log('DB저장성공');
    resp.send('DB저장성공');
  })
});

app.get('/message/:chatRoomId', isLogin, (req,resp) => {

  resp.writeHead(200, {
    "Connection" : "keep-alive",
    "Content-Type" : "text/event-stream",
    "Cache-Control": "no-cache",
  });

  db.collection('message').find({parent : req.params.chatRoomId}).toArray()
  .then((result) => {
    console.log(result);
    resp.write('event: test\n');
    resp.write('data: ' + JSON.stringify(result) + '\n\n');
  })

  const pipeline = [
    { $match: {'fullDocument.parent' : req.params.chatRoomId} }
  ];
  const collection = db.collection('message');
  const changeStream = collection.watch(pipeline);
  changeStream.on('change', (result) => {
    resp.write('event: test\n');
    resp.write('data: ' + JSON.stringify([result.fullDocument])+ '\n\n');
  });
});
