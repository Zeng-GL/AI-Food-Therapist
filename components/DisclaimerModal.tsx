'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguageStore } from '@/store/use-language-store';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export default function DisclaimerModal({ isOpen, onClose, onAgree }: DisclaimerModalProps) {
  const { language } = useLanguageStore();
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const isZh = language === 'zh';

  const handleAgree = () => {
    if (agreed) {
      onAgree();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isZh ? '免責聲明' : 'Disclaimer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand/10 rounded-full transition-colors text-brand-muted"
            aria-label={isZh ? '關閉' : 'Close'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-4 text-sm leading-relaxed">
            {isZh ? (
              <>
                <p className="font-semibold text-red-600">
                  本舌診結果僅供參考，不構成醫療診斷或治療建議。
                </p>
                <p>
                  使用本 AI 舌診健康助理服務前，請仔細閱讀以下免責聲明。使用本服務即表示您已閱讀、理解並同意接受本免責聲明的所有條款。
                </p>
                <div>
                  <h3 className="font-semibold mb-2">1. 服務性質</h3>
                  <p>本服務提供的舌診分析結果僅供健康參考與資訊提供之用，不構成醫療診斷、治療建議或處方，不替代專業醫療人員的診斷與治療，不適用於緊急醫療情況。</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. AI 分析限制</h3>
                  <p>本服務使用人工智慧影像識別技術進行分析，AI 分析結果可能無法達到 100% 準確度，分析結果可能因拍攝條件、光線、角度等因素而有所差異。</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. 醫療建議</h3>
                  <p>如有任何健康疑慮、症狀或不適，請立即諮詢合格的醫療專業人員。請勿僅依賴本服務的分析結果做出醫療決策。</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4. 責任限制</h3>
                  <p>我們不對基於本服務分析結果所做的任何決定、行動或後果負責。</p>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold text-red-600">
                  This tongue diagnosis result is for reference only and does not constitute medical diagnosis or treatment.
                </p>
                <p>
                  Before using this AI Tongue Diagnosis Health Assistant service, please carefully read the following disclaimer. By using this service, you acknowledge that you have read, understood, and agree to accept all terms of this disclaimer.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">1. Nature of Service</h3>
                  <p>The tongue diagnosis analysis results provided by this service are for health reference and informational purposes only, do not constitute medical diagnosis, treatment recommendations, or prescriptions, and do not replace professional medical diagnosis and treatment.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. AI Analysis Limitations</h3>
                  <p>This service uses artificial intelligence image recognition technology for analysis. AI analysis results may not achieve 100% accuracy, and analysis results may vary due to shooting conditions, lighting, angles, and other factors.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Medical Advice</h3>
                  <p>If you have any health concerns, symptoms, or discomfort, please consult a qualified healthcare professional immediately. Do not make medical decisions based solely on the analysis results of this service.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4. Limitation of Liability</h3>
                  <p>We are not responsible for any decisions, actions, or consequences made based on the analysis results of this service.</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 space-y-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              {isZh 
                ? '我已閱讀並理解上述免責聲明，同意接受所有條款' 
                : 'I have read and understood the disclaimer above and agree to accept all terms'}
            </span>
          </label>
          <button
            onClick={handleAgree}
            disabled={!agreed}
            className="w-full py-3 px-4 bg-brand text-white rounded-full font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90 transition-colors"
          >
            {isZh ? '我同意' : 'I Agree'}
          </button>
        </div>
      </div>
    </div>
  );
}

