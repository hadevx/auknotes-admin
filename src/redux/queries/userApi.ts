import { api } from "./api.ts";

const userApi = api.injectEndpoints({
  endpoints: (builder: any) => ({
    loginUser: builder.mutation({
      query: (data: any) => ({
        url: "/api/users/admin",
        method: "POST",
        body: data,
      }),
    }),
    getUsers: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        url: `/api/users?pageNumber=${pageNumber}&keyword=${keyword}`,
      }),
      providesTags: ["User"],
    }),

    getAddress: builder.query({
      query: (userId: any) => ({
        url: `/api/users/address/${userId}`,
      }),
    }),
    getUserDetails: builder.query({
      query: (userId: any) => ({
        url: `/api/users/${userId}`,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `/api/users/admin/logout`,
        method: "POST",
      }),
    }),
    deleteUser: builder.mutation({
      query: (userId: any) => ({
        url: `/api/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: (data: any) => ({
        url: `/api/users/${data.userId}`,
        method: "PUT",
        body: data,
      }),
    }),
    getGovernorate: builder.query({
      query: () => ({
        url: `/api/users/governorates`,
      }),
    }),
    toggleBlockUser: builder.mutation({
      query: (id: any) => ({
        url: `/api/users/${id}`,
        method: "PATCH",
      }),
    }),
    setToVerified: builder.mutation({
      query: (id: any) => ({
        url: `/api/users/verify/${id}`,
        method: "PATCH",
      }),
    }),
    addPurchasedCourse: builder.mutation({
      query: ({ userId, courseId }: any) => ({
        url: `/api/users/add-course/${userId}`,
        method: "PUT",
        body: { courseId },
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useGetAddressQuery,
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useLogoutMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useGetGovernorateQuery,
  useToggleBlockUserMutation,
  useSetToVerifiedMutation,
  useAddPurchasedCourseMutation,
} = userApi;
