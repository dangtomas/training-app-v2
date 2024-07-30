import User from "@/models/User";
import dbConnect from "@/db/dbConnect";
import { NextResponse } from "next/server";

dbConnect();

export async function POST(req: Request) {
    const { username, password } = await req.json();
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
        return Response.json(
            { error: "Invalid authentication." },
            { status: 400 },
        );
    }

    const token = user.createJWT();
    const response = NextResponse.json(
        { token, id: user._id },
        { status: 200 },
    );
    response.cookies.set("token", token);

    return response;
}
