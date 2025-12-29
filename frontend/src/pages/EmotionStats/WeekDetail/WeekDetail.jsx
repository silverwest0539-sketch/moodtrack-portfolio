// src/pages/EmotionStats/WeekDetail/WeekDetail.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './WeekDetail.css';
import { Line, Bar } from 'react-chartjs-2';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend
);

function WeekDetail() {
    const location = useLocation();
    const navigate = useNavigate();

    // MonthlyStats에서 전달받은 데이터
    const { year, month, weekNum } = location.state || {};

    // 서버 데이터 상태
    const [weekData, setWeekData] = useState(null);
    const [loading, setLoading] = useState(false);

    // 디자인 컬러 상수 (브라운 톤)
    const chartTextColor = '#5D4037'; // 텍스트: 딥 코코아 브라운
    const chartGridColor = 'rgba(93, 64, 55, 0.1)'; // 그리드: 연한 브라운

    // API 호출
    useEffect(() => {
        if (!year || !month || !weekNum) {
            alert('잘못된 접근입니다.');
            navigate('/emotion-stats');
            return;
        }

        const fetchWeekDetail = async () => {
            try {
                setLoading(true);
                const res = await fetch(
                    `http://localhost:3000/api/emotion-stats/week-detail?year=${year}&month=${month}&weekNum=${weekNum}`,
                    { credentials: 'include' }
                );
                const data = await res.json();

                if (data.success) {
                    setWeekData(data.weekDetail);
                } else {
                    alert('데이터 조회 실패');
                }
            } catch (error) {
                console.error('주차 상세 조회 에러:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeekDetail();
    }, [year, month, weekNum, navigate]);

    // 로딩 중 (글씨 색상을 브라운으로 변경)
    if (loading) {
        return (
            <div id="analysis-result-page" className="week-detail-page">
                <p style={{ marginTop: '40vh', textAlign: 'center', color: chartTextColor }}>
                    데이터 불러오는 중...
                </p>
            </div>
        );
    }

    // 데이터 없음 (글씨 색상을 브라운으로 변경)
    if (!weekData) {
        return (
            <div id="analysis-result-page" className="week-detail-page">
                <p style={{ marginTop: '40vh', textAlign: 'center', color: chartTextColor }}>
                    데이터를 불러올 수 없습니다.
                </p>
            </div>
        );
    }

    // 1. 점수 차트 (Bar Chart)
    const barChartData = {
        labels: weekData.labels,
        datasets: [
            {
                label: weekData.thisWeek.label,
                data: weekData.thisWeek.scores,
                // 밝은 배경에 어울리는 부드러운 코랄 핑크로 조정
                backgroundColor: '#FF8A80',
                borderRadius: 6, // 막대 끝 둥글게
                barThickness: 20, // 막대 두께 조정
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                titleColor: chartTextColor,
                bodyColor: chartTextColor,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 1,
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
                    color: chartTextColor, // Y축 글씨 브라운
                    font: { size: 11 },
                    stepSize: 20,
                    callback: (value) => value < 110 ? `${value}점` : '',
                },
                grid: {
                    color: chartGridColor, // 그리드 연한 브라운
                    drawBorder: false
                },
            },
            x: {
                ticks: {
                    color: chartTextColor, // X축 글씨 브라운
                    font: { size: 12, weight: 'bold' }
                },
                grid: { display: false },
            },
        },
    };


    // 2. 감정별 변화 차트 (Line Chart)
    const emotionChartData = {
        labels: weekData.labels,
        datasets: [
            {
                label: '기쁨',
                data: weekData.emotions?.joy || [],
                borderColor: '#FFAB91', // 코랄 (가독성 조정)
                backgroundColor: 'rgba(255, 171, 145, 0.2)',
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#FFAB91',
            },
            {
                label: '슬픔',
                data: weekData.emotions?.sadness || [],
                borderColor: '#90CAF9', // 스카이 블루
                backgroundColor: 'rgba(144, 202, 249, 0.2)',
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#90CAF9',
            },
            {
                label: '화남',
                data: weekData.emotions?.anger || [],
                borderColor: '#EF9A9A', // 소프트 레드
                backgroundColor: 'rgba(239, 154, 154, 0.2)',
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#EF9A9A',
            },
            {
                label: '불안',
                data: weekData.emotions?.anxiety || [],
                borderColor: '#B39DDB', // 소프트 레드
                backgroundColor: 'rgba(239, 154, 154, 0.2)',
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#B39DDB',
            },
            {
                label: '중립',
                data: weekData.emotions?.neutral || [],
                borderColor: '#a7a7a7ff',
                backgroundColor: 'rgba(239, 154, 154, 0.2)',
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#a7a7a7ff',
            },
        ],
    };

    const emotionChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    color: chartTextColor, // 범례 글씨 브라운
                    font: { size: 12, weight: 'bold' },
                    padding: 15,
                    usePointStyle: true,
                    boxWidth: 8
                },
            },
            tooltip: {
                titleColor: chartTextColor,
                bodyColor: chartTextColor,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y}%`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 120,
                ticks: {
                    color: chartTextColor, // Y축 글씨 브라운
                    font: { size: 11 },
                    stepSize: 20,
                    callback: (value) => value < 110 ? `${value}%` : '',
                },
                grid: {
                    color: chartGridColor, // 그리드 연한 브라운
                    drawBorder: false
                },
            },
            x: {
                ticks: {
                    color: chartTextColor, // X축 글씨 브라운
                    font: { size: 11, weight: 'bold' }
                },
                grid: { display: false },
            },
        },
    };

    return (
        <div id="analysis-result-page" className="week-detail-page">
            {/* 타이틀 */}
            <section className="week-title">
                <h2>{year}년 {month}월 {weekData.thisWeek.label}</h2>
            </section>

            {/* 일별 점수 차트 (카드 스타일 적용) */}
            <div className="stat-card">
                <div className="chart-wrapper">
                    <Bar data={barChartData} options={barChartOptions} />
                </div>
                <p className="card-label">일별 감정 점수</p>
            </div>

            {/* 감정별 변화 차트 (카드 스타일 적용) */}
            <div className="stat-card">
                <div className="chart-wrapper">
                    <Line data={emotionChartData} options={emotionChartOptions} />
                </div>
                <p className="card-label">감정별 변화 추이</p>
            </div>

            {/* 뒤로가기 버튼 */}
            <div className="footer-actions">
                <button
                    className="btn-back"
                    onClick={() => navigate('/emotion-stats', {
                        state: { activeTab: 'monthly' }
                    })}
                >
                    ← 통계로 돌아가기
                </button>
            </div>
        </div>
    ); S
}

export default WeekDetail;