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

function MonthlyStats({
  serverData,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange
}) {
  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const defaultLabels = ['1주차', '2주차', '3주차', '4주차', '5주차']
  const labels = serverData?.labels?.length > 0 ? serverData.labels : defaultLabels;
  const defaultScores = [0, 0, 0, 0, 0];
  const scores = serverData?.scores?.length > 0 ? serverData.scores : defaultScores;

  const getWeekDateRange = (weekNum) => {
    const startDate = (weekNum - 1) * 7 + 1
    const endDate = Math.min(weekNum * 7, new Date(selectedYear, selectedMonth, 0).getDate())
    return `(${startDate}일 ~ ${endDate}일)`
  }
  const weekList = scores
    .map((score, index) => ({
      week: index + 1,
      weekLabel: labels[index],
      dateRange: getWeekDateRange(index + 1),
      score: score,
      icon: getEmotionIcon(score)
    }))
    .filter(item => item.score > 0)

  // 차트 렌더링 (Bar Chart)
  useEffect(() => {
    if (!chartCanvasRef.current) return;
    const ctx = chartCanvasRef.current.getContext('2d');

    if (chartInstanceRef.current) { chartInstanceRef.current.destroy() }

    chartInstanceRef.current = new ChartJS(ctx, {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [
      {
        type: 'bar',
        label: '평균 점수',
        data: scores,
        backgroundColor: 'rgba(255, 182, 193, 0.6)',
        borderColor: '#ffa3d4ff',
        borderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 120,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          display: true,
          callback: function (value) {
            return value === 120 ? '' : value;
          }
        }
      },
      x: {
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false }, // 범례 숨김
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        cornerRadius: 8,
      }
    }
  },
});

    return () => chartInstanceRef.current?.destroy();
  }, [labels, scores]);

  return (
    <div className="weekly-stats-container"> {/* CSS 재사용 */}

      {/* 1. 그래프 영역 */}
      <section className="chart-card">
        <div className="chart-wrapper">
          <canvas ref={chartCanvasRef} />
        </div>
      </section>

      {/* 2. 설명 및 선택 영역 */}
      <div className="section-description">
        <p className="main-desc">{selectedYear}년 {selectedMonth}월의 주별 평균 점수예요</p>

        <div className="date-selector-container">
          <select
            className='custom-select'
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
          >
            <option value={2024}>2024년</option>
            <option value={2025}>2025년</option>
            <option value={2026}>2026년</option>
          </select>

          <select
            className='custom-select'
            value={selectedMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}월</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. 리스트 영역 */}
      <section className="list-card-container">
        {weekList.length > 0 ? (
          <div className="record-list">
            {weekList.map((item, idx) => (
              <div className="record-item" key={idx}>
                <div className="week-info">
                  <div className="week-label">WEEK {item.week}</div>
                  <div className="date-range">{item.dateRange}</div>
                </div>
                <div className="record-icon">{item.icon}</div>
                <div className="record-score">{item.score}점</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-list">
            <p>선택한 달의 기록이 없어요 😅</p>
          </div>
        )}
      </section>

      <div className="bottom-nav-spacer"></div>
    </div>
  );
}

export default MonthlyStats;