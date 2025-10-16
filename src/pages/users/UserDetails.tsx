import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import clsx from "clsx";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { Loader2Icon } from "lucide-react";
import {
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useGetUsersQuery,
  useToggleBlockUserMutation,
  useSetToVerifiedMutation,
} from "../../redux/queries/userApi";
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

  const handleDeleteUser = async () => {
    try {
      if (user?.isAdmin) {
        toast.error(
          language === "ar" ? "لا يمكن حذف مستخدم مسؤول" : "Cannot delete an admin user."
        );
        return;
      }

      await deleteUser(userID).unwrap();
      toast.success(language === "ar" ? "تم حذف المستخدم بنجاح" : "User deleted successfully");
      refetch();

      navigate("/admin/userlist");
    } catch (error: any) {
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        (language === "ar"
          ? "حدث خطأ أثناء حذف المستخدم"
          : "An error occurred while deleting the user.");
      toast.error(errorMsg);
    }
  };
  const handleToggleBlockUser = async (id: any) => {
    try {
      await toggleBlockUser(id).unwrap();
      refetchUser();
      toast.success("User blocked");
    } catch (err: any) {
      toast.error(err?.data?.message || "Error toggling block status");
    }
  };
  const handleVerifyUser = async (id: any) => {
    try {
      await setToVerified(id).unwrap();
      refetchUser();
      toast.success("User Verified");
    } catch (err: any) {
      toast.error(err?.data?.message || "Error verifying user");
    }
  };
  return (
    <Layout>
      {loadingUser ? (
        <Loader />
      ) : (
        <div
          className={clsx(
            "px-4 min-h-screen lg:w-4xl py-3 w-full mb-10  flex flex-col mt-[70px] lg:mt-[50px]"
          )}
          dir={language === "ar" ? "rtl" : "ltr"}>
          {/* Header */}
          <div className={`flex justify-between items-center `}>
            <h1 className="text-lg font-bold">
              {language === "ar" ? "معلومات العميل:" : "Customer's Information:"}
            </h1>
            <div className="flex gap-2">
              {!user?.isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="select-none text-xs lg:text-lg  bg-gradient-to-t from-rose-500 to-rose-400 text-white px-2 lg:px-3 py-2 rounded-lg font-bold  hover:opacity-80">
                  {language === "ar" ? "حذف المستخدم" : "Delete User"}
                </button>
              )}
              <button
                onClick={async () => {
                  await handleToggleBlockUser(userID);
                  refetch(); // refresh user data after toggle
                }}
                className={clsx(
                  "select-none text-xs lg:text-lg font-bold px-2 lg:px-3 py-2 rounded-lg shadow-md transition-all duration-200",
                  user?.isBlocked
                    ? "bg-gradient-to-t from-green-600 to-green-500 hover:opacity-85 text-white"
                    : "bg-gradient-to-t from-rose-500 to-rose-400 hover:opacity-85 text-white"
                )}>
                {user?.isBlocked
                  ? language === "ar"
                    ? "إزالة الحظر"
                    : "Unblock User"
                  : language === "ar"
                  ? "حظر المستخدم"
                  : "Block User"}
              </button>
              <button
                onClick={async () => {
                  await handleVerifyUser(userID);
                  refetch(); // refresh user data after toggle
                }}
                className={clsx(
                  "select-none text-xs lg:text-lg font-bold px-2 lg:px-3 py-2 rounded-lg shadow-md transition-all duration-200",
                  user?.isVerified
                    ? "bg-gradient-to-t from-green-600 to-green-500 hover:opacity-85 text-white"
                    : "bg-gradient-to-t from-rose-500 to-rose-400 hover:opacity-85 text-white"
                )}>
                {user?.isVerified
                  ? language === "ar"
                    ? "موثق"
                    : "un User"
                  : language === "ar"
                  ? "توثيق"
                  : "Block User"}
              </button>
            </div>
          </div>

          <Separator className="my-4 bg-black/20" />

          {/* Personal Info */}
          <div className="relative mb-2 w-full p-6 bg-white  rounded-xl border ">
            <section>
              <h2 className="text-xl font-bold text-gray-800 border-b  border-gray-200 pb-2 mb-6">
                {language === "ar" ? "المعلومات الشخصية" : "Personal Information"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">
                    {language === "ar" ? "اليوزر:" : "Username:"}
                  </span>
                  <span className="mt-1 font-semibold text-gray-700">{user?.username}@</span>
                </div>
                {/* Name */}
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">
                    {language === "ar" ? "الاسم:" : "Name:"}
                  </span>
                  <span className="mt-1 font-semibold text-gray-700">{user?.name}</span>
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">
                    {language === "ar" ? "البريد الإلكتروني:" : "Email:"}
                  </span>
                  <a
                    href={`mailto:${user?.email}`}
                    className="mt-1 font-semibold text-blue-500 hover:text-blue-600 underline break-words whitespace-pre-line">
                    {user?.email}
                  </a>
                </div>

                <div className="flex flex-col items-start">
                  <span className="text-gray-400 text-sm">
                    {language === "ar" ? "محظور:" : "Blocked:"}
                  </span>
                  {user.isBlocked ? (
                    <Badge icon={false} variant="danger" className="px-2 py-1 rounded-full">
                      {language === "ar" ? "محظور" : "Bloced"}
                    </Badge>
                  ) : (
                    <Badge icon={false} variant="success" className="px-2 py-1 rounded-full">
                      {language === "ar" ? "غير محظور" : "Not Blocked"}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-gray-400 text-sm">
                    {language === "ar" ? "محظور:" : "Blocked:"}
                  </span>
                  {user?.isVerified ? (
                    <Badge icon={false} variant="success" className="px-2 py-1 rounded-full">
                      {language === "ar" ? "موثق" : "Verified"}
                    </Badge>
                  ) : (
                    <Badge icon={false} variant="danger" className="px-2 py-1 rounded-full">
                      {language === "ar" ? "غير موثق" : "Unverified"}
                    </Badge>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "ar" ? "حذف المستخدم" : "Delete User"}</DialogTitle>
          </DialogHeader>
          {language === "ar"
            ? "هل أنت متأكد أنك تريد حذف هذا المستخدم؟"
            : "Are you sure you want to delete this user?"}
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              disabled={loadingDeleteUser}
              variant="destructive"
              className="bg-gradient-to-t from-rose-500 to-rose-400"
              onClick={handleDeleteUser}>
              {loadingDeleteUser ? (
                <Loader2Icon className="animate-spin" />
              ) : language === "ar" ? (
                "حذف"
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default UserDetails;
