import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import clsx from "clsx";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import {
  ArrowLeft,
  Loader2Icon,
  ShieldBan,
  ShieldCheck,
  Trash2,
  BadgeCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX,
} from "lucide-react";
import {
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useGetUsersQuery,
  useToggleBlockUserMutation,
  useSetToVerifiedMutation,
  useSubscribeUserMutation,
  useCancelSubscriptionMutation,
} from "../../redux/queries/userApi";
import Badge from "../../components/Badge";
import {
  SUBSCRIPTION_MONTHS,
  formatSubscriptionDate,
  isSubscriptionActive,
  subscriptionDaysLeft,
} from "../../lib/subscription";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "../../components/ui/separator";
import { useSelector } from "react-redux";

function UserDetails() {
  const { userID } = useParams();
  const navigate = useNavigate();
  const language = useSelector((state: any) => state.language.lang); // 'ar' | 'en'
  const dir = language === "ar" ? "rtl" : "ltr";

  // Subscription (grants access to every paid course while it lasts)
  const [months, setMonths] = useState<number>(SUBSCRIPTION_MONTHS);

  const [subscribeUser, { isLoading: loadingSubscribe }] = useSubscribeUserMutation();
  const [cancelSubscription, { isLoading: loadingCancel }] = useCancelSubscriptionMutation();

  const [toggleBlockUser] = useToggleBlockUserMutation();
  const [setToVerified] = useSetToVerifiedMutation();

  const {
    data: user,
    refetch: refetchUser,
    isLoading: loadingUser,
  } = useGetUserDetailsQuery<any>(userID);

  const [deleteUser, { isLoading: loadingDeleteUser }] = useDeleteUserMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { refetch } = useGetUsersQuery(undefined);

  const labels: any = {
    en: {
      title: "User Details",
      back: "Back",
      personal: "Personal Information",
      subscription: "Subscription",
      subActive: "Active",
      subExpired: "Expired",
      subNone: "Never subscribed",
      startedAt: "Started",
      expiresAt: "Expires",
      daysLeft: "Days left",
      months: "Months",
      subscribe: "Subscribe",
      extend: "Extend",
      renew: "Renew",
      cancelSub: "Cancel subscription",
      subscribing: "Saving...",
      canceling: "Canceling...",
      subscribed: "Subscription updated successfully",
      subError: "Error updating subscription",
      canceled: "Subscription canceled",
      cancelError: "Error canceling subscription",
      extendHint: "Renewing early adds the new months on top of the remaining time.",
      noSubscription: "This user has no access to paid courses.",
      deleteUser: "Delete User",
      delete: "Delete",
      cancel: "Cancel",
      confirmDelete: "Are you sure you want to delete this user?",
      cannotDeleteAdmin: "Cannot delete an admin user.",
      deleted: "User deleted successfully",
      block: "Block User",
      unblock: "Unblock User",
      verified: "User Verified",
      verify: "Verify User",
      blocked: "Blocked",
      notBlocked: "Not Blocked",
      isVerified: "Verified",
      unverified: "Unverified",
      username: "Username",
      name: "Name",
      email: "Email",
    },
    ar: {
      title: "تفاصيل المستخدم",
      back: "رجوع",
      personal: "المعلومات الشخصية",
      subscription: "الاشتراك",
      subActive: "نشط",
      subExpired: "منتهي",
      subNone: "لم يشترك من قبل",
      startedAt: "بدأ في",
      expiresAt: "ينتهي في",
      daysLeft: "الأيام المتبقية",
      months: "الأشهر",
      subscribe: "تفعيل الاشتراك",
      extend: "تمديد",
      renew: "تجديد",
      cancelSub: "إلغاء الاشتراك",
      subscribing: "جارٍ الحفظ...",
      canceling: "جارٍ الإلغاء...",
      subscribed: "تم تحديث الاشتراك بنجاح",
      subError: "خطأ في تحديث الاشتراك",
      canceled: "تم إلغاء الاشتراك",
      cancelError: "خطأ في إلغاء الاشتراك",
      extendHint: "التجديد المبكر يضيف الأشهر الجديدة فوق المدة المتبقية.",
      noSubscription: "لا يملك هذا المستخدم صلاحية الوصول للدورات المدفوعة.",
      deleteUser: "حذف المستخدم",
      delete: "حذف",
      cancel: "إلغاء",
      confirmDelete: "هل أنت متأكد أنك تريد حذف هذا المستخدم؟",
      cannotDeleteAdmin: "لا يمكن حذف مستخدم مسؤول",
      deleted: "تم حذف المستخدم بنجاح",
      block: "حظر المستخدم",
      unblock: "إزالة الحظر",
      verified: "تم توثيق المستخدم",
      verify: "توثيق",
      blocked: "محظور",
      notBlocked: "غير محظور",
      isVerified: "موثق",
      unverified: "غير موثق",
      username: "اسم المستخدم",
      name: "الاسم",
      email: "البريد الإلكتروني",
    },
  };

  const t = labels[language];

  const subscription = user?.subscription;
  const subActive = isSubscriptionActive(subscription);
  const subExpired = Boolean(subscription?.expiresAt) && !subActive;
  const daysLeft = subscriptionDaysLeft(subscription);

  const handleSubscribe = async () => {
    try {
      await subscribeUser({ userId: userID, months }).unwrap();
      toast.success(t.subscribed);
      refetchUser();
    } catch (err: any) {
      toast.error(err?.data?.message || t.subError);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription(userID).unwrap();
      toast.success(t.canceled);
      refetchUser();
    } catch (err: any) {
      toast.error(err?.data?.message || t.cancelError);
    }
  };

  const handleDeleteUser = async () => {
    try {
      if (user?.isAdmin) {
        toast.error(t.cannotDeleteAdmin);
        return;
      }

      await deleteUser(userID).unwrap();
      toast.success(t.deleted);
      refetch();
      navigate("/admin/userlist");
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Error");
    }
  };

  const handleToggleBlockUser = async () => {
    try {
      await toggleBlockUser(userID).unwrap();
      refetchUser();
      toast.success(language === "ar" ? "تم تحديث حالة الحظر" : "Block status updated");
    } catch (err: any) {
      toast.error(err?.data?.message || (language === "ar" ? "حدث خطأ" : "Error"));
    }
  };

  const handleVerifyUser = async () => {
    try {
      await setToVerified(userID).unwrap();
      refetchUser();
      toast.success(t.verified);
    } catch (err: any) {
      toast.error(err?.data?.message || (language === "ar" ? "حدث خطأ" : "Error"));
    }
  };

  return (
    <Layout>
      {loadingUser ? (
        <Loader />
      ) : (
        <div
          dir={dir}
          className={clsx(
            "px-3 sm:px-6 lg:px-8 py-6 mt-[70px] lg:mt-[50px] mb-10 w-full max-w-5xl  min-h-screen"
          )}>
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-gray-50">
                <ArrowLeft className="size-4" />
                {t.back}
              </button>

              <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900">{t.title}</h1>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {!user?.isAdmin && (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="destructive"
                  className="bg-rose-500 hover:bg-rose-600">
                  <Trash2 className="size-4 mr-2" />
                  {t.deleteUser}
                </Button>
              )}

              <Button
                onClick={handleToggleBlockUser}
                className={clsx(
                  "text-white font-bold",
                  user?.isBlocked ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-900 hover:bg-black"
                )}>
                {user?.isBlocked ? (
                  <>
                    <ShieldCheck className="size-4 mr-2" />
                    {t.unblock}
                  </>
                ) : (
                  <>
                    <ShieldBan className="size-4 mr-2" />
                    {t.block}
                  </>
                )}
              </Button>

              <Button
                onClick={handleVerifyUser}
                className={clsx(
                  "text-white font-bold",
                  user?.isVerified
                    ? "bg-teal-600 hover:bg-teal-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                )}>
                <BadgeCheck className="size-4 mr-2" />
                {user?.isVerified ? t.isVerified : t.verify}
              </Button>
            </div>
          </div>

          <Separator className="my-5 bg-black/10" />

          {/* Profile Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <img
                    src={`/avatar/${user.avatar}`}
                    alt={user?.name}
                    className="size-12 rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="size-12 rounded-xl bg-gray-900 text-white grid place-items-center font-extrabold uppercase">
                    {(user?.username?.charAt(0) || "U") +
                      (user?.username?.charAt((user?.username?.length || 1) - 1) || "U")}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-lg font-extrabold text-gray-900 truncate">{user?.name}</p>

                    {user?.isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs font-bold">
                        <BadgeCheck className="size-4" />
                        {t.isVerified}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 text-xs font-bold">
                        {t.unverified}
                      </span>
                    )}

                    {user?.isBlocked ? (
                      <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 text-xs font-bold">
                        {t.blocked}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-1 text-xs font-bold">
                        {t.notBlocked}
                      </span>
                    )}
                  </div>

                  {/* <p className=" block text-sm text-gray-900 break-words">@{user?.username}</p> */}
                </div>
              </div>
            </div>

            <Separator className="my-5 bg-black/10" />

            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-4">{t.personal}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold text-gray-500">{t.username}</p>
                <p className="mt-1 font-extrabold text-gray-900">@{user?.username}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold text-gray-500">{t.name}</p>
                <p className="mt-1 font-extrabold text-gray-900">{user?.name}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:col-span-2">
                <p className="text-xs font-bold text-gray-500">{t.email}</p>
                <p className="mt-1 font-extrabold text-gray-900 break-words">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
                {t.subscription}
              </h2>

              <Badge icon={false} className="px-3 py-1.5 rounded-full">
                <span
                  className={clsx(
                    "font-bold",
                    subActive ? "text-emerald-700" : subExpired ? "text-rose-700" : "text-gray-600"
                  )}>
                  {subActive ? t.subActive : subExpired ? t.subExpired : t.subNone}
                </span>
              </Badge>
            </div>

            {subscription?.expiresAt ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-500">{t.startedAt}</p>
                  <p className="mt-1 font-extrabold text-gray-900">
                    {formatSubscriptionDate(subscription.startedAt, language)}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-500">{t.expiresAt}</p>
                  <p
                    className={clsx(
                      "mt-1 font-extrabold",
                      subActive ? "text-gray-900" : "text-rose-700"
                    )}>
                    {formatSubscriptionDate(subscription.expiresAt, language)}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-500">{t.daysLeft}</p>
                  <p className="mt-1 font-extrabold text-gray-900">{daysLeft}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">{t.noSubscription}</p>
            )}

            <Separator className="my-5 bg-black/10" />

            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="w-full sm:w-40">
                <label className="text-xs font-bold text-gray-500">{t.months}</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
                />
              </div>

              <Button
                disabled={loadingSubscribe || months < 1 || months > 24}
                onClick={handleSubscribe}
                className="bg-gray-900 hover:bg-black text-white font-bold rounded-xl min-w-[170px]">
                {loadingSubscribe ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2Icon className="animate-spin size-4" />
                    {t.subscribing}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    {subActive ? (
                      <CalendarPlus className="size-4" />
                    ) : (
                      <CalendarClock className="size-4" />
                    )}
                    {subActive ? t.extend : subExpired ? t.renew : t.subscribe}
                  </span>
                )}
              </Button>

              {subActive && (
                <Button
                  disabled={loadingCancel}
                  onClick={handleCancelSubscription}
                  variant="destructive"
                  className="bg-rose-500 hover:bg-rose-600 font-bold rounded-xl min-w-[170px]">
                  {loadingCancel ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2Icon className="animate-spin size-4" />
                      {t.canceling}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <CalendarX className="size-4" />
                      {t.cancelSub}
                    </span>
                  )}
                </Button>
              )}
            </div>

            {subActive && <p className="mt-3 text-xs text-gray-500">{t.extendHint}</p>}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteUser}</DialogTitle>
          </DialogHeader>

          <p className="py-4">{t.confirmDelete}</p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t.cancel}
            </Button>

            <Button disabled={loadingDeleteUser} variant="destructive" onClick={handleDeleteUser}>
              {loadingDeleteUser ? <Loader2Icon className="animate-spin mr-2" /> : null}
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default UserDetails;
