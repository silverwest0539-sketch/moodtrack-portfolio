// // 일기 작성 후 AI 분석 결과 페이지

import React from "react";
import './EmotionResult.css'
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  layouts,
} from 'chart.js'

import { Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

  // 어제와 비교 섹션 토글
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)

  // 어제 데이터 상태
  const [yesterdayData, setYesterdayData] = useState(null)
  const [isLoadingYesterday, setIsLoadingYesterday] = useState(false)

  const emotionValues = emotionScores
    ? emotionOrder.map((emotion) => emotionScores[emotion])
    : []

  // 어제 데이터 가져오기
  const fetchYesterdayData = async () => {
    if (yesterdayData) return

    setIsLoadingYesterday(true)
    try {
      const res = await fetch(
        `http://localhost:3000/api/diary/yesterday?date=${date}`,
        { credentials: 'include' }
      )
      const data = await res.json()

      if (data.success) {
        setYesterdayData(data.diary)
      }
    } catch (error) {
      console.error('어제 일기 조회 실패:', error)
    } finally {
      setIsLoadingYesterday(false)
    }
  }

  const handleToggle = () => {
    if (!isComparisonOpen) {
      fetchYesterdayData()
    }
    setIsComparisonOpen(!isComparisonOpen)
  }

  const yesterdayEmotionValues = yesterdayData?.emotionScores
    ? emotionOrder.map((emotion) => yesterdayData.emotionScores[emotion])
    : [0, 0, 0, 0]

  const generateComparisonComment = () => {
    if (!yesterdayData?.emotionScores) return '데이터를 불러오는 중...'

    // 오늘 감정 중 가장 큰 확률 찾기
    const maxTodayEmotion = emotionOrder.reduce((max, emotion, index) => {
      return emotionValues[index] > emotionValues[max] ? index : max
    }, 0)

    const maxEmotionName = emotionOrder[maxTodayEmotion]
    const todayValue = emotionValues[maxTodayEmotion]
    const yesterdayValue = yesterdayEmotionValues[maxTodayEmotion]
    const diff = todayValue - yesterdayValue

    // 코멘트 생성
    if (Math.abs(diff) < 5) {
      return `오늘 가장 많이 느낀 ${maxEmotionName} 감정은 어제와 비슷한 수준이에요. (${Math.abs(diff).toFixed(1)}% 차이)`
    } else if (diff > 0) {
      return `오늘 ${maxEmotionName} 감정이 어제보다 약 ${diff.toFixed(1)}%p 더 많아졌어요.`
    } else {
      return `오늘 ${maxEmotionName} 감정이 어제보다 ${Math.abs(diff).toFixed(1)}%p 줄었어요.`
    }
  }

  const doughnutData = {
    labels: emotionOrder,
    datasets: [
      {
        data: emotionValues,
        backgroundColor: [
          '#FFB5C2', // 기쁨 - 로즈 핑크
          '#A8D8EA', // 슬픔 - 스카이 블루
          '#FFDB9A', // 화남 - 피치 골드
          '#C9A9E9', // 중립 - 라벤더
        ],
        borderWidth: 0,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    cutout: '50%', // 도넛 두께
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#818181ff',
          font: {
            size: 12,
            weight: 'bold',
          },
          padding: 15,
          usePointStyle: true,
          ponintStyle: 'circle'
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}%`,
        },
      },
    },
  }

  const lineChartData = {
    labels: ['기쁨', '슬픔', '화남', '중립'],
    datasets: [
      {
        label: '어제',
        data: yesterdayEmotionValues,
        borderColor: '#FFB4A2',
        backgroundColor: 'rgba(255, 180, 162, 0.2)',
        tension: 0.3, // 곡선 정도
        borderWidth: 3,
      },
      {
        label: '오늘',
        data: emotionValues,
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.2)',
        tension: 0.3,
        borderWidth: 3,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
          font: {
            size: 13,
            weight: 'bold',
          },
          padding: 15,
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 110,
        ticks: {
          color: '#fff',
          font: {
            size: 11,
          },
          stepSize: 20,
          callback: (value) => value < 105 ? `${value}%` : '',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#fff',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        grid: {
          display: false,
        },
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
      {/* 1. 오늘 감정 점수 */}
      <section className="score-section">
        <h3>오늘의 감정 점수는</h3>
        <h1 id="emotion-score" className="big-score">
          {displayScore.toFixed(1)}점
        </h1>
      </section>

      {/* 오늘 차트 */}
      <div className="chart-container">
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>

      {/* AI 코멘트 */}
      <div className="ai-comment-box">
        <p id="ai-message">{comment || '코멘트를 불러오는 중이에요...'}</p>
      </div>

      {/* 어제와 비교 토글 버튼 */}
      <button
        className="comparison-toggle"
        onClick={handleToggle}>
        어제와 비교하면? {isComparisonOpen ? '▲' : '▼'}
      </button>

      {/* 어제 비교 섹션 */}
      {isComparisonOpen && (
        <section className="comparison-section">
          {isLoadingYesterday ? (
            <p style={{ textAlign: 'center', color: '#fff' }}>불러오는 중...</p>
          ) : !yesterdayData ? (
            <p style={{ textAlign: 'center', color: '#fff' }}>어제 일기가 없어요 😢</p>
          ) : (
            <div className="comparison-content">
              {/* 꺾은선 차트 */}
              <div className="comparison-chart-container">
                <div className="comparison-chart">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
                <p className="chart-label">어제와의 감정 변화</p>
              </div>

              {/* 비교 코멘트 박스 */}
              <div className="comparison-comment-box">
                <p className="comparison-comment">
                  {generateComparisonComment()}
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default EmotionResult;