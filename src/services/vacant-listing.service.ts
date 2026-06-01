import api from "@/lib/api";

export interface CreateVacantListingDto {
  unitId: string;
  title: string;
  description: string;
  highlights: string[];
  contactName: string;
  contactPhone: string;
  images: string[];
  availableFrom: string;
}

export interface UpdateVacantListingDto {
  title?: string;
  description?: string;
  highlights?: string[];
  contactName?: string;
  contactPhone?: string;
  images?: string[];
  availableFrom?: string;
  isActive?: boolean;
}

export interface VacantListing {
  id: string;
  unitId: string;
  title: string;
  description: string;
  highlights: string[];
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  images: string[];
  availableFrom: string;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  unit: {
    id: string;
    unitNumber: string;
    floor?: string;
    bedrooms?: number;
    bathrooms?: number;
    size?: string;
    rentAmount: number;
    status: string;
    property: {
      id: string;
      name: string;
      address: string;
      description?: string;
      owner: {
        id: string;
        fullName: string;
        email: string;
        phone?: string;
      };
    };
  };
}

export const vacantListingService = {
  // Public endpoints - no auth required
  async getAllPublicListings(filters?: {
    bedrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.bedrooms) params.append("bedrooms", filters.bedrooms.toString());
    if (filters?.minPrice) params.append("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
    if (filters?.location) params.append("location", filters.location);

    const url = `/vacant-listings${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  async getListingById(id: string) {
    const response = await api.get(`/vacant-listings/${id}`);
    return response.data;
  },

  async incrementViewCount(id: string) {
    const response = await api.patch(`/vacant-listings/${id}/increment-view`);
    return response.data;
  },

  // Protected endpoints - landlord only
  async getMyListings() {
    const response = await api.get("/vacant-listings/my-listings");
    return response.data;
  },

  async createListing(data: CreateVacantListingDto) {
    const response = await api.post("/vacant-listings", data);
    return response.data;
  },

  async updateListing(id: string, data: UpdateVacantListingDto) {
    const response = await api.patch(`/vacant-listings/${id}`, data);
    return response.data;
  },

  async deleteListing(id: string) {
    const response = await api.delete(`/vacant-listings/${id}`);
    return response.data;
  },
};
