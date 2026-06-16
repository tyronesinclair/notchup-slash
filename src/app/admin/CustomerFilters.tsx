"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

type Props = {
  search?: string;
  status?: string;
  act?: string;
  from?: string;
  to?: string;
};

export default function CustomerFilters({ search, status, act, from, to }: Props) {
  const router = useRouter();

  const update = useCallback(
    (key: string, value: string) => {
      const current = { search, status, act, from, to };
      const next = new URLSearchParams();
      for (const [k, v] of Object.entries(current)) {
        if (v) next.set(k, v);
      }
      if (value) next.set(key, value); else next.delete(key);
      next.delete("page"); // reset to page 1 on filter change
      // NOTE: next/navigation router auto-prepends basePath ("/slash"), so pass "/admin"
      // here — passing "/slash/admin" would produce "/slash/slash/admin" → 404.
      router.push(`/admin?${next.toString()}`);
    },
    [router, search, status, act, from, to]
  );

  const hasFilters = !!(search || status || act || from || to);

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50">
      <input
        type="text"
        placeholder="Search name or email…"
        defaultValue={search ?? ""}
        onChange={(e) => update("search", e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 w-48"
      />
      <select
        defaultValue={status ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
      >
        <option value="">All payments</option>
        <option value="paid">Paid</option>
        <option value="scheduled">Scheduled</option>
        <option value="failed">Failed</option>
        <option value="pending">Pending</option>
      </select>
      <select
        defaultValue={act ?? ""}
        onChange={(e) => update("act", e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
      >
        <option value="">All activation</option>
        <option value="not_started">Not started</option>
        <option value="in_progress">In progress</option>
        <option value="activated">Activated</option>
        <option value="failed">Failed</option>
      </select>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">Joined</span>
        <input
          type="date"
          defaultValue={from ?? ""}
          onChange={(e) => update("from", e.target.value)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <span className="text-xs text-gray-400">–</span>
        <input
          type="date"
          defaultValue={to ?? ""}
          onChange={(e) => update("to", e.target.value)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>
      {hasFilters && (
        <a href="/slash/admin" className="text-xs text-violet-600 hover:underline font-semibold">
          Clear filters
        </a>
      )}
    </div>
  );
}
