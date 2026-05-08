import { apiClient } from "@/lib/api/client";
import type {
  CreateModelInput,
  DeleteModelInput,
  DeleteModelResponse,
  DeviceListResponse,
  Model,
  ProductListResponse,
  ReleaseModelInput,
  UpdateModelInput,
} from "@/lib/types/partner";

export function listProducts(partnerId: string, page = 1, size = 20) {
  return apiClient<ProductListResponse>(
    `/api/partner/product/list/${partnerId}?page=${page}&size=${size}`,
  );
}

export function getProduct(partnerId: string, productId: string) {
  return apiClient<Model>(`/api/partner/product/${partnerId}/${productId}`);
}

export function createProduct(payload: CreateModelInput) {
  return apiClient<Model>("/api/partner/product-admin/create", {
    method: "POST",
    body: payload,
  });
}

export function updateProduct(payload: UpdateModelInput) {
  return apiClient<Model>("/api/partner/product/edit", {
    method: "POST",
    body: payload,
  });
}

export function releaseProduct(partnerId: string, payload: ReleaseModelInput) {
  return apiClient<{ modelId: string }>(`/api/partner/product-admin/release/${partnerId}`, {
    method: "POST",
    body: payload,
  });
}

export function deleteProduct(payload: DeleteModelInput) {
  return apiClient<DeleteModelResponse>("/api/partner/product-admin/delete", {
    method: "POST",
    body: payload,
  });
}

export function listModelDevices(partnerId: string, productId: string, page = 1, size = 20) {
  return apiClient<DeviceListResponse>(
    `/api/partner/product-admin/modeldevices/${partnerId}/${productId}?page=${page}&size=${size}`,
  );
}
