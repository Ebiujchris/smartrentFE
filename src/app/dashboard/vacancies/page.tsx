"use client";

import { useState, useEffect } from "react";
import { Plus, Home, MapPin, Eye, Trash2, Loader2, ExternalLink, ChevronLeft, ChevronRight, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { vacantListingService, VacantListing } from "@/services/vacant-listing.service";
import { propertyService, Property } from "@/services/property.service";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import CreateVacancyModal from "@/components/vacancies/CreateVacancyModal";
import { toast } from "sonner";
import Link from "next/link";

export default function VacanciesPage() {
  const [listings, setListings] = useState<VacantListing[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { subscription, fetchSubscription } = useSubscriptionStore();

  // Check if user has access to vacancy feature (Professional or Premium only)
  const hasVacancyAccess = subscription?.plan === 'PROFESSIONAL' || subscription?.plan === 'PREMIUM';

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const fetchData = async () => {
    if (!hasVacancyAccess) return;
    
    setIsLoading(true);
    try {
      const [listingsData, propertiesData] = await Promise.all([
        vacantListingService.getMyListings(),
        propertyService.getAll(),
      ]);
      setListings(listingsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load vacancies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;
    
    setIsDeleting(id);
    try {
      await vacantListingService.deleteListing(id);
      toast.success("Listing removed");
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      toast.error("Failed to delete listing");
    } finally {
      setIsDeleting(null);
    }
  };

  const openGallery = (images: string[]) => {
    setGalleryImages(images);
    setCurrentImageIndex(0);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setGalleryImages([]);
    setCurrentImageIndex(0);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    fetchData();
  }, [hasVacancyAccess]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!galleryOpen) return;
      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryOpen]);

  // Flatten units from properties and map to the required interface for the modal
  const allUnits = properties.flatMap((p) => 
    (p.units || []).map((u) => ({
      id: u.id,
      unitNumber: u.unitNumber,
      rentAmount: Number(u.rentAmount),
      status: u.status,
      property: {
        name: p.name,
        address: p.address,
      }
    }))
  );

  // Show upgrade prompt if user doesn't have access
  if (!hasVacancyAccess) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card className="max-w-2xl mx-auto mt-12 border-2 border-emerald-100">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <Lock className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Upgrade to Access Vacancy Advertising
            </h2>
            <p className="text-slate-600 max-w-md mb-8">
              The vacancy advertising feature is available on Professional and Premium plans. 
              Advertise your vacant units publicly to attract more tenants.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                asChild
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Link href="/dashboard/subscription">
                  View Subscription Plans
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                className="border-slate-200"
              >
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <div className="mt-8 p-4 bg-slate-50 rounded-lg max-w-md">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Current Plan:</span> {subscription?.plan || 'Starter'} Plan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Vacancy Advertisements
          </h1>
          <p className="text-slate-500">
            Manage your public listings for vacant units to attract tenants.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Advertise Unit
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : listings.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No active advertisements
            </h3>
            <p className="text-slate-500 max-w-sm mb-6">
              You haven't created any public listings for your vacant units yet.
            </p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              Create Your First Ad
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden shadow-sm flex flex-col group border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="relative h-48 w-full bg-slate-100 border-b border-slate-100 cursor-pointer" onClick={() => listing.images && listing.images.length > 0 && openGallery(listing.images)}>
                {listing.images && listing.images.length > 0 ? (
                  <>
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                      <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">{listing.images.length} photo{listing.images.length > 1 ? 's' : ''}</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Home className="h-10 w-10 opacity-30" />
                  </div>
                )}
                <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm
                  ${listing.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}
                `}>
                  {listing.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="mb-2">
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{listing.title}</h3>
                  <div className="text-sm font-medium text-emerald-600">
                    UGX {listing.unit.rentAmount.toLocaleString()} / mo
                  </div>
                </div>
                
                <div className="flex items-center text-slate-500 text-sm mb-4">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{listing.unit.property.address}</span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center text-slate-500 text-sm" title="Total Views">
                    <Eye className="h-4 w-4 mr-1.5" />
                    {listing.viewCount} views
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                      asChild
                    >
                      <Link href={`/houses-for-rent`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(listing.id)}
                      disabled={isDeleting === listing.id}
                    >
                      {isDeleting === listing.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateVacancyModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          units={allUnits}
          onSuccess={fetchData}
        />
      )}

      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeGallery}>
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 text-white hover:text-slate-300 z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-slate-300 z-10 bg-black/50 rounded-full p-2"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-slate-300 z-10 bg-black/50 rounded-full p-2"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <img
              src={galleryImages[currentImageIndex]}
              alt={`Photo ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {galleryImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
