"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createProduct, listProducts } from "@/lib/api/product";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { CreateModelInput, Model } from "@/lib/types/partner";
import { parseJsonInput, parseNumberList } from "@/lib/utils/parsing";
import {
  EmptyState,
  Field,
  LoadingBlock,
  Modal,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  TextArea,
  TextInput,
} from "@/features/shared/ui";

const createProductSchema = z.object({
  modelId: z.string().min(1, "modelId is required."),
  name: z.string().min(1, "Name is required."),
  baseInfo: z.string().min(1, "baseInfo is required."),
  categoryInfo: z.string().min(1, "categoryInfo is required."),
  extraInfo: z.string().min(1, "extraInfo JSON is required."),
  image: z.string().min(1, "Image is required."),
  isPublic: z.boolean(),
  description: z.string().optional(),
  brand: z.string().optional(),
  ownership: z.string().optional(),
  developmentInfo: z.string().optional(),
  wrapFeatures: z.string().optional(),
  addressType: z.string().optional(),
  typeIdentify: z.string().optional(),
  msgDecoder: z.string().optional(),
  msgEncoder: z.string().optional(),
  urlImg: z.string().optional(),
  urlIcon: z.string().optional(),
  urlIconDark: z.string().optional(),
  metaData: z.string().optional(),
});

type CreateProductValues = z.infer<typeof createProductSchema>;

function buildCreatePayload(partnerId: string, values: CreateProductValues): CreateModelInput {
  return {
    partnerId,
    modelId: values.modelId,
    name: values.name,
    baseInfo: parseNumberList(values.baseInfo),
    categoryInfo: parseNumberList(values.categoryInfo),
    extraInfo: parseJsonInput(values.extraInfo, {}),
    image: values.image,
    isPublic: Boolean(values.isPublic),
    description: values.description || undefined,
    brand: values.brand || undefined,
    ownership: values.ownership || undefined,
    developmentInfo: parseJsonInput(values.developmentInfo || "{}", {}),
    wrapFeatures: parseNumberList(values.wrapFeatures || ""),
    addressType: values.addressType ? Number(values.addressType) : undefined,
    typeIdentify: values.typeIdentify ? Number(values.typeIdentify) : undefined,
    msgDecoder: values.msgDecoder || undefined,
    msgEncoder: values.msgEncoder || undefined,
    urlImg: values.urlImg || undefined,
    urlIcon: values.urlIcon || undefined,
    urlIconDark: values.urlIconDark || undefined,
    metaData: parseJsonInput(values.metaData || "{}", {}),
  };
}

