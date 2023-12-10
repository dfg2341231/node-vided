const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// MySQL 연결 설정
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '362121',
  database: 'sys',
});

db.connect((err) => {
  if (err) {
    console.log('MySQL 연결 실패: ', err);
  } else {
    console.log('MySQL 연결 성공');
  }
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 뷰 엔진 설정 (예: EJS)
app.set('view engine', 'ejs');

// 비디오 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).single('video');

// 루트 페이지
app.get('/', (req, res) => {
  // MySQL에서 비디오 목록 조회
  db.query('SELECT * FROM videos', (err, results) => {
    if (err) throw err;
    res.render('index', { videos: results });
  });
});

// 비디오 업로드 페이지
app.get('/upload', (req, res) => {
  res.render('upload');
});

// 비디오 업로드 처리
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) throw err;

    // MySQL에 비디오 정보 저장
    const video = { title: req.body.title, path: req.file.filename };
    db.query('INSERT INTO videos SET ?', video, (err, result) => {
      if (err) throw err;
      res.redirect('/');
    });
  });
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
