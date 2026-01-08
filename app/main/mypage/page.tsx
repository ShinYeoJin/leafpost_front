"use client";

import { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import MailCardReadonly from "@/components/mail/MailCardReadonly";
import ProfileEdit from "@/components/user/ProfileEdit";
import { useEmails } from "@/hooks/useEmails";
import type { Email, EmailStatus } from "@/lib/api/emails";
import { getVillagers, type Villager } from "@/lib/api/villagers";
import Image from "next/image";

export default function MyPage() {
  const [filter, setFilter] = useState<"all" | "reserved" | "sent">("all");
  const { emails, isLoading, error, fetchEmails } = useEmails();
  const [userInfo, setUserInfo] = useState<{
    email: string;
    nickname: string;
    profileImage: string | null;
  } | null>(null);
  const [villagers, setVillagers] = useState<Villager[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const loadUserInfo = () => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("userEmail") || "";
      const nickname = localStorage.getItem("userNickname") || email.split("@")[0] || "사용자";
      const profileImage = localStorage.getItem("userProfileImage");
      
      setUserInfo({
        email,
        nickname,
        profileImage,
      });
    }
  };

  useEffect(() => {
    const loadData = () => {
      loadUserInfo();
    };

    loadData();

    // 페이지 포커스 시 최신 사용자 정보 로딩
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    const handleFocus = () => {
      loadData();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleSaveProfile = (nickname: string, profileImage: string | null) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userNickname", nickname);
      if (profileImage) {
        localStorage.setItem("userProfileImage", profileImage);
      } else {
        localStorage.removeItem("userProfileImage");
      }
      loadUserInfo();
      setIsEditingProfile(false);
    }
  };

  useEffect(() => {
    // 주민 목록 가져오기 (이미지 URL을 위해)
    const loadVillagers = async () => {
      try {
        const response = await getVillagers();
        if (response.isValid && response.villagers) {
          setVillagers(response.villagers);
        }
      } catch (err) {
        console.error("주민 목록 로드 실패:", err);
      }
    };
    
    loadVillagers();

    // 페이지 포커스 시 최신 데이터 로딩
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadVillagers();
      }
    };

    const handleFocus = () => {
      loadVillagers();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    // 필터에 따라 이메일 가져오기
    // 예약 시간이 지난 이메일은 자동으로 'sent' 상태로 업데이트되므로
    // 'reserved' 필터는 'draft' 상태만 가져오고, 'sent' 필터는 'sent' 상태를 가져옵니다
    const loadEmails = () => {
      const status: EmailStatus | undefined =
        filter === "all" ? undefined : filter === "reserved" ? "draft" : "sent";
      fetchEmails(status).catch(() => {
        // 에러는 useEmails hook에서 처리됨
      });
    };

    loadEmails();

    // 페이지 포커스 시 최신 데이터 로딩 (다른 기기에서 수정한 내용 반영)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadEmails();
      }
    };

    // 페이지 포커스 이벤트 리스너 추가
    const handleFocus = () => {
      loadEmails();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [filter, fetchEmails]);

  const mapEmailToCardProps = (email: Email) => {
    // 예약 시간이 지났는지 확인 (서버에서 이미 업데이트되었을 수 있지만, 클라이언트에서도 확인)
    let status: "reserved" | "sent" = email.status === "sent" ? "sent" : "reserved";
    if (email.status === "draft" && email.scheduledAt) {
      const scheduledTime = new Date(email.scheduledAt);
      const now = new Date();
      if (scheduledTime <= now) {
        status = "sent";
      }
    }
    
    // 유저가 작성한 원본 내용을 표시 (previewContent가 아닌 content 사용)
    const speechBubbleText = email.content || email.previewContent || "";

    // 주민 이미지 찾기
    const villager = villagers.find((v) => v.id === email.villagerId);
    const villagerStickerUrl = villager?.iconUrl || villager?.imageUrl || "";

    return {
      villagerStickerUrl,
      villagerName: email.villagerName,
      speechBubbleText,
      textSafeAreaContent: email.subject, // 유저가 작성한 제목
      status,
      scheduledDate: status === "reserved" && email.scheduledAt ? email.scheduledAt : undefined,
      sentDate: email.sentAt || (status === "sent" && email.scheduledAt ? email.scheduledAt : undefined),
      backgroundUrl: undefined, // TODO: 배경 이미지 추가
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-yellow-50 to-white">
      <Header />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* 사용자 프로필 정보 */}
          {userInfo && (
            <div className="mb-8 p-6 bg-white rounded-xl shadow-md border-2 border-sky-100">
              {!isEditingProfile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-sky-100 border-4 border-sky-200 flex-shrink-0">
                      {userInfo.profileImage ? (
                        <Image
                          src={userInfo.profileImage}
                          alt={userInfo.nickname}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-sky-200 to-yellow-200">
                          👤
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-900 mb-1">
                        {userInfo.nickname}
                      </h2>
                      <p className="text-sm text-zinc-600">
                        {userInfo.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-colors font-medium text-sm shadow-md"
                  >
                    프로필 편집
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4 pb-4 border-b border-sky-200">
                    <h3 className="text-lg font-bold text-zinc-900 mb-4">프로필 편집</h3>
                  </div>
                  <ProfileEdit
                    initialNickname={userInfo.nickname}
                    initialProfileImage={userInfo.profileImage}
                    onSave={handleSaveProfile}
                    onCancel={() => setIsEditingProfile(false)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Header with Filter Buttons */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4 sm:mb-6">
              내 이메일
            </h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm
                ${
                  filter === "all"
                    ? "bg-sky-400 text-white shadow-md"
                    : "bg-white text-zinc-700 hover:bg-sky-50 border-2 border-sky-200"
                }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter("reserved")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm
                ${
                  filter === "reserved"
                    ? "bg-yellow-400 text-white shadow-md"
                    : "bg-white text-zinc-700 hover:bg-yellow-50 border-2 border-yellow-200"
                }`}
            >
              예약됨
            </button>
            <button
              onClick={() => setFilter("sent")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm
                ${
                  filter === "sent"
                    ? "bg-green-400 text-white shadow-md"
                    : "bg-white text-zinc-700 hover:bg-green-50 border-2 border-green-200"
                }`}
            >
              전송됨
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-sky-200 
                              border-t-sky-400 rounded-full animate-spin" />
              <p className="text-zinc-600 font-medium">
                이메일을 불러오는 중...
              </p>
            </div>
          </div>
        )}

        {/* Error State - Toast 형태로 표시 */}
        {error && !isLoading && (
          <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-red-400 text-white px-4 py-3 rounded-lg shadow-xl max-w-md border-2 border-red-300">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-sm font-medium">
                  이메일을 불러오는 중 오류가 발생했습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && emails.length === 0 && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center bg-white p-8 rounded-xl shadow-md border-2 border-sky-100">
              <p className="text-zinc-600 text-lg font-medium mb-2">
                이메일이 없습니다.
              </p>
              <p className="text-sm text-zinc-500">
                {filter === "all"
                  ? "아직 작성한 이메일이 없습니다."
                  : filter === "reserved"
                  ? "예약된 이메일이 없습니다."
                  : "전송된 이메일이 없습니다."}
              </p>
            </div>
          </div>
        )}

        {/* Email Grid */}
        {!isLoading && !error && emails.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {emails
              .map((email) => {
                const props = mapEmailToCardProps(email);
                return { email, props };
              })
              .filter(({ props }) => {
                // 필터에 따라 표시할 이메일 필터링
                if (filter === "all") return true;
                if (filter === "reserved") return props.status === "reserved";
                if (filter === "sent") return props.status === "sent";
                return true;
              })
              .map(({ email, props }) => (
                <MailCardReadonly key={email.id} {...props} />
              ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
