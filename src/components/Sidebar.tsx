import React from 'react';
import { Send, CheckCircle2, ShieldAlert, RotateCcw } from 'lucide-react';
import { PortalTab } from '../types';

interface SidebarProps {
  activeSection: 'section-1' | 'section-2' | 'section-3' | 'submit-section';
  onNavigateSection: (sectionId: string) => void;
  sectionStatus: {
    section1Complete: boolean;
    section2Complete: boolean;
    section3Complete: boolean;
  };
  currentTab: PortalTab;
  onResetForm: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigateSection,
  sectionStatus,
  currentTab,
  onResetForm,
}) => {
  return (
    <nav className="hidden lg:flex flex-col p-6 gap-6 bg-white h-screen w-64 fixed left-0 top-0 border-r border-[#c3c6d7]/50 shadow-xs z-20 overflow-y-auto">
      {/* Brand Header */}
      <div className="mb-2">
        <h1 className="text-[20px] font-bold text-[#004ac6] tracking-tight font-['Work_Sans']">
          Enrollment Portal
        </h1>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-[#e5eeff] rounded-full border border-[#c3c6d7]/30">
          <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-pulse"></span>
          <p className="text-xs font-medium text-[#434655]">
            {currentTab === 'form' ? 'Nueva solicitud' : 'Panel administrador'}
          </p>
        </div>
      </div>

      {currentTab === 'form' ? (
        /* Progress Stepper */
        <div className="flex flex-col gap-2 relative flex-1">
          {/* Progress Line */}
          <div className="absolute left-[19px] top-6 bottom-16 w-0.5 bg-[#d9e3f4] -z-10" />
          
          {/* Step 1 */}
          <button
            onClick={() => onNavigateSection('section-1')}
            className={`flex items-center gap-4 px-2 py-3 text-left font-medium transition-colors group ${
              activeSection === 'section-1' ? 'text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ring-4 ring-white transition-all ${
                activeSection === 'section-1'
                  ? 'bg-[#004ac6] text-white'
                  : sectionStatus.section1Complete
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#d9e3f4] text-[#434655]'
              }`}
            >
              {sectionStatus.section1Complete ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">1</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Customer Details</span>
              <span className="text-[12px] text-[#004ac6]/80 font-normal">
                {activeSection === 'section-1'
                  ? 'In progress'
                  : sectionStatus.section1Complete
                  ? 'Completed'
                  : 'Pending'}
              </span>
            </div>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => onNavigateSection('section-2')}
            className={`flex items-center gap-4 px-2 py-3 text-left font-medium transition-colors group ${
              activeSection === 'section-2' ? 'text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white transition-all ${
                activeSection === 'section-2'
                  ? 'bg-[#004ac6] text-white'
                  : sectionStatus.section2Complete
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#d9e3f4] text-[#434655] group-hover:bg-[#2563eb] group-hover:text-white'
              }`}
            >
              {sectionStatus.section2Complete ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">2</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Business Info</span>
              <span className="text-[12px] text-[#434655]/80 font-normal">
                {activeSection === 'section-2'
                  ? 'In progress'
                  : sectionStatus.section2Complete
                  ? 'Completed'
                  : 'Pending'}
              </span>
            </div>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => onNavigateSection('section-3')}
            className={`flex items-center gap-4 px-2 py-3 text-left font-medium transition-colors group ${
              activeSection === 'section-3' ? 'text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white transition-all ${
                activeSection === 'section-3'
                  ? 'bg-[#004ac6] text-white'
                  : sectionStatus.section3Complete
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#d9e3f4] text-[#434655] group-hover:bg-[#2563eb] group-hover:text-white'
              }`}
            >
              {sectionStatus.section3Complete ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">3</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Owners</span>
              <span className="text-[12px] text-[#434655]/80 font-normal">
                {activeSection === 'section-3'
                  ? 'In progress'
                  : sectionStatus.section3Complete
                  ? 'Completed'
                  : 'Pending'}
              </span>
            </div>
          </button>

          {/* Step 4: Submit */}
          <button
            onClick={() => onNavigateSection('submit-section')}
            className={`flex items-center gap-4 px-2 py-3 text-left font-medium transition-colors group mt-4 border-t border-[#c3c6d7]/30 pt-6 ${
              activeSection === 'submit-section'
                ? 'text-[#004ac6]'
                : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                activeSection === 'submit-section'
                  ? 'bg-[#004ac6] text-white'
                  : 'bg-[#d9e3f4] text-[#434655] group-hover:bg-[#004ac6] group-hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold">Submit</span>
          </button>

          {/* Reset Draft option */}
          <div className="mt-auto pt-6 border-t border-[#c3c6d7]/30">
            <button
              onClick={onResetForm}
              className="flex items-center gap-2 text-xs text-[#737686] hover:text-[#ba1a1a] transition-colors px-2 py-1.5 rounded"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Current Draft</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between pt-4">
          <div className="bg-[#eef4ff] p-4 rounded-xl border border-[#c3c6d7]/40">
            <div className="flex items-center gap-2 text-[#004ac6] text-xs font-semibold mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Portal Dashboard</span>
            </div>
            <p className="text-xs text-[#434655]">
              View all merchant applications and manage underwriting statuses. Access requires MFA verification.
            </p>
          </div>
          <div className="text-[11px] text-[#737686] text-center">
            Merchant Processing Systems v4.2
          </div>
        </div>
      )}
    </nav>
  );
};
