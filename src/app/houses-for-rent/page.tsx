'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Home, MapPin, Bed, Bath, Phone, Mail, ArrowLeft, Search, Loader2 } from 'lucide-react';
import { vacantListingService, VacantListing } from '@/services/vacant-listing.service';
import { toast } from 'sonner';

export default function HousesForRentPage() {
  const [listings, setListings] = useState<VacantListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchListings();
  }, [debouncedSearch]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const data = await vacantListingService.getAllPublicListings({
        location: debouncedSearch || undefined,
      });
      setListings(data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to load houses for rent');
    } finally {
      setIsLoading(false);
    }
  };

  const incrementView = async (id: string) => {
    try {
      await vacantListingService.incrementViewCount(id);
    } catch (error) {
      // Silently fail view count increment
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-md">
              <Home className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">SmartRentUG</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back Home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:px-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Houses for Rent</h1>
            <p className="text-slate-600 text-lg">Find your next perfect home directly from verified landlords.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by location..."
              className="pl-10 h-12 rounded-full border-slate-200 bg-white shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No houses found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We couldn't find any available houses matching your search. Please try a different location or check back later.
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow flex flex-col group bg-white">
                <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                  {listing.images && listing.images.length > 0 ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
                      <Home className="h-12 w-12 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                    Available
                  </div>
                </div>
                
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-2 leading-tight">
                      {listing.title}
                    </h3>
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald-600">
                        UGX {listing.unit.rentAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">per month</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-slate-500 mb-4 text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{listing.unit.property.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {listing.unit.bedrooms !== undefined && listing.unit.bedrooms !== null && (
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1.5 text-slate-400" />
                        <span className="font-medium">{listing.unit.bedrooms} Bed</span>
                      </div>
                    )}
                    {listing.unit.bathrooms !== undefined && listing.unit.bathrooms !== null && (
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1.5 text-slate-400" />
                        <span className="font-medium">{listing.unit.bathrooms} Bath</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                    {listing.description}
                  </p>
                </CardContent>
                
                <CardFooter className="p-6 pt-0 bg-white border-t border-slate-50 mt-auto">
                  <div className="w-full space-y-3 pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                        {listing.contactName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{listing.contactName}</span>
                        <span className="text-xs text-slate-500">Landlord / Manager</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      <Button 
                        variant="default" 
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                        onClick={() => {
                          incrementView(listing.id);
                          window.location.href = `tel:${listing.contactPhone}`;
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {listing.contactPhone}
                      </Button>
                      
                      {listing.contactEmail && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            incrementView(listing.id);
                            window.location.href = `mailto:${listing.contactEmail}`;
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email Landlord
                        </Button>
                      )}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-slate-200 mt-auto">
        <div className="container mx-auto px-4 md:px-8 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} SmartRentUG. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
