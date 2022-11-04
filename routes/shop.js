const router = require('express').Router();

function isLogin(req, resp, next) {
  if(req.user){
    next();
  } else {
    resp.send('로그인 안하셨는데요?');
  }
}

router.use('/shirts',isLogin);

router.get('/shirts', (req, resp) =>{
  resp.send('셔츠 파는 페이지입니다.');
});

router.get('/pants', (req, resp) => {
  resp.send('바지 파는 페이지입니다.');
}); 

module.exports = router;