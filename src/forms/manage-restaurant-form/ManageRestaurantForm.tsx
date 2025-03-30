import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import DetailsSection from "./DetailsSection";
import { Separator } from "@/components/ui/separator";
import CuisinesSection from "./CuisinesSection";
import MenuSection from "./MenuSection";
import ImageSection from "./ImageSection";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Restaurant } from "@/types";

// Enhanced form schema with better validation
const formSchema = z.object({
  restaurantName: z.string({
    required_error: "Restaurant name is required"
  }).min(1, "Restaurant name is required"),
  city: z.string({
    required_error: "City is required"
  }).min(1, "City is required"),
  country: z.string({
    required_error: "Country is required"
  }).min(1, "Country is required"),
  deliveryPrice: z.coerce.number({
    required_error: "Delivery price is required",
    invalid_type_error: "Must be a valid number"
  }).min(0, "Delivery price must be positive"),
  estimatedDeliveryTime: z.coerce.number({
    required_error: "Estimated delivery time is required",
    invalid_type_error: "Must be a valid number"
  }).min(5, "Minimum 5 minutes").max(180, "Maximum 3 hours"),
  cuisines: z.array(z.string()).nonempty({
    message: "Please select at least one cuisine"
  }),
  menuItems: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number().min(0.01, "Price must be at least 0.01")
  })).min(1, "At least one menu item is required"),
  imageUrl: z.string().optional(),
  imageFile: z.instanceof(File, { message: "Image is required" }).optional()
}).refine((data) => data.imageUrl || data.imageFile, {
  message: "Either image URL or image file must be provided",
  path: ["imageFile"]
});

type RestaurantFormData = z.infer<typeof formSchema>;

type Props = {
  restaurant?: Restaurant;
  onSave: (restaurantFormData: FormData) => void;
  isLoading: boolean;
};

const ManageRestaurantForm = ({ onSave, isLoading, restaurant }: Props) => {
  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: "",
      city: "",
      country: "",
      deliveryPrice: 0,
      estimatedDeliveryTime: 30, // Default to 30 minutes
      cuisines: [],
      menuItems: [{ name: "", price: 0 }],
      imageFile: undefined
    }
  });

  // Improved data loading with proper type conversion
  useEffect(() => {
    if (!restaurant) return;

    const formatPrice = (price: number) => {
      return price ? Math.round(price / 100) : 0;
    };

    const updatedRestaurant = {
      ...restaurant,
      deliveryPrice: formatPrice(restaurant.deliveryPrice),
      menuItems: restaurant.menuItems?.map(item => ({
        ...item,
        price: formatPrice(item.price)
      })) || []
    };

    form.reset(updatedRestaurant);
  }, [form, restaurant]);

  // Robust form submission handler
  const onSubmit = async (formDataJson: RestaurantFormData) => {
    try {
      const formData = new FormData();

      // Append basic fields
      formData.append("restaurantName", formDataJson.restaurantName);
      formData.append("city", formDataJson.city);
      formData.append("country", formDataJson.country);

      // Convert prices back to cents
      formData.append("deliveryPrice", String(Math.round((formDataJson.deliveryPrice || 0) * 100)));
      formData.append("estimatedDeliveryTime", String(formDataJson.estimatedDeliveryTime));

      // Handle arrays safely
      formDataJson.cuisines?.forEach((cuisine, index) => {
        formData.append(`cuisines[${index}]`, cuisine);
      });

      formDataJson.menuItems?.forEach((menuItem, index) => {
        formData.append(`menuItems[${index}][name]`, menuItem.name);
        formData.append(`menuItems[${index}][price]`, String(Math.round((menuItem.price || 0) * 100)));
      });

      // Handle image (either file or URL)
      if (formDataJson.imageFile) {
        formData.append("imageFile", formDataJson.imageFile);
      } else if (formDataJson.imageUrl) {
        formData.append("imageUrl", formDataJson.imageUrl);
      }

      await onSave(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      // Consider adding user feedback here (e.g., toast notification)
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-gray-50 p-10 rounded-lg">
      <FormProvider {...form}>
        <DetailsSection />
        <Separator />
        <CuisinesSection />
        <Separator />
        <MenuSection />
        <Separator />
        <ImageSection />
        {isLoading ? <LoadingButton /> : <Button type="submit">Submit</Button>}
      </FormProvider>
    </form>
  );
};

export default ManageRestaurantForm;