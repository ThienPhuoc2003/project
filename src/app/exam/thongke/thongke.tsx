"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Doc, Id } from "@convex/_generated/dataModel";
import { useState } from "react";

type Data = [string, { createdAt: number; isFile: boolean }[]][];

export const ThongKe = ({ data }: { data: Data }) => {
  const [selectedYear, setSelected] = useState(data[0][0]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-6">Thống Kê {selectedYear}</h1>

        <div>
          {data.map(([year]) => (
            <Button
              key={"data-" + year}
              variant={year === selectedYear ? "default" : "ghost"}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>

      <HienThiDuLieu data={data.find(([year]) => selectedYear === year)!} />
    </div>
  );
};

export const HienThiDuLieu = ({ data }: { data: Data[number] }) => {
  const files = data[1].filter((data) => data.isFile);
  const favorites = data[1].filter((data) => !data.isFile);

  return (
    <div className="flex items-center *:flex-1 gap-2">
      <div className="border rounded-lg px-4 py-2">
        <h3>Số lượng file đã tải trong năm</h3>
        <span>{files.length}</span>
      </div>

      <div className="border rounded-lg px-4 py-2">
        <h3>Số lượng file yêu thích đã tải trong năm</h3>
        <span>{favorites.length}</span>
      </div>
    </div>
  );
};
