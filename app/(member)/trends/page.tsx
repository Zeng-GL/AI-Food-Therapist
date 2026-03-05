"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { useLanguageStore } from "@/store/use-language-store";
import { useSession } from "next-auth/react";
import { getTongueData, TongueType } from "@/lib/tongue-data";
import { getTongueImage } from "@/lib/image-mapping";
import { format } from "date-fns";
import { zhTW, enUS } from "date-fns/locale";

interface DisplayItem {
  id: string;
  image_url: string;
  result_code: TongueType;
  result_name: string;
  result_desc: string;
  result_advice?: string;
  created_at: string;
}

interface GroupedHistory {
  [key: string]: DisplayItem[];
}

export default function TrendsPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isZh = language === "zh";

  const pickLang = (field: any) => isZh ? (field?.zh ?? "") : (field?.en ?? "");

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();

      if (data.items) {
        const mapped = data.items.map((item: any) => ({
          id: item.historyId,
          // image_url: item.imageUrl || getTongueImage(item.result.id, getTongueData(item.result.id).name),
          image_url: getTongueImage(item.result.id, getTongueData(item.result.id).name),
          result_code: item.result.id,
          result_name: pickLang(item.result.name),
          result_desc: pickLang(item.result.desc),
          result_advice: pickLang(item.result.advice),
          created_at: item.createdAt,
        }));
        setHistory(mapped);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchHistory();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  const groupByMonth = (items: DisplayItem[]): GroupedHistory => {
    const grouped: GroupedHistory = {};
    items.forEach((item) => {
      const date = new Date(item.created_at);
      const monthKey = format(date, "yyyy-MM");
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(item);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>{isZh ? "載入中..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  const groupedHistory = groupByMonth(history);
  const monthKeys = Object.keys(groupedHistory).sort().reverse();

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="w-full p-4 flex items-center justify-center bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold">{isZh ? "健康日誌" : "Health Journal"}</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {history.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg mb-2">{isZh ? "尚無檢測記錄" : "No diagnosis records yet"}</p>
            <button
              onClick={() => router.push("/diagnosis")}
              className="mt-4 px-6 py-3 bg-brand text-white rounded-full font-semibold"
            >
              {isZh ? "開始檢測" : "Start Diagnosis"}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {monthKeys.map((monthKey) => {
              const items = groupedHistory[monthKey].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              const monthLabel = format(new Date(monthKey + "-01"), isZh ? "yyyy年MM月" : "MMMM yyyy", {
                locale: isZh ? zhTW : enUS,
              });

              return (
                <div key={monthKey} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-800">{monthLabel}</h2>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <div className="grid gap-4">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => router.push(`/trends/${item.id}`)}
                        className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-4 text-left border border-gray-100"
                      >
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.result_name}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="mb-1">
                            <p className="text-xs text-brand font-medium">
                              {format(new Date(item.created_at), "MMM dd · HH:mm", { locale: isZh ? zhTW : enUS })}
                            </p>
                            <h3 className="font-bold text-gray-900 truncate">{item.result_name}</h3>
                          </div>
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {item.result_desc}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}