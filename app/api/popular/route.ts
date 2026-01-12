import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const DEFAULT_DAYS = 30;
const DEFAULT_LIMIT = 20;
const MAX_DAYS = 365;
const MAX_LIMIT = 50;
const CACHE_CONTROL = "public, max-age=300, s-maxage=300, stale-while-revalidate=3600";

export const revalidate = 300;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const parseIntParam = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const daysBack = clamp(parseIntParam(searchParams.get("days"), DEFAULT_DAYS), 1, MAX_DAYS);
  const limitCount = clamp(parseIntParam(searchParams.get("limit"), DEFAULT_LIMIT), 1, MAX_LIMIT);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_popular_proposals", {
    days_back: daysBack,
    limit_count: limitCount
  });

  if (error) {
    console.error("Error fetching popular proposals:", error);
    const response = NextResponse.json({ data: [] });
    response.headers.set("Cache-Control", CACHE_CONTROL);
    return response;
  }

  const response = NextResponse.json({ data: data ?? [] });
  response.headers.set("Cache-Control", CACHE_CONTROL);
  return response;
}
