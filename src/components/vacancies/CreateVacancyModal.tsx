"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { vacantListingService } from "@/services/vacant-listing.service";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

interface Unit {
  id: string;
  unitNumber: string;
  rentAmount: number;
  status: string;
  property: {
    name: string;
    address: string;
  };
}

interface CreateVacancyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  units: Unit[];
  onSuccess: () => void;
}

export default function CreateVacancyModal({ open, onOpenChange, units, onSuccess }: CreateVacancyModalProps) {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    unitId: "",
    title: "",
    description: "",
    highlights: "",
    contactName: user?.fullName || "",
    contactPhone: "",
    contactEmail: user?.email || "",
    availableFrom: new Date().toISOString().split("T")[0],
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process each file
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize image logic (max 800px width/height)
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;

          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          
          setImages((prev) => {
            if (prev.length >= 5) {
              toast.error("Maximum 5 images allowed");
              return prev;
            }
            return [...prev, dataUrl];
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unitId) {
      toast.error("Please select a unit");
      return;
    }

    setIsLoading(true);
    try {
      await vacantListingService.createListing({
        unitId: formData.unitId,
        title: formData.title,
        description: formData.description,
        highlights: formData.highlights.split(",").map(h => h.trim()).filter(Boolean),
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        images: images,
        availableFrom: formData.availableFrom,
      });

      toast.success("Listing created successfully");
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setImages([]);
      setFormData({
        ...formData,
        unitId: "",
        title: "",
        description: "",
        highlights: "",
      });
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Failed to create listing");
    } finally {
      setIsLoading(false);
    }
  };

  const vacantUnits = units.filter((u) => u.status === "VACANT");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advertise Vacant Unit</DialogTitle>
          <DialogDescription>
            Create a public listing for a vacant unit. Add attractive photos and details to attract tenants.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label>Select Unit *</Label>
              <Select
                value={formData.unitId}
                onValueChange={(val) => setFormData({ ...formData, unitId: val || "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vacant unit" />
                </SelectTrigger>
                <SelectContent>
                  {vacantUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.property.name} - Unit {unit.unitNumber} (UGX {unit.rentAmount.toLocaleString()})
                    </SelectItem>
                  ))}
                  {vacantUnits.length === 0 && (
                    <SelectItem value="none" disabled>
                      No vacant units available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Listing Title *</Label>
              <Input
                required
                placeholder="e.g. Spacious 2 Bedroom Apartment in Kololo"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                required
                className="h-24"
                placeholder="Describe the property features, neighborhood, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label>Highlights (comma separated)</Label>
              <Input
                placeholder="e.g. Balcony, Free Parking, Security Guard, Wi-Fi"
                value={formData.highlights}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Name *</Label>
                <Input
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
              </div>
              <div>
                <Label>Contact Phone *</Label>
                <Input
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <Label>Available From *</Label>
                <Input
                  type="date"
                  required
                  value={formData.availableFrom}
                  onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <Label className="mb-2 block">Property Photos (Up to 5)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/50 hover:bg-black text-white p-1 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg flex flex-col items-center justify-center transition-colors text-slate-500"
                  >
                    <ImageIcon className="h-6 w-6 mb-2 text-slate-400" />
                    <span className="text-xs font-medium">Add Photo</span>
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
              <p className="text-xs text-slate-500">
                Images will be automatically compressed before uploading.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Listing
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
