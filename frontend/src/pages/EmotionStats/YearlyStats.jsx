// src/pages/EmotionStats/YearlyStats.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { useNavigate } from 'react-router-dom';

const getEmotionIcon = (score) => {
  if (score >= 80) return '🥰';
  if (score >= 60) return '🙂';
  if (score >= 40) return '😐';
  if (score >= 20) return '😥';
  return '😭';
};

function YearlyStats({
  serverData,
  loading,
  selectedYear,
  onYearChange
}) {
  const navigate = useNavigate();
  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const defaultLabels = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
  const labels = serverData?.labels?.length > 0 ? serverData.labels : defaultLabels;
  const defaultScores = Array(12).fill(0);
  const scores = serverData?.scores?.length > 0 ? serverData.scores : defaultScores;

  const handleMonthClick = (monthIndex) => {
    navigate('/emotion-stats/month-detail', {
      state: {
        year: selectedYear,
        month: monthIndex + 1
      }
    })
  }

  const monthList = scores
    .map((score, index) => ({
      month: index + 1,
      monthLabel: labels[index],
      score: score,
      icon: getEmotionIcon(score)
    }))
    .filter(item => item.score > 0);

  // 차트 렌더링 (Bar Chart)
  useEffect(() => {
    if (!chartCanvasRef.current) return;

    const ctx = chartCanvasRef.current.getContext('2d');

    if (chartInstanceRef.current) {chartInstanceRef.current.destroy()};

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(147, 112, 219, 0.4)');
    gradient.addColorStop(1, 'rgba(147, 112, 219, 0.0)');

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '월별 평균 점수',
          data: scores,
          borderColor: '#9370DB',
          backgroundColor: gradient,
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#9370DB',
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
            max: 120,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              display: true,
              callback: function(value) {
                return value === 120 ? '' : value;
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
  }, [labels, scores]);

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
            onChange={(e) => onYearChange(Number(e.target.value))}
          >
            <option value="2024">2024년</option>
            <option value="2025">2025년</option>
            <option value={2026}>2026년</option>
          </select>
        </div>
      </div>

      {/* 3. 리스트 영역 */}
      <section className="list-card-container">
        {monthList.length > 0 ? (
          <div className="record-list">
            {monthList.map((item, idx) => (
              <div 
              className="record-item clickable" 
              key={idx}
              onClick={()=>handleMonthClick(item.month -1)}
              style={{ cursor: 'pointer' }}
              >
                <div className="month-label">{item.month}월</div>
                <div className="record-icon">{item.icon}</div>
                <div className="record-score">{item.score}점</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-list">
            <p>선택한 연도의 기록이 없어요 😅</p>
          </div>
        )}
      </section>
      
      <div className="bottom-nav-spacer"></div>
    </div>
  );
}

export default YearlyStats;