import { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ProductCard } from '@/components/ProductCard';
import { equipmentData, servicesData } from '@/data/products';

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [equipmentPage, setEquipmentPage] = useState(1);
  const [servicesPage, setServicesPage] = useState(1);

  const equipmentTotalPages = Math.ceil(equipmentData.length / ITEMS_PER_PAGE);
  const servicesTotalPages = Math.ceil(servicesData.length / ITEMS_PER_PAGE);

  const getPaginatedProducts = (data: typeof equipmentData, page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number, setter: (page: number) => void) => {
    setter(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void
  ) => {
    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={
                currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <Layout>
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Products</h1>
        <p className="text-muted-foreground text-lg">
          Explore our range of farming equipment and professional services
        </p>
      </div>

      <Tabs defaultValue="equipment" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="equipment" className="text-lg">
            🛠️ Equipment
          </TabsTrigger>
          <TabsTrigger value="services" className="text-lg">
            ⚙️ Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="mt-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-2">Farming Equipment</h2>
            <p className="text-muted-foreground">
              High-quality tools and equipment for all your farming needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {getPaginatedProducts(equipmentData, equipmentPage).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {renderPagination(equipmentPage, equipmentTotalPages, (p) => handlePageChange(p, setEquipmentPage))}
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-2">Professional Services</h2>
            <p className="text-muted-foreground">
              Expert services to help you succeed in urban farming
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {getPaginatedProducts(servicesData, servicesPage).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {renderPagination(servicesPage, servicesTotalPages, (p) => handlePageChange(p, setServicesPage))}
        </TabsContent>
      </Tabs>
    </div>
    </Layout>
  );
}
