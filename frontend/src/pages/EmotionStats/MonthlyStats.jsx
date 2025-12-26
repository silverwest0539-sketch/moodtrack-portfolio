// src/pages/EmotionStats/MonthlyStats.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';

const getEmotionIcon = (score) => {
  if (score >= 80) return '🥰';
  if (score >= 60) return '🙂';
  if (score >= 40) return '😐';
  if (score >= 20) return '😥';
  return '😭';
};

function MonthlyStats() {
  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // 날짜 선택 상태
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // 차트 및 리스트 데이터 상태
  const [chartData, setChartData] = useState({ labels: [], scores: [] });
  const [recordList, setRecordList] = useState([]);

  // 데이터 로드 (Mock Data)
  useEffect(() => {
    // 실제 API 호출 대신 더미 데이터 생성
    // (선택한 월에 따라 데이터가 바뀌는 척 시뮬레이션)
    const weeks = ['1주차', '2주차', '3주차', '4주차', '5주차'];
    const dummyScores = [85, 92, 60, 75, 40]; // 임의 점수

    setChartData({ labels: weeks, scores: dummyScores });

    const listData = weeks.map((week, idx) => ({
      label: `WEEK ${idx + 1}`,
      score: dummyScores[idx],
      icon: getEmotionIcon(dummyScores[idx]),
    }));
    setRecordList(listData);

  }, [selectedYear, selectedMonth]);

  // 차트 렌더링 (Bar Chart)
  useEffect(() => {
    if (!chartCanvasRef.current) return;
    const ctx = chartCanvasRef.current.getContext('2d');

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'bar', // 월간은 막대 그래프가 보기 좋음
      data: {
        labels: chartData.labels,
        datasets: [{
          label: '평균 점수',
          data: chartData.scores,
          backgroundColor: 'rgba(79, 172, 254, 0.6)',
          borderRadius: 6, // 막대 둥글게
          barThickness: 20, // 막대 두께
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      },
    });

    return () => chartInstanceRef.current?.destroy();
  }, [chartData]);

  return (
    <div className="weekly-stats-container"> {/* CSS 재사용 */}
      
      {/* 1. 그래프 영역 */}
      <section className="chart-card">
        <div className="chart-wrapper">
          <canvas ref={chartCanvasRef} />
        </div>
      </section>

      {/* 2. 설명 및 선택 영역 */}
      <div className="stats-header-area">
        <p className="stats-title">
          {selectedMonth}월의 주별 평균 점수예요
        </p>
        <div className="date-selector-container">
          {/* 연도 선택 */}
          <select 
            className="custom-select" 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value="2024">2024년</option>
            <option value="2025">2025년</option>
          </select>
          
          {/* 월 선택 */}
          <select 
            className="custom-select" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. 리스트 영역 */}
      <section className="list-card-container">
        <div className="record-list">
          {recordList.map((item, idx) => (
            <div className="record-item" key={idx}>
              <div className="record-date">
                <span className="date-num" style={{ fontSize: '16px' }}>{item.label}</span>
              </div>
              <div className="record-icon">{item.icon}</div>
              <div className="record-score">{item.score}점</div>
            </div>
          ))}
        </div>
      </section>

      <div className="bottom-nav-spacer"></div>
    </div>
  );
}

export default MonthlyStats;