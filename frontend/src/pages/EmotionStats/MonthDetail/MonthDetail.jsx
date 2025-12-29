// src/pages/EmotionStats/MonthDetail/MonthDetail.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './MonthDetail.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

function MonthDetail() {
  const location = useLocation();
  const navigate = useNavigate();

  const { year, month } = location.state || {};

  const [monthData, setMonthData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!year || !month) {
      alert('잘못된 접근입니다.');
      navigate('/emotion-stats');
      return;
    }

    const fetchMonthDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:3000/api/emotion-stats/month-detail?year=${year}&month=${month}`,
          { credentials: 'include' }
        );
        const data = await res.json();

        if (data.success) setMonthData(data.monthDetail);
        else alert('데이터 조회 실패');
      } catch (error) {
        console.error('월 상세 조회 에러:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthDetail();
  }, [year, month, navigate]);

  if (loading) {
    return (
      <div id="analysis-result-page" className="month-detail-page">
        <section className="month-title">
          <h2>{year}년 {month}월</h2>
        </section>
        <div className="stat-card">
          <p style={{ textAlign: 'center', margin: 0, color: '#5D4037', fontWeight: 600 }}>
            데이터 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (!monthData) {
    return (
      <div id="analysis-result-page" className="month-detail-page">
        <section className="month-title">
          <h2>{year}년 {month}월</h2>
        </section>
        <div className="stat-card">
          <p style={{ textAlign: 'center', margin: 0, color: '#5D4037', fontWeight: 600 }}>
            데이터를 불러올 수 없습니다.
          </p>
        </div>
        <div className="footer-actions">
          <button
            className="btn-back"
            onClick={() => navigate('/emotion-stats', { state: { activeTab: 'yearly' } })}
          >
            ← 통계로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const barChartData = {
    labels: monthData.labels,
    datasets: [
      {
        label: `${year}년 ${month}월`,
        data: monthData.scores,
        backgroundColor: 'rgba(255, 107, 107, 0.6)',
        borderColor: '#FF6B6B',
        borderWidth: 2,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}점`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 120,
        ticks: {
          color: '#5D4037',
          stepSize: 20,
          callback: (value) => (value < 110 ? `${value}점` : ''),
        },
        grid: { color: 'rgba(93, 64, 55, 0.12)' },
      },
      x: {
        ticks: { color: '#5D4037', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  const lineChartData = {
    labels: monthData.labels,
    datasets: [
      {
        label: '기쁨',
        data: monthData.emotions?.joy || [],
        borderColor: '#FFAB91', // 코랄 (가독성 조정)
        backgroundColor: 'rgba(255, 171, 145, 0.2)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#FFAB91',
      },
      {
        label: '슬픔',
        data: monthData.emotions?.sadness || [],
        borderColor: '#90CAF9', // 스카이 블루
        backgroundColor: 'rgba(144, 202, 249, 0.2)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#90CAF9',
      },
      {
        label: '화남',
        data: monthData.emotions?.anger || [],
        borderColor: '#EF9A9A', // 소프트 레드
        backgroundColor: 'rgba(239, 154, 154, 0.2)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#EF9A9A',
      },
      {
        label: '불안',
        data: monthData.emotions?.anxiety || [],
        borderColor: '#B39DDB', // 소프트 레드
        backgroundColor: 'rgba(239, 154, 154, 0.2)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#B39DDB',
      },
      {
        label: '중립',
        data: monthData.emotions?.neutral || [],
        borderColor: '#a7a7a7ff',
        backgroundColor: 'rgba(239, 154, 154, 0.2)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#a7a7a7ff',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#5D4037',
          font: { size: 11, weight: 'bold' },
          padding: 10,
          usePointStyle: true,
          boxWidth: 8,

          generateLabels: (chart) => {
            const labels =
              ChartJS.defaults.plugins.legend.labels.generateLabels(chart);

            labels.forEach((item) => {
              const ds = chart.data.datasets[item.datasetIndex];
              item.pointStyle = 'circle';
              item.fillStyle = ds.borderColor;
              item.strokeStyle = ds.borderColor;
              item.lineWidth = 0;
            });

            return labels;
          },
        },
      },
    },
    // ✅ scales 추가
    scales: {
      y: {
        beginAtZero: true,
        max: 120,
        ticks: {
          color: '#5D4037',
          stepSize: 20,
          callback: (value) => (value < 110 ? `${value}점` : ''),
        },
        grid: { color: 'rgba(93, 64, 55, 0.12)' },
      },
      x: {
        ticks: { color: '#5D4037', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div id="analysis-result-page" className="month-detail-page">
      {/* 1) 타이틀 */}
      <section className="month-title">
        <h2>{year}년 {month}월</h2>
      </section>

      {/* 2) 카드 1: 바 차트 */}
      <div className="stat-card">
        <div className="chart-wrapper">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
        <p className="card-label">일별 감정 점수</p>
      </div>

      {/* 3) 카드 2: 라인 차트 */}
      <div className="stat-card">
        <div className="chart-wrapper">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
        <p className="card-label">감정별 변화 추이</p>
      </div>

      {/* 4) 뒤로가기 */}
      <div className="footer-actions">
        <button
          className="btn-back"
          onClick={() =>
            navigate('/emotion-stats', {
              state: { activeTab: 'yearly' },
            })
          }
        >
          ← 통계로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default MonthDetail;