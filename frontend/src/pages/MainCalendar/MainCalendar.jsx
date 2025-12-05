// 메인 캘린더 페이지

import React, { useState, useMemo } from 'react';
import './MainCalendar.css';

const KOR_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startWeekDay = firstDay.getDay(); // 0=일
  const totalDays = lastDay.getDate();

  const cells = [];

  // 앞쪽 빈 칸
  for (let i = 0; i < startWeekDay; i++) {
    cells.push(null);
  }

  // 이번 달 날짜
  for (let d = 1; d <= totalDays; d++) {
    cells.push(new Date(year, month, d));
  }

  // 뒤쪽 빈 칸 (7의 배수 맞추기)
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

function isSameDate(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateKey(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateLabel(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = KOR_WEEK[date.getDay()];
  return `${y}. ${m}.${d} (${w})`;
}

function MainCalendar() {
  const today = new Date();

  // 현재 보고 있는 연/월
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0~11

  // 선택된 날짜 (기본: 오늘)
  const [selectedDate, setSelectedDate] = useState(today);

  // 나중에 일기 데이터 표시용 (지금은 비어 있음)
  const [entries] = useState({
    // '2025-12-04': { hasDiary: true },
  });

  const weeks = useMemo(
    () => buildCalendar(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleToday = () => {
    const t = new Date();
    setCurrentYear(t.getFullYear());
    setCurrentMonth(t.getMonth());
    setSelectedDate(t);
  };

  // ✅ 핵심: 클릭한 날짜로 선택 + (나중에 다른 달 날짜까지 나오면) 연/월도 동기화
  const handleSelectDate = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setCurrentYear(date.getFullYear());
    setCurrentMonth(date.getMonth());
  };

  const handleWriteDiary = () => {
    const baseDate = selectedDate || today;
    const key = formatDateKey(baseDate);
    alert(`"${key}" 날짜 기준으로 일기 쓰기 (나중에 라우팅 연결 예정)`);
  };

  return (
    <div id="main-container">
      {/* 1. 상단 헤더 */}
      <header className="top-bar">
          <div className="date-indicator">
            <span className="year-sm">{currentYear}</span>
            <span className="month-lg">{currentMonth + 1}월</span>
          </div>

        <div className="header-actions">
          <button
            className="icon-btn"
            type="button"
            onClick={handlePrevMonth}
          >
            ◀
          </button>
          <button
            className="icon-btn"
            type="button"
            onClick={handleToday}
          >
            오늘
          </button>
          <button
            className="icon-btn"
            type="button"
            onClick={handleNextMonth}
          >
            ▶
          </button>
        </div>
      </header>

      {/* 2. 요일 헤더 */}
      <div className="week-days">
        <div className="day-name sun">일</div>
        <div className="day-name">월</div>
        <div className="day-name">화</div>
        <div className="day-name">수</div>
        <div className="day-name">목</div>
        <div className="day-name">금</div>
        <div className="day-name sat">토</div>
      </div>

      {/* 3. 캘린더 그리드 */}
      <section className="calendar-body">
        {weeks.map((week, wi) => (
          <div className="week-row" key={wi}>
            {week.map((date, di) => {
              const isEmpty = !date;
              const isToday = isSameDate(date, today);
              const isSelected = isSameDate(date, selectedDate);
              const key = isEmpty ? `empty-${wi}-${di}` : formatDateKey(date);
              const hasEntry = !isEmpty && entries[formatDateKey(date)];

              const classes = ['day-cell'];
              if (isEmpty) classes.push('empty');
              if (isToday) classes.push('today');
              if (isSelected) classes.push('selected');
              if (hasEntry) classes.push('has-entry');

              return (
                <button
                  key={key}
                  type="button"
                  className={classes.join(' ')}
                  onClick={() => handleSelectDate(date)}
                  disabled={isEmpty}
                >
                  <span className="day-number">
                    {date ? date.getDate() : ''}
                  </span>
                  {hasEntry && <span className="day-dot" />}
                </button>
              );
            })}
          </div>
        ))}
      </section>

      {/* 4. 플로팅 "오늘의 일기 쓰기" 버튼 */}
      <button
        id="fab-write"
        className="fab-btn"
        type="button"
        onClick={handleWriteDiary}
      >
        <span className="fab-icon">✏️</span>
        <span className="fab-text">오늘의 일기 쓰기</span>
      </button>

      {/* 5. 하단 네비게이션 바 */}
      <nav className="bottom-nav">
        <button className="nav-item active" type="button">
          🏠
          <br />
          홈
        </button>
        <button className="nav-item" type="button">
          📊
          <br />
          통계
        </button>
        <button className="nav-item" type="button">
          🎁
          <br />
          콘텐츠
        </button>
        <button className="nav-item" type="button">
          👤
          <br />
          마이
        </button>
      </nav>
    </div>
  );
}

export default MainCalendar;
