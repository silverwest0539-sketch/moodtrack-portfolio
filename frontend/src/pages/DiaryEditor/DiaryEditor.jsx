// src/pages/DiaryEditor/DiaryEditor.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './DiaryEditor.css';

/**
 * props:
 * - initialTag: 모달에서 선택된 단어 (string | null)
 * - onSave: (payload) => void (선택적 콜백)
 */
function DiaryEditor({ initialTag = null, onSave }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  /* ------------------ ✅ 상수 정의 ------------------ */
  const MIN_LENGTH = 50; // 최소 글자 수 제한

  /* ------------------ ✅ Query Parameter & 날짜 ------------------ */
  const topic = searchParams.get('topic'); // 질문
  const dateParam = searchParams.get('date');

  const todayLabel = useMemo(() => {
    // URL에 날짜가 있으면 그 포맷을 유지 (YYYY-MM-DD -> YYYY. MM. DD)
    if (dateParam) {
      return dateParam.replace(/-/g, '. ');
    }
    // 없으면 오늘 날짜 생성
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}. ${m}. ${d}`;
  }, [dateParam]);

  /* ------------------ ✅ 상태 관리 ------------------ */
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 백엔드 통신 중 로딩 상태

  // 현재 글자 수 및 저장 가능 여부 계산
  const currentLength = content.length;
  const isSaveEnabled = currentLength >= MIN_LENGTH;

  /* ------------------ ✅ 핸들러: 저장 및 분석 요청 ------------------ */
  const handleSave = async () => {
    // 1. 유효성 검사 (글자 수 부족)
    if (!isSaveEnabled) {
      alert(`최소 ${MIN_LENGTH}자 이상 작성해주세요!`);
      return;
    }

    // 2. 로딩 시작
    setIsLoading(true);

    try {
      console.log('감정 분석 요청 시작...');

      // 3. 백엔드 API 요청
      const response = await fetch('http://localhost:3000/api/diary/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: content,
          diaryDate: todayLabel,
          tag: initialTag || null,
          topic: topic || null,
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ 감정 분석 완료');
        console.log('최종 점수:', data.finalScore);
        console.log('감정별 점수:', data.emotionScores);

        // 상위 컴포넌트 콜백이 있다면 실행
        if (onSave) {
            onSave({
                date: todayLabel,
                tag: initialTag || null,
                content,
                finalScore: data.finalScore,
                emotionScores: data.emotionScores
            });
        }

        // 4. 감정 분석 결과 페이지로 이동 (데이터 전달)
        navigate('/emotionResult', {
          state: {
            date: todayLabel,
            tag: initialTag,
            content: content,
            finalScore: data.finalScore,
            emotionScores: data.emotionScores,
            comment: data.comment,
          }
        });

      } else {
        alert('감정 분석에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('❌ 에러 발생:', error);
      alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      // 5. 로딩 종료 (성공하든 실패하든 실행)
      setIsLoading(false);
    }
  };

  /* ------------------ ✅ 렌더링 헬퍼 ------------------ */
  // 버튼 텍스트 및 상태 결정
  const getButtonText = () => {
    if (isLoading) return '감정 분석 중...';
    if (!isSaveEnabled) return `${MIN_LENGTH}자 이상 작성해 주세요`;
    return '오늘의 일기 저장하기';
  };

  // 버튼 비활성화 조건: 로딩 중이거나 OR 글자 수가 부족할 때
  const isButtonDisabled = isLoading || !isSaveEnabled;

  return (
    <div id="editor-page">
      {/* 1. 상단 정보 */}
      <header className="editor-header">
        <span id="editor-date">{todayLabel}</span>

        {/* 선택된 태그 */}
        {initialTag && (
          <div id="selected-tag" className="chip">
            <span>#</span>
            <span id="tag-text">{initialTag}</span>
          </div>
        )}
      </header>

      {/* 질문 표시 */}
      {topic && (
        <div className="topic-box">
          💡 {topic}
        </div>
      )}

      {/* 2. 텍스트 입력 영역 */}
      <main className="input-area">
        <textarea
          id="diary-content"
          placeholder={
            topic
              ? topic
              : `오늘 하루는 어땠나요? 편안하게 이야기 해주세요. (${MIN_LENGTH}자 이상)`
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading} // 로딩 중에는 수정 불가
        />

        {/* 글자 수 카운터 표시 */}
        <div className={`char-counter ${isSaveEnabled ? 'valid' : ''}`}>
          {currentLength} 글자
        </div>
      </main>

      {/* 3. 저장 버튼 */}
      <footer className="editor-footer">
        <button
          id="btn-save-diary"
          type="button"
          className={`btn-full-width ${isButtonDisabled ? 'disabled' : ''}`}
          onClick={handleSave}
          disabled={isButtonDisabled} // HTML 속성으로 비활성화
        >
          {getButtonText()}
        </button>
      </footer>
    </div>
  );
}

export default DiaryEditor;