// const http = require("http");
// const server = http.createServer();
// const PORT = 3000;
// server.addListener("request", (req, res) => {});

// server.listen(PORT, () => {
//   console.log(`${PORT} server start`);
// });

const express = require("express");
const app = express();
const fs = require("fs");
const fsPromise = fs.promises;
const path = require("path");
app.set("port", 3000);

// app.use(express.json({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

const url = path.join(__dirname, "data", "todo.json");

app.get("/", async (req, res) => {
  // get에서 todo.json을 가져오는방법?
  // const raw = await fsPromise.readFile(url, "utf-8");

  res.sendFile(path.join(__dirname, "views", "todo.html"));
});

// 데이터 가져오기
app.post("/", async (req, res) => {
  // get에서 todo.json을 가져오는방법? => 같은 경로 POST로 가져온다
  const raw = await fsPromise.readFile(url, "utf-8");
  if (JSON.parse(raw).length === 0) {
    res.json({
      success: false,
      message: "데이터가 없습니다",
      todos: raw,
    });
    return;
  }
  res.json({
    success: true,
    message: "출력성공!!",
    todos: raw,
  });
});

// 데이터 추가
app.post("/add", async (req, res) => {
  // undefined
  // express.json({ extended: true }) , express.urlencoded({extended: true }) 필요
  // extended: false - querystring 모듈 extended: true - qs 모듈을 사용한다.
  const { todo } = req.body;
  const raw = await fsPromise.readFile(url, "utf-8");
  const datas = JSON.parse(raw);

  const id = datas.length ? datas[datas.length - 1].id : 0;
  const new_todo = { id: id + 1, todo, checked: false };
  // todo.json을 res로 보낸후 todo.html에서 localStorage처리
  // localStorage is not defined...
  // localStorage.setItem(
  //   "todos",
  //   JSON.stringify([...datas, new_todo], null, "  ")
  // );
  await fsPromise.writeFile(
    url,
    JSON.stringify([...datas, new_todo], null, "  "),
    (err) => {
      if (err) console.log(err);
    }
  );
  if ([...datas, new_todo].length > datas.length) {
    res.json({
      success: true,
      message: "정상등록",
      todos: JSON.stringify([...datas, new_todo], null, "  "),
    });
    return;
  }
  res.json({
    success: false,
    message: "등록실패",
  });
});

// 데이터 제거 => 연속으로 추가하고 삭제하면 에러 발생
app.delete("/remove", async (req, res) => {
  const { id } = req.body;
  const raw = await fsPromise.readFile(url, "utf-8");
  const datas = JSON.parse(raw);
  let check = false;
  const new_datas = datas.filter((data) => {
    if (data.id !== +id) {
      return data;
    } else {
      check = true;
    }
  });
  await fsPromise.writeFile(url, JSON.stringify(new_datas), (err) => {
    if (err) console.log(err);
  });
  if (!check) {
    res.json({
      success: false,
      message: "삭제할 데이터가 없습니다",
    });
    return;
  }
  res.json({
    success: true,
    message: "삭제완료",
    todos: JSON.stringify(new_datas),
  });
});

// 데이터 수정
app.put("/update", async (req, res) => {
  const { id, checked } = req.body;

  const raw = await fsPromise.readFile(url, "utf-8");
  const datas = JSON.parse(raw);
  let check = false;
  const index = datas.findIndex((data) => {
    if (data.id === +id) {
      check = true;
      return true;
    }
  });
  // 정렬안해도됨 => 그자리에서 바꿈
  datas[index].checked = checked;
  await fsPromise.writeFile(url, JSON.stringify(datas), (err) => {
    if (err) console.log(err);
  });
  if (check) {
    res.json({
      success: true,
      message: "수정완료",
      todos: JSON.stringify(datas),
    });
  } else {
    res.json({
      success: false,
      message: "수정실패",
    });
  }
});

app.listen(app.get("port"), () => {
  console.log(`port: ${app.get("port")}`);
});
