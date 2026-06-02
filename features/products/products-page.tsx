"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X, Folder, Copy, ChevronDown, ChevronRight, Grid, List, ArrowRight, Globe, Lock, Cpu, Layers } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

import { createProduct, listProducts, updateProduct } from "@/lib/api/product";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { CreateModelInput, Model } from "@/lib/types/partner";
import { parseJsonInput, parseNumberList } from "@/lib/utils/parsing";
import {
  CheckboxInput,
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
  SearchInput,
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

function getDeviceType(model: Model) {
  if (model.name.toLowerCase().includes("fan")) return "FAN";
  if (model.name.toLowerCase().includes("sensor")) return "SENSOR";
  if (model.name.toLowerCase().includes("repeater")) return "REPEATER";
  if (model.name.toLowerCase().includes("switch")) return "SWITCH";
  return "OTHER";
}

function getProtocol(model: Model) {
  if (model.developmentInfo?.solution === "thirdparty") return "Z2M";
  return "Wile";
}

function getBrandName(brandCode: string | undefined): string {
  if (!brandCode) return "—";
  const code = brandCode.trim().toLowerCase();
  if (code === "0000" || code === "rogo" || code === "rogo_os") return "ROGO";
  if (code === "7267" || code === "thingedu") return "ThingEdu";
  if (code === "fpt") return "FPT";
  if (code === "thingedge") return "ThingEdge";
  return brandCode;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Model[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [statusFilter, setStatusFilter] = useState<"all" | "released" | "developing">("all");

  const [selectedProduct, setSelectedProduct] = useState<Model | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [addressType, setAddressType] = useState("auto");
  const [isPublic, setIsPublic] = useState(false);
  const [baseInfoOpen, setBaseInfoOpen] = useState(true);
  const [partners, setPartners] = useState(["FPT", "THINGEDGE"]);

  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setName(selectedProduct.name || "");
      setDescription(selectedProduct.description || "");
      setIsPublic(selectedProduct.isPublic);
      
      const addrVal = selectedProduct.addressType;
      setAddressType(
        addrVal === 1 ? "from device" : addrVal === 2 ? "from model" : "auto"
      );

      if (selectedProduct.sharePartners && selectedProduct.sharePartners.length > 0) {
        setPartners(selectedProduct.sharePartners.map(p => String(p.partnerId || p.name || "")));
      } else {
        setPartners(["FPT", "THINGEDGE"]);
      }
    }
  }, [selectedProduct]);

  const handleAddPartner = () => {
    if (!newPartnerName.trim()) return;
    if (partners.includes(newPartnerName.trim())) {
      toast.error("Partner already added!");
      return;
    }
    setPartners([...partners, newPartnerName.trim()]);
    setNewPartnerName("");
    setShowAddPartner(false);
    toast.success("Added new share partner!");
  };

  const handleSave = async () => {
    if (!selectedProduct || !partnerId) return;

    try {
      setIsSaving(true);
      
      const payload = {
        partnerId: partnerId,
        modelId: selectedProduct.modelId,
        name: name,
        description: description || undefined,
        addressType: addressType === "from device" ? 1 : addressType === "from model" ? 2 : 0,
        isPublic: isPublic,
        sharePartners: partners.map(p => ({ partnerId: p }))
      };

      await updateProduct(payload);
      toast.success("Product updated successfully in data cloud!");
      setSelectedProduct(null);
      await loadProducts(page);
      void loadAllProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update product.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.modelId.toLowerCase().includes(query) ||
          (p.brand && p.brand.toLowerCase().includes(query))
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => p.releaseStatus === statusFilter);
    }
    return list;
  }, [products, allProducts, searchQuery, statusFilter]);

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

  const loadProducts = useCallback(async (nextPage = page) => {
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
  }, [partnerId, page]);

  const loadAllProducts = useCallback(async () => {
    if (!partnerId) return;
    try {
      const response = await listProducts(partnerId, 1, 9999);
      setAllProducts(response.data);
    } catch (error) {
      console.error("Failed to prefetch all products:", error);
    }
  }, [partnerId]);

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      void loadProducts(page);
      void loadAllProducts();
    };
    void run();
  }, [loadProducts, loadAllProducts, page]);

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
      void loadAllProducts();
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
          <div className="px-6 py-4 border-b border-border-muted flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white">
            <div className="flex flex-wrap items-center gap-4">
              {/* Release Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200/50 shadow-sm">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold font-sans transition-all duration-200",
                    statusFilter === "all"
                      ? "bg-white text-neutral-800 shadow-sm border border-neutral-200/30"
                      : "text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("released")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold font-sans transition-all duration-200",
                    statusFilter === "released"
                      ? "bg-white text-blue-600 shadow-sm border border-neutral-200/30"
                      : "text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  Released
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("developing")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold font-sans transition-all duration-200",
                    statusFilter === "developing"
                      ? "bg-white text-purple-600 shadow-sm border border-neutral-200/30"
                      : "text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  Developing
                </button>
              </div>

              {/* Redesigned Product Count Badge */}
              <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200/40 px-3.5 py-[7px] rounded-xl font-sans font-semibold shadow-sm transition-all duration-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-100 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-300"></span>
                </span>
                <span>
                  <strong className="text-neutral-800 font-extrabold text-[13px]">{filteredProducts.length}</strong> products found
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
              <SearchInput
                placeholder="Search name, ID or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[260px] flex-1 sm:flex-initial"
              />

              {/* Apple-style Segmented Control */}
              <div className="inline-flex p-1 bg-neutral-100 rounded-2xl border border-neutral-200/60">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition-all duration-300",
                    viewMode === "grid"
                      ? "bg-white text-primary-300 shadow-sm border border-neutral-200/40"
                      : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50/50"
                  )}
                >
                  <Grid className="size-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition-all duration-300",
                    viewMode === "table"
                      ? "bg-white text-primary-300 shadow-sm border border-neutral-200/40"
                      : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50/50"
                  )}
                >
                  <List className="size-3.5" />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>

          {viewMode === "grid" ? (
            filteredProducts.length === 0 ? (
              <div className="px-6 py-16 text-center bg-neutral-50/20">
                <p className="text-sm text-neutral-400 font-sans">No products found matching your search.</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))] px-6 py-6 bg-neutral-50/20">
                {filteredProducts.map((product) => (
                  <div
                    key={product.uuid ?? product.modelId}
                    onClick={() => setSelectedProduct(product)}
                    className="group relative flex flex-col w-full bg-white border border-neutral-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-primary-200/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer mx-auto sm:mx-0"
                  >
                    {/* Radial Mesh Backdrop & Image */}
                    <div className="h-[232px] w-full bg-white flex items-end justify-center pt-6 pb-5 px-6 border-b border-neutral-100/60 relative group-hover:bg-neutral-50/50 transition-colors duration-500 overflow-hidden rounded-t-3xl">
                      {/* Radial pattern background */}
                      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 group-hover:scale-110 transition-transform duration-500" />
                      
                      {/* Glass overlays */}
                      <div className="absolute top-3 left-3 z-10">
                        {product.isPublic ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm backdrop-blur-md">
                            <Globe className="size-3 text-emerald-500" /> Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm backdrop-blur-md">
                            <Lock className="size-3 text-amber-500" /> Private
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 z-10">
                        {product.releaseStatus ? (
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-md",
                            product.releaseStatus === "released" 
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/25" 
                              : "bg-purple-500/10 text-purple-600 border-purple-500/25"
                          )}>
                            {product.releaseStatus}
                          </span>
                        ) : null}
                      </div>

                      {/* Product Image */}
                      <img
                        src={product.image || "/product_hub.png"}
                        alt={product.name}
                        className="aspect-square size-[160px] object-contain bg-gradient-to-br from-white via-neutral-50/30 to-[color-mix(in_srgb,var(--brand-primary)_8%,transparent)] border border-[color-mix(in_srgb,var(--brand-primary)_15%,#E5E7EB)] p-3 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.03)] group-hover:scale-105 group-hover:border-[color-mix(in_srgb,var(--brand-primary)_35%,#E5E7EB)] group-hover:shadow-[0_8px_20px_color-mix(in_srgb,var(--brand-primary)_10%,transparent)] transition-all duration-500 ease-out z-1"
                      />
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            "text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded font-sans border",
                            getProtocol(product) === "Z2M"
                              ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                              : "bg-teal-50 text-teal-600 border-teal-100"
                          )}>
                            {getProtocol(product)}
                          </span>
                          {product.brand && (
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded font-sans">
                              {getBrandName(product.brand)}
                            </span>
                          )}
                          <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded font-sans bg-amber-50 text-amber-700 border border-amber-100">
                            {getDeviceType(product)}
                          </span>
                        </div>

                        {/* Title & Copyable Model ID */}
                        <div className="space-y-1">
                          <h4 className="font-bold text-neutral-800 text-[15px] leading-snug group-hover:text-primary-300 transition-colors line-clamp-1">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200/50 w-fit select-all">
                            <span>{product.modelId}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(product.modelId);
                                toast.success("Copied Model ID to clipboard!");
                              }}
                              className="p-0.5 hover:bg-neutral-200/60 rounded text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                              title="Copy Model ID"
                            >
                              <Copy className="size-3" />
                            </button>
                          </div>
                        </div>

                        {/* Tech-Spec Parameter Dashboard */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 bg-neutral-50/50 rounded-xl border border-neutral-100">
                          <div className="space-y-0.5">
                            <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-sans">Category Info</span>
                            <span className="block text-xs font-semibold text-neutral-700 truncate font-mono">
                              {product.categoryInfo.join(", ") || "—"}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-sans">Base Info</span>
                            <span className="block text-xs font-semibold text-neutral-700 truncate font-mono">
                              {product.baseInfo.join(", ") || "—"}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[12px] text-neutral-500 leading-relaxed line-clamp-2 pt-0.5 h-[36px]">
                          {product.description || "No description provided for this model."}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3 border-t border-neutral-100/80 flex items-center justify-between">
                        {/* Pulse Indicator */}
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            {product.isReadyOEM ? (
                              <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                              </>
                            ) : (
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-300"></span>
                            )}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-sans">
                            {product.isReadyOEM ? "OEM Ready" : "No OEM"}
                          </span>
                        </div>

                        {/* Detail Link */}
                        <div className="flex items-center gap-1 text-xs font-bold text-primary-300 group-hover:text-primary-400 transition-colors">
                          <span>Details</span>
                          <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Redesigned Table View */
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm bg-white">
                <thead>
                  <tr className="border-b border-neutral-100 text-[11px] font-bold uppercase tracking-wider text-neutral-400 leading-[18px] font-sans bg-neutral-50/50">
                    <th className="px-6 py-4 text-left">Product / Info</th>
                    <th className="px-6 py-4 text-left hidden md:table-cell">Model ID</th>
                    <th className="px-6 py-4 text-left hidden md:table-cell">Category</th>
                    <th className="px-6 py-4 text-left hidden md:table-cell">Base Info</th>
                    <th className="px-6 py-4 text-left">Release status</th>
                    <th className="px-6 py-4 text-left hidden md:table-cell">Public</th>
                    <th className="px-6 py-4 text-left hidden md:table-cell">OEM ready</th>
                    <th className="py-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-neutral-400 font-sans">
                        No products found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr
                        key={product.uuid ?? product.modelId}
                        onClick={() => setSelectedProduct(product)}
                        className="group border-b border-neutral-100 hover:bg-neutral-50/50 transition-all duration-200 cursor-pointer"
                      >
                        {/* Product Thumbnail Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-neutral-200/60 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover:border-neutral-300 transition-colors">
                              <img
                                src={product.image || "/product_hub.png"}
                                alt={product.name}
                                className="w-full h-full object-contain max-h-8 group-hover:scale-105 transition-transform rounded-full"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-bold text-neutral-800 text-[14px] leading-tight group-hover:text-primary-300 transition-colors">{product.name}</div>
                              <div className="text-[10px] font-sans flex gap-1.5 items-center mt-3.5">
                                <span className={cn(
                                  "font-extrabold px-1.5 py-0.5 rounded text-[10px] uppercase border -ml-1",
                                  getProtocol(product) === "Z2M"
                                    ? "bg-indigo-50 text-indigo-600 border-indigo-100/50"
                                    : "bg-teal-50 text-teal-600 border-teal-100/50"
                                )}>
                                  {getProtocol(product)}
                                </span>
                                {product.brand && (
                                  <span className="bg-neutral-50 text-neutral-600 border border-neutral-200/60 font-extrabold px-1.5 py-0.5 rounded text-[10px] uppercase">
                                    {getBrandName(product.brand)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-neutral-600 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 w-fit">
                            <span>{product.modelId}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(product.modelId);
                                toast.success("Copied Model ID to clipboard!");
                              }}
                              className="p-0.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                              title="Copy Model ID"
                            >
                              <Copy className="size-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-neutral-600 font-mono whitespace-nowrap hidden md:table-cell">{product.categoryInfo.join(", ") || "—"}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-neutral-600 font-mono whitespace-nowrap hidden md:table-cell">{product.baseInfo.join(", ") || "—"}</td>
                        <td className="px-6 py-4">
                          {product.releaseStatus ? (
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                              product.releaseStatus === "released" 
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20" 
                                : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                            )}>
                              {product.releaseStatus}
                            </span>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-neutral-600 text-xs hidden md:table-cell">
                          {product.isPublic ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1"><Globe className="size-3.5" /> Yes</span>
                          ) : (
                            <span className="text-neutral-400 font-medium">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className="relative flex h-1.5 w-1.5">
                              {product.isReadyOEM ? (
                                <>
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </>
                              ) : (
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neutral-300"></span>
                              )}
                            </span>
                            <span className="text-xs font-semibold text-neutral-600">
                              {product.isReadyOEM ? "Yes" : "No"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(product)}
                            className="inline-flex h-[34px] items-center justify-center rounded-full border border-neutral-200 bg-white px-3.5 py-1 text-xs font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:border-neutral-300 font-sans cursor-pointer group-hover:text-primary-300 group-hover:border-primary-200/50"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!searchQuery.trim() && (
            <div className="px-6 py-4 flex items-center justify-between text-sm text-neutral-500 border-t border-neutral-100 bg-white">
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
          )}
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
            <CheckboxInput {...createForm.register("isPublic")} />
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

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-4 sm:px-8 py-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-start border-b border-neutral-100">
              <div className="space-y-1">
                <h3 className="text-[24px] font-bold text-neutral-900 tracking-tight font-sans break-all">
                  {selectedProduct.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-neutral-500 font-mono flex-wrap">
                  <span className="break-all">{selectedProduct.modelId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedProduct.modelId);
                      toast.success("Copied Model ID to clipboard!");
                    }}
                    className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600 transition shrink-0"
                    title="Copy Model ID"
                  >
                    <Copy className="size-4" />
                  </button>
                </div>
                <div className="pt-2">
                  <a href="#" className="inline-flex items-center gap-1.5 text-xs text-primary-300 hover:underline font-semibold font-sans">
                    <Folder className="size-4 text-primary-300" /> Show OTA folder
                  </a>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedProduct(null)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white rounded-md hover:bg-neutral-50 text-sm font-semibold text-neutral-700 transition shrink-0 self-end sm:self-start w-full sm:w-auto"
              >
                <X className="size-4" /> Close
              </button>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Image and Specs */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Product Image Frame */}
                  <div className="w-full h-[210px] bg-white rounded-[2rem] border border-neutral-200/60 p-5 flex items-center justify-center relative overflow-hidden shadow-sm">
                    {/* Radial dot mesh background */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-40" />
                    
                    <img
                      src={selectedProduct.image || "/product_hub.png"}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain max-h-[150px] rounded-[1.5rem] drop-shadow-md relative z-1"
                    />
                  </div>

                  {/* Hardware Spec Panel */}
                  <div className="bg-neutral-50/50 border border-neutral-200/60 rounded-3xl p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-sans border-b border-neutral-200/60 pb-2 flex items-center gap-1.5">
                      <Cpu className="size-3.5 animate-pulse text-primary-300" /> Hardware Specs
                    </h4>

                    {/* Protocol */}
                    <div className="flex items-center justify-between text-sm py-0.5">
                      <span className="font-semibold text-neutral-500 font-sans">Protocol</span>
                      <span className={cn(
                        "text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full font-mono border",
                        getProtocol(selectedProduct) === "Z2M"
                          ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                          : "bg-teal-50 text-teal-600 border-teal-100"
                      )}>
                        {getProtocol(selectedProduct)}
                      </span>
                    </div>

                    {/* Device Type */}
                    <div className="flex items-center justify-between text-sm py-0.5">
                      <span className="font-semibold text-neutral-500 font-sans">Device Type</span>
                      <span className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full font-mono bg-amber-50 text-amber-700 border border-amber-100">
                        {getDeviceType(selectedProduct)}
                      </span>
                    </div>

                    {/* Address Type */}
                    <div className="flex items-center justify-between text-sm py-0.5">
                      <span className="font-semibold text-neutral-500 font-sans">Address Type</span>
                      <select
                        value={addressType}
                        onChange={(e) => setAddressType(e.target.value)}
                        className="px-2.5 py-1 border border-neutral-200 shadow-sm rounded-xl bg-white text-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-primary-300 font-sans font-bold cursor-pointer transition"
                      >
                        <option value="auto">auto</option>
                        <option value="from device">from device</option>
                        <option value="from model">from model</option>
                      </select>
                    </div>

                    {/* Product Type */}
                    <div className="flex items-center justify-between text-sm py-0.5">
                      <span className="font-semibold text-neutral-500 font-sans">Visibility</span>
                      <div className="inline-flex bg-neutral-100 p-0.5 rounded-xl border border-neutral-200/60 overflow-hidden text-[10px] font-bold shadow-sm">
                        <button
                          type="button"
                          onClick={() => setIsPublic(true)}
                          className={cn(
                            "px-3 py-1 rounded-[10px] transition-all cursor-pointer",
                            isPublic ? "bg-white text-neutral-800 shadow-sm border border-neutral-200/10" : "text-neutral-500 hover:text-neutral-700"
                          )}
                        >
                          Public
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPublic(false)}
                          className={cn(
                            "px-3 py-1 rounded-[10px] transition-all cursor-pointer",
                            !isPublic ? "bg-white text-neutral-800 shadow-sm border border-neutral-200/10" : "text-neutral-500 hover:text-neutral-700"
                          )}
                        >
                          Private
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Information Forms and Partners */}
                <div className="lg:col-span-7 space-y-6">
                  {/* General Information Card */}
                  <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 space-y-5 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-sans border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                      <Layers className="size-3.5 text-primary-300" /> General Information
                    </h4>

                    {/* Product Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-sans">Product Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-neutral-50/30 text-neutral-800 text-sm focus:outline-none focus:ring-1 focus:ring-primary-300 font-sans font-semibold transition"
                      />
                    </div>

                    {/* Product Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-sans">Product Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="Provide a description for this product model..."
                        className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-neutral-50/30 text-neutral-800 text-sm focus:outline-none focus:ring-1 focus:ring-primary-300 font-sans transition resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Share Partners Card */}
                  <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 space-y-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-sans flex items-center gap-1.5">
                        <Folder className="size-3.5 text-primary-300" /> Share Partners
                      </h4>
                      <span className="text-[10px] text-[#ea4335] font-extrabold uppercase tracking-wide">
                        Check before submitting
                      </span>
                    </div>

                    <div className="space-y-3 w-full">
                      {/* Partners List Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {partners.map((partner) => (
                          <div
                            key={partner}
                            className="flex items-center justify-between px-3.5 py-2.5 border border-neutral-200/60 rounded-xl bg-white hover:bg-neutral-50/30 transition shadow-sm"
                          >
                            <span className="text-xs font-bold text-neutral-800 font-sans">{partner}</span>
                            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase font-sans">
                              <button
                                type="button"
                                onClick={() => {
                                  setPartners(partners.filter(p => p !== partner));
                                  toast.success(`Removed partner ${partner}`);
                                }}
                                className="text-[#ea4335] hover:underline cursor-pointer"
                              >
                                remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Partner Trigger */}
                      {showAddPartner ? (
                        <div className="flex gap-2 w-full mt-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/50">
                          <input
                            type="text"
                            value={newPartnerName}
                            onChange={(e) => setNewPartnerName(e.target.value)}
                            placeholder="Enter partner ID..."
                            className="flex-1 px-3 py-1.5 border border-neutral-200 rounded-xl text-xs font-sans focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleAddPartner}
                            className="px-3 py-1.5 bg-[#3aa757] text-white rounded-xl text-[10px] font-bold hover:bg-[#2f8c47] transition uppercase cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddPartner(false);
                              setNewPartnerName("");
                            }}
                            className="px-3 py-1.5 border border-neutral-200 rounded-xl text-[10px] font-bold hover:bg-neutral-50 transition uppercase text-neutral-500 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowAddPartner(true)}
                          className="w-full py-2.5 border border-dashed border-neutral-300 rounded-2xl hover:border-neutral-400 hover:bg-neutral-50/50 text-neutral-500 font-extrabold text-[11px] uppercase tracking-wider flex justify-center items-center gap-1 transition shadow-sm cursor-pointer"
                        >
                          Add Partner +
                        </button>
                      )}

                      {partners.length === 0 && !showAddPartner && (
                        <p className="text-xs text-neutral-400 font-sans italic text-center py-2">No partners shared.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer / Action panel */}
            <div className="px-4 sm:px-8 py-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 border border-neutral-200 rounded-md text-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition font-sans disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-4 py-2 bg-[#3aa757] text-white hover:bg-[#2f8c47] rounded-md text-sm font-semibold transition font-sans disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
