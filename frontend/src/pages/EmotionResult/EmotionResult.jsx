// 일기 작성 후 AI 분석 결과 페이지


import React, { useEffect, useMemo, useRef, useState } from 'react';
import './EmotionResult.css';
import { Chart as ChartJS } from 'chart.js/auto';

// 1) 기본 더미 데이터 (AI 응답 없을 때 보여줄 값)
const MOCK_ANALYSIS = {
  score: 7.5,
  weather: '맑음 ☀️',
  chartLabels: ['행복', '긍정', '활력', '차분함', '부정', '불안'],
  chartData: [8, 7, 6, 4, 2, 3],
  comment:
    '오늘은 전체적으로 밝고 따뜻한 감정이 많이 보이는 하루였어요. ' +
    '중간중간 피곤함과 걱정이 느껴지지만, 스스로를 잘 돌보려는 태도가 인상적입니다. ' +
    '오늘은 잠깐이라도 쉬는 시간을 만들고, 내 마음을 다독여 주는 걸 추천드려요.',
};

// 2) AI 응답(JSON)을 화면용 데이터로 변환하는 함수
// 👉 여기를 AI 응답 구조에 맞게 손보면 됨
function mapAnalysisToViewData(analysis) {
  if (!analysis) return null;

  // 예시: 백엔드에서 이런 구조로 내려온다고 가정
  // {
  //   overall_score: 0.78,           // 0~1 또는 0~10
  //   mood_label: "맑음 ☀️",
  //   emotions: [
  //     { code: "happy", label_kr: "행복", score: 0.82 },
  //     { code: "positive", label_kr: "긍정", score: 0.74 },
  //     ...
  //   ],
  //   comment: "AI 한줄평..."
  // }

  const scoreRaw =
    analysis.overall_score != null
      ? analysis.overall_score
      : analysis.score;

  // 점수가 0~1 이면 0~10으로 스케일 업
  const score =
    scoreRaw <= 1 ? Math.round(scoreRaw * 100) / 10 : Number(scoreRaw);

  const weather =
    analysis.mood_label ||
    analysis.weather ||
    '오늘의 감정을 정리했어요 ☁️';

  const emotions = Array.isArray(analysis.emotions)
    ? analysis.emotions
    : [];

  const chartLabels =
    emotions.length > 0
      ? emotions.map((e) => e.label_kr || e.label || e.code)
      : ['행복', '긍정', '활력', '차분함', '부정', '불안'];

  const chartData =
    emotions.length > 0
      ? emotions.map((e) =>
          e.score <= 1 ? Math.round(e.score * 10) : Number(e.score),
        )
      : [8, 7, 6, 4, 2, 3];

  const comment =
    analysis.comment ||
    analysis.summary ||
    '오늘 하루 동안 느낀 감정들을 잘 정리해 주셨어요. 작은 감정들도 소중하게 다뤄 주는 태도가 인상적입니다.';

  return {
    score,
    weather,
    chartLabels,
    chartData,
    comment,
  };
}

/**
 * EmotionResultPage
 *
 * props:
 * - analysis: AI 분석 결과(JSON 원본)
 * - loading: boolean, 분석 중 여부 (true면 로딩 오버레이 표시)
 * - useMockFallback: boolean, 기본값 true
 *      → analysis 없을 때 MOCK_ANALYSIS 표시할지 여부
 * - onGoReward: (viewData) => void
 * - onViewStats: (viewData) => void
 */
function EmotionResult({
  analysis = null,
  loading = false,
  useMockFallback = true,
  onGoReward,
  onViewStats,
}) {
  const chartCanvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // 화면에서 실제로 쓸 데이터 (AI 결과 → 뷰 모델)
  const viewData = useMemo(() => {
    const mapped = mapAnalysisToViewData(analysis);
    if (mapped) return mapped;
    if (useMockFallback) return MOCK_ANALYSIS;
    return null; // 완전 아무것도 안 보여주고 싶을 때
  }, [analysis, useMockFallback]);

  // 점수 애니메이션용
  const [displayScore, setDisplayScore] = useState(0);

  // 점수 0 → 목표 점수까지 자연스럽게 애니메이션
  useEffect(() => {
    if (!viewData) return;

    let startTimestamp = null;
    const duration = 800;
    const start = 0;
    const end = viewData.score;
    let rafId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = start + (end - start) * progress;
      setDisplayScore(value);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [viewData]);

  // Chart.js 레이더 차트 렌더링
  useEffect(() => {
    if (!viewData || !chartCanvasRef.current) return;

    const ctx = chartCanvasRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'radar',
      data: {
        labels: viewData.chartLabels,
        datasets: [
          {
            label: '감정 균형',
            data: viewData.chartData,
            backgroundColor: 'rgba(255, 255, 255, 0.35)',
            borderColor: '#ffffff',
            borderWidth: 2,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              color: 'rgba(255, 255, 255, 0.25)',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
            pointLabels: {
              color: '#ffffff',
              font: {
                size: 12,
                family: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                weight: '600',
              },
            },
            ticks: {
              display: false,
              maxTicksLimit: 5,
            },
            suggestedMin: 0,
            suggestedMax: 10,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuad',
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [viewData]);

  if (!viewData && !loading) {
    // 분석도 없고, 더미 데이터도 쓰지 않겠다(useMockFallback=false)인 경우
    return (
      <div id="analysis-result-page">
        <p style={{ marginTop: '40vh', textAlign: 'center' }}>
          아직 분석 결과가 없습니다.
        </p>
      </div>
    );
  }

  const handleGoReward = () => {
    if (onGoReward) onGoReward(viewData);
    else alert('🎁 나를 위한 선물 페이지로 이동 (onGoReward 연결 필요)');
  };

  const handleViewStats = () => {
    if (onViewStats) onViewStats(viewData);
    else alert('📊 상세 통계 페이지로 이동 (onViewStats 연결 필요)');
  };

  return (
    <div id="analysis-result-page">
      {/* 로딩 오버레이 */}
      {loading && (
        <div id="loading-spinner">
          <div className="spinner-icon" />
          <span>AI가 당신의 일기를 분석하는 중이에요...</span>
        </div>
      )}

      {/* 1. 점수 & 감정 날씨 */}
      <section className="score-section">
        <h1 id="emotion-score" className="big-score">
          {displayScore.toFixed(1)}
        </h1>
        <span id="emotion-weather">{viewData.weather}</span>
      </section>

      {/* 2. 레이더 차트 */}
      <section className="chart-container">
        <canvas id="radar-chart" ref={chartCanvasRef} />
      </section>

      {/* 3. AI 코멘트 */}
      <section className="ai-comment-box">
        <p id="ai-message">{viewData.comment}</p>
      </section>

      {/* 4. 버튼들 */}
      <div className="result-actions">
        <button
          id="btn-go-reward"
          className="btn-gradient"
          type="button"
          onClick={handleGoReward}
        >
          🎁 나를 위한 선물 확인하기
        </button>
        <button
          id="btn-view-stats"
          className="btn-text"
          type="button"
          onClick={handleViewStats}
        >
          상세 통계 보기
        </button>
      </div>
    </div>
  );
}

export default EmotionResult;
