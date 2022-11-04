const router = require('express').Router();



router.get('/sub/sports', (req,resp) => {
  resp.send('스포츠 게시판');
});

router.get('/sub/game', (req,resp) => {
  resp.send('게임 게시판');
});

module.exports = router;