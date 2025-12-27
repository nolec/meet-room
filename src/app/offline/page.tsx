"use client";

import { EmptyState } from "@/components/ui";

export default function OfflinePage() {
  return (
    <EmptyState
      title="오프라인 상태"
      message="네트워크 연결이 원활하지 않습니다. 연결이 복구되면 자동으로 다시 시도됩니다."
      showBackButton={true}
      showHomeButton={true}
      homeButtonText="다시 시도"
      backButtonText="뒤로 가기"
      onHomeClick={() => window.location.reload()}
      className="max-w-md mx-auto"
    />
  );
}
