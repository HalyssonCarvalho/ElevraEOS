import { demoWeeklyReports } from "@/lib/data/mock-data";
import { GlobalReportsView } from "@/components/reports/GlobalReportsView";

export default function GlobalReportsPage() {
  return <GlobalReportsView reports={demoWeeklyReports} />;
}
