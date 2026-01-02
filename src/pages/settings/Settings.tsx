import Layout from "../../Layout";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  useUpdateStoreStatusMutation,
  useGetStoreStatusQuery,
} from "../../redux/queries/maintenanceApi";
import Spinner from "../../components/Spinner";
import { Separator } from "../../components/ui/separator";
import {
  Loader2Icon,
  Globe,
  Store,
  Wrench,
  BadgeCheck,
  Tag,
  Megaphone,
  RefreshCw,
} from "lucide-react";
import { toggleLang } from "../../redux/slices/languageSlice";
import { useSelector, useDispatch } from "react-redux";

function Settings() {
  const [updateStoreStatus, { isLoading: loadingUpdateStatus }] = useUpdateStoreStatusMutation();
  const { data: storeStatus, refetch, isLoading } = useGetStoreStatusQuery(undefined);

  const [status, setStatus] = useState<"active" | "maintenance" | "">("");
  const [banner, setBanner] = useState("");
  const [price, setPrice] = useState<number>(0);

  const language = useSelector((state: any) => state.language.lang);
  const dispatch = useDispatch();

  const current = storeStatus?.[0];

  const formatDate = (isoString: any) => {
    if (!isoString) return language === "en" ? "N/A" : "غير متوفر";
    const date = new Date(isoString);
    return date.toLocaleString(language === "en" ? "en-US" : "ar-KW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (current) {
      setStatus(current?.status || "");
      setBanner(current?.banner || "");
      setPrice(current?.price || 0);
    }
  }, [current]);

  const isDirty = useMemo(() => {
    if (!current) return true;
    const sameStatus = (status || "") === (current.status || "");
    const sameBanner = (banner || "").trim() === (current.banner || "").trim();
    const samePrice = Number(price || 0) === Number(current.price || 0);
    return !(sameStatus && sameBanner && samePrice);
  }, [current, status, banner, price]);

  const statusPill = useMemo(() => {
    const s = current?.status;
    if (s === "active")
      return {
        label: language === "en" ? "Active" : "نشط",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
        icon: BadgeCheck,
      };
    if (s === "maintenance")
      return {
        label: language === "en" ? "Maintenance" : "صيانة",
        cls: "bg-rose-50 text-rose-700 border-rose-100",
        icon: Wrench,
      };
    return {
      label: language === "en" ? "Unknown" : "غير معروف",
      cls: "bg-zinc-50 text-zinc-700 border-zinc-100",
      icon: Store,
    };
  }, [current?.status, language]);

  const handleUpdateStoreStatus = async () => {
    try {
      await updateStoreStatus({ status, banner: banner.trim(), price }).unwrap?.();
      toast.success(
        language === "en" ? "Store status updated successfully" : "تم تحديث حالة المتجر بنجاح"
      );
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || (language === "en" ? "Update failed" : "فشل التحديث"));
    }
  };

  const resetToCurrent = () => {
    if (!current) return;
    setStatus(current?.status || "");
    setBanner(current?.banner || "");
    setPrice(current?.price || 0);
  };

  return (
    <Layout>
      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        className="px-2 w-full min-h-screen lg:w-4xl text-black py-6 mt-[50px]">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">
              {language === "en" ? "Store Settings" : "إعدادات المتجر"}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {language === "en"
                ? "Control store availability, price, and banner message."
                : "تحكم بحالة المتجر والسعر ونص البانر."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full hover:bg-zinc-100 transition shadow-sm"
              type="button"
              aria-label="Refresh">
              <RefreshCw className="w-4 h-4 text-zinc-700" />
              <span className="text-sm font-semibold text-zinc-700">
                {language === "en" ? "Refresh" : "تحديث"}
              </span>
            </button>

            <button
              onClick={() => dispatch(toggleLang())}
              className="flex items-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)] gap-2 px-4 py-2 bg-white border rounded-full hover:bg-zinc-100 transition"
              type="button">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-zinc-700">
                {language === "en" ? "العربية" : "English"}
              </span>
            </button>
          </div>
        </div>

        <Separator className="my-5 bg-black/10" />

        {/* Status cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-zinc-500">
                {language === "en" ? "Current condition" : "الحالة الحالية"}
              </p>
              <Store className="size-4 text-zinc-400" />
            </div>

            <div className="mt-3">
              {isLoading ? (
                <Spinner className="border-t-black" />
              ) : (
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold border ${statusPill.cls}`}>
                  <statusPill.icon className="size-4" />
                  {statusPill.label}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-zinc-500">
                {language === "en" ? "Course price" : "سعر المواد"}
              </p>
              <Tag className="size-4 text-zinc-400" />
            </div>

            <div className="mt-3">
              {isLoading ? (
                <Spinner className="border-t-black" />
              ) : (
                <div className="text-2xl font-black text-zinc-900 flex items-end gap-2">
                  <span>{Number(current?.price || 0).toFixed(2)}</span>
                  <span className="text-sm font-bold text-zinc-500">KD</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-zinc-500">
                {language === "en" ? "Last updated" : "آخر تحديث"}
              </p>
              <BadgeCheck className="size-4 text-zinc-400" />
            </div>

            <div className="mt-3">
              {isLoading ? (
                <Spinner className="border-t-black" />
              ) : (
                <p className="text-sm font-bold text-zinc-800">{formatDate(current?.updatedAt)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-4">
          {/* Update form */}
          <section className="bg-white border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-black text-zinc-900">
                  {language === "en" ? "Update settings" : "تحديث الإعدادات"}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {language === "en"
                    ? "Change condition, price, and banner text."
                    : "غيّر الحالة والسعر ونص البانر."}
                </p>
              </div>

              {isDirty && (
                <span className="text-xs font-bold rounded-full px-3 py-1 border bg-amber-50 text-amber-700 border-amber-100">
                  {language === "en" ? "Unsaved changes" : "تغييرات غير محفوظة"}
                </span>
              )}
            </div>

            <Separator className="my-4 bg-black/10" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block mb-1 text-xs font-black text-zinc-600">
                  {language === "en" ? "Store condition" : "حالة المتجر"}
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("active")}
                    className={`rounded-xl border px-4 py-3 text-sm font-black flex items-center justify-center gap-2 transition ${
                      status === "active"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800"
                    }`}>
                    <BadgeCheck className="size-4" />
                    {language === "en" ? "Active" : "نشط"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("maintenance")}
                    className={`rounded-xl border px-4 py-3 text-sm font-black flex items-center justify-center gap-2 transition ${
                      status === "maintenance"
                        ? "bg-rose-50 border-rose-200 text-rose-800"
                        : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800"
                    }`}>
                    <Wrench className="size-4" />
                    {language === "en" ? "Maintenance" : "صيانة"}
                  </button>
                </div>

                {status === "" && (
                  <p className="text-xs text-rose-500 font-semibold mt-2">
                    {language === "en" ? "Please choose a condition." : "اختر حالة المتجر."}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block mb-1 text-xs font-black text-zinc-600">
                  {language === "en" ? "Courses price (KD)" : "سعر المواد (د.ك)"}
                </label>
                <input
                  type="number"
                  value={price}
                  min={0}
                  step={0.5}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder={language === "en" ? "Enter price" : "أدخل السعر"}
                  className="w-full px-4 py-3 border rounded-xl outline-0 shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-zinc-500 mt-2 font-semibold">
                  {language === "en"
                    ? "Tip: use 0 to temporarily remove pricing."
                    : "ملاحظة: استخدم 0 لإلغاء السعر مؤقتاً."}
                </p>
              </div>
            </div>

            {/* Banner */}
            <div className="mt-4">
              <label className="block mb-1 text-xs font-black text-zinc-600">
                {language === "en" ? "Banner text" : "نص البانر"}
              </label>

              <div className="rounded-2xl border bg-zinc-50 p-3">
                <div className="flex items-center gap-2 mb-2 text-zinc-600">
                  <Megaphone className="size-4" />
                  <p className="text-xs font-black">
                    {language === "en" ? "Shown at the top of the website" : "يظهر أعلى الموقع"}
                  </p>
                </div>

                <textarea
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  rows={4}
                  placeholder={
                    language === "en" ? "Enter banner text (optional)" : "أدخل نص البانر (اختياري)"
                  }
                  className="w-full px-4 py-3 border outline-0 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 font-semibold">
                  <span>
                    {language === "en" ? "Characters" : "عدد الحروف"}: {(banner || "").length}
                  </span>
                  <button type="button" onClick={() => setBanner("")} className="hover:underline">
                    {language === "en" ? "Clear" : "مسح"}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex items-center justify-end gap-2 flex-wrap">
              <button
                type="button"
                onClick={resetToCurrent}
                disabled={!isDirty || isLoading}
                className="px-4 py-2 rounded-xl border bg-white hover:bg-zinc-50 transition text-sm font-black disabled:opacity-60">
                {language === "en" ? "Reset" : "إرجاع"}
              </button>

              <button
                onClick={handleUpdateStoreStatus}
                disabled={loadingUpdateStatus || isLoading || !status}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-black px-6 py-2 rounded-xl shadow-lg
                  drop-shadow-[0_0_10px_rgba(24,24,27,0.35)]
                  transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-60">
                {loadingUpdateStatus ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <>
                    {language === "en" ? "Save changes" : "حفظ التغييرات"}
                    <span className="text-white/60">•</span>
                    <span className="text-white/90 text-sm">
                      {language === "en" ? "Update" : "تحديث"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Live preview */}
          <section className="bg-white border rounded-2xl p-5">
            <h2 className="text-lg font-black text-zinc-900">
              {language === "en" ? "Live preview" : "معاينة مباشرة"}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {language === "en"
                ? "This is how it would look after saving."
                : "هكذا سيظهر بعد الحفظ."}
            </p>

            <Separator className="my-4 bg-black/10" />

            {/* Preview banner */}
            <div className="rounded-2xl border bg-zinc-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black text-zinc-500">
                  {language === "en" ? "Banner" : "البانر"}
                </p>

                <span
                  className={`text-[11px] font-black rounded-full px-3 py-1 border ${
                    (status || current?.status) === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}>
                  {(status || current?.status) === "active"
                    ? language === "en"
                      ? "Active"
                      : "نشط"
                    : language === "en"
                    ? "Maintenance"
                    : "صيانة"}
                </span>
              </div>

              <div className="mt-3 rounded-xl border bg-white p-3">
                <p className="text-sm font-semibold text-zinc-800 whitespace-pre-wrap break-words">
                  {(banner || "").trim()
                    ? banner
                    : language === "en"
                    ? "No banner text."
                    : "لا يوجد نص بانر."}
                </p>
              </div>

              <div className="mt-3 text-xs font-semibold text-zinc-500 flex items-center justify-between">
                <span>
                  {language === "en" ? "Price" : "السعر"}:{" "}
                  <span className="font-black text-zinc-800">
                    {Number(price || 0).toFixed(2)} KD
                  </span>
                </span>
                <span>
                  {language === "en" ? "Saved at" : "آخر حفظ"}:{" "}
                  <span className="font-black text-zinc-700">{formatDate(current?.updatedAt)}</span>
                </span>
              </div>
            </div>

            {/* Current data block (small) */}
            <div className="mt-4 rounded-2xl border p-4">
              <p className="text-xs font-black text-zinc-500 mb-2">
                {language === "en" ? "Current stored values" : "القيم الحالية"}
              </p>

              {isLoading ? (
                <Spinner className="border-t-black" />
              ) : (
                <div className="space-y-2 text-sm font-semibold text-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-bold">
                      {language === "en" ? "Condition" : "الحالة"}
                    </span>
                    <span className="font-black capitalize">{current?.status || "—"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-bold">
                      {language === "en" ? "Price" : "السعر"}
                    </span>
                    <span className="font-black">{Number(current?.price || 0).toFixed(2)} KD</span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-zinc-500 font-bold">
                      {language === "en" ? "Banner" : "البانر"}
                    </span>
                    <span className="font-black text-right whitespace-pre-wrap break-words max-w-[260px]">
                      {(current?.banner || "").trim()
                        ? current.banner
                        : language === "en"
                        ? "No banner"
                        : "لا يوجد"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
