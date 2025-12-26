// src/pages/EmotionStats/WeeklyStats.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Chart as ChartJS } from 'chart.js/auto';

// 감정 아이콘 매핑 헬퍼 함수 (점수에 따라 아이콘 변경 예시)
const getEmotionIcon = (score) => {
  if (score >= 80) return '🥰'; // 아주 좋음
  if (score >= 60) return '🙂'; // 좋음
  if (score >= 40) return '😐'; // 보통
  if (score >= 20) return '😥'; // 나쁨
  return '😭'; // 아주 나쁨
};

// 요일 매핑
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function WeeklyStats() {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({ labels: DAY_LABELS, scores: Array(7).fill(0) });
  // 리스트 표시용 데이터 (실제 날짜 등을 포함한 상세 데이터 구조가 필요함)
  const [recordList, setRecordList] = useState([]);

  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        setLoading(true);
        // API 호출 (실제로는 여기서 날짜 정보도 같이 받아와야 리스트를 예쁘게 그릴 수 있습니다)
        // const res = await axios.get('http://localhost:3000/api/emotion-stats/weekly', { withCredentials: true });
        
        // ** UI 테스트를 위한 더미 데이터 **
        // 실제 연동 시 res.data를 파싱해서 사용하세요.
        const dummyScores = [95, 0, 0, 0, 45, 80, 0]; 
        
        // 차트용 데이터 세팅
        setChartData({
          labels: DAY_LABELS,
          scores: dummyScores
        });

        // 리스트용 데이터 가공 (점수가 0보다 큰 날만 필터링)
        // 실제로는 백엔드에서 날짜(일자)도 받아야 함. 여기선 임의로 계산.
        const today = new Date();
        const currentDay = today.getDay() === 0 ? 7 : today.getDay(); // 일요일 보정
        const mondayOffset = 1 - currentDay; // 월요일 기준 오프셋
        
        const listData = dummyScores.map((score, index) => {
          // 날짜 계산 (이번주 월요일 기준)
          const date = new Date(today);
          date.setDate(today.getDate() + mondayOffset + index);
          
          return {
            dayName: DAY_LABELS[index],     // 월, 화...
            dateNum: date.getDate(),        // 16, 17...
            score: score,
            icon: getEmotionIcon(score)
          };
        }).filter(item => item.score > 0); // 기록이 있는 날만 필터

        setRecordList(listData);

      } catch (err) {
        console.error('주간 통계 로드 실패', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyStats();
  }, []);

  // 차트 렌더링
  useEffect(() => {
    if (!chartCanvasRef.current) return;
    
    const ctx = chartCanvasRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // 그라데이션 효과 (옵션)
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(79, 172, 254, 0.4)');
    gradient.addColorStop(1, 'rgba(79, 172, 254, 0.0)');

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: '감정 점수',
          data: chartData.scores,
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
            max: 100,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { display: true }
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
  }, [chartData]);

  return (
    <div className="weekly-stats-container">
      {loading && <div className="loading-msg">로딩 중...</div>}
      
      {/* 1. 그래프 영역 (카드 형태) */}
      <section className="chart-card">
        <div className="chart-wrapper">
          <canvas ref={chartCanvasRef} />
        </div>
      </section>

      {/* 2. 설명 텍스트 */}
      <div className="section-description">
        <p className="main-desc">이번 주에는 이런 기록들을 남겼어요</p>
        <p className="sub-desc">클릭하면 더 자세한 분석을 볼 수 있어요</p>
      </div>

      {/* 3. 리스트 영역 (기록이 있는 날만) */}
      <section className="list-card-container">
        {recordList.length > 0 ? (
          <div className="record-list">
            {recordList.map((item, idx) => (
              <div className="record-item" key={idx}>
                <div className="record-date">
                  <span className="day-name">{item.dayName === '월' ? 'Mon' : 
                                              item.dayName === '화' ? 'Tue' : 
                                              item.dayName === '수' ? 'Wed' : 
                                              item.dayName === '목' ? 'Thu' : 
                                              item.dayName === '금' ? 'Fri' : 
                                              item.dayName === '토' ? 'Sat' : 'Sun'}</span>
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
      
      {/* 네비게이션 바 공간 확보용 투명 박스 */}
      <div className="bottom-nav-spacer"></div>
    </div>
  );
}

export default WeeklyStats;