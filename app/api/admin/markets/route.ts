import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardRequest, handleApiError } from "@/lib/api-guard";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

const marketSchema = z.object({
  name: z.string().min(2).max(80),
  stateName: z.string().min(2),
  cityName: z.string().min(2),
  description: z.string().max(400).optional().or(z.literal("")),
  specialty: z.string().max(120).optional().or(z.literal("")),
  heroImage: z.string().url().optional().or(z.literal("")),
  coverImage: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const guard = await guardRequest(request, { routeContext: "admin", csrf: true });
  if (!guard.ok) return guard.response;
  const { requestId } = guard.data;
  try {
    const parsed = marketSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const slug = slugify(data.name);

    const market = await db.$transaction(async (tx) => {
      const state = await tx.state.upsert({
        where: { name: data.stateName },
        update: {},
        create: { name: data.stateName, slug: slugify(data.stateName) },
      });

      const city = await tx.city.upsert({
        where: { slug_stateId: { slug: slugify(data.cityName), stateId: state.id } },
        update: {},
        create: { name: data.cityName, slug: slugify(data.cityName), stateId: state.id },
      });

      const existing = await tx.market.findUnique({
        where: { slug_cityId: { slug, cityId: city.id } },
      });
      if (existing) {
        throw new Error("A market with this name already exists in that city");
      }

      return tx.market.create({
        data: {
          name: data.name,
          slug,
          description: data.description || null,
          specialty: data.specialty || null,
          heroImage: data.heroImage || null,
          coverImage: data.coverImage || null,
          cityId: city.id,
        },
      });
    });

    return NextResponse.json({ success: true, market }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("already exists")) {
      return NextResponse.json({ error: (err as Error).message }, { status: 409 });
    }
    return handleApiError(requestId, err);
  }
}