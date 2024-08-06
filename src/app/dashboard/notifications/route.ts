import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

import { EmailTemplate } from "./email-template";
import { Resend } from "resend";
import { auth, currentUser } from "@clerk/nextjs/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = async (req: Request) => {
  const body = (await req.json()) as {
    orgId: string;
    userId: string;
    message: string;
  };

  const user = await currentUser();
  if (!user?.id) {
    return NextResponse.json(
      { error: { message: "Vui lòng đăng nhập trước!" } },
      { status: 401 }
    );
  }

  const usersInOrg = await clerkClient.users.getUserList({
    organizationId: ["+" + body.orgId],
  });

  if (usersInOrg.data.length === 0) {
    return NextResponse.json(
      { error: { message: "Tổ chức không tồn tại!" } },
      { status: 400 }
    );
  }

  const emailList = usersInOrg.data
    .map((user) => user.primaryEmailAddress?.emailAddress)
    .filter(
      (email) => email && email !== user.primaryEmailAddress?.emailAddress
    ) as string[];

  const username = user.firstName!;

  try {
    const { data, error } = await resend.emails.send({
      from: `${username} <no-reply@shareexam.asakuri.tech>`,
      to: emailList,
      subject: body.message,
      react: EmailTemplate({ message: body.message }),
    });

    if (error) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Notification sent successfully",
      data,
    });
  } catch (error) {
    const err = new Error(error as string);
    return NextResponse.json({ error: { message: err } }, { status: 500 });
  }
};
