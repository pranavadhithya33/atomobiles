import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { generateAdminToken } from "@/lib/adminAuth";

export const metadata = {
  title: "Store Admin | Command Center",
  description: "Enterprise Admin Dashboard",
};

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token')?.value;

  try {
    const expectedToken = generateAdminToken();
    if (!adminToken || adminToken !== expectedToken) {
      redirect("/admin/login");
    }
  } catch (err) {
    redirect("/admin/login");
  }

  // 2. Render Layout
  return (
    <>
      {children}
    </>
  );
}
