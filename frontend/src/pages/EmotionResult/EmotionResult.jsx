import React, { useState, useEffect } from "react";
import './EmotionResult.css'
import { useLocation, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

function EmotionResult({ onViewStats }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { date, content, finalScore, emotionScores, comment, from } = location.state || {}

  const [displayScore, setDisplayScore] = useState(0)
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)
  const [yesterdayData, setYesterdayData] = useState(null)
  const [isLoadingYesterday, setIsLoadingYesterday] = useState(false)

  const emotionOrder = ['기쁨', '슬픔', '화남', '중립']

  // =========================================================
  // [수정 1] 점수(0~100)에 따른 5단계 레벨 결정 함수
  // =========================================================
  const getScoreLevelClass = (score) => {
    if (score === undefined || score === null) return 'level-3'; // 기본값
    if (score <= 20) return 'level-1'; // 0-20: 매우 저조 (차분한 밤)
    if (score <= 40) return 'level-2'; // 21-40: 저조 (흐린 하늘)
    if (score <= 60) return 'level-3'; // 41-60: 보통 (안정적인 라벤더)
    if (score <= 80) return 'level-4'; // 61-80: 좋음 (따뜻한 피치)
    return 'level-5';                  // 81-100: 매우 좋음 (화사한 핑크)
  };

  const emotionValues = emotionScores
    ? emotionOrder.map((emotion) => emotionScores[emotion])
    : []

  // 어제 데이터 로직 (기존 유지)
  const fetchYesterdayData = async () => {
    if (yesterdayData) return
    setIsLoadingYesterday(true)
    try {
      const res = await fetch(
        `http://localhost:3000/api/diary/yesterday?date=${date}`,
        { credentials: 'include' }
      )
      const data = await res.json()
      if (data.success) setYesterdayData(data.diary)
    } catch (error) {
      console.error('어제 일기 조회 실패:', error)
    } finally {
      setIsLoadingYesterday(false)
    }
  }

  const handleToggle = () => {
    if (!isComparisonOpen) fetchYesterdayData()
    setIsComparisonOpen(!isComparisonOpen)
  }

  const yesterdayEmotionValues = yesterdayData?.emotionScores
    ? emotionOrder.map((emotion) => yesterdayData.emotionScores[emotion])
    : [0, 0, 0, 0]

  const generateComparisonComment = () => {
    if (!yesterdayData?.emotionScores) return '데이터를 불러오는 중...'
    const maxTodayEmotionIdx = emotionOrder.reduce((max, emotion, index) => {
      return emotionValues[index] > emotionValues[max] ? index : max
    }, 0)
    const maxEmotionName = emotionOrder[maxTodayEmotionIdx]
    const todayValue = emotionValues[maxTodayEmotionIdx]
    const yesterdayValue = yesterdayEmotionValues[maxTodayEmotionIdx]
    const diff = todayValue - yesterdayValue

    if (Math.abs(diff) < 5) return `오늘 가장 많이 느낀 ${maxEmotionName} 감정은 어제와 비슷해요.`
    else if (diff > 0) return `오늘 ${maxEmotionName} 감정이 어제보다 약 ${diff.toFixed(1)}%p 늘었어요.`
    else return `오늘 ${maxEmotionName} 감정이 어제보다 ${Math.abs(diff).toFixed(1)}%p 줄었어요.`
  }

  // =========================================================
  // [수정 2] 차트 색상: 눈이 편안한 소프트 파스텔 톤으로 조정
  // =========================================================
  const doughnutData = {
    labels: emotionOrder,
    datasets: [
      {
        data: emotionValues,
        backgroundColor: [
          '#FFB7B2', // 기쁨 (Soft Rose)
          '#A9DEF9', // 슬픔 (Soft Sky)
          '#E2A3C7', // 화남 (Muted Magenta - 자극적이지 않게)
          '#D0D0E0', // 중립 (Soft Grayish Purple)
        ],
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)', // 경계선 추가로 부드럽게
        hoverOffset: 8,
      },
    ],
  }

  // 차트 텍스트 및 그리드 색상 설정 (흰색으로 통일하되 그림자 효과 활용 예정)
  const commonChartOptions = {
    color: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  }

  const doughnutOptions = {
    responsive: true,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff', // 모든 테마에서 흰색 글씨 유지 (가독성 위해 배경 명도 조절됨)
          font: { size: 12, weight: '500' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        },
      },
      tooltip: {
        callbacks: { label: (context) => `${context.label}: ${context.parsed}%` },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#333',
      },
    },
  }

  const lineChartData = {
    labels: ['기쁨', '슬픔', '화남', '중립'],
    datasets: [
      {
        label: '어제',
        data: yesterdayEmotionValues,
        borderColor: '#FFDAC1', // 살구색
        backgroundColor: 'rgba(255, 218, 193, 0.3)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#FFDAC1',
      },
      {
        label: '오늘',
        data: emotionValues,
        borderColor: '#FF9AA2', // 핑크
        backgroundColor: 'rgba(255, 154, 162, 0.3)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#FF9AA2',
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#fff', font: { size: 12 }, boxWidth: 8, boxHeight: 8 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 110,
        ticks: { color: 'rgba(255,255,255,0.8)', stepSize: 20 },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      x: {
        ticks: { color: '#fff', font: { size: 12 } },
        grid: { display: false },
      },
    },
  }

  useEffect(() => {
    if (finalScore === undefined) return
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
      if (progress < 1) rafId = window.requestAnimationFrame(step)
    }
    rafId = window.requestAnimationFrame(step)
    return () => { if (rafId) window.cancelAnimationFrame(rafId) }
  }, [finalScore])

  if (finalScore === undefined || !emotionScores) {
    return (
      <div id="analysis-result-page" className="level-3">
        <p style={{ marginTop: '40vh', textAlign: 'center', color: '#fff' }}>
          결과를 불러오는 중입니다...
        </p>
      </div>
    )
  }

  // 현재 점수에 맞는 클래스명 가져오기
  const currentLevelClass = getScoreLevelClass(finalScore);

  return (
    <div id="analysis-result-page" className={currentLevelClass}>
      <section className="score-section">
        <h3>오늘의 감정 지수</h3>
        <h1 id="emotion-score" className="big-score">
          {displayScore.toFixed(0)}<span style={{ fontSize: '2rem', fontWeight: 400 }}>/100</span>
        </h1>
      </section>

      <div className="chart-container">
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>

      <div className="ai-comment-box">
        <p id="ai-message">{comment || '분석된 코멘트가 없습니다.'}</p>
      </div>

      <button className="comparison-toggle" onClick={handleToggle}>
        어제와 비교하기 {isComparisonOpen ? '▲' : '▼'}
      </button>

      {isComparisonOpen && (
        <section className="comparison-section">
          {isLoadingYesterday ? (
            <p style={{ textAlign: 'center', color: '#fff' }}>로딩 중...</p>
          ) : !yesterdayData ? (
            <p style={{ textAlign: 'center', color: '#fff', opacity: 0.8 }}>어제 기록이 없어요.</p>
          ) : (
            <div className="comparison-content">
              <div className="comparison-chart-container">
                <div className="comparison-chart">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
                <p className="chart-label">감정 흐름 비교</p>
              </div>
              <div className="comparison-comment-box">
                <p className="comparison-comment">{generateComparisonComment()}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 조건부 "통계로 돌아가기" 버튼 */}
      {from === 'weekly-stats' && (
        <p
          className="back-link"
          onClick={() => navigate('/emotion-stats', {
            state: { activeTab: 'weekly' }
          })}
        >
          ← 통계로 돌아가기
        </p>
      )}

    </div>
  )
}

export default EmotionResult;