export function ProductsPage() {
  const { session } = usePartnerContext();
  const canEdit = usePermission("productDev:edit");
  const partnerId = session.activePartnerId;
  const [products, setProducts] = useState<Model[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const createForm = useForm<CreateProductValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      modelId: "",
      name: "",
      baseInfo: "",
      categoryInfo: "",
      extraInfo: "{}",
      image: "",
      isPublic: false,
      description: "",
      brand: "",
      ownership: "",
      developmentInfo: "{}",
      wrapFeatures: "",
      addressType: "",
      typeIdentify: "",
      msgDecoder: "",
      msgEncoder: "",
      urlImg: "",
      urlIcon: "",
      urlIconDark: "",
      metaData: "{}",
    },
  });

  async function loadProducts(nextPage = page) {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await listProducts(partnerId, nextPage, 20);
      setProducts(response.data);
      setTotalPage(response.totalPage || 1);
      setPage(response.page || nextPage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts(page);
  }, [partnerId, page]);

  const handleCreate = createForm.handleSubmit(async (values) => {
    if (!partnerId) {
      return;
    }

    try {
      await createProduct(buildCreatePayload(partnerId, values));
      toast.success("Product created.");
      setShowCreate(false);
      createForm.reset({
        modelId: "",
        name: "",
        baseInfo: "",
        categoryInfo: "",
        extraInfo: "{}",
        image: "",
        isPublic: false,
        description: "",
        brand: "",
        ownership: "",
        developmentInfo: "{}",
        wrapFeatures: "",
        addressType: "",
        typeIdentify: "",
        msgDecoder: "",
        msgEncoder: "",
        urlImg: "",
        urlIcon: "",
        urlIconDark: "",
        metaData: "{}",
      });
      await loadProducts(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create product.");
    }
  });

  return (
    <div className="space-y-6">
      <Panel
        title="Products"
        description="Device models available to the active partner."
        action={
          canEdit ? (
            <PrimaryButton type="button" onClick={() => setShowCreate(true)}>
              + Create
            </PrimaryButton>
          ) : undefined
        }
      >
        {loading ? (
          <LoadingBlock label="Loading products..." />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" description="Create a product using the button above." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="pb-3 pr-4 font-medium">Model ID</th>
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Release status</th>
                    <th className="pb-3 pr-4 font-medium">Public</th>
                    <th className="pb-3 pr-4 font-medium">OEM ready</th>
                    <th className="pb-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.uuid ?? product.modelId} className="border-b border-zinc-100">
                      <td className="py-3 pr-4 font-medium text-zinc-900">{product.modelId}</td>
                      <td className="py-3 pr-4 text-zinc-600">{product.name}</td>
                      <td className="py-3 pr-4 text-zinc-600">{product.categoryInfo.join(", ") || "—"}</td>
                      <td className="py-3 pr-4">
                        {product.releaseStatus ? <StatusBadge value={product.releaseStatus} /> : <span className="text-zinc-400">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-zinc-600">{product.isPublic ? "Yes" : "No"}</td>
                      <td className="py-3 pr-4 text-zinc-600">{product.isReadyOEM ? "Yes" : "No"}</td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/products/${product.modelId}`}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
              <span>Page {page} of {Math.max(totalPage, 1)}</span>
              <div className="flex gap-2">
                <SecondaryButton type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                  Previous
                </SecondaryButton>
                <SecondaryButton type="button" disabled={page >= totalPage} onClick={() => setPage((current) => current + 1)}>
                  Next
                </SecondaryButton>
              </div>
            </div>
          </>
        )}
      </Panel>

      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); createForm.reset(); }}
        title="Create product"
        wide
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <Field label="Model ID" error={createForm.formState.errors.modelId?.message}>
            <TextInput invalid={Boolean(createForm.formState.errors.modelId)} {...createForm.register("modelId")} />
          </Field>
          <Field label="Name" error={createForm.formState.errors.name?.message}>
            <TextInput invalid={Boolean(createForm.formState.errors.name)} {...createForm.register("name")} />
          </Field>
          <Field label="Image URL" error={createForm.formState.errors.image?.message}>
            <TextInput invalid={Boolean(createForm.formState.errors.image)} {...createForm.register("image")} />
          </Field>
          <label className="inline-flex items-center gap-3 text-sm text-zinc-700">
            <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" {...createForm.register("isPublic")} />
            Public model
          </label>
          <Field label="Base info (comma-separated numbers)" error={createForm.formState.errors.baseInfo?.message}>
            <TextInput invalid={Boolean(createForm.formState.errors.baseInfo)} {...createForm.register("baseInfo")} />
          </Field>
          <Field label="Category info (comma-separated numbers)" error={createForm.formState.errors.categoryInfo?.message}>
            <TextInput invalid={Boolean(createForm.formState.errors.categoryInfo)} {...createForm.register("categoryInfo")} />
          </Field>
          <Field label="Brand">
            <TextInput {...createForm.register("brand")} />
          </Field>
          <Field label="Ownership">
            <TextInput {...createForm.register("ownership")} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <TextArea rows={2} {...createForm.register("description")} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Extra info (JSON)" error={createForm.formState.errors.extraInfo?.message}>
              <TextArea rows={5} invalid={Boolean(createForm.formState.errors.extraInfo)} {...createForm.register("extraInfo")} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Development info (JSON)">
              <TextArea rows={4} {...createForm.register("developmentInfo")} />
            </Field>
          </div>
          <Field label="Wrap features (comma-separated numbers)">
            <TextInput {...createForm.register("wrapFeatures")} />
          </Field>
          <Field label="Address type">
            <TextInput type="number" {...createForm.register("addressType")} />
          </Field>
          <Field label="Type identify">
            <TextInput type="number" {...createForm.register("typeIdentify")} />
          </Field>
          <Field label="Message decoder">
            <TextInput {...createForm.register("msgDecoder")} />
          </Field>
          <Field label="Message encoder">
            <TextInput {...createForm.register("msgEncoder")} />
          </Field>
          <Field label="Image URL (urlImg)">
            <TextInput {...createForm.register("urlImg")} />
          </Field>
          <Field label="Icon URL">
            <TextInput {...createForm.register("urlIcon")} />
          </Field>
          <Field label="Icon URL (dark)">
            <TextInput {...createForm.register("urlIconDark")} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Metadata (JSON)">
              <TextArea rows={4} {...createForm.register("metaData")} />
            </Field>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <PrimaryButton type="submit" loading={createForm.formState.isSubmitting}>
              Create product
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => { setShowCreate(false); createForm.reset(); }}>
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
