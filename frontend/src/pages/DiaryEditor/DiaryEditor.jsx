// 일기 작성

import React, { useMemo, useState } from 'react';
import './DiaryEditor.css';

/**
 * props:
 * - initialTag: 모달에서 선택된 단어 (string | null)
 * - onSave: (payload) => void   // 저장 시 부모로 내용 넘기고 싶으면 사용
 */
function DiaryEditor({ initialTag = null, onSave }) {
  // 오늘 날짜 문자열 만들기 (YYYY. MM. DD)
  const todayLabel = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}. ${m}. ${d}`;
  }, []);

  const [content, setContent] = useState('');

  const handleSave = () => {
    if (content.trim() === '') {
      alert('내용을 입력해 주세요!');
      return;
    }

    const payload = {
      date: todayLabel,
      tag: initialTag || null,
      content,
    };

    console.log('📘 Diary Save Payload:', payload);

    if (onSave) {
      onSave(payload);
    } else {
      // 나중에 여기서 fetch/axios로 서버에 저장 로직 넣으면 됩니다.
      alert('일기가 저장되었습니다! (onSave 미연결 상태)');
    }
  };

  return (
    <div id="editor-page">
      {/* 1. 상단 정보 */}
      <header className="editor-header">
        <span id="editor-date">{todayLabel}</span>

        {/* 선택된 태그가 있을 때만 칩 표시 */}
        {initialTag && (
          <div id="selected-tag" className="chip">
            <span>#</span>
            <span id="tag-text">{initialTag}</span>
          </div>
        )}
      </header>

      {/* 2. 텍스트 입력 영역 */}
      <main className="input-area">
        <textarea
          id="diary-content"
          placeholder="오늘 하루는 어땠나요? 편안하게 이야기 해주세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </main>

      {/* 3. 저장 버튼 영역 */}
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
