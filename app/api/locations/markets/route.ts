import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const stateSlug = searchParams.get("stateSlug");

  if (!stateSlug) {
    return NextResponse.json({ error: "stateSlug parameter is required" }, { status: 400 });
  }

  try {
    const markets = await db.market.findMany({
      where: {
        city: {
          state: {
            slug: stateSlug,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        cityId: true,
        city: {
          select: { name: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formattedMarkets = markets.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      cityId: m.cityId,
      cityName: m.city.name,
    }));

    return NextResponse.json({ markets: formattedMarkets }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching markets", { err: String(error) });
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}
