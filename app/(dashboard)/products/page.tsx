import { ProductsPage as ProductsPageContent } from "@/features/products/products-page";
import { PermissionGate } from "@/lib/components/PermissionGate";

export default function ProductsPage() {
  return (
    <PermissionGate action="productDev:view">
      <ProductsPageContent />
    </PermissionGate>
  );
}
