import Layout from "../../Layout";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useGetUsersQuery } from "../../redux/queries/userApi";
import {
  Search,
  Users,
  X,
  Crown,
  Shield,
  CheckCircle2,
  Calendar,
  Mail,
  ArrowUpDown,
  ChevronRight,
  Copy,
} from "lucide-react";
import Badge from "../../components/Badge";
import { Separator } from "../../components/ui/separator";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";
import Paginate from "@/components/Paginate";
import { toast } from "react-toastify";
import { formatSubscriptionDate, isSubscriptionActive } from "../../lib/subscription";

type SortKey = "newest" | "oldest" | "name" | "email";
// type FilterKey = "all" | "purchased" | "verified" | "admin";

function Customers() {
  const language = useSelector((state: any) => state.language.lang);

  const labels: any = {
    en: {
      users: "Users",
      totalUsers: "users",
      purchasedUsers: "subscribed",
      searchPlaceholder: "Search users by email or name",
      name: "Name",
      email: "Email",
      registeredIn: "Registered",
      noUsersFound: "No users found.",
      purchased: "Subscribed",
      all: "All",
      verified: "Verified",
      admin: "Admin",
      premium: "Subscribed",
      expiresAt: "Expires",
      newest: "Newest",
      oldest: "Oldest",
      sortName: "Name",
      sortEmail: "Email",
      results: "Results",
      open: "Open",
      quickFilters: "Quick filters",
      sort: "Sort",
      copyEmails: "Copy emails",
      exportCSV: "Export CSV",
      copied: "Emails copied!",
      nothingToCopy: "No emails to copy.",
      tip: "Tip: uses current page + filters + search.",
    },
    ar: {
      users: "المستخدمون",
      totalUsers: "مستخدمين",
      purchasedUsers: "مشترك",
      searchPlaceholder: "ابحث بالاسم أو البريد الإلكتروني",
      name: "الاسم",
      email: "البريد الإلكتروني",
      registeredIn: "تاريخ التسجيل",
      noUsersFound: "لم يتم العثور على مستخدمين.",
      purchased: "مشترك",
      all: "الكل",
      verified: "موثّق",
      admin: "أدمن",
      premium: "مشترك",
      expiresAt: "ينتهي في",
      newest: "الأحدث",
      oldest: "الأقدم",
      sortName: "الاسم",
      sortEmail: "البريد",
      results: "النتائج",
      open: "عرض",
      quickFilters: "فلترة سريعة",
      sort: "ترتيب",
      copyEmails: "نسخ الإيميلات",
      exportCSV: "تصدير CSV",
      copied: "تم نسخ الإيميلات!",
      nothingToCopy: "لا يوجد إيميلات للنسخ.",
      tip: "ملاحظة: ينسخ إيميلات الصفحة الحالية بعد الفلاتر والبحث.",
    },
  };

  const t = labels[language];
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const { data, isLoading } = useGetUsersQuery<any>({
    pageNumber: page,
    keyword: searchQuery,
  });

  const users = data?.users || [];
  const pages = data?.pages || 1;
  const totalUsers = data?.total || 0;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, , sortKey]);

  const processedUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...users];

    if (q) {
      list = list.filter((u: any) => {
        const name = (u?.name || u?.username || "").toLowerCase();
        const email = (u?.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }

    const byStr = (a: any, b: any, key: "name" | "email") =>
      String(a?.[key] || "").localeCompare(String(b?.[key] || ""), undefined, {
        sensitivity: "base",
      });

    list.sort((a: any, b: any) => {
      if (sortKey === "newest")
        return new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime();
      if (sortKey === "oldest")
        return new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime();
      if (sortKey === "name") return byStr(a, b, "name");
      if (sortKey === "email") return byStr(a, b, "email");
      return 0;
    });

    return list;
  }, [users, searchQuery, sortKey]);

  const clearSearch = () => setSearchQuery("");

  const formatDate = (d: any) =>
    new Date(d).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const uniqueEmails = useMemo(() => {
    const emails = processedUsers.map((u: any) => String(u?.email || "").trim()).filter(Boolean);
    return Array.from(new Set(emails));
  }, [processedUsers]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t.copied);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        toast.success(t.copied);
      } catch {
        toast.error("Copy failed");
      }
    }
  };

  const handleCopyAllEmails = () => {
    if (!uniqueEmails.length) return toast.error(t.nothingToCopy);
    copyToClipboard(uniqueEmails.join(", "));
  };

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div
          className={`lg:px-4 mb-10 lg:w-4xl w-full min-h-screen lg:min-h-auto flex justify-between py-3 mt-[70px] lg:mt-[50px] px-2 ${
            language === "ar" ? "text-right" : ""
          }`}>
          <div className="w-full">
            {/* Header */}
            <div
              className={`flex justify-between items-start gap-3 flex-wrap ${
                language === "ar" ? "flex-row-reverse" : ""
              }`}>
              <div className="w-full sm:w-auto flex gap-5 flex-col sm:flex-row">
                <h1
                  dir={language === "ar" ? "rtl" : "ltr"}
                  className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-4 items-center flex-wrap">
                  {t.users}:
                  <Badge icon={false} className="p-1">
                    <Users strokeWidth={1} className="size-5" />
                    <p className="text-lg lg:text-lg">{totalUsers || 0}</p>
                  </Badge>
                </h1>

                <button
                  type="button"
                  onClick={handleCopyAllEmails}
                  className="h-10 inline-flex items-center justify-center gap-2 rounded-lg px-4 text-xs sm:text-sm font-bold border bg-black text-white border-black hover:bg-black/90 transition w-full sm:w-auto">
                  <Copy className="size-4" />
                  {t.copyEmails}
                </button>
              </div>

              {/* Desktop pills */}
            </div>

            <Separator className="my-4 bg-black/20" />

            {/* Search + desktop sort */}
            <div className="mt-2 mb-3 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3 items-center">
                {/* Search */}
                <div className="relative w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
                  />
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      aria-label="Clear search">
                      <X className="size-5" />
                    </button>
                  )}
                </div>

                {/* Sort (desktop) */}
                <div className="w-full hidden sm:block">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <ArrowUpDown className="h-5 w-5" />
                    </span>
                    <select
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value as SortKey)}
                      className="w-full cursor-pointer border bg-white border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2">
                      <option value="newest">{t.newest}</option>
                      <option value="oldest">{t.oldest}</option>
                      <option value="name">{t.sortName}</option>
                      <option value="email">{t.sortEmail}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Desktop table */}
              <div className="rounded-lg border p-3 sm:p-5 bg-white mt-4 hidden sm:block">
                <table className="w-full rounded-lg text-xs lg:text-sm border-gray-200 text-left text-gray-700">
                  <thead className="bg-white text-gray-900/50 font-semibold">
                    <tr>
                      <th className="pb-2 border-b">{t.name}</th>
                      <th className="pb-2 border-b hidden md:table-cell">{t.email}</th>
                      <th className="pb-2 border-b">{t.purchased}</th>
                      <th className="pb-2 border-b">{t.registeredIn}</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {processedUsers.length > 0 ? (
                      processedUsers.map((user: any) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-100 transition-all duration-300 font-bold cursor-pointer"
                          onClick={() => navigate(`/userlist/${user._id}`)}>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              {user?.avatar ? (
                                <img
                                  src={`/avatar/${user.avatar}`}
                                  alt={user?.name}
                                  className="size-10 object-cover rounded-md"
                                />
                              ) : (
                                <div
                                  className={`size-10 rounded-md text-sm flex items-center uppercase justify-center font-semibold ${
                                    user.isAdmin
                                      ? "bg-white text-black border"
                                      : "bg-[#f84713] text-white"
                                  }`}>
                                  {(user?.username || user?.name || "U")?.charAt(0)}
                                  {(user?.username || user?.name || "U")?.charAt(
                                    (user?.username || user?.name || "U").length - 1
                                  )}
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="truncate">{user.name}</span>
                                  {user.isVerified && (
                                    <img src="/verify.png" className="size-3 sm:size-4" />
                                  )}
                                  {user.isAdmin && (
                                    <img src="/admin.png" className="size-3 sm:size-4" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 hidden md:table-cell">{user.email}</td>

                          <td className="py-3">
                            {isSubscriptionActive(user?.subscription) ? (
                              <img
                                src="/premium.png"
                                className="size-5"
                                alt="subscribed"
                                title={`${t.expiresAt}: ${formatSubscriptionDate(
                                  user?.subscription?.expiresAt,
                                  language
                                )}`}
                              />
                            ) : (
                              "--"
                            )}
                          </td>

                          <td className="py-3">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          {t.noUsersFound}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="mt-4">
                  <Paginate page={page} pages={pages} setPage={setPage} />
                </div>
              </div>

              {/* Mobile list cards */}
              <div className="sm:hidden mt-4 space-y-3">
                {processedUsers.length > 0 ? (
                  <>
                    {processedUsers.map((user: any) => {
                      const isPurchased = isSubscriptionActive(user?.subscription);

                      return (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => navigate(`/userlist/${user._id}`)}
                          className="w-full text-left rounded-xl border bg-white p-3 active:scale-[0.99] transition">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              {user?.avatar ? (
                                <img
                                  src={`/avatar/${user.avatar}`}
                                  alt={user?.name}
                                  className="size-11 object-cover rounded-lg shrink-0"
                                />
                              ) : (
                                <div
                                  className={`size-11 rounded-lg text-sm flex items-center uppercase justify-center font-extrabold shrink-0 ${
                                    user.isAdmin
                                      ? "bg-white text-black border"
                                      : "bg-[#f84713] text-white"
                                  }`}>
                                  {(user?.username || user?.name || "U")?.charAt(0)}
                                  {(user?.username || user?.name || "U")?.charAt(
                                    (user?.username || user?.name || "U").length - 1
                                  )}
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-extrabold text-zinc-900 truncate">
                                    {user.name}
                                  </p>
                                  {user.isVerified && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                                      <CheckCircle2 className="size-3" />
                                      {t.verified}
                                    </span>
                                  )}
                                  {user.isAdmin && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full border bg-zinc-50 text-zinc-700">
                                      <Shield className="size-3" />
                                      {t.admin}
                                    </span>
                                  )}
                                  {isPurchased && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                                      <Crown className="size-3" />
                                      {t.premium}
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 text-[12px] text-zinc-600 font-semibold space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Mail className="size-4 text-zinc-400" />
                                    <span className="truncate">{user.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="size-4 text-zinc-400" />
                                    <span>{formatDate(user.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 mt-1 text-zinc-400">
                              <ChevronRight className="size-5" />
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    <div className="pt-2">
                      <Paginate page={page} pages={pages} setPage={setPage} />
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border bg-white p-6 text-center text-gray-500 font-semibold">
                    {t.noUsersFound}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Customers;
