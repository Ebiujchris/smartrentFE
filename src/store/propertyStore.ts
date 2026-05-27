import { create } from "zustand";
import axios from "axios";
import {
  propertyService,
  Property,
  CreatePropertyData,
  CreateUnitData,
  Unit,
} from "@/services/property.service";

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;

    if (typeof apiMessage === "string") {
      return apiMessage;
    }

    if (Array.isArray(apiMessage)) {
      return apiMessage.join(", ");
    }
  }

  return fallback;
}

interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  isLoading: boolean;
  error: string | null;
  fetchProperties: () => Promise<void>;
  fetchProperty: (id: string) => Promise<void>;
  createProperty: (data: CreatePropertyData) => Promise<Property>;
  updateProperty: (
    id: string,
    data: Partial<CreatePropertyData>,
  ) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  createUnit: (propertyId: string, data: CreateUnitData) => Promise<Unit>;
  clearError: () => void;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  currentProperty: null,
  isLoading: false,
  error: null,

  fetchProperties: async () => {
    set({ isLoading: true, error: null });
    try {
      const properties = await propertyService.getAll();
      set({ properties, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to fetch properties"),
        isLoading: false,
      });
    }
  },

  fetchProperty: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const property = await propertyService.getOne(id);
      set({ currentProperty: property, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to fetch property"),
        isLoading: false,
      });
    }
  },

  createProperty: async (data: CreatePropertyData) => {
    set({ isLoading: true, error: null });
    try {
      const property = await propertyService.create(data);
      set((state) => ({
        properties: [...state.properties, property],
        isLoading: false,
      }));
      return property;
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to create property"),
        isLoading: false,
      });
      throw error;
    }
  },

  updateProperty: async (id: string, data: Partial<CreatePropertyData>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await propertyService.update(id, data);
      set((state) => ({
        properties: state.properties.map((p) => (p.id === id ? updated : p)),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to update property"),
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProperty: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await propertyService.delete(id);
      set((state) => ({
        properties: state.properties.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to delete property"),
        isLoading: false,
      });
      throw error;
    }
  },

  createUnit: async (propertyId: string, data: CreateUnitData) => {
    set({ isLoading: true, error: null });
    try {
      const newUnit = await propertyService.createUnit(propertyId, data);
      // Refresh all properties to get updated units list
      await get().fetchProperties();
      set({ isLoading: false });
      return newUnit;
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to create unit"),
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
