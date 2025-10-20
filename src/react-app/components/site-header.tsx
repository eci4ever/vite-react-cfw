import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useLocation } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";

export function SiteHeader() {
  const location = useLocation();
  const { data: session } = authClient.useSession();
  const segments = location.pathname.split("/").filter(Boolean);

  // Build breadcrumb parts with cumulative hrefs (starting from root)
  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = seg
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
    return { href, label };
  });

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.length > 0 ? (
              crumbs.map((c, i) => (
                <React.Fragment key={c.href}>
                  <BreadcrumbItem>
                    {i < crumbs.length - 1 ? (
                      <BreadcrumbLink asChild>
                        <Link to={c.href}>{c.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{c.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {i < crumbs.length - 1 ? <BreadcrumbSeparator /> : null}
                </React.Fragment>
              ))
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>Home</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          {session?.user?.role ? (
            <Badge variant="secondary" className="uppercase tracking-wide">
              {session.user.role}
            </Badge>
          ) : null}
        </div>
      </div>
    </header>
  );
}
