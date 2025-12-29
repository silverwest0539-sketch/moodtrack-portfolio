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

  // YearlyStats에서 전달받은 데이터
  const { year, month } = location.state || {};

  // 서버 데이터 상태
  const [monthData, setMonthData] = useState(null);
  const [loading, setLoading] = useState(false);

  // API 호출
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

        if (data.success) {
          setMonthData(data.monthDetail);
        } else {
          alert('데이터 조회 실패');
        }
      } catch (error) {
        console.error('월 상세 조회 에러:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthDetail();
  }, [year, month, navigate]);

  // 로딩 중
  if (loading) {
    return (
      <div id="analysis-result-page" className="month-detail-page">
        <p style={{ marginTop: '40vh', textAlign: 'center', color: '#fff' }}>
          데이터 불러오는 중...
        </p>
      </div>
    );
  }

  // 데이터 없음
  if (!monthData) {
    return (
      <div id="analysis-result-page" className="month-detail-page">
        <p style={{ marginTop: '40vh', textAlign: 'center', color: '#fff' }}>
          데이터를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  // 차트 데이터 구성
  const barChartData = {
    labels: monthData.labels, // ['1일', '2일', ...]
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
        max: 110,
        ticks: {
          color: '#fff',
          stepSize: 20,
          callback: (value) => value < 105 ? `${value}점` : '',
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      x: {
        ticks: { color: '#fff', font: { size: 11 } },
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
        borderColor: '#FFB5C2',
        backgroundColor: 'rgba(255, 181, 194, 0.2)',
        tension: 0.3,
        borderWidth: 2,
      },
      {
        label: '슬픔',
        data: monthData.emotions?.sadness || [],
        borderColor: '#A8D8EA',
        backgroundColor: 'rgba(168, 216, 234, 0.2)',
        tension: 0.3,
        borderWidth: 2,
      },
      {
        label: '화남',
        data: monthData.emotions?.anger || [],
        borderColor: '#FFDB9A',
        backgroundColor: 'rgba(255, 219, 154, 0.2)',
        tension: 0.3,
        borderWidth: 2,
      },
      {
        label: '불안',
        data: monthData.emotions?.anxiety || [],
        borderColor: '#b3ffb7ff',
        backgroundColor: 'rgba(255, 219, 154, 0.2)',
        tension: 0.3,
        borderWidth: 2,
      },
      {
        label: '중립',
        data: monthData.emotions?.neutral || [],
        borderColor: '#C9A9E9',
        backgroundColor: 'rgba(201, 169, 233, 0.2)',
        tension: 0.3,
        borderWidth: 2,
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
          color: '#fff',
          font: { size: 11, weight: 'bold' },
          padding: 10,
          usePointStyle: true,
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
          stepSize: 20,
          callback: (value) => value < 105 ? `${value}%` : '',
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      x: {
        ticks: { color: '#fff', font: { size: 10 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div id="analysis-result-page" className="month-detail-page">
      {/* 타이틀 */}
      <section className="month-detail-title">
        <h2>{year}년 {month}월</h2>
      </section>

      {/* 일별 점수 차트 */}
      <div className="month-detail-chart-container">
        <div className="month-detail-bar-chart">
          <Bar data={barChartData} options={barChartOptions} />
          <p className="month-detail-chart-label">일별 감정 점수</p>
        </div>
      </div>

      {/* 감정별 변화 차트 */}
      <div className="month-detail-chart-container">
        <div className="month-detail-line-chart">
          <Line data={lineChartData} options={lineChartOptions} />
          <p className="month-detail-chart-label">감정별 변화 추이</p>
        </div>
      </div>


      {/* 뒤로가기 텍스트 */}
      <p
        className="back-link"
        onClick={() => navigate('/emotion-stats', {
          state: { activeTab: 'yearly' }
        })}
      >
        ← 통계로 돌아가기
      </p>
    </div>
  );
}

export default MonthDetail;