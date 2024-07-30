import Link from "next/link";

export function Footer() {
  return (
    <div className="h-40 bg-gray-100 mt-12 flex items-center">
      <div className="container mx-auto flex justify-between items-center">
        <div>Quản lý đề thi</div>

        <Link className="text-blue-900 hover:text-blue-500" href="/privacy">
          Chính sách bảo mật
        </Link>
        <Link
          className="text-blue-900 hover:text-blue-500"
          href="/terms-of-service"
        >
          Điều khoản dịch vụ
        </Link>
        <Link className="text-blue-900 hover:text-blue-500" href="/about">
          Về chúng tôi 
        </Link>
      </div>
    </div>
  );
}