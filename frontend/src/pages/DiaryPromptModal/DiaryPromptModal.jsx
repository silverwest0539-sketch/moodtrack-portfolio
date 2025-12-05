// 일기 주제 추천 (작성 이전)

import React, { useEffect, useState } from 'react';
import './DiaryPromptModal.css';

// wire3.html 의 wordList 내용 요약 버전 (나머지는 ... 부분에 그대로 붙이시면 돼요)
const WORD_LIST = [
  // 자연과 날씨
  '오후의 햇살', '빗소리', '새벽 공기',
  '저녁 노을', '밤하늘의 별', '스치는 바람',
  '길가에 핀 꽃', '소나기', '첫눈', '겨울 바다',
  '물 웅덩이', '구름 뒤의 해', '낙엽 밟는 소리',
  '여름의 냄새', '달빛 산책', '무지개', '안개 낀 아침',
  '파도 소리', '초록 잎사귀', '따스한 봄날',

  // 일상과 사물
  '따뜻한 커피', '오래된 책', '좋아하는 노래',
  '창밖 풍경', '편안한 이불', '버스 창가',
  '퇴근길', '늦은 저녁밥', '편의점 맥주',
  '작은 화분', '손편지', '낡은 사진', '이어폰',
  '책상의 먼지', '갓 구운 빵', '따뜻한 샤워',

  // ... wire3.html 안에 있는 나머지 wordList 전부 여기로 복붙! ...
];

function getRandomWord() {
  if (!WORD_LIST.length) return '';
  const idx = Math.floor(Math.random() * WORD_LIST.length);
  return WORD_LIST[idx];
}

/**
 * props:
 * - isOpen: 모달 열림 여부 (기본값: true) -> 안 넘겨도 자동으로 뜸
 * - onClose: 닫기 콜백 (선택)
 * - onSelectTopic: (word | null) 선택된 단어 전달 (선택)
 */
function DiaryPromptModal({
  isOpen = true,
  onClose,
  onSelectTopic,
}) {
  const [currentWord, setCurrentWord] = useState(getRandomWord());
  const [isFading, setIsFading] = useState(false);

  // 모달이 열릴 때마다 랜덤 단어 새로 세팅
  useEffect(() => {
    if (isOpen) {
      setCurrentWord(getRandomWord());
    }
  }, [isOpen]);

  const handleRefreshWord = () => {
    if (!WORD_LIST.length) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentWord(getRandomWord());
      setIsFading(false);
    }, 300);
  };

  const handleUseWord = () => {
    if (onSelectTopic) {
      onSelectTopic(currentWord);
    } else {
      alert(`'${currentWord}' 주제로 일기 쓰기 (onSelectTopic 연결 필요)`);
    }
    if (onClose) onClose();
  };

  const handleSkip = () => {
    if (onSelectTopic) {
      onSelectTopic(null);
    } else {
      alert('주제 없이 그냥 쓰기 (onSelectTopic 연결 필요)');
    }
    if (onClose) onClose();
  };

  const handleOverlayClick = (e) => {
    // 바깥 클릭 시 닫기
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // ✅ 이제 isOpen 안 넘겨도 기본 true라서, 컴포넌트만 쓰면 뜸
  if (!isOpen) return null;

  return (
    <div
      id="modal-overlay"
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div id="prompt-modal" className="modal-card">
        <h3 className="modal-title">오늘 무엇을 쓸지 고민되시나요?</h3>

        <div id="word-card-container" className="card-elevation">
          <p
            id="random-word-text"
            className={isFading ? 'fade-out' : ''}
          >
            {currentWord}
          </p>
        </div>

        <div className="modal-actions">
          <button
            id="btn-use-word"
            className="btn-primary"
            type="button"
            onClick={handleUseWord}
          >
            ✨ 이 주제로 쓰기
          </button>

          <button
            id="btn-refresh-word"
            className="btn-secondary"
            type="button"
            onClick={handleRefreshWord}
          >
            🔄 다른 단어 추천받기
          </button>

          <button
            id="btn-skip"
            className="btn-text-only"
            type="button"
            onClick={handleSkip}
          >
            건너뛰고 그냥 쓰기
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiaryPromptModal;
