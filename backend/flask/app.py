# Flask 서버 구축

from flask import Flask, request, jsonify
from flask_cors import CORS
from emotion_analyzer import EmotionAnalyzer

# Flask 앱 생성
app = Flask(__name__)

# CORS 설정(Node.js에서 접근 가능하게)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# 서버 시작할 때 모델 로드
print("Flask 서버 시작 중...")
analyzer = EmotionAnalyzer()
print("서버 준비 완료!")



# ============= API 엔드포인트 =============
@app.route('/', methods=['GET'])
def home():
    """
    서버 상태 확인용 엔드포인트
    브라우저에서 http://localhost:5000/ 접속하면 확인 가능
    """
    return jsonify({
        'status': 'running',
        'message': '감정 분석 API 서버가 실행 중입니다.'
    })

# 일기 감정 분석 API
@app.route('/analyze', methods=['POST'])
def analyze_diary():
    try:
        # 1. 클라이언트가 보낸 데이터 받기
        data = request.get_json()

        # 2. 일기 내용 추출
        diary_content = data.get('content', '') 
        # 'content'라는 키가 존재하면 그 키값의 value 반환, 존재하지 않으면 기본값('') 반환
    

        # 3. 유효성 검사(빈 문자열 체크)
        if not diary_content or diary_content.strip() == '':
            # 위 data.get('content','')에서 content라는 키값이 존재하지 않은 경우
            return jsonify({
                'success': False,
                'error': '일기 내용이 비어있습니다.'
            }), 400
        
        # 4. 감정 분석 실행
        print('분석 요청')
        
        result = analyzer.analyze(diary_content)

        print('분석 완료')

        # 5. 성공 응답 반환
        return jsonify ({
            'success': True,
            'emotion_scores': result['emotion_scores'],
            'final_score': result['final_score']
        }), 200
    
    # 6. 에러 발생 시
    except Exception as e:
        print(f"에러 발생: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'서버 오류: {str(e)}'
        }), 500
    
@app.route('/health', methods=['GET'])
def health_check():
    """
    서버 헬스 체크 (서버가 살아있는지 확인)
    Node.js에서 Flask 서버 연결 전에 확인용
    """
    return jsonify({
        'status': 'healthy',
        'model_loaded': True
    }), 200

# ============= 서버 실행 =============

if __name__ == '__main__':
    # Flask 서버 시작
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )