// src/pages/EmotionStats/EmotionStats.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WeeklyStats from './WeeklyStats';
import MonthlyStats from './MonthlyStats';
import YearlyStats from './YearlyStats';
import './EmotionStats.css';

/* 탭 라벨 상수 */
const PERIOD_LABELS = {
  weekly: '주간',
  monthly: '월간',
  yearly: '연간'
};

function EmotionStats() {
  // --- State 관리 ---
  const [activePeriod, setActivePeriod] = useState('weekly');
  const [loading, setLoading] = useState(false);

  // 서버에서 받아온 데이터 저장
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);

  // Monthly 선택 상태
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  // --- API 호출 (Source A의 로직 유지) ---

  /* 1. 주간 통계 API 호출 */
  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'http://localhost:3000/api/emotion-stats/weekly',
          { withCredentials: true }
        );
        if (res.data?.success) {
          setWeeklyData(res.data.weekly);
        }
      } catch (err) {
        console.error('주간 감정 통계 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeeklyStats();
  }, []);

  /* 2. 월간 통계 API 호출 */
  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `http://localhost:3000/api/emotion-stats/monthly?year=${selectedYear}&month=${selectedMonth}`,
          { withCredentials: true }
        );

        if (res.data?.success) {
          setMonthlyData(res.data.monthly);
        }
      } catch (err) {
        console.error('월간 감정 통계 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlyStats();
  }, [selectedYear, selectedMonth]);

  /* 3. 연간 통계 API 호출 */
  useEffect(() => {
    const fetchYearlyStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'http://localhost:3000/api/emotion-stats/yearly',
          { withCredentials: true }
        );
        if (res.data?.success) {
          setYearlyData(res.data.yearly);
        }
      } catch (err) {
        console.error('연간 감정 통계 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchYearlyStats();
  }, []);

  return (
    <div className="stats-page-container">
      {/* 로딩 인디케이터 (필요 시 주석 해제하여 사용) */}
      {/* {loading && <div className="loading-msg">데이터 불러오는 중...</div>} */}

      {/* 상단 탭 메뉴 (Source B 스타일) */}
      <div className="tab-menu-container">
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
      </div>

      {/* 탭 내용 영역 */}
      {/* 하위 컴포넌트에 API 데이터를 prop으로 전달합니다 */}
      <div className="stats-content">
        {activePeriod === 'weekly' && (
          <WeeklyStats serverData={weeklyData} loading={loading} />
        )}

        {activePeriod === 'monthly' && (
          <MonthlyStats 
          serverData={monthlyData} 
          loading={loading}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChnage={setSelectedYear}
          onMonthChange={setSelectedMonth}
          />
        )}

        {activePeriod === 'yearly' && (
          <YearlyStats serverData={yearlyData} loading={loading} />
        )}
      </div>
    </div>
  );
}

export default EmotionStats;