// src/pages/DiaryViewer/DiaryViewer.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DiaryViewer.css';

const DiaryViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 데이터 가져오기 (없으면 더미 데이터)
  const initialData = location.state || {
    date: '2025. 12. 23',
    content: `오늘은 정말 신기한 날이었다.\n길을 걷다가 우연히 옛 친구를 만났는데,\n우리는 시간 가는 줄 모르고 이야기를 나눴다.\n\n비가 조금 왔지만, 빗소리가 오히려 운치 있게 느껴졌다.\n집에 돌아와서 따뜻한 차를 마시니 마음이 차분해진다.`,
    emotion: '😊',
    score: 85.5,
    tags: ['#우연', '#빗소리', '#차분함']
  };

  /* ------------------ ✅ 수정 기능 상태 관리 ------------------ */
  const [isEditing, setIsEditing] = useState(false);         // 현재 수정 모드인지?
  const [content, setContent] = useState(initialData.content); // 보여줄 내용 (수정되면 바뀜)
  const [editContent, setEditContent] = useState(initialData.content); // 수정 중인 임시 내용

  // '수정하기' 버튼 클릭 시
  const toggleEdit = () => {
    setEditContent(content); // 현재 내용을 에디터에 세팅
    setIsEditing(true);      // 수정 모드 ON
  };

  // '저장 완료' 버튼 클릭 시
  const handleSaveEdit = () => {
    if (window.confirm('수정한 내용을 저장하시겠습니까?')) {
      // 1. 여기서 백엔드에 수정 요청 (axios.put / axios.post 등)
      // await axios.put('/api/diary/update', { ... })
      
      console.log('수정된 내용 저장:', editContent);
      
      // 2. 성공 시 상태 업데이트
      setContent(editContent); // 화면 내용 갱신
      setIsEditing(false);     // 수정 모드 OFF
    }
  };

  // '취소' 버튼 클릭 시
  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="viewer-container">
      
      {/* 헤더 */}
      <header className="viewer-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ←
        </button>
        <h2 className="viewer-date">{initialData.date}</h2>
        <div className="header-placeholder"></div> 
      </header>

      {/* 메인 카드 */}
      <main className="viewer-card">
        
        {/* 태그 영역 (보기 모드일 때만 표시하거나 유지 가능) */}
        {!isEditing && initialData.tags && (
          <div className="viewer-tags">
            {initialData.tags.map((tag, idx) => (
              <span key={idx} className="tag-chip">{tag}</span>
            ))}
          </div>
        )}

        {/* 
         * ✅ 일기 내용 텍스트 박스 
         * - isEditing이 true면: 입력 가능 (readOnly={false}), 스타일 변경
         * - isEditing이 false면: 읽기 전용 (readOnly={true})
         */}
        <div className={`content-box ${isEditing ? 'editing-mode' : ''}`}>
          <textarea
            className="viewer-textarea"
            value={isEditing ? editContent : content}
            readOnly={!isEditing} 
            onChange={(e) => setEditContent(e.target.value)}
          />
        </div>

        <div className="divider-line"></div>

        {/* 감정 분석 결과 (수정 모드일 땐 가려도 되고, 둬도 됨. 여기선 유지) */}
        <div className="analysis-result">
          <p className="result-label">이날의 감정 분석</p>
          <div className="score-badge">
            <span className="emoji-icon">{initialData.emotion}</span>
            <span className="score-text">{initialData.score}점</span>
          </div>
        </div>

      </main>

      {/* ✅ 하단 버튼 영역 */}
      <footer className="viewer-footer">
        {isEditing ? (
          <div className="btn-group">
            <button className="btn-action cancel" onClick={handleCancel}>취소</button>
            <button className="btn-action save" onClick={handleSaveEdit}>저장 완료</button>
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