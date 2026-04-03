import React, { Suspense } from "react";
import SuccessPageClient from "@/components/pages/SuccessPageClient";

const SuccessPage = () => (
  <Suspense fallback={<div className="p-10 text-center">Loading success page...</div>}>
    <SuccessPageClient />
  </Suspense>
);

export default SuccessPage;