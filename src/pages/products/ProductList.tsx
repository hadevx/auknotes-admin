import { useState, useEffect } from "react";
import Layout from "../../Layout";
import {
  useUploadProductFileMutation,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetAllCoursesQuery,
  useGetProductsByCourseQuery,
  useUpdateProductMutation,
  useGetCourseByIdQuery,
  useGetNumberOfProductsQuery,
} from "../../redux/queries/productApi";
import Badge from "../../components/Badge";
import { Box, Plus, Trash2, Edit } from "lucide-react";
import Loader from "../../components/Loader";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { texts } from "./translation";

function ProductList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null); // store product being edited
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const language = useSelector((state: any) => state.language.lang);

  const { data: numberOfProducts } = useGetNumberOfProductsQuery(undefined);

  console.log(numberOfProducts);

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setName(product.name);
    setCourse(product.course);
    setType(product.type);
    setPdfFile(null); // reset pdf file
    setIsEditModalOpen(true);
  };
  // Fetch all courses
  const { data: courses, isLoading: loadingCourses } = useGetAllCoursesQuery(undefined);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  // ✅ Automatically select the first course when loaded
  useEffect(() => {
    if (!loadingCourses && courses?.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]?._id);
    }
  }, [courses, loadingCourses]);
  // Fetch products by selected course
  const { data: products, isLoading: loadingProducts } = useGetProductsByCourseQuery({
    courseId: selectedCourse,
  });

  console.log(products);

  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [uploadProductFile, { isLoading: loadingUploadImage }] = useUploadProductFileMutation();
  const [createProduct, { isLoading: loadingCreateProduct }] = useCreateProductMutation();

  const [name, setName] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [type, setType] = useState<string>("");
  const { data } = useGetCourseByIdQuery(course);

  const formattedCode = data?.code?.replace(/\s+/g, ""); // "CPEG100"

  console.log(formattedCode);
  const resetForm = () => {
    setName("");
    setCourse("");
    setType("");
    setPdfFile(null);
  };

  const handleCreateProduct = async () => {
    // Make sure a course is selected
    if (!course) {
      toast.error("Please select a course before uploading");
      return;
    }

    let uploadedFile: { url: string; publicId: string; size: number } | null = null;

    // Upload file if selected
    if (pdfFile) {
      try {
        const formData = new FormData();
        formData.append("file", pdfFile);

        console.log("FormData course:", course); // Debug

        // Send FormData to backend
        const res = await uploadProductFile({ formData, course }).unwrap();

        uploadedFile = {
          url: res.file.fileUrl,
          publicId: res.file.publicId,
          size: pdfFile.size,
        };
      } catch (error: any) {
        toast.error(error?.data?.message || error?.error || "File upload failed");
        return;
      }
    }

    // Create the product in DB
    try {
      await createProduct({
        name,
        course, // this is the course ID
        type,
        file: uploadedFile,
      }).unwrap();

      toast.success("Product created successfully");
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create product");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId).unwrap();
      toast.success(language === "ar" ? "تم حذف المنتج بنجاح" : "Product deleted successfully");
    } catch {
      toast.error(language === "ar" ? "فشل حذف المنتج" : "Failed to delete product");
    }
  };
  // Update product function
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    let uploadedFile: { url: string; publicId: string; size: number } | undefined;

    // Upload new file if selected
    if (pdfFile) {
      try {
        const formData = new FormData();
        formData.append("file", pdfFile);
        const res = await uploadProductFile({ formData, course }).unwrap();
        uploadedFile = {
          url: res.file.fileUrl,
          publicId: res.file.publicId,
          size: pdfFile.size,
        };
      } catch (error: any) {
        toast.error(error?.data?.message || error?.error);
        return;
      }
    }

    try {
      await updateProduct({
        _id: editingProduct._id,
        name,
        course,
        type,
        file: uploadedFile || editingProduct.file, // keep old file if no new file
      }).unwrap();

      toast.success(language === "ar" ? "تم تعديل المنتج بنجاح" : "Product updated successfully");
      setIsEditModalOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      toast.error(language === "ar" ? "فشل تعديل المنتج" : "Failed to update product");
    }
  };

  return (
    <Layout>
      {loadingProducts || loadingCourses ? (
        <Loader />
      ) : (
        <div className="px-2 flex lg:w-4xl flex-col w-full min-h-screen lg:min-h-auto py-3 mt-[70px]">
          {/* Header */}
          <div className="w-full">
            <div className="flex justify-between items-center flex-wrap gap-3" dir="rtl">
              <h1
                dir={language === "ar" ? "rtl" : "ltr"}
                className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center flex-wrap">
                {texts[language].products}:
                <Badge icon={false} className="p-1">
                  <Box className="size-5" strokeWidth={1} />
                  <p className="text-lg lg:text-lg">{numberOfProducts || 0}</p>
                </Badge>
              </h1>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-black text-white font-bold flex items-center gap-1 text-sm lg:text-md shadow-md px-3 py-2 rounded-md hover:bg-black/70 transition">
                {texts[language].addProduct}
                <Plus />
              </button>
            </div>

            <Separator className="my-4 bg-black/20" />

            {/* Course Filters */}
            <div className="mb-5">
              <select
                value={selectedCourse || ""}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full sm:w-60 px-4 py-2 border rounded-lg bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-black focus:border-black outline-none">
                <option value="" disabled>
                  Select a course
                </option>
                {courses?.map((c: any) => (
                  <option
                    key={c._id}
                    value={c._id}
                    className={`${c.isClosed && "text-rose-500"} ${c.isPaid && "text-blue-500"}`}>
                    {c.code} {c.isPaid ? "(paid)" : ""} {c.isClosed ? "(closed)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Table */}
            <div className="rounded-lg border p-3 lg:p-5 bg-white overflow-x-auto">
              <table className="w-full lg:min-w-[700px] rounded-lg border-gray-200 text-sm text-left text-gray-700">
                <thead className="bg-white text-gray-900/50 font-semibold">
                  <tr>
                    <th className="pb-2 border-b ">{texts[language].name}</th>
                    <th className="pb-2 border-b text-center">{texts[language].type}</th>
                    <th className="pb-2 border-b text-center">{texts[language].size}</th>
                    <th className="pb-2 border-b text-center">{texts[language].actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-5 text-gray-400">
                        {texts[language].noProductsFound}
                      </td>
                    </tr>
                  ) : (
                    products?.map((p: any) => (
                      <tr key={p._id}>
                        <td className="py-2 flex items-center gap-2 font-semibold">
                          <img
                            src={
                              p.file?.url?.toLowerCase().endsWith(".pdf")
                                ? "/pdf.png"
                                : p.file?.url?.toLowerCase().endsWith(".ppt") ||
                                  p.file?.url?.toLowerCase().endsWith(".pptx")
                                ? "/powerpoint.png"
                                : "/word.png"
                            }
                            className="size-10 object-cover rounded-md"
                          />
                          {p.name}
                        </td>
                        <td className="font-semibold text-gray-400">{p.type}</td>
                        <td className="font-semibold">
                          {p?.size && (
                            <span className="text-xs text-gray-400  block">
                              {p?.size < 1024 * 1024
                                ? `${(p?.size / 1024).toFixed(2)} KB`
                                : `${(p?.size / 1024 / 1024).toFixed(2)} MB`}
                            </span>
                          )}
                        </td>
                        <td className="py-2 flex justify-center gap-2">
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="text-black hover:bg-zinc-200 bg-zinc-100 p-2 rounded-md text-sm">
                            <Trash2 className="size-4 sm:size-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="text-black hover:bg-zinc-200 bg-zinc-100 p-2 rounded-md text-sm">
                            <Edit className="size-4 sm:size-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="flex flex-col">
          <DialogHeader>
            <DialogTitle>{texts[language].addProduct}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4 space-y-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="p-2 w-full border rounded-md"
            />

            <input
              type="text"
              placeholder={texts[language].productName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 w-full border rounded-md"
            />

            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="p-2 w-full border rounded-md">
              <option value="" disabled>
                {texts[language].selectCategory}
              </option>
              {loadingCourses ? (
                <option>Loading...</option>
              ) : (
                courses?.map((c: any) => (
                  <option key={c._id} value={c._id}>
                    {c.code}
                  </option>
                ))
              )}
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-2 w-full border rounded-md">
              <option value="" disabled>
                {texts[language].selectType}
              </option>
              <option value="Note">Note</option>
              <option value="Book">Book</option>
              <option value="Exam">Exam</option>
              <option value="Assignment">Assignment</option>
              <option value="Syllabus">Syllabus</option>
            </select>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="default"
              disabled={loadingCreateProduct || loadingUploadImage}
              onClick={handleCreateProduct}>
              {loadingUploadImage
                ? texts[language].uploading
                : loadingCreateProduct
                ? texts[language].creating
                : texts[language].create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="flex flex-col">
          <DialogHeader>
            <DialogTitle>{texts[language].editProduct}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4 space-y-4">
            <input
              type="file"
              // value={pdfFile}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="p-2 w-full border rounded-md"
            />

            <input
              type="text"
              placeholder={texts[language].productName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 w-full border rounded-md"
            />

            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="p-2 w-full border rounded-md">
              <option value="" disabled>
                {texts[language].selectCategory}
              </option>
              {courses?.map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.code}
                </option>
              ))}
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-2 w-full border rounded-md">
              <option value="" disabled>
                {texts[language].selectType}
              </option>
              <option value="Note">Note</option>
              <option value="Book">Book</option>
              <option value="Exam">Exam</option>
              <option value="Assignment">Assignment</option>
              <option value="Syllabus">Syllabus</option>
            </select>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="default" disabled={loadingUploadImage} onClick={handleUpdateProduct}>
              {loadingUploadImage ? texts[language].uploading : texts[language].update}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default ProductList;
