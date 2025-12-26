// src/pages/EmotionStats/WeeklyStats.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS } from 'chart.js/auto';

const getEmotionIcon = (score) => {
  if (score >= 80) return '🥰';
  if (score >= 60) return '🙂';
  if (score >= 40) return '😐';
  if (score >= 20) return '😥';
  return '😭';
};

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_LABELS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function WeeklyStats({ serverData, loading }) {
  const navigate = useNavigate();
  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // serverData가 없으면 기본값 사용
  const labels = serverData?.labels || DAY_LABELS;
  const scores = serverData?.scores || Array(7).fill(0);

  // 리스트용 데이터 생성
  const today = new Date();
  const currentDay = today.getDay() === 0 ? 7 : today.getDay();
  const mondayOffset = 1 - currentDay;

  const recordList = scores
    .map((score, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + index);
      
      return {
        dayName: labels[index],
        dayNameEn: DAY_LABELS_EN[index],
        dateNum: date.getDate(),
        score: score,
        icon: getEmotionIcon(score),
        date: date,
        dateString: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      };
    })
    .filter(item => item.score > 0);

    // 날짜 클릭 핸들러
    const handleDateClick = async (dateString) => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/diary/result?date=${dateString}`,
          { credentials: 'include' }
        )
        const data = await res.json()

        if (data.success && data.diary) {
          navigate('/emotionResult', {
            state: {
              date: dateString,
              content: data.diary.content,
              finalScore: data.diary.emoScore,
              emotionScores: data.diary.emotionScores,
              comment: data.diary.comment
            }
          })
        } else {
          alert('일기 데이터를 불러올 수 없습니다.')
        }
      } catch (error) {
        console.error('일기 조회 실패:', error)
        alert('일기를 불러오는 데 실패했습니다.')
      }
    }

  // 차트 렌더링
  useEffect(() => {
    if (!chartCanvasRef.current || !serverData) return;
    
    const ctx = chartCanvasRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(79, 172, 254, 0.4)');
    gradient.addColorStop(1, 'rgba(79, 172, 254, 0.0)');

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '감정 점수',
          data: scores,
          borderColor: '#4facfe',
          backgroundColor: gradient,
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#4facfe',
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 110,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { display: true,
              callback: function(value) {
                return value === 110 ? '' : value
              }
             }
          },
          x: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 10,
            cornerRadius: 8,
          }
        }
      },
    });

    return () => chartInstanceRef.current?.destroy();
  }, [serverData]);

  return (
    <div className="weekly-stats-container">
      {loading && <div className="loading-msg">로딩 중...</div>}
      
      <section className="chart-card">
        <div className="chart-wrapper">
          <canvas ref={chartCanvasRef} />
        </div>
      </section>

      <div className="section-description">
        <p className="main-desc">이번 주에는 이런 기록들을 남겼어요</p>
        <p className="sub-desc">클릭하면 더 자세한 분석을 볼 수 있어요</p>
      </div>

      <section className="list-card-container">
        {recordList.length > 0 ? (
          <div className="record-list">
            {recordList.map((item, idx) => (
              <div 
              className="record-item" 
              key={idx}
              onClick={()=>handleDateClick(item.dateString)}
              style={{ cursor: 'pointer' }}>
                <div className="record-date">
                  <span className="day-name">{item.dayNameEn}</span>
                  <span className="date-num">{item.dateNum}</span>
                </div>
                <div className="record-icon">{item.icon}</div>
                <div className="record-score">{item.score}점</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-list">
            <p>아직 기록된 감정이 없어요 😅</p>
          </div>
        )}
      </section>
      
      <div className="bottom-nav-spacer"></div>
    </div>
  );
}

export default WeeklyStats;