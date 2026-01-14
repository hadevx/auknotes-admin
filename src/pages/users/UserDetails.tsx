import { useMemo, useState } from "react";
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
  X,
} from "lucide-react";
import {
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useGetUsersQuery,
  useToggleBlockUserMutation,
  useSetToVerifiedMutation,
  useAddPurchasedCourseMutation,
  useRemovePurchasedCourseMutation,
} from "../../redux/queries/userApi";
import { useGetAllCoursesQuery } from "../../redux/queries/productApi";
import Badge from "../../components/Badge";
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

  // Add / Remove purchased course
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null);

  const [addPurchasedCourse] = useAddPurchasedCourseMutation();
  const [removePurchasedCourse] = useRemovePurchasedCourseMutation();

  const { data: allCourses } = useGetAllCoursesQuery(undefined);

  const isPaidCourses = useMemo(() => {
    return allCourses?.filter((c: any) => c.isPaid) ?? [];
  }, [allCourses]);

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
      purchased: "Purchased Courses",
      addCourse: "Add Purchased Course",
      select: "Select a course",
      add: "Add",
      addAll: "Add all paid courses",
      adding: "Adding...",
      removing: "Removing...",
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
      noCourses: "No courses purchased yet.",
      paidCount: "Paid courses",
      purchasedCount: "Purchased",
      noPaid: "No paid courses to add",
      addedCourse: "Course added successfully",
      addError: "Error adding course",
      removedCourse: "Course removed successfully",
      removeError: "Error removing course",
    },
    ar: {
      title: "تفاصيل المستخدم",
      back: "رجوع",
      personal: "المعلومات الشخصية",
      purchased: "الدورات المشتراة",
      addCourse: "إضافة دورة للمستخدم",
      select: "اختر دورة",
      add: "إضافة",
      addAll: "إضافة كل الدورات المدفوعة",
      adding: "جارٍ الإضافة...",
      removing: "جارٍ الحذف...",
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
      noCourses: "لم يتم شراء أي دورة بعد.",
      paidCount: "دورات مدفوعة",
      purchasedCount: "مشتراة",
      noPaid: "لا توجد دورات مدفوعة لإضافتها",
      addedCourse: "تمت إضافة الدورة بنجاح",
      addError: "خطأ بإضافة الدورة",
      removedCourse: "تمت إزالة الدورة بنجاح",
      removeError: "خطأ أثناء إزالة الدورة",
    },
  };

  const t = labels[language];

  const handleRemoveCourse = async (courseId: string) => {
    if (removingCourseId === courseId) return;

    setRemovingCourseId(courseId);

    try {
      await removePurchasedCourse({
        userId: userID,
        courseId,
      }).unwrap();

      toast.success(t.removedCourse);
      refetchUser();
    } catch (err: any) {
      toast.error(err?.data?.message || t.removeError);
    } finally {
      setRemovingCourseId(null);
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

  const handleAddCourse = async () => {
    if (!selectedCourse) return;
    try {
      await addPurchasedCourse({ userId: userID, courseId: selectedCourse }).unwrap();
      toast.success(t.addedCourse);
      setSelectedCourse("");
      refetchUser();
    } catch (error: any) {
      toast.error(error?.data?.message || t.addError);
    }
  };

  const handleAddAllCourses = async () => {
    if (!isPaidCourses?.length) {
      toast.info(t.noPaid);
      return;
    }

    setIsAddingAll(true);

    try {
      const tasks = isPaidCourses.map((course: any) =>
        addPurchasedCourse({ userId: userID, courseId: course._id }).unwrap()
      );

      const results = await Promise.allSettled(tasks);
      const successCount = results.filter((r) => r.status === "fulfilled").length;
      const failCount = results.filter((r) => r.status === "rejected").length;

      if (failCount === 0) {
        toast.success(
          language === "ar"
            ? `تمت إضافة كل الدورات (${successCount}) بنجاح`
            : `All courses added successfully (${successCount})`
        );
      } else {
        toast.warning(
          language === "ar"
            ? `تمت إضافة (${successCount}) وفشل (${failCount})`
            : `Added (${successCount}) and failed (${failCount})`
        );
      }

      await refetchUser();
    } catch (error: any) {
      toast.error(error?.data?.message || (language === "ar" ? "حدث خطأ" : "Something went wrong"));
    } finally {
      setIsAddingAll(false);
    }
  };

  const purchasedCount = user?.purchasedCourses?.length || 0;

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

          {/* Purchased Courses */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900">{t.purchased}</h2>

              <Badge icon={false} className="px-3 py-1.5 rounded-full">
                <span className="font-bold">{purchasedCount}</span>
              </Badge>
            </div>

            {user?.purchasedCourses?.length ? (
              <div className="flex flex-wrap gap-2">
                {user.purchasedCourses.map((course: any) => (
                  <div
                    key={course._id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 pl-3 pr-2 py-1 text-sm font-semibold text-gray-900 group">
                    <span>{course.code || course.title || "Course"}</span>

                    <button
                      onClick={() => handleRemoveCourse(course._id)}
                      disabled={removingCourseId === course._id}
                      className="rounded-full p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      title={language === "ar" ? "إزالة الدورة" : "Remove course"}>
                      {removingCourseId === course._id ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <X className="size-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">{t.noCourses}</p>
            )}
          </div>

          {/* Add Purchased Course */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-4">
              {t.addCourse}
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full sm:flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300">
                <option value="">{t.select}</option>
                {isPaidCourses?.map((course: any) => (
                  <option key={course._id} value={course._id}>
                    {course.code || course.title || "Course"}
                  </option>
                ))}
              </select>

              <Button
                disabled={!selectedCourse}
                onClick={handleAddCourse}
                className="bg-gray-900 hover:bg-black text-white font-bold rounded-xl min-w-[100px]">
                {t.add}
              </Button>

              <Button
                disabled={isAddingAll || !isPaidCourses.length}
                onClick={handleAddAllCourses}
                className="bg-gray-900 hover:bg-black text-white font-bold rounded-xl min-w-[180px]">
                {isAddingAll ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2Icon className="animate-spin size-4" />
                    {t.adding}
                  </span>
                ) : (
                  t.addAll
                )}
              </Button>
            </div>
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
