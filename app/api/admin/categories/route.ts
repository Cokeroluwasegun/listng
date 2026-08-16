import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { guardRequest, handleApiError } from "@/lib/api-guard";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  icon: z.string().max(20).optional().or(z.literal("")),
  description: z.string().max(300).optional().or(z.literal("")),
  parentId: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
});

export async function POST(request: NextRequest) {
  const guard = await guardRequest(request, { routeContext: "admin", csrf: true });
  if (!guard.ok) return guard.response;
  const { requestId } = guard.data;
  try {
    const parsed = categorySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const slug = data.slug || slugify(data.name);
    const parentId = data.parentId || null;

    if (parentId) {
      const parent = await db.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
      }
    }

    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
    }

    const category = await db.category.create({
      data: {
        name: data.name,
        slug,
        icon: data.icon || null,
        description: data.description || null,
        parentId,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err) {
    return handleApiError(requestId, err);
  }
}