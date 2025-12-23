// src/pages/EmotionStats/EmotionStats.jsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS } from 'chart.js/auto';
import './EmotionStats.css';

/* 서버 데이터 없을 때 fallback */
const DEFAULT_WEEKLY = {
  labels: ['월', '화', '수', '목', '금', '토', '일'],
  scores: [0, 0, 0, 0, 0, 0, 0],
};

const DEFAULT_MONTHLY = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return {
    labels: Array.from(
      { length: daysInMonth },
      (_, i) => `${i + 1}일`
    ),
    scores: Array(daysInMonth).fill(0),
  }
}

const DEFAULT_YEARLY = {
  labels: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  scores: Array(12).fill(0),
}

const PERIOD_LABELS = {
  weekly: '주간',
  monthly: '월간',
  yearly: '연간'
};

function EmotionStats() {
  const [activePeriod, setActivePeriod] = useState('weekly')
  const [loading, setLoading] = useState(false)

  const [weeklyStats, setWeeklyStats] = useState(null)
  const [monthlyStats, setMonthlyStats] = useState(null)
  const [yearlyStats, setYearlyStats] = useState(null)



  const chartCanvasRef = useRef(null)
  const chartInstanceRef = useRef(null)

  /* 주간 통계 API 호출 */
  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          'http://localhost:3000/api/emotion-stats/weekly',
          { withCredentials: true }
        );

        if (res.data?.success) {
          setWeeklyStats(res.data.weekly);
        }
      } catch (err) {
        console.error('주간 감정 통계 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyStats();
  }, []);

  /* 월간 통계 API 호출 */
  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          'http://localhost:3000/api/emotion-stats/monthly',
          { withCredentials: true }
        );

        if (res.data?.success) {
          setMonthlyStats(res.data.monthly);
        }
      } catch (err) {
        console.error('월간 감정 통계 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyStats();
  }, []);

  /* 연간 통계 API 호출 */
  useEffect(() => {
    const fetchYearlyStats = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          'http://localhost:3000/api/emotion-stats/yearly',
          { withCredentials: true }
        );

        if (res.data?.success) {
          setYearlyStats(res.data.yearly);
        }
      } catch (err) {
        console.error('연간 감정 통계 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchYearlyStats();
  }, []);

  /*  현재 차트 데이터 */
  const currentStats = useMemo(() => {
    if (activePeriod === 'weekly') {
      return weeklyStats || DEFAULT_WEEKLY
    }

    if (activePeriod === 'monthly') {
      return monthlyStats || DEFAULT_MONTHLY()
    }

    if (activePeriod === 'yearly') {
      return yearlyStats || DEFAULT_YEARLY
    }

    return DEFAULT_WEEKLY
  }, [activePeriod, weeklyStats, monthlyStats, yearlyStats])

  /* Chart.js 렌더링 */
  useEffect(() => {
    if (!chartCanvasRef.current) return

    const ctx = chartCanvasRef.current.getContext('2d')
    const isMonthly = activePeriod === 'monthly'
    const isYearly = activePeriod === 'yearly'


    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    chartInstanceRef.current = new ChartJS(ctx, {
      type: isMonthly || isYearly ? 'bar' : 'line',
      data: {
        labels: currentStats.labels,
        datasets: [
          {
            label: '감정 점수',
            data: currentStats.scores,
            borderColor: '#4facfe',
            backgroundColor: isMonthly
              ? 'rgba(79, 172, 254, 0.6)'
              : 'rgba(79, 172, 254, 0.15)',
            borderWidth: 2,
            tension: isMonthly ? 0 : 0.4,
            fill: !isMonthly,
            pointRadius: isMonthly ? 0 : 4,
            borderRadius: isMonthly ? 6 : 0,
            barThickness: isMonthly ? 12 : undefined,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
          x: {
            ticks: {
              maxTicksLimit: isMonthly ? 10 : 7,
            },
          },
        },
        plugins: {
          legend: { display: false }
        }
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [currentStats, activePeriod]);

  return (
    <div className="stats-wrapper">
      <div id="stats-page">
        {loading && (
          <div className="stats-loading-overlay">
            <div className="stats-spinner" />
            <span>통계를 불러오는 중...</span>
          </div>
        )}

        {/* 기간 탭 */}
        <div className="tab-menu">
          {['weekly', 'monthly', 'yearly'].map((period) => (
            <button
              key={period}
              className={`tab ${activePeriod === period ? 'active' : ''}`}
              onClick={() => setActivePeriod(period)}
            >
              {PERIOD_LABELS[period]}
            </button>
          ))}
        </div>

        {/* 그래프 */}
        <section className="graph-section">
          <canvas ref={chartCanvasRef} />
        </section>

        <nav className="bottom-nav">Bottom Navigation Area</nav>
      </div>
    </div>
  );
}

export default EmotionStats;
