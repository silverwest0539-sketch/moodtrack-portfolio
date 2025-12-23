import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './DiaryEditor.css';

/**
 * props:
 * - initialTag: 모달에서 선택된 단어 (string | null)
 * - onSave: (payload) => void
 */
function DiaryEditor({ initialTag = null, onSave }) {
  /* ------------------ ✅ query parameter ------------------ */
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic'); // 질문
  const dateParam = searchParams.get('date');

  /* ------------------ ✅ 날짜 ------------------ */
  const todayLabel = useMemo(() => {
    if (dateParam) return dateParam;

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}. ${m}. ${d}`;
  }, [dateParam]);

  /* ------------------ ✅ 상태 ------------------ */
  const [content, setContent] = useState('');

  /* ------------------ ✅ 저장 ------------------ */
  const handleSave = () => {
    if (content.trim() === '') {
      alert('내용을 입력해 주세요!');
      return;
    }

    const payload = {
      date: todayLabel,
      tag: initialTag || null,
      topic: topic || null, // ✅ 질문도 함께 저장 가능
      content,
    };

    console.log('📘 Diary Save Payload:', payload);

    if (onSave) {
      onSave(payload);
    } else {
      alert('일기가 저장되었습니다! (onSave 미연결 상태)');
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
        />
      </main>

      {/* 3. 저장 버튼 */}
      <footer className="editor-footer">
        <button
          id="btn-save-diary"
          type="button"
          className="btn-full-width"
          onClick={handleSave}
        >
          오늘의 일기 저장하기
        </button>
      </footer>
    </div>
  );
}

export default DiaryEditor;