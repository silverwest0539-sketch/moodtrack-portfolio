import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './WriteMethodSelection.css';

const WriteMethodSelection = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // 날짜 정보를 계속 달고 다녀야 합니다.
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    return (
        <div className="selection-container">
            <header className="selection-header">
                <span className="selection-date">{dateStr}</span>
                <h2>오늘의 이야기를<br/>어떻게 기록할까요?</h2>
            </header>

            <div className="selection-options">
                {/* 옵션 1: 자유롭게 쓰기 */}
                <div 
                    className="option-card free-write" 
                    onClick={() => navigate(`/diaryedit?date=${dateStr}`)}
                >
                    <div className="icon-area">📝</div>
                    <div className="text-area">
                        <h3>자유롭게 쓰기</h3>
                        <p>형식 없이 내 마음가는 대로 솔직하게 털어놓아요.</p>
                    </div>
                </div>

                {/* 옵션 2: 주제(질문) 고르기 */}
                <div 
                    className="option-card topic-write"
                    onClick={() => navigate(`/diary?date=${dateStr}`)}
                >
                    <div className="icon-area">💡</div>
                    <div className="text-area">
                        <h3>질문 보고 쓰기</h3>
                        <p>무엇을 쓸지 막막하다면 영감을 주는 질문을 골라보세요.</p>
                    </div>
                </div>
            </div>

            <button className="btn-back" onClick={() => navigate(-1)}>
                뒤로 가기
            </button>
        </div>
    );
};

export default WriteMethodSelection;