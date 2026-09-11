import type { ReactNode } from "react";
import { Nav } from "@/components/ui/nav";
import { Sidebar } from "@/components/ui/sidebar";

// The shell used by the vertical slice: Nav across the top, an optional Sidebar, and the
// slice's own content (form + list) in the main column.
export function DashboardShell({ project, children }: { project: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav project={project} />
      <div className="flex flex-1">
        <Sidebar>
          <span className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">
            Workspace
          </span>
        </Sidebar>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
