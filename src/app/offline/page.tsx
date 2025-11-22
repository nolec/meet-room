"use client";

import { Alert, Button } from "@/components/ui";

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md p-6 text-center">
      <Alert variant="warning" title="오프라인 상태">
        네트워크 연결이 원활하지 않습니다. 연결이 복구되면 자동으로 다시
        시도됩니다.
      </Alert>
      <div className="mt-6">
        <Button variant="primary" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </div>
    </div>
  );
}
