import { useState, type JSX } from "react";
import Layout from "../../Layout";
import {
  useGetProductsQuery,
  useUploadProductFileMutation,
  useCreateProductMutation,
  useGetCategoriesTreeQuery,
  useDeleteProductMutation,
} from "../../redux/queries/productApi";
import Badge from "../../components/Badge";
import { Box, Plus, Download, Trash2, Edit } from "lucide-react";
import Loader from "../../components/Loader";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { texts } from "./translation";
import Error from "@/components/Error";
import Paginate from "@/components/Paginate";

function ProductList() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  console.log(pdfFile);
  const language = useSelector((state: any) => state.language.lang);

  const {
    data: productsData,
    isLoading: loadingProducts,
    error: errorGettingProducts,
  } = useGetProductsQuery({
    pageNumber: page,
  });

  const products = productsData?.products || [];
  const pages = productsData?.pages || 1;

  const { data: tree } = useGetCategoriesTreeQuery(undefined);
  const [deleteProduct] = useDeleteProductMutation();

  console.log(products);
  /* Create product fields */
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<string>("");

  const [uploadProductFile, { isLoading: loadingUploadImage }] = useUploadProductFileMutation();
  const [createProduct, { isLoading: loadingCreateOrder }] = useCreateProductMutation();

  // ✅ Group products by category
  const groupedProducts = products?.reduce((acc: any, product: any) => {
    const categoryName = product.category?.name || "Uncategorized";
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(product);
    return acc;
  }, {});

  const handleCreateProduct = async () => {
    let uploadedFile: { url: string; publicId: string; size: number } | null = null;

    if (pdfFile) {
      try {
        const formData = new FormData();
        formData.append("file", pdfFile);

        const res = await uploadProductFile(formData).unwrap();
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

    const newProduct = {
      name,
      price,
      file: uploadedFile,
      category,
      description,
      type,
    };

    try {
      const result = await createProduct(newProduct);
      if ("error" in result) {
        toast.error("Error creating product");
      } else {
        toast.success("Product created");
        setIsModalOpen(false);
        resetForm();
      }
    } catch {
      toast.error("Failed to create product");
    }
  };

  const resetForm = () => {
    setName("");
    setPrice(undefined);
    setCategory("");
    setDescription("");
    setType("");
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
    toast.success(language === "ar" ? "تم حذف المنتج بنجاح" : "Product deleted successfully");
  };
  const handleUpdateProduct = async (productId: string) => {};

  return (
    <Layout>
      {errorGettingProducts ? (
        <Error />
      ) : loadingProducts ? (
        <Loader />
      ) : (
        <div className="px-4 flex lg:w-4xl flex-col w-full min-h-screen lg:min-h-auto py-3 mt-[70px]">
          {/* Header */}
          <div className="w-full">
            <div className={`flex justify-between items-center flex-wrap gap-3`} dir="rtl">
              <h1
                dir={language === "ar" ? "rtl" : "ltr"}
                className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center flex-wrap">
                {texts[language].products}:
                <Badge icon={false}>
                  <Box />
                  <p className="text-lg lg:text-sm">
                    {productsData?.total ?? 0}{" "}
                    <span className="hidden lg:inline">{texts[language].products}</span>
                  </p>
                </Badge>
              </h1>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-black drop-shadow-[0_0_10px_rgba(24,24,27,0.5)] cursor-pointer hover:bg-black/70 text-white font-bold flex items-center gap-1 text-sm lg:text-md shadow-md px-3 py-2 rounded-md">
                <Plus />
                {texts[language].addProduct}
              </button>
            </div>

            <Separator className="my-4 bg-black/20" />

            {/* ✅ Tabs with grouped products */}
            <Tabs defaultValue={Object.keys(groupedProducts || {})[0]} className="w-full">
              <TabsList className="flex flex-wrap gap-2 bg-gray-100 rounded-lg ">
                {Object.keys(groupedProducts || {}).map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="p-5 uppercase rounded-md text-sm border-black font-medium data-[state=active]:bg-black data-[state=active]:text-white">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(groupedProducts || {}).map(([category, items]: any) => (
                <TabsContent key={category} value={category} className="mt-4">
                  <div className="rounded-lg border lg:p-5 bg-white overflow-x-auto">
                    <table className="w-full lg:min-w-[700px] rounded-lg border-gray-200 text-sm text-left text-gray-700">
                      <thead className="bg-white text-gray-900/50 font-semibold">
                        <tr>
                          <th className="p-4 border-b">{texts[language].name}</th>
                          {/* <th className="px-4 py-3 border-b">{texts[language].price}</th> */}
                          <th className="p-4 border-b ">{texts[language].type}</th>
                          <th className="p-4 border-b ">{texts[language].size}</th>
                          <th className="p-4 border-b text-center">{texts[language].actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {items.map((p: any) => (
                          <tr key={p._id}>
                            <td className="p-4 font-semibold">{p.name}</td>
                            <td className=" font-semibold ">{p.type}</td>
                            <td className=" font-semibold ">
                              {/* File Size */}
                              {p.size && (
                                <span className="text-xs text-gray-400 mt-1 block">
                                  {p.size < 1024 * 1024
                                    ? `${(p.size / 1024).toFixed(2)} KB`
                                    : `${(p.size / 1024 / 1024).toFixed(2)} MB`}
                                </span>
                              )}
                            </td>
                            {/* <td className="px-4 py-4">{p.price ? `${p.price} KD` : "-"}</td> */}
                            <td className="px-4 py-4 flex justify-center gap-2">
                              {p.file?.url && (
                                <a
                                  target="_blank"
                                  href={p.file.url}
                                  download
                                  className="text-black hover:bg-zinc-200 bg-zinc-100  p-2 rounded-md text-sm">
                                  <Download className="h-5 w-5" />
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteProduct(p._id)}
                                className="text-black hover:bg-zinc-200 bg-zinc-100 p-2 rounded-md text-sm">
                                <Trash2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleUpdateProduct(p._id)}
                                className="text-black hover:bg-zinc-200 bg-zinc-100 p-2 rounded-md text-sm">
                                <Edit className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Pagination */}
            <Paginate page={page} pages={pages} setPage={setPage} />
          </div>
        </div>
      )}

      {/* Create product modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="flex flex-col">
          <DialogHeader>
            <DialogTitle>{texts[language].addProduct}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4 space-y-4">
            <input
              type="file"
              accept="application/pdf"
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
            <textarea
              placeholder={texts[language].productDescription}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-2 w-full border rounded-md"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 w-full border rounded-md">
              <option value="" disabled>
                {texts[language].selectCategory}
              </option>
              {tree?.length > 0 && renderCategoryOptions(tree)}
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
              disabled={loadingCreateOrder || loadingUploadImage}
              onClick={handleCreateProduct}>
              {loadingUploadImage
                ? texts[language].uploading
                : loadingCreateOrder
                ? texts[language].creating
                : texts[language].create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

// Recursively render category options for dropdown
const renderCategoryOptions = (nodes: any, level = 0): JSX.Element[] => {
  return nodes.flatMap((node: any) => [
    <option key={node._id} value={node._id}>
      {"‣ ".repeat(level)}
      {node.name}
    </option>,
    ...(node.children ? renderCategoryOptions(node.children, level + 1) : []),
  ]);
};

export default ProductList;
