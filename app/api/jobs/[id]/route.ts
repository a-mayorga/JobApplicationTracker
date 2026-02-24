import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // 🔒 opcional: validar que haya algo que actualizar
    if (!body || Object.keys(body).length === 0) {
      return new Response("No data provided", { status: 400 });
    }

    const job = await prisma.jobApplication.update({
      where: { id },
      data: body, // 👈 update parcial flexible
    });

    return Response.json(job);
  } catch (error) {
    console.error("PATCH ERROR:", error);
    return new Response("Failed to update job", { status: 500 });
  }
}