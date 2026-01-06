"use client";

import { useState } from "react";
import MailCard from "@/components/mail/MailCard";
import MailCardReadonly from "@/components/mail/MailCardReadonly";
import VillagerCard from "@/components/villagers/VillagerCard";

export default function TestPage() {
  const [mailCardText, setMailCardText] = useState("안녕하세요! 오늘 날씨가 정말 좋네요.");
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [selectedVillagerId, setSelectedVillagerId] = useState(1);

  const addLog = (message: string) => {
    setTestLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const handleSendNow = () => {
    addLog("MailCard: 즉시 전송 버튼 클릭됨");
  };

  const handleScheduleSend = (scheduledDate: Date) => {
    addLog(`MailCard: 예약 전송 버튼 클릭됨 - 예약 시간: ${scheduledDate.toLocaleString()}`);
  };

  const handleVillagerCardClick = (id: number) => {
    setSelectedVillagerId(id);
    addLog(`VillagerCard: 주민 ID ${id} 클릭`);
  };

  const dummyVillagers = [
    {
      id: 1,
      name: "톰",
      imageUrl: "/next.svg",
      isPopular: true,
      exampleSentence: "안녕하세요! 오늘도 좋은 하루 되세요~",
    },
    {
      id: 2,
      name: "이사벨",
      imageUrl: "/next.svg",
      isPopular: false,
      exampleSentence: "날씨가 정말 좋네요! 산책하기 좋은 날이에요~",
    },
    {
      id: 3,
      name: "마샬",
      imageUrl: "/next.svg",
      isPopular: true,
      exampleSentence: "오늘 뭐 하실 거예요? 함께 놀아요~",
    },
    {
      id: 4,
      name: "레이몬드",
      imageUrl: "/next.svg",
      isPopular: false,
      exampleSentence: "편지 받아서 정말 기뻐요! 고마워요~",
    },
    {
      id: 5,
      name: "쥬디",
      imageUrl: "/next.svg",
      isPopular: true,
      exampleSentence: "오늘도 힘내세요! 응원할게요~",
    },
  ];

  const dummyEmails = [
    {
      villagerStickerUrl: "/next.svg",
      villagerName: "톰",
      speechBubbleText: "안녕하세요! 오늘도 좋은 하루 되세요~",
      textSafeAreaContent: "안녕 인사",
      status: "sent" as const,
      sentDate: new Date().toISOString(),
    },
    {
      villagerStickerUrl: "/next.svg",
      villagerName: "이사벨",
      speechBubbleText: "날씨가 정말 좋네요! 산책하기 좋은 날이에요~",
      textSafeAreaContent: "날씨 이야기",
      status: "reserved" as const,
      scheduledDate: new Date(Date.now() + 3600000).toISOString(),
    },
    {
      villagerStickerUrl: "/next.svg",
      villagerName: "마샬",
      speechBubbleText: "오늘 뭐 하실 거예요? 함께 놀아요~",
      textSafeAreaContent: "함께 놀기",
      status: "sent" as const,
      sentDate: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-yellow-50 to-yellow-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-yellow-100">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-b from-sky-400 via-sky-300 to-yellow-300 bg-clip-text text-transparent">
            UI/UX 테스트 페이지
          </h1>
          <p className="text-sky-600 text-lg">
            MailCard, MailCardReadonly, VillagerCard 컴포넌트 테스트
          </p>
        </div>

        {/* MailCard 테스트 섹션 */}
        <section className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-yellow-100">
          <h2 className="text-2xl font-bold text-sky-600 mb-6">
            1. MailCard (이메일 작성/미리보기/전송)
          </h2>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* 텍스트 입력 영역 */}
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2 text-sky-600">
                원본 텍스트 입력 (debounce + preview 테스트)
              </label>
              <textarea
                value={mailCardText}
                onChange={(e) => setMailCardText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl bg-white text-zinc-800 
                         focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
                placeholder="편지 내용을 입력하세요..."
                rows={6}
              />
              <p className="text-sm text-sky-600 mt-2">
                (입력 시 0.5초 후 미리보기 자동 업데이트)
              </p>
              <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  테스트 기능:
                </p>
                <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                  <li>• textarea 입력 → debounce → preview API 호출</li>
                  <li>• 즉시 전송 버튼 → POST /emails 호출</li>
                  <li>• 예약 전송 버튼 → POST /emails (scheduledAt 포함)</li>
                  <li>• 로딩/에러 상태 시각적 표시</li>
                </ul>
              </div>
            </div>
            {/* MailCard 표시 영역 */}
            <div className="flex-1 flex justify-center items-start">
              <MailCard
                villagerId={selectedVillagerId}
                villagerStickerUrl="/next.svg"
                villagerName="테스트 주민"
                speechBubbleText="편지 미리보기"
                textSafeAreaContent="테스트 제목"
                originalText={mailCardText}
                onSendNow={handleSendNow}
                onScheduleSend={handleScheduleSend}
              />
            </div>
          </div>
        </section>

        {/* MailCardReadonly 테스트 섹션 */}
        <section className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-yellow-100">
          <h2 className="text-2xl font-bold text-sky-600 mb-6">
            2. MailCardReadonly (보낸/예약 이메일)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {dummyEmails.map((email, index) => (
              <MailCardReadonly
                key={index}
                villagerStickerUrl={email.villagerStickerUrl}
                villagerName={email.villagerName}
                speechBubbleText={email.speechBubbleText}
                textSafeAreaContent={email.textSafeAreaContent}
                status={email.status}
                scheduledDate={email.scheduledDate}
                sentDate={email.sentDate}
              />
            ))}
          </div>
          <p className="text-sm text-sky-600 mt-4">
            반응형 Grid: 1열 (모바일) → 2열 (태블릿) → 3열 (데스크톱) → 4열 (큰 화면)
          </p>
        </section>

        {/* VillagerCard 테스트 섹션 */}
        <section className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-yellow-100">
          <h2 className="text-2xl font-bold text-sky-600 mb-6">
            3. VillagerCard (주민 카드)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {dummyVillagers.map((villager) => (
              <div
                key={villager.id}
                onClick={() => handleVillagerCardClick(villager.id)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <VillagerCard
                  name={villager.name}
                  imageUrl={villager.imageUrl}
                  isPopular={villager.isPopular}
                  exampleSentence={villager.exampleSentence}
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-sky-600 mt-4">
            반응형 Grid: 1열 → 2열 → 3열 → 4열 → 5열 (hover 시 말풍선 표시)
          </p>
        </section>

        {/* 테스트 로그 */}
        <section className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-yellow-100">
          <h2 className="text-2xl font-bold text-sky-600 mb-6">
            4. 테스트 로그
          </h2>
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 max-h-60 overflow-y-auto">
            {testLogs.length === 0 ? (
              <p className="text-sky-600 dark:text-sky-400">아직 로그가 없습니다.</p>
            ) : (
              <ul className="space-y-1">
                {testLogs.map((log, index) => (
                  <li
                    key={index}
                    className="text-sm text-zinc-700 dark:text-zinc-200 font-mono"
                  >
                    {log}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
