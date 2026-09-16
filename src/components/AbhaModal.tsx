import { useState } from 'react';
import { X, CheckCircle, Smartphone } from 'lucide-react';

interface AbhaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AbhaModal({ isOpen, onClose, onSuccess }: AbhaModalProps) {
  const [step, setStep] = useState(1);
  const [abhaId, setAbhaId] = useState('');
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleGenerateOTP = () => {
    if (abhaId.length < 14) {
      alert("Please enter a valid 14-digit ABHA ID");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
    }, 1200);
  };

  const handleVerifyOTP = () => {
    if (otp.length < 6) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      setTimeout(() => {
        onSuccess();
        onClose();
        setStep(1); // Reset for future
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        {step === 1 && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Link ABHA Account</h2>
            <p className="text-sm text-slate-500">Enter your 14-digit Ayushman Bharat Health Account ID to sync your medical records.</p>
            
            <input 
              type="text" 
              placeholder="e.g. 14-XXXX-XXXX-XXXX" 
              value={abhaId}
              onChange={(e) => setAbhaId(e.target.value.replace(/[^0-9-]/g, ''))}
              maxLength={17}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            
            <button 
              onClick={handleGenerateOTP}
              disabled={isProcessing || !abhaId}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 transition-all"
            >
              {isProcessing ? "Connecting to ABDM..." : "Generate OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Smartphone size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Verify OTP</h2>
            <p className="text-sm text-slate-500">We sent a 6-digit code to the mobile number registered with your ABHA ID.</p>
            
            <div className="flex gap-2 justify-center py-2">
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center text-2xl tracking-[1em] p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            
            <button 
              onClick={handleVerifyOTP}
              disabled={isProcessing || otp.length < 6}
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 transition-all"
            >
              {isProcessing ? "Verifying..." : "Confirm & Link"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Successfully Linked!</h2>
            <p className="text-sm text-slate-500">Your health records have been synced securely.</p>
          </div>
        )}
      </div>
    </div>
  );
}
