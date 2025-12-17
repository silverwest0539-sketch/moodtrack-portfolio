import React from "react"
import LandingPage from "./pages/LandingPage/LandingPage"
import MainCalendar from "./pages/MainCalendar/MainCalendar"
import DiaryPromptModal from "./pages/DiaryPromptModal/DiaryPromptModal"
import DiaryEditor from "./pages/DiaryEditor/DiaryEditor"
import EmotionResult from "./pages/EmotionResult/EmotionResult"
import EmotionStats from "./pages/EmotionStats/EmotionStats"
import { useEffect } from 'react';
import axios from 'axios';
import { useState } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import HomeWeekly from "./pages/HomeWeekly/HomeWeekly"; // 새로운 메인 화면


// 컴포넌트 (Components)
// import BottomNav from "./components/layout/BottomNav";
import "./App.css"; // 스타일 파일이 있다면 유지

import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";

function App() {
  const location = useLocation();

  // 하단 네비게이션 바를 숨길 경로들을 여기에 적어줍니다.
  // 예: 랜딩페이지(/landing), 로그인 등에서는 네비게이션 바가 안 보이게 설정
  // AppContent 내부의 hideNavRoutes 에도 추가 (로그인 화면엔 하단바 숨김)
  const hideNavRoutes = ["/landing", "/login", "/signup"];
  
  // 현재 경로가 숨길 경로에 포함되지 않으면 Nav바를 보여줍니다.
  const showNav = !hideNavRoutes.includes(location.pathname);

  const [data, setData] = useState('')
  const [obj, setObj] = useState({})

  const sendToServer = ()=>{
    console.log('sendToServer', data);
    axios.post('http://localhost:3000/getData', {
      data : data
    }).then(res => {
      console.log('res', res.data)
      setObj(res.data)
      
    })
    
  }

    useEffect(() => {
    fetch('http://localhost:3000/')
      .then(() => console.log('React -> Node 연결 성공!'))
      .catch(err => console.error(err));
  }, []);
  return (
    <Routes>
     <Route path='/' element = {<LandingPage/>}/>
     <Route path='login' element = {<Login/>} />
     <Route path='signup' element = {<Signup/>} />
     <Route path='weekly' element={<HomeWeekly />} />
     <Route path='main' element = {<MainCalendar/>} />
     <Route path='diary' element = {<DiaryPromptModal/>}/>
     <Route path='diaryEdit' element = {<DiaryEditor/>}/>
     <Route path='emotionResult' element = {<EmotionResult/>}/>
     <Route path='emotionStats' element = {<EmotionStats/>}/>
    </Routes>
  )
}

export default App;
