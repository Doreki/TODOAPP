const router = require('express').Router();

function isLogin(req, resp, next) {
  if(req.user){
    next();
  } else {
    resp.send('로그인 안하셨는데요?');
  }
}

router.use('/shirts',isLogin);

router.get('/sub/sports', (req,resp) => {
  resp.send('스포츠 게시판');
});

router.get('/sub/game', (req,resp) => {
  resp.send('게임 게시판');
});

module.exports = router;