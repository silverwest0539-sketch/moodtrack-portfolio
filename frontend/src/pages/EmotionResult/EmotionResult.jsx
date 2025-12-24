// // 일기 작성 후 AI 분석 결과 페이지

import React from "react";
import './EmotionResult.css'
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

import { Radar } from 'react-chartjs-2'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

function EmotionResult({
  onViewStats,
}) {
  const location = useLocation()

  //DiaryEditor에서 전달받은 데이터
  const { date, content, finalScore, emotionScores, comment } = location.state || {}

  // 점수 애니메이션용
  const [displayScore, setDisplayScore] = useState(0)

  // 감정 데이터 변환
  const emotionOrder = ['기쁨', '슬픔', '화남', '중립']

  const emotionValues = emotionScores
    ? emotionOrder.map((emotion) => emotionScores[emotion])
    : []

  const radarData = {
    labels: emotionOrder,
    datasets: [
      {
        label: '감정 분포',
        data: emotionValues,
        backgroundColor: 'rgba(255, 182, 193, 0.35)',
        borderColor: '#ffb6c1',
        borderWidth: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#ffb6c1',
      },
    ],
  }

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          display: false,
        },
        grid: {
          color: 'rgba(255,255,255,0.2)',
        },
        angleLines: {
          color: 'rgba(255,255,255,0.2)',
        },
        pointLabels: {
          color: '#fff',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  // 점수 0->목표 점수까지 애니메이션
  useEffect(() => {
    if (!finalScore) return

    let startTimestamp = null
    const duration = 800
    const start = 0
    const end = finalScore
    let rafId

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const value = start + (end - start) * progress
      setDisplayScore(value)

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step)
      }
    }

    rafId = window.requestAnimationFrame(step)

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [finalScore])

  if (!finalScore || !emotionScores) {
    return (
      <div id="analysis-result-page">
        <p style={{ marginTop: '40vh', textAlign: 'center', color: '#fff' }}>
          감정 분석 결과를 불러올 수 없습니다.<br />
          일기를 다시 작성해주세요.
        </p>
      </div>
    )
  }

  return (
    <div id="analysis-result-page">
      {/* 1. 점수만 표시 */}
      <section className="score-section">
        <h3>오늘의 감정 점수는</h3>
        <h1 id="emotion-score" className="big-score">
          {displayScore.toFixed(1)}점
        </h1>
      </section>

      {/* 2. 차트 공간 (비어있음) */}
      <section className="chart-container">
        <Radar data={radarData} options={radarOptions} />
      </section>

      <section className="ai-comment-box">
        <p id="ai-message">{comment || '코멘트를 불러오는 중이에요...'}</p>
      </section>

      {/* 3. 버튼들 */}

    </div>
  )
}

export default EmotionResult;