import Layout from "../../Layout";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useGetUsersQuery } from "../../redux/queries/userApi";
import { Search, Users } from "lucide-react";
import Badge from "../../components/Badge";
import { Separator } from "../../components/ui/separator";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";
import Paginate from "@/components/Paginate";

function Customers() {
  const language = useSelector((state: any) => state.language.lang);

  const labels: any = {
    en: {
      users: "Users",
      totalUsers: "users",
      searchPlaceholder: "Search users by email",
      name: "Name",
      email: "Email",
      phone: "Phone",
      registeredIn: "Registered in",
      admin: "Admin",
      user: "User",
      noUsersFound: "No users found.",
    },
    ar: {
      users: "المستخدمون",
      totalUsers: "مستخدمين",
      searchPlaceholder: "ابحث عن المستخدمين بواسطة البريد الإلكتروني",
      name: "الاسم",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      registeredIn: "تاريخ التسجيل",
      admin: "مدير",
      user: "مستخدم",
      noUsersFound: "لم يتم العثور على مستخدمين.",
    },
  };
  const t = labels[language];

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetUsersQuery<any>({ pageNumber: page, keyword: searchQuery });
  // const [toggleBlockUser] = useToggleBlockUserMutation();

  const users = data?.users || [];
  const pages = data?.pages || 1;
  const totalUsers = data?.total || 0;

  const navigate = useNavigate();
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      const filtered = users.filter((user: any) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [data, searchQuery]);

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="lg:px-4 mb-10 lg:w-4xl w-full min-h-screen lg:min-h-auto flex text-xs lg:text-lg justify-between py-3 mt-[70px] lg:mt-[50px] px-2">
          <div className="w-full">
            <div
              className={`flex justify-between items-center ${
                language === "ar" ? "flex-row-reverse" : ""
              }`}>
              <h1
                dir={language === "ar" ? "rtl" : "ltr"}
                className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center">
                {t.users}:{" "}
                <Badge icon={false} className="p-1">
                  <Users strokeWidth={1} className="size-5" />
                  <p className="text-lg lg:text-lg">{totalUsers > 0 ? totalUsers : "0"} </p>
                </Badge>
              </h1>
            </div>
            <Separator className="my-4 bg-black/20" />

            <div className="mt-5 mb-2 overflow-hidden">
              <div className="relative w-full  mb-5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Search className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
                />
              </div>

              <div className="rounded-lg border p-3 sm:p-5  bg-white">
                <table className="w-full rounded-lg text-xs lg:text-sm border-gray-200 text-left text-gray-700">
                  <thead className="bg-white text-gray-900/50 font-semibold">
                    <tr>
                      <th className="pb-2  border-b">{t.name}</th>
                      <th className="pb-2  border-b">{t.email}</th>
                      <th className="pb-2 border-b">{t.registeredIn}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user: any) => (
                        <tr
                          key={user._id}
                          className="cursor-pointer hover:bg-gray-100 transition-all duration-300 font-bold"
                          onClick={() => navigate(`/userlist/${user._id}`)}>
                          <td className=" py-2 flex items-center gap-1">
                            {user?.avatar ? (
                              <img
                                src={`/avatar/${user.avatar}`}
                                alt={user}
                                className={`size-10  object-cover rounded-md`}
                              />
                            ) : (
                              <div
                                className={`size-10 rounded-md text-sm flex items-center uppercase justify-center font-semibold ${
                                  user.isAdmin ? "bg-white text-black" : "bg-[#f84713] text-white"
                                }`}>
                                {user?.username?.charAt(0) +
                                  user?.username?.charAt(user?.username?.length - 1)}
                              </div>
                            )}
                            <span className="ml-1">{user.name}</span>
                            {user.isVerified && (
                              <img src="/verify.png" className="size-3 sm:size-4" />
                            )}
                            {user.isAdmin && <img src="/admin.png" className="size-3 sm:size-4" />}
                          </td>
                          <td className=" py-2">{user.email}</td>
                          {/* <td className="px-4 py-5">{user.phone}</td> */}

                          <td className="py-2 ">
                            {new Date(user.createdAt).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",

                              hour12: true,
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className=" py-6 text-center text-gray-500">
                          {t.noUsersFound}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <Paginate page={page} pages={pages} setPage={setPage} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Customers;
