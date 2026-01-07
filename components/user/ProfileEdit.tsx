"use client";

import { useState, useRef } from "react";

type ProfileEditProps = {
  initialNickname: string;
  initialProfileImage: string | null;
  onSave: (nickname: string, profileImage: string | null) => void;
  onCancel: () => void;
};

export default function ProfileEdit({
  initialNickname,
  initialProfileImage,
  onSave,
  onCancel,
}: ProfileEditProps) {
  const [nickname, setNickname] = useState(initialNickname);
  const [profileImage, setProfileImage] = useState<string | null>(initialProfileImage);
  const [previewImage, setPreviewImage] = useState<string | null>(initialProfileImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 파일 검증
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }
      
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("이미지 크기는 5MB 이하여야 합니다.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setProfileImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }
    onSave(nickname.trim(), profileImage);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* 프로필 이미지 */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-sky-100 border-4 border-sky-200 flex-shrink-0">
          {previewImage ? (
            <img
              src={previewImage}
              alt="프로필 미리보기"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-sky-200 to-yellow-200">
              👤
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-colors cursor-pointer text-sm font-medium">
            이미지 선택
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {previewImage && (
            <button
              onClick={handleRemoveImage}
              className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors text-sm font-medium"
            >
              이미지 제거
            </button>
          )}
        </div>
      </div>

      {/* 닉네임 입력 */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          닉네임
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full px-4 py-2 border-2 border-sky-200 rounded-lg bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
          placeholder="닉네임을 입력하세요"
          maxLength={20}
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors font-medium shadow-md"
        >
          저장
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition-colors font-medium"
        >
          취소
        </button>
      </div>
    </div>
  );
}

