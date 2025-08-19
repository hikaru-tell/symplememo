import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

//メモ一覧取得API
export async function GET(request: Request) {
    const todos = await prisma.memo.findMany({
        orderBy: {
            createdAt: "asc"
        }
    })
    return Response.json({ data: todos });
    };

//メモ作成API
export async function POST(request: Request) {
    const formData = await request.formData();
    const title = formData.get("title") as string
    const memo = formData.get("content") as string

    const memos = await prisma.memo.create({
        data: {
            title,
            memo
        },
    })
    return Response.json({});
}

//編集API（タグ付け）

//削除API