// src/pages/EmotionStats/EmotionStatsPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './EmotionStats.css';
import { Chart as ChartJS } from 'chart.js/auto';

// ✅ 기본 더미 통계 데이터 (실제 API 연동 전에는 이걸로 시늉)
const DEFAULT_STATS = {
  daily: {
    labels: ['월', '화', '수', '목', '금', '토', '일'],
    scores: [60, 72, 50, 85, 90, 45, 80],
    words: [
      { text: '행복', size: '1.2rem', color: '#ff6b6b' },
      { text: '피곤', size: '0.9rem', color: '#888888' },
      { text: '커피', size: '1.0rem', color: '#555555' },
      { text: '운동', size: '0.8rem', color: '#aaaaaa' },
    ],
    bestDay: '금요일',
    bestScore: 90,
  },
  weekly: {
    labels: ['1주', '2주', '3주', '4주'],
    scores: [65, 55, 78, 88],
    words: [
      { text: '여행', size: '1.3rem', color: '#1976d2' },
      { text: '야근', size: '0.9rem', color: '#555555' },
      { text: '친구', size: '1.1rem', color: '#ff9800' },
      { text: '맛집', size: '1.0rem', color: '#4caf50' },
    ],
    bestDay: '4주차',
    bestScore: 88,
  },
  monthly: {
    labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
    scores: [70, 75, 60, 80, 95, 85],
    words: [
      { text: '성장', size: '1.2rem', color: '#9c27b0' },
      { text: '도전', size: '1.1rem', color: '#673ab7' },
      { text: '휴식', size: '1.0rem', color: '#00bcd4' },
      { text: '가족', size: '1.3rem', color: '#e91e63' },
    ],
    bestDay: '5월',
    bestScore: 95,
  },
};

const PERIOD_LABELS = {
  daily: '일간',
  weekly: '주간',
  monthly: '월간',
};

/**
 * EmotionStatsPage
 *
 * props:
 * - statsByPeriod: {
 *     daily?:   { labels, scores, words, bestDay/bestLabel, bestScore },
 *     weekly?:  { ... },
 *     monthly?: { ... }
 *   }
 *   → 실제 AI/백엔드에서 받은 데이터 (없으면 DEFAULT_STATS 사용)
 *
 * - defaultPeriod: 'daily' | 'weekly' | 'monthly'  (기본: 'daily')
 * - loading: boolean                               → AI 호출 중일 때 true
 * - onPeriodChange?: (period) => void              → 탭 바뀔 때 API 호출하고 싶으면 여기서
 */
function EmotionStats({
  statsByPeriod = null,
  defaultPeriod = 'daily',
  loading = false,
  onPeriodChange,
}) {
  const [activePeriod, setActivePeriod] = useState(defaultPeriod);

  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // ✅ 현재 선택된 탭에 맞는 데이터 계산
  const currentStats = useMemo(() => {
    const fallback = DEFAULT_STATS[activePeriod];

    const external =
      statsByPeriod && statsByPeriod[activePeriod]
        ? statsByPeriod[activePeriod]
        : null;

    const labels =
      external && Array.isArray(external.labels) && external.labels.length
        ? external.labels
        : fallback.labels;

    const scores =
      external && Array.isArray(external.scores) && external.scores.length
        ? external.scores
        : fallback.scores;

    const words =
      external && Array.isArray(external.words) && external.words.length
        ? external.words
        : fallback.words;

    const bestLabel =
      (external && (external.bestLabel || external.bestDay)) ||
      fallback.bestDay;

    const bestScore =
      external && typeof external.bestScore === 'number'
        ? external.bestScore
        : fallback.bestScore;

    return {
      labels,
      scores,
      words,
      bestLabel,
      bestScore,
    };
  }, [statsByPeriod, activePeriod]);

  // ✅ Chart.js 라인 차트 렌더링 / 업데이트
  useEffect(() => {
    if (!chartCanvasRef.current || !currentStats) return;

    const ctx = chartCanvasRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: currentStats.labels,
        datasets: [
          {
            label: '감정 점수',
            data: currentStats.scores,
            borderColor: '#4facfe',
            backgroundColor: 'rgba(79, 172, 254, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#4facfe',
            pointRadius: 4,
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
            grid: { display: false },
          },
          x: {
            grid: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [currentStats]);

  const handleTabClick = (period) => {
    setActivePeriod(period);
    if (onPeriodChange) {
      onPeriodChange(period); // 👉 여기서 부모가 API 호출해서 statsByPeriod 갱신하면 됨
    }
  };

  if (!currentStats) return null;

  return (
    <div className="stats-wrapper">
      <div id="stats-page">
        {/* 로딩 오버레이 (AI/서버 호출 중일 때) */}
        {loading && (
          <div className="stats-loading-overlay">
            <div className="stats-spinner" />
            <span>AI가 기간별 감정을 정리하는 중이에요...</span>
          </div>
        )}

        {/* 1. 기간 선택 탭 */}
        <div className="tab-menu">
          {['daily', 'weekly', 'monthly'].map((period) => (
            <button
              key={period}
              type="button"
              className={
                'tab' + (activePeriod === period ? ' active' : '')
              }
              onClick={() => handleTabClick(period)}
            >
              {PERIOD_LABELS[period]}
            </button>
          ))}
        </div>

        {/* 2. 추이 그래프 */}
        <section className="graph-section">
          <canvas ref={chartCanvasRef} />
        </section>

        {/* 3. 인사이트 요약 카드 */}
        <section className="insight-cards">
          <div className="card-mini">
            <h4>가장 많이 쓴 단어</h4>
            <div id="word-cloud-area">
              {currentStats.words.map((word, idx) => {
                const fontSize =
                  word.size ||
                  (word.weight
                    ? 0.8 + word.weight * 0.2 + 'rem'
                    : '1.0rem');
                const color = word.color || '#555555';

                return (
                  <span
                    key={word.text + '-' + idx}
                    className="cloud-word"
                    style={{
                      fontSize: fontSize,
                      color: color,
                    }}
                  >
                    {word.text}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="card-mini">
            <h4>최고의 날</h4>
            <span id="best-day-date">{currentStats.bestLabel}</span>
            <span className="best-day-sub">
              기분 점수:{' '}
              <span id="best-day-score">
                {currentStats.bestScore}
              </span>
              점
            </span>
          </div>
        </section>

        {/* 4. 하단 네비게이션 (공통 영역 자리만 잡아둠) */}
        <nav className="bottom-nav">Bottom Navigation Area</nav>
      </div>
    </div>
  );
}

export default EmotionStats;
