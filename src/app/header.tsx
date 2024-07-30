import { Button } from "@/components/ui/button";
import { OrganizationSwitcher, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import  Link  from"next/link";

export function Header(){
    return <div className="border-b py-4 bg-gray-50">
        <div className="items-center container mx-auto justify-between flex">
        <Link href="/" className="flex gap-2 items-center text-xl text-black"> 
        <img src="/logo.png" width="50" height="50" alt="Exam logo"/>
        Quản lý đề thi 
        </Link>
        <Button variant={"outline"}>
              <Link href="/dashboard/files">Tệp của bạn</Link>
        </Button>
        <div className="flex gap-2">
            <OrganizationSwitcher/>
        <UserButton/>
        <SignedOut>
        <SignInButton><Button>Đăng nhập</Button></SignInButton>
        </SignedOut>
        </div>
        </div>
    </div>
}