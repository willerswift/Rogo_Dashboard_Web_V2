"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  deleteProduct,
  getProduct,
  listModelDevices,
  releaseProduct,
  updateProduct,
} from "@/lib/api/product";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { DeviceListResponse, Model, UpdateModelInput } from "@/lib/types/partner";
import { parseJsonInput, parseNumberList, stringifyJson } from "@/lib/utils/parsing";
import {
  Field,
  JsonBlock,
  LoadingBlock,
  Notice,
  Panel,
  PrimaryButton,
  SecondaryButton,
  TextArea,
  TextInput,
} from "@/features/shared/ui";

const updateProductSchema = z.object({
  name: z.string().min(1, "Name is required."),
  image: z.string().min(1, "Image is required."),
  isPublic: z.boolean(),
  description: z.string().optional(),
  brand: z.string().optional(),
  ownership: z.string().optional(),
  baseInfo: z.string().optional(),
  extraInfo: z.string().optional(),
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
  releaseStatus: z.string(),
});

type UpdateProductValues = z.infer<typeof updateProductSchema>;

function buildUpdatePayload(partnerId: string, productId: string, values: UpdateProductValues): UpdateModelInput {
  return {
    partnerId,
    modelId: productId,
    name: values.name,
    image: values.image,
    isPublic: Boolean(values.isPublic),
    description: values.description || undefined,
    brand: values.brand || undefined,
    ownership: values.ownership || undefined,
    baseInfo: parseNumberList(values.baseInfo || ""),
    extraInfo: parseJsonInput(values.extraInfo || "{}", {}),
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

export function ProductDetailPage({ productId }: { productId: string }) {
  const { session } = usePartnerContext();
  const canEdit = usePermission("productDev:edit");
  const partnerId = session.activePartnerId;
  const router = useRouter();
  const [product, setProduct] = useState<Model | null>(null);
  const [devices, setDevices] = useState<DeviceListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [devicePage, setDevicePage] = useState(1);

  const form = useForm<UpdateProductValues>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: "",
      image: "",
      isPublic: false,
      description: "",
      brand: "",
      ownership: "",
      baseInfo: "",
      extraInfo: "{}",
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
      releaseStatus: "releasing",
    },
  });

  const loadProduct = useCallback(async (nextDevicePage = devicePage) => {
    if (!partnerId) {
      return;
    }

    try {
      setLoading(true);
      const [nextProduct, nextDevices] = await Promise.all([
        getProduct(partnerId, productId),
        listModelDevices(partnerId, productId, nextDevicePage, 20),
      ]);
      setProduct(nextProduct);
      setDevices(nextDevices);
      form.reset({
        name: nextProduct.name,
        image: nextProduct.image ?? "",
        isPublic: nextProduct.isPublic,
        description: nextProduct.description ?? "",
        brand: nextProduct.brand ?? "",
        ownership: nextProduct.ownership ?? "",
        baseInfo: nextProduct.baseInfo.join(", "),
        extraInfo: stringifyJson(nextProduct.extraInfo ?? {}),
        developmentInfo: stringifyJson(nextProduct.developmentInfo ?? {}),
        wrapFeatures: (nextProduct.wrapFeatures ?? []).join(", "),
        addressType: nextProduct.addressType?.toString() ?? "",
        typeIdentify: nextProduct.typeIdentify?.toString() ?? "",
        msgDecoder: nextProduct.msgDecoder ?? "",
        msgEncoder: nextProduct.msgEncoder ?? "",
        urlImg: nextProduct.urlImg ?? "",
        urlIcon: nextProduct.urlIcon ?? "",
        urlIconDark: nextProduct.urlIconDark ?? "",
        metaData: stringifyJson(nextProduct.metaData ?? {}),
        releaseStatus: nextProduct.releaseStatus ?? "releasing",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load product detail.");
    } finally {
      setLoading(false);
    }
  }, [partnerId, productId, devicePage, form]);

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      void loadProduct(devicePage);
    };
    void run();
  }, [loadProduct, devicePage]);

  const handleSave = form.handleSubmit(async (values) => {
    if (!partnerId) {
      return;
    }

    try {
      await updateProduct(buildUpdatePayload(partnerId, productId, values));
      toast.success("Product updated.");
      await loadProduct(devicePage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update product.");
    }
  });

  const handleRelease = async () => {
    if (!partnerId) {
      return;
    }

    try {
      const releaseStatus = form.getValues("releaseStatus") || "releasing";
      await releaseProduct(partnerId, { modelId: productId, releaseStatus });
      toast.success("Release endpoint invoked.");
      await loadProduct(devicePage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to release product.");
    }
  };

  const handleDelete = async () => {
    if (!partnerId || !window.confirm(`Delete product ${productId}?`)) {
      return;
    }

    try {
      await deleteProduct({ partnerId, modelId: productId });
      toast.success("Product deleted.");
      router.push("/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product.");
    }
  };

  if (loading) {
    return <LoadingBlock label="Loading product detail..." />;
  }

  if (!product) {
    return <Notice tone="error">Product detail was not returned for the active partner.</Notice>;
  }

  return (
    <div className="space-y-6">
      <Panel title={product.name} description={`Product ${product.modelId}`}>
        <JsonBlock value={product} />
      </Panel>

      {canEdit ? (
        <Panel
          title="Edit product"
          description="UpdateModelDto requires partnerId and modelId, then accepts a partial subset of product metadata fields."
        >
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
            <Field label="Name" error={form.formState.errors.name?.message}>
              <TextInput invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
            </Field>
            <Field label="Image" error={form.formState.errors.image?.message}>
              <TextInput invalid={Boolean(form.formState.errors.image)} {...form.register("image")} />
            </Field>
            <label className="inline-flex items-center gap-3 text-sm text-zinc-700">
              <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" {...form.register("isPublic")} />
              Public model
            </label>
            <Field label="Release status input">
              <TextInput {...form.register("releaseStatus")} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <TextArea rows={3} {...form.register("description")} />
              </Field>
            </div>
            <Field label="Brand">
              <TextInput {...form.register("brand")} />
            </Field>
            <Field label="Ownership">
              <TextInput {...form.register("ownership")} />
            </Field>
            <Field label="baseInfo (comma-separated ints)">
              <TextInput {...form.register("baseInfo")} />
            </Field>
            <Field label="wrapFeatures (comma-separated ints)">
              <TextInput {...form.register("wrapFeatures")} />
            </Field>
            <Field label="addressType">
              <TextInput {...form.register("addressType")} />
            </Field>
            <Field label="typeIdentify">
              <TextInput {...form.register("typeIdentify")} />
            </Field>
            <Field label="msgDecoder">
              <TextInput {...form.register("msgDecoder")} />
            </Field>
            <Field label="msgEncoder">
              <TextInput {...form.register("msgEncoder")} />
            </Field>
            <Field label="urlImg">
              <TextInput {...form.register("urlImg")} />
            </Field>
            <Field label="urlIcon">
              <TextInput {...form.register("urlIcon")} />
            </Field>
            <Field label="urlIconDark">
              <TextInput {...form.register("urlIconDark")} />
            </Field>
            <div className="md:col-span-2">
              <Field label="extraInfo JSON">
                <TextArea rows={8} {...form.register("extraInfo")} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="developmentInfo JSON">
                <TextArea rows={8} {...form.register("developmentInfo")} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="metaData JSON">
                <TextArea rows={8} {...form.register("metaData")} />
              </Field>
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-2">
              <PrimaryButton type="submit" loading={form.formState.isSubmitting}>
                Save product
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => void handleRelease()}>
                Invoke release endpoint
              </SecondaryButton>
              <SecondaryButton type="button" onClick={() => void handleDelete()}>
                Delete product
              </SecondaryButton>
            </div>
          </form>
          <Notice tone="warn">
            The backend currently ignores the provided releaseStatus and coerces release calls toward a released state. This UI keeps the input visible so you can verify that mismatch directly.
          </Notice>
        </Panel>
      ) : null}

      <Panel title="Registered devices" description="GET /partner/product-admin/modeldevices/:partnerId/:productId">
        {devices?.data?.length ? <JsonBlock value={devices.data} /> : <Notice>No devices were returned for this product.</Notice>}
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <span>
            Page {devices?.page ?? devicePage} of {devices?.totalPage ?? 1}
          </span>
          <div className="flex gap-2">
            <SecondaryButton type="button" disabled={devicePage <= 1} onClick={() => setDevicePage((current) => current - 1)}>
              Previous
            </SecondaryButton>
            <SecondaryButton
              type="button"
              disabled={Boolean(devices && devicePage >= (devices.totalPage || 1))}
              onClick={() => setDevicePage((current) => current + 1)}
            >
              Next
            </SecondaryButton>
          </div>
        </div>
      </Panel>
    </div>
  );
}
