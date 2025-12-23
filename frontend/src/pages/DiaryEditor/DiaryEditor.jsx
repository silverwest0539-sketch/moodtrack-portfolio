import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './DiaryEditor.css';

/**
 * props:
 * - initialTag: 모달에서 선택된 단어 (string | null)
 * - onSave: (payload) => void
 */
function DiaryEditor({ initialTag = null, onSave }) {
  const navigate = useNavigate();

  // 날짜 문자열 만들기 (YYYY. MM. DD)
  const [searchParams] = useSearchParams()
  const topic = searchParams.get('topic'); // 질문
  const dateParam = searchParams.get('date')

  const todayLabel = useMemo(() => {
    if (dateParam) {
      return dateParam.replace(/-/g, '. ')
    }

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}. ${m}. ${d}`;
  }, [dateParam]);

  /* ------------------ ✅ 상태 ------------------ */
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (content.trim() === '') {
      alert('내용을 입력해 주세요!');
      return;
    }

    setIsLoading(true);
    const payload = {
      date: todayLabel,
      tag: initialTag || null,
      topic: topic || null, // ✅ 질문도 함께 저장 가능
      content,
    };

    try {
      console.log('감정 분석 요청');

      const response = await fetch('http://localhost:3000/api/diary/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // ✅ 수정!
        },
        credentials: 'include',
        body: JSON.stringify({
          content: content,
          diaryDate: todayLabel
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('감정 분석 완료');
        console.log('최종 점수:', data.finalScore);
        console.log('감정별 점수:', data.emotionScores);

        const payload = {
          date: todayLabel,
          tag: initialTag || null,
          content,
          finalScore: data.finalScore,
          emotionScores: data.emotionScores
        };

        console.log('Diary Save Payload:', payload);

        // 감정 분석 결과 페이지로 이동
        navigate('/emotionResult', {
          state: {
            date: todayLabel,
            tag: initialTag,
            content: content,
            finalScore: data.finalScore,
            emotionScores: data.emotionScores
          }
        });
        
        if (onSave) {
          onSave(payload);
        }
      } else {
        alert('감정 분석에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('에러 발생:', error);
      alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="editor-page">
      {/* 1. 상단 정보 */}
      <header className="editor-header">
        <span id="editor-date">{todayLabel}</span>

        {/* ✅ 선택된 태그 */}
        {initialTag && (
          <div id="selected-tag" className="chip">
            <span>#</span>
            <span id="tag-text">{initialTag}</span>
          </div>
        )}
      </header>

      {/* ✅ 질문 표시 (선택) */}
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
              : '오늘 하루는 어땠나요? 편안하게 이야기 해주세요.'
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
        />
      </main>

      {/* 3. 저장 버튼 */}
      <footer className="editor-footer">
        <button
          id="btn-save-diary"
          type="button"
          className="btn-full-width"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? '감정 분석 중...' : '오늘의 일기 저장하기'}
        </button>
      </footer>
    </div>
  );
}

export default DiaryEditor;