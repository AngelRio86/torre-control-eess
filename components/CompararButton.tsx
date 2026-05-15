import Link from "next/link";
import { GitCompareArrows } from "lucide-react";

export function CompararButton() {
  return (
    <Link href="/comparar" className="comparar-btn">
      <GitCompareArrows size={15} strokeWidth={2} />
      <span>Comparar estaciones</span>
    </Link>
  );
}
