// src/pages/DiaryViewer/DiaryViewer.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './DiaryViewer.css';

const DiaryViewer = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams()
  const dateParam = searchParams.get('date')

  // 1. 데이터 가져오기 (없으면 더미 데이터)
  const [diaryData, setDiaryData] = useState({
    date: location.state?.date ?? '',
    content: location.state?.content ?? '',
    emotion: location.state?.emotionEmoji ?? '',
    score: location.state?.score ?? 0,
  });

  /* ------------------ ✅ 수정 기능 상태 관리 ------------------ */
  const [isEditing, setIsEditing] = useState(false);         // 현재 수정 모드인지?
  const [editContent, setEditContent] = useState(diaryData.content); // 수정 중인 임시 내용

  const MIN_LENGTH = 50
  const currentLength = editContent.length
  const isSaveEnabled = currentLength >= MIN_LENGTH

  // '수정하기' 버튼 클릭 시
  const toggleEdit = () => {
    setEditContent(diaryData.content); // 현재 내용을 에디터에 세팅
    setIsEditing(true);      // 수정 모드 ON
  };

  // '저장 완료' 버튼 클릭 시
  const handleSaveEdit = async () => {
    if (editContent.trim().length < MIN_LENGTH) {
      alert(`최소 ${MIN_LENGTH}자 이상 작성해주세요!`)
      return
    }
    if (!window.confirm('수정한 내용을 저장하시겠습니까?')) return

    try {
      const updateRes = await fetch('http://localhost:3000/api/diary', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          date: dateParam,
          content: editContent,
        })
      })

      // 감정 분석 재요청
      const analyzeRes = await fetch('http://localhost:3000/api/diary/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          diaryDate: dateParam.replace(/-/g, '. '),
          content: editContent,
        })
      })

      const data = await analyzeRes.json()

      navigate('/emotionResult', {
        state: {
          date: dateParam,
          content: editContent,
          finalScore: data.finalScore,
          emotionScores: data.emotionScores,
        }
      })

    } catch (err) {
      console.error('수정 저장 실패:', err)
      alert('서버 오류')
    }
  };

  // '취소' 버튼 클릭 시
  const handleCancel = () => {
    setIsEditing(false);
  };
  useEffect(() => {
    if (diaryData.content) {
      setEditContent(diaryData.content)
    }
  }, [diaryData.content])

  useEffect(() => {
    if (location.state?.content) return

    if (!dateParam) return

    const fetchDiary = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/diary?date=${dateParam}`,
          { credentials: 'include' }
        )

        const data = await res.json()

        if (data.success) {
          setDiaryData({
            date: dateParam.replace(/-/g, '. '),
            content: data.diary.content,
            emotion: data.diary.emotionEmoji,
            score: data.diary.score,
          })
        }
      } catch (err) {
        console.error('일기 조회 실패:', err)
      }
    }

    fetchDiary()
  }, [dateParam, location.state])

  return (
    <div className="viewer-container">

      {/* 헤더 */}
      <header className="viewer-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ←
        </button>
        <h2 className="viewer-date">{diaryData.date}</h2>
        <div className="header-placeholder"></div>
      </header>

      {/* 메인 카드 */}
      <main className="viewer-card">

        {/* 태그 영역 (보기 모드일 때만 표시하거나 유지 가능)
        {!isEditing && initialData.tags && (
          <div className="viewer-tags">
            {initialData.tags.map((tag, idx) => (
              <span key={idx} className="tag-chip">{tag}</span>
            ))}
          </div>
        )} */}

        {/* 
         * ✅ 일기 내용 텍스트 박스 
         * - isEditing이 true면: 입력 가능 (readOnly={false}), 스타일 변경
         * - isEditing이 false면: 읽기 전용 (readOnly={true})
         */}
        <div className={`content-box ${isEditing ? 'editing-mode' : ''}`}>
          <textarea
            className="viewer-textarea"
            value={isEditing ? editContent : diaryData.content}
            readOnly={!isEditing}
            onChange={(e) => setEditContent(e.target.value)}
          />
          {isEditing && (
            <div className={`char-counter ${isSaveEnabled ? 'valid' : ''}`}>
              {currentLength} 글자
            </div>
          )}
        </div>

        <div className="divider-line"></div>

        {/* 감정 분석 결과 (수정 모드일 땐 가려도 되고, 둬도 됨. 여기선 유지) */}
        <div className="analysis-result">
          <p className="result-label">이날의 감정 분석</p>
          <div className="score-badge">
            <span className="emoji-icon">{diaryData.emotion}</span>
            <span className="score-text">{diaryData.score}점</span>
          </div>
        </div>

      </main>

      {/* ✅ 하단 버튼 영역 */}
      <footer className="viewer-footer">
        {isEditing ? (
          <div className="btn-group">
            <button className="btn-action cancel" onClick={handleCancel}>취소</button>
            <button className="btn-action save"
              onClick={handleSaveEdit}
              disabled={!isSaveEnabled}>저장 완료</button>
          </div>
        ) : (
          <button className="btn-action edit" onClick={toggleEdit}>
            내용 수정하기 ✏️
          </button>
        )}
      </footer>

    </div>
  );
};

export default DiaryViewer;