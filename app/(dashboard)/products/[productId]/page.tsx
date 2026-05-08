import { ProductDetailPage } from "@/features/products/product-detail-page";
import { PermissionGate } from "@/lib/components/PermissionGate";

export default async function ProductDetailRoute({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  return (
    <PermissionGate action="productDev:view">
      <ProductDetailPage productId={productId} />
    </PermissionGate>
  );
}
