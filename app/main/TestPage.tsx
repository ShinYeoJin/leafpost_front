"use client";

import { useState } from "react";
import MailCard from "@/components/mail/MailCard";
import MailCardReadonly from "@/components/mail/MailCardReadonly";
import VillagerCard from "@/components/villagers/VillagerCard";

export default function TestPage() {
  const [mailCardText, setMailCardText] = useState("안녕하세요! 오늘 날씨가 정말 좋네요.");
  const [testLog, setTestLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setTestLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleSendNow = () => {
    addLog("즉시 전송 버튼 클릭됨");
  };

  const handleScheduleSend = (scheduledDate: Date) => {
    addLog(`예약 전송 버튼 클릭됨 - 예약 시간: ${scheduledDate.toLocaleString()}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            UI/UX 테스트 페이지
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            모든 컴포넌트의 동작과 반응형 레이아웃을 확인할 수 있습니다.
          </p>
        </div>

        {/* MailCard 테스트 섹션 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            MailCard 테스트
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
              원본 텍스트 입력 (debounce + preview 테스트)
            </label>
            <textarea
              value={mailCardText}
              onChange={(e) => setMailCardText(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg 
                       bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 
                       focus:outline-none focus:ring-2 focus:ring-zinc-500 
                       min-h-[100px] resize-y"
              placeholder="텍스트를 입력하면 debounce 후 preview API가 호출됩니다."
            />
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <MailCard
              backgroundUrl=""
              villagerStickerUrl="/next.svg"
              villagerName="테스트 주민"
              speechBubbleText="기본 말풍선 텍스트"
              textSafeAreaContent="테스트 제목"
              villagerId={1}
              toneType="RULE"
              originalText={mailCardText}
              onSendNow={handleSendNow}
              onScheduleSend={handleScheduleSend}
            />
          </div>
        </section>

        {/* MailCardReadonly 테스트 섹션 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            MailCardReadonly 테스트 (반응형 Grid)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <MailCardReadonly
              backgroundUrl=""
              villagerStickerUrl="/next.svg"
              villagerName="주민 A"
              speechBubbleText="안녕하세요! 오늘도 좋은 하루 되세요~"
              textSafeAreaContent="제목: 인사말"
              status="sent"
              sentDate={new Date().toISOString()}
            />
            <MailCardReadonly
              backgroundUrl=""
              villagerStickerUrl="/next.svg"
              villagerName="주민 B"
              speechBubbleText="내일 만나요! 기대돼요!"
              textSafeAreaContent="제목: 약속"
              status="reserved"
              scheduledDate={new Date(Date.now() + 86400000).toISOString()}
            />
            <MailCardReadonly
              backgroundUrl=""
              villagerStickerUrl="/next.svg"
              villagerName="주민 C"
              speechBubbleText="고마워요! 정말 도움이 많이 됐어요."
              textSafeAreaContent="제목: 감사 인사"
              status="sent"
              sentDate={new Date(Date.now() - 86400000).toISOString()}
            />
            <MailCardReadonly
              backgroundUrl=""
              villagerStickerUrl="/next.svg"
              villagerName="주민 D"
              speechBubbleText="다음 주에 또 만나요!"
              textSafeAreaContent="제목: 다음 약속"
              status="reserved"
              scheduledDate={new Date(Date.now() + 172800000).toISOString()}
            />
          </div>
        </section>

        {/* VillagerCard 테스트 섹션 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            VillagerCard 테스트 (반응형 Grid)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            <VillagerCard
              name="톰"
              imageUrl="/next.svg"
              isPopular={true}
              exampleSentence="안녕하세요! 오늘도 좋은 하루 되세요!"
            />
            <VillagerCard
              name="제리"
              imageUrl="/next.svg"
              isPopular={false}
              exampleSentence="고마워요! 정말 도움이 많이 됐어요."
            />
            <VillagerCard
              name="미키"
              imageUrl="/next.svg"
              isPopular={true}
              exampleSentence="다음에 또 만나요! 기대돼요!"
            />
            <VillagerCard
              name="미니"
              imageUrl="/next.svg"
              isPopular={false}
              exampleSentence="정말 즐거웠어요! 또 놀러 와요~"
            />
            <VillagerCard
              name="도날드"
              imageUrl="/next.svg"
              isPopular={true}
              exampleSentence="고마워요! 정말 고마워요!"
            />
          </div>
        </section>

        {/* 로딩/에러 상태 테스트 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            로딩/에러 상태 테스트
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  로딩 상태 예시
                </p>
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-red-700 dark:text-red-300 font-medium">
                  에러 상태 예시: API 호출 실패
                </p>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-700 dark:text-green-300 font-medium">
                  성공 상태 예시: 작업이 완료되었습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 테스트 로그 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            테스트 로그
          </h2>
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 max-h-64 overflow-y-auto">
            {testLog.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                버튼을 클릭하면 로그가 표시됩니다.
              </p>
            ) : (
              <div className="space-y-1">
                {testLog.map((log, index) => (
                  <p key={index} className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">
                    {log}
                  </p>
                ))}
              </div>
            )}
          </div>
          {testLog.length > 0 && (
            <button
              onClick={() => setTestLog([])}
              className="mt-4 px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 
                       rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              로그 초기화
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

