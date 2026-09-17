"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { SettlementPDF } from "./SettlementPDF";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

export default function PDFWrapper({ data, people }: { data: any; people: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="brutal-btn bg-black text-white px-4 py-4 w-full flex justify-center items-center gap-2 shadow-[6px_6px_0px_var(--color-neon-cyan)] opacity-50 cursor-not-allowed">
        <Download size={20} strokeWidth={3} /> LOADING REPORT...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<SettlementPDF data={data} people={people} />}
      fileName={`${data.trip.name.replace(/\s+/g, "_")}_Settlement.pdf`}
      className="brutal-btn bg-black text-white px-4 py-4 w-full flex justify-center items-center gap-2 shadow-[6px_6px_0px_var(--color-neon-cyan)] hover:text-neon-cyan transition-colors"
    >
      <Download size={20} strokeWidth={3} /> DOWNLOAD REPORT (PDF)
    </PDFDownloadLink>
  );
}
