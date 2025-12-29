// src/pages/HomeWeekly/HomeWeekly.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeWeekly.css';
import logo from '../../assets/images/logos/logo3.PNG'; // 로고 경로는 실제 프로젝트에 맞게 확인 필요

const GREETINGS = [,
  "오늘도 기록하러 와줘서 고마워요",
  "지금의 감정도 충분히 소중해요",
  "오늘도 찾아와주셨네요!",
  "좋은 하루 보내고 계신가요?",
  "오늘도 당신을 기다리고 있었어요",
  "이 공간은 언제나 당신의 편이에요",
  "여기서는 편하게 쉬어가도 괜찮아요",
  "당신의 하루를 나눠줘서 고마워요",
  "오늘도 무사히 하루를 보내셨군요",
  "이곳은 당신만의 공간이에요",
  "당신의 마음을 응원하고 있어요",
  "힘든 하루였다면, 여기서 내려놓아요",
  "오늘도 잘 버텨내셨어요",
  "당신의 이야기는 언제나 환영이에요",
  "당신을 위한 공간이 여기 있어요",
  "오늘 하루를 마무리할 시간이에요",
  "여기선 어떤 감정이든 괜찮아요",
  "오늘도 당신 곁에 있을게요",
  "편안한 하루였길 바라요"
];

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_NAMES_KO = ['일', '월', '화', '수', '목', '금', '토'];

const HomeWeekly = () => {
  const navigate = useNavigate();

  // --- State 관리 ---
  const [weekDays, setWeekDays] = useState([]); // 백엔드(가상) 데이터 담을 곳
  const [greeting, setGreeting] = useState('');

  // 사용자 정보 (추후 백엔드 연동 시 대체)
  const [nickname, setNickname] = useState('');
  const [streak, setStreak] = useState(0);
  const [points] = useState(120);

  // --- 초기 데이터 로드 (백엔드 통신 시뮬레이션) ---
  useEffect(() => {
    // 인사말 랜덤 설정
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);

    // 사용자 프로필 조회
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/user/profile',
          { credentials: 'include' }
        )
        const data = await res.json()

        if (data.success) {
          setNickname(data.nickname)
          setStreak(data.streak)
        } else {
          console.error('프로필 조회 실패:', data.message)
          setNickname(data.nickname)
          setStreak(0)
        }
      } catch (error) {
        console.error('프로필 조회 에러:', error)
        setNickname('사용자')
        setStreak(0)
      }
    }

    // 주간 감정 데이터 조회
    const fetchWeekly = async () => {
      try {
        const res = await fetch(
          'http://localhost:3000/api/emotion-stats/week-full',
          { credentials: 'include' }
        );
        const data = await res.json();

        if (!data.success) {
          console.error('주간 데이터 조회 실패');
          return;
        }

        const days = data.diaries.map(diary => {
          const dateStr = diary.DIARY_DATE;
          const [year, month, day] = dateStr.split('-');
          const date = new Date(year, month - 1, day);

          return {
            dateObj: date,
            dateStr: diary.DIARY_DATE,
            dayName: getDayName(date.getDay()),
            dayNum: date.getDate(),
            dayIndex: date.getDay(),
            isToday: isToday(date),
            score: diary.EMO_SCORE,
            emotion: diary.EMO_SCORE ? getEmoji(diary.EMO_SCORE) : null
          };
        });

        setWeekDays(days);
      } catch (error) {
        console.error('주간 데이터 조회 에러:', error);
      }
    };

    fetchUserProfile();
    fetchWeekly();
  }, []);

  const isToday = (date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  const getEmoji = (score) => {
    if (score == null) return '';
    if (score >= 80) return '😄';
    if (score >= 60) return '🙂';
    if (score >= 40) return '😐';
    if (score >= 20) return '😞';
    return '😢';
  }

  const getDayName = (dayIndex) => {
    const names = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return names[dayIndex];
  };

  // handleCardClick 함수 내부 수정
  const handleCardClick = (day) => {
    if (day.isFuture) return

    if (day.score) {
      navigate(`/diary-view?date=${day.dateStr}`, {
        state: {
          date: day.dateStr.replace(/-/g, '.'),
          score: day.score,
          emotion: day.emotion,
        }
      })
    } else {
      navigate(`/write-option?date=${day.dateStr}`)
    }

  }

  // --- 핸들러 ---
  const handleWriteClick = () => {

    const todayData = weekDays.find(d => d.isToday)

    if (!todayData) {
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0]
      navigate(`/write-option?date=${dateStr}`)
      return
    }

    if (todayData.score) {
      navigate(`/diary-view?date=${todayData.dateStr}`, {
        state: {
          date: todayData.dateStr.replace(/-/g, '.'),
          score: todayData.score,
          emotion: todayData.emotion,
        }
      })
    } else {
      navigate(`/write-option?date=${todayData.dateStr}`)
    }
  };

  return (
    <div className="home-weekly-container">

      {/* 헤더: 로고 */}
      <header className="weekly-header">
        <img src={logo} alt="MoodTrack Logo" className="app-logo" />
      </header>

      {/* 1️⃣ 프로필 카드 */}
      <section className="card profile-card">
        <p className="profile-nickname">
          {nickname ? `${nickname}님,` : '로딩 중...'}
        </p>
        <p className="profile-greeting">{greeting}</p>
        <p className="profile-streak">
          <strong>{streak}</strong>일째 연속 출석 중!
        </p>
        {/* <p className="profile-points">
          🅿️ {points} 포인트
        </p> */}
      </section>

      {/* 2️⃣ 이번 주 출석 현황 */}
      <section className="card">
        <p className="section-title">
          이번 주 기록 현황
        </p>

        <div className="week-check">
          {DAY_NAMES_KO.map((dayName, index) => {
            // 이번 주에 해당하는 날짜만 체크
            const today = new Date();
            const thisWeekStart = new Date(today);
            thisWeekStart.setDate(today.getDate() - today.getDay()); // 이번 주 일요일
            thisWeekStart.setHours(0, 0, 0, 0);

            const recordExists = weekDays.some(d => {
              return d.dayIndex === index &&
                d.score &&
                d.dateObj >= thisWeekStart; // 이번 주 데이터만
            });

            return (
              <div key={index} className={`day-circle ${recordExists ? 'checked' : ''}`}>
                {recordExists ? '✓' : dayName}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3️⃣ 최근 감정 리스트 */}
      <section className="card">
        <p className="section-title">
          최근의 감정들을 한눈에 돌아보세요
        </p>

        <div className="emotion-list vertical">
          {weekDays.length > 0 ? (
            (() => {
              const todayIndex = weekDays.findIndex(d => d.isToday);
              const today = weekDays[todayIndex];
              
              // 오늘 이전 2일 가져오기
              const startIndex = todayIndex >= 2 ? todayIndex - 2 : 0;
              const recentDays = weekDays.slice(startIndex, todayIndex);

              return (
                <>
                  {/* 오늘 이전 2일 */}
                  {recentDays.map((day) => (
                    <div
                      key={day.dateStr}
                      className="emotion-card vertical"
                      onClick={() => handleCardClick(day)}
                      style={{ cursor: 'pointer' }}>
                      <span className="emotion-date">
                        {day.dayName} {day.dayNum}
                      </span>
                      <span className="emotion-emoji">
                        {day.emotion || ''}
                      </span>
                      <span className="emotion-score">
                        {day.score ? `${day.score}점` : ''}
                      </span>
                    </div>
                  ))}

                  {/* 오늘 카드 */}
                  {today && (
                    <div
                      className={`emotion-card vertical ${today.score ? '' : 'today-card'}`}
                      onClick={handleWriteClick}
                      style={{ cursor: 'pointer' }}>
                      <span className="emotion-date">
                        {today.score ? today.dayName : ''} {today.score ? today.dayNum : ''}
                      </span>
                      <span className={today.score ? "emotion-emoji" : "today-comment"}>
                        {today.score ? today.emotion : '오늘 하루는 어땠나요?'}
                      </span>
                      <span className={today.score ? "emotion-score" : "today-record"}>
                        {today.score ? `${today.score}점` : '기록하러 가기 ▶'}
                      </span>
                    </div>
                  )}
                </>
              );
            })()
          ) : (
            <div className="no-record-message">아직 기록된 감정이 없어요.</div>
          )}
        </div>
      </section>

      {/* 기록하기 CTA (오늘)
      <section
        className="card cta-card"
        onClick={handleWriteClick}
      >
        <span>오늘 하루는 어땠나요?</span>
        <strong>기록하러 가기 ▶</strong>
      </section> */}

    </div>
  );
};

export default HomeWeekly;