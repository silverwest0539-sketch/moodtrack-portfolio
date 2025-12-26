// src/pages/EmotionStats/YearlyStats.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';

const getEmotionIcon = (score) => {
  if (score >= 80) return '🥰';
  if (score >= 60) return '🙂';
  if (score >= 40) return '😐';
  if (score >= 20) return '😥';
  return '😭';
};

function YearlyStats() {
  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // 연도 선택 상태
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [chartData, setChartData] = useState({ labels: [], scores: [] });
  const [recordList, setRecordList] = useState([]);

  useEffect(() => {
    // 1월~12월 라벨
    const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
    // 더미 점수 (랜덤 생성 예시)
    const dummyScores = Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 50);

    setChartData({ labels: months, scores: dummyScores });

    const listData = months.map((month, idx) => ({
      label: `MONTH ${idx + 1}`, // 혹은 그냥 '1월'
      monthName: month,
      score: dummyScores[idx],
      icon: getEmotionIcon(dummyScores[idx]),
    }));
    setRecordList(listData);

  }, [selectedYear]);

  // 차트 렌더링 (Bar Chart)
  useEffect(() => {
    if (!chartCanvasRef.current) return;
    const ctx = chartCanvasRef.current.getContext('2d');

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: '평균 점수',
          data: chartData.scores,
          backgroundColor: 'rgba(255, 159, 64, 0.6)', // 연간은 주황색 계열 예시
          borderRadius: 4,
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
    <div className="weekly-stats-container"> {/* 구조 재사용 */}
      
      {/* 1. 그래프 영역 */}
      <section className="chart-card">
        <div className="chart-wrapper">
          <canvas ref={chartCanvasRef} />
        </div>
      </section>

      {/* 2. 설명 및 선택 영역 */}
      <div className="stats-header-area">
        <p className="stats-title">
          {selectedYear}년의 월별 평균 점수예요
        </p>
        <div className="date-selector-container">
          {/* 연도 선택만 존재 */}
          <select 
            className="custom-select" 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value="2024">2024년</option>
            <option value="2025">2025년</option>
          </select>
        </div>
      </div>

      {/* 3. 리스트 영역 */}
      <section className="list-card-container">
        <div className="record-list">
          {recordList.map((item, idx) => (
            <div className="record-item" key={idx}>
              <div className="record-date">
                {/* 1월, 2월... 로 표시 */}
                <span className="date-num">{item.monthName}</span>
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

export default YearlyStats;