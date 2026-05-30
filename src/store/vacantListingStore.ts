import { create } from "zustand";
import {
  vacantListingService,
  VacantListing,
  CreateVacantListingDto,
  UpdateVacantListingDto,
} from "@/services/vacant-listing.service";

interface VacantListingStore {
  publicListings: VacantListing[];
  myListings: VacantListing[];
  currentListing: VacantListing | null;
  loading: boolean;
  error: string | null;

  // Public actions
  fetchPublicListings: (filters?: {
    bedrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }) => Promise<void>;
  fetchListingById: (id: string) => Promise<void>;
  incrementView: (id: string) => Promise<void>;

  // Landlord actions
  fetchMyListings: () => Promise<void>;
  createListing: (data: CreateVacantListingDto) => Promise<VacantListing>;
  updateListing: (id: string, data: UpdateVacantListingDto) => Promise<VacantListing>;
  deleteListing: (id: string) => Promise<void>;

  // Utility
  reset: () => void;
}

export const useVacantListingStore = create<VacantListingStore>((set) => ({
  publicListings: [],
  myListings: [],
  currentListing: null,
  loading: false,
  error: null,

  // Public actions
  fetchPublicListings: async (filters) => {
    set({ loading: true, error: null });
    try {
      const listings = await vacantListingService.getAllPublicListings(filters);
      set({ publicListings: listings, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch listings",
        loading: false,
      });
    }
  },

  fetchListingById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const listing = await vacantListingService.getListingById(id);
      set({ currentListing: listing, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch listing",
        loading: false,
      });
    }
  },

  incrementView: async (id: string) => {
    try {
      await vacantListingService.incrementViewCount(id);
    } catch (error) {
      // Silently fail - view count is not critical
      console.error("Failed to increment view count:", error);
    }
  },

  // Landlord actions
  fetchMyListings: async () => {
    set({ loading: true, error: null });
    try {
      const listings = await vacantListingService.getMyListings();
      set({ myListings: listings, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch your listings",
        loading: false,
      });
    }
  },

  createListing: async (data: CreateVacantListingDto) => {
    set({ loading: true, error: null });
    try {
      const listing = await vacantListingService.createListing(data);
      set((state) => ({
        myListings: [listing, ...state.myListings],
        loading: false,
      }));
      return listing;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create listing",
        loading: false,
      });
      throw error;
    }
  },

  updateListing: async (id: string, data: UpdateVacantListingDto) => {
    set({ loading: true, error: null });
    try {
      const updated = await vacantListingService.updateListing(id, data);
      set((state) => ({
        myListings: state.myListings.map((l) => (l.id === id ? updated : l)),
        currentListing: state.currentListing?.id === id ? updated : state.currentListing,
        loading: false,
      }));
      return updated;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update listing",
        loading: false,
      });
      throw error;
    }
  },

  deleteListing: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await vacantListingService.deleteListing(id);
      set((state) => ({
        myListings: state.myListings.filter((l) => l.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete listing",
        loading: false,
      });
      throw error;
    }
  },

  // SECURITY: Reset method to clear all data on logout
  reset: () => {
    console.log("[VacantListingStore] Resetting all listing data");
    set({
      publicListings: [],
      myListings: [],
      currentListing: null,
      loading: false,
      error: null,
    });
  },
}));
