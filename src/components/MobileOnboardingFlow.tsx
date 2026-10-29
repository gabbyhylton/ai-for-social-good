import React, { useState } from "react";
import {
  Leaf,
  Check,
  Recycle,
  Sun,
  Sprout,
  Accessibility,
  ArrowRight,
} from "lucide-react";
import {
  MetricKey,
  UserMetricWeights,
  UserProfile,
} from "../types/sustainability";
import { METRIC_METADATA } from "../utils/scoringEngine";
import { FygsLogo } from "./GemPrintLogo";

interface MobileOnboardingFlowProps {
  initialWeights: UserMetricWeights;
  onComplete: (profile: UserProfile, weights: UserMetricWeights) => void;
}

const PILLAR_ICONS: Record<MetricKey, React.ReactNode> = {
  wasteManagement: <Recycle className="w-5 h-5" />,
  operations: <Sun className="w-5 h-5" />,
  plantBased: <Sprout className="w-5 h-5" />,
  accessibility: <Accessibility className="w-5 h-5" />,
};

export const MobileOnboardingFlow: React.FC<MobileOnboardingFlowProps> = ({
  initialWeights,
  onComplete,
}) => {
  const [step, setStep] = useState<"login" | "preferences">("login");
  const [name, setName] = useState("Alex Rivera");
  const [email, setEmail] = useState("devstar2642@gcplab.me");
  const [selectedKeys, setSelectedKeys] = useState<MetricKey[]>(() => {
    const keys = (Object.keys(initialWeights) as MetricKey[]).filter(
      (k) => initialWeights[k] > 1
    );
    return keys.length > 0 ? keys : ["wasteManagement", "plantBased"];
  });

  const handleGoogleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("preferences");
  };

  const toggleMetric = (key: MetricKey) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleFinish = () => {
    const nextWeights: UserMetricWeights = {
      wasteManagement: selectedKeys.includes("wasteManagement") ? 2.5 : 1,
      operations: selectedKeys.includes("operations") ? 2.5 : 1,
      plantBased: selectedKeys.includes("plantBased") ? 2.5 : 1,
      accessibility: selectedKeys.includes("accessibility") ? 2.5 : 1,
    };

    const trimmedName = name.trim() || "NYC Diner";
    const initials = trimmedName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    onComplete(
      {
        name: trimmedName,
        email: email.trim() || "devstar2642@gcplab.me",
        avatarInitials: initials || "FY",
        hasCompletedOnboarding: true,
      },
      nextWeights
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-[#E6E1D6] rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* fygs Brand Header */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3">
            <FygsLogo size="lg" variant="app-icon" />
            <div>
              <div className="text-2xl font-bold tracking-tight text-[#1A531A] font-display lowercase leading-none">
                fygs
              </div>
              <div className="text-xs text-[#BD735A] font-medium mt-1">
                NYC Sustainability &amp; Access
              </div>
            </div>
          </div>

          <div className="text-xs font-mono tabular-nums text-[#BD735A] bg-[#F7ECE8] px-2.5 py-1 rounded-full font-semibold">
            {step === "login" ? "1 / 2" : "2 / 2"}
          </div>
        </div>

        {step === "login" ? (
          <div className="mt-8">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight font-display">
              Every NYC restaurant&apos;s green footprint, simplified.
            </h1>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              Connect your Google account and pick your priorities to see both the{" "}
              <strong className="text-[#1A531A]">Standard Score</strong> baseline and your{" "}
              <strong className="text-[#BD735A]">Personal Score</strong>.
            </p>

            {/* Preview Strip */}
            <div className="mt-6 p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D6] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800">
                  Dirt Candy · Lower East Side
                </span>
                <span className="inline-flex items-center gap-1 font-mono font-bold text-[#1A531A]">
                  9.5/10
                  <Leaf className="w-3.5 h-3.5 fill-[#1A531A] text-[#0F4C35]" />
                  <Leaf className="w-3.5 h-3.5 fill-[#1A531A] text-[#0F4C35]" />
                  <Leaf className="w-3.5 h-3.5 fill-[#1A531A] text-[#0F4C35]" />
                </span>
              </div>
              <div className="text-stone-500">
                100% Plant-Forward · Union Square Greenmarket · Step-Free ADA
              </div>
            </div>

            <form onSubmit={handleGoogleConnect} className="mt-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl focus:outline-none focus:bg-white focus:border-[#1A531A]"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Google Account Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-[#FAF9F5] border border-[#E6E1D6] rounded-xl focus:outline-none focus:bg-white focus:border-[#1A531A]"
                    placeholder="you@gmail.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-[#1A531A] hover:bg-[#0F4C35] text-white font-semibold text-sm flex items-center justify-center gap-3 transition-transform active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 20.4 7.4 23 12 23z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-7">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight font-display">
              Customize your Personal Score
            </h1>
            <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
              Pick the pillars you care about most. We&apos;ll show your Personal Score alongside
              each restaurant&apos;s Standard Score.
            </p>

            <div className="mt-5 space-y-2.5">
              {(Object.keys(METRIC_METADATA) as MetricKey[]).map((key) => {
                const meta = METRIC_METADATA[key];
                const isSelected = selectedKeys.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleMetric(key)}
                    className={`w-full min-h-[68px] p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#1A531A] bg-[#1A531A]/[0.05]"
                        : "border-[#E6E1D6] bg-[#FAF9F5]/80 hover:border-[#BD735A]/60"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#1A531A] text-white"
                            : "bg-[#F7ECE8] text-[#BD735A]"
                        }`}
                      >
                        {PILLAR_ICONS[key]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-stone-900">
                          {meta.friendlyTitle}
                        </div>
                        <div className="text-xs text-stone-600 mt-0.5 line-clamp-1">
                          {meta.subtitle}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-[#BD735A] border-[#BD735A] text-white"
                          : "border-[#E6E1D6] bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="mt-6 w-full min-h-[48px] px-4 py-3 rounded-2xl bg-[#1A531A] hover:bg-[#0F4C35] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer"
            >
              <span>Enter fygs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
