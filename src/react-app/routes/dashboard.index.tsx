// import { ChartAreaInteractive } from "@/components/chart-area-interactive";
// import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { createFileRoute } from "@tanstack/react-router";
// import data from "../../db/data.json";

export const Route = createFileRoute("/dashboard/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">{/* <ChartAreaInteractive /> */}</div>
      {/* <DataTable data={data} /> */}
    </>
  );
}
