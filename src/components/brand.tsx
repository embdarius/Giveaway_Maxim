import Link from "next/link";
import { Flower2 } from "lucide-react";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="La MAXIM — pagina principală">
      <Flower2
        className="brand-flower"
        size={34}
        strokeWidth={1}
        aria-hidden="true"
      />
      <span className="brand-wordmark">
        <i>La</i> MAXIM
      </span>
    </Link>
  );
}
