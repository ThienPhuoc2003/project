import Layout from "./layout"; // Ensure this imports correctly from your file structure
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { ThongKe } from "./thongke";

import groupBy from "object.groupby";

// Define the StatsPage component
const StatsPage = async () => {
  const rawData = await fetchQuery(api.files.getAnalyticsData);
  
  const data = Object.entries(
    groupBy(rawData, (data) => new Date(data.createdAt).getFullYear())
  ).sort((a, b) => Number(a[0]) - Number(b[0]));

  return (
    <Layout>
      <div className="p-8">
        <ThongKe data={data} />
      </div>
    </Layout>
  );
};

// Export the StatsPage component
export default StatsPage;
