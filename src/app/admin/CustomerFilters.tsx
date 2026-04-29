"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export default function CustomerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value); else next.delete(key);
      next.delete("page"); // reset to page 1 on filter change
      router.push(`${pathname}?${next.toString()}`);
    },
    [router, pathname, params]
  );

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50">
      <input
        type="text"
        placeholder="Search name or email…"
        defaultValue={params.get("search") ?? ""}
        onChange={(e) => update("search", e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 w-48"
      />
      <select
        defaultValue={params.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
      >
        <option value="">All statuses</option>
        <option value="paid">Paid</option>
        <option value="scheduled">Scheduled</option>
        <option value="failed">Failed</option>
        <option value="pending">Pending</option>
      </select>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">Joined</span>
        <input
          type="date"
          defaultValue={params.get("from") ?? ""}
          onChange={(e) => update("from", e.target.value)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <span className="text-xs text-gray-400">–</span>
        <input
          type="date"
          defaultValue={params.get("to") ?? ""}
          onChange={(e) => update("to", e.target.value)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>
      {(params.get("search") || params.get("status") || params.get("from") || params.get("to")) && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-violet-600 hover:underline font-semibold"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
