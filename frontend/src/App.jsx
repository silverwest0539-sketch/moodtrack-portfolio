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
import { Routes, Route } from 'react-router-dom';

function App() {

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
     <Route path='main' element = {<MainCalendar/>} />
     <Route path='diary' element = {<DiaryPromptModal/>}/>
     <Route path='diaryEdit' element = {<DiaryEditor/>}/>
     <Route path='emotionResult' element = {<EmotionResult/>}/>
     <Route path='emotionStats' element = {<EmotionStats/>}/>
    </Routes>
  )
}

export default App;
