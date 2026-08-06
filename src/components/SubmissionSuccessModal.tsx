import React from 'react';
import { CheckCircle2, Copy, ShieldCheck } from 'lucide-react';
import { MerchantApplication } from '../types';

interface SubmissionSuccessModalProps {
  application: MerchantApplication | null;
  onClose: () => void;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  application,
  onClose,
}) => {
  if (!application) return null;

  const [copied, setCopied] = React.useState(false);

  const copyAppId = () => {
    navigator.clipboard.writeText(application.appId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#c3c6d7]/50 p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#121c28]">Application Submitted!</h3>
          <p className="text-xs text-[#434655] mt-1">
            Your merchant enrollment request has been safely received and queued for underwriting processing.
          </p>
        </div>

        {/* Reference ID Card */}
        <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#c3c6d7]/40 text-left space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#737686] font-medium">Application Reference ID:</span>
            <button
              onClick={copyAppId}
              className="flex items-center gap-1 text-[#004ac6] hover:underline font-medium text-xs cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <p className="text-lg font-mono font-bold text-[#004ac6]">{application.appId}</p>
          <div className="pt-2 border-t border-[#c3c6d7]/30 flex items-center gap-2 text-xs text-[#434655]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Confirmation email sent to <strong>{application.businessInfo.email}</strong></span>
          </div>
        </div>

        {/* Next Steps List */}
        <div className="text-left bg-[#eef4ff] p-3.5 rounded-xl border border-[#004ac6]/20 text-xs text-[#434655] space-y-1.5">
          <p className="font-semibold text-[#004ac6]">Estimated Processing Time:</p>
          <p className="text-[12px]">• Underwriting review completes in 24-48 business hours.</p>
          <p className="text-[12px]">• Save your reference ID — our team will contact you at the email provided.</p>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full bg-[#004ac6] hover:bg-[#003ea8] text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer"
          >
            Start Another Form
          </button>
        </div>
      </div>
    </div>
  );
};
