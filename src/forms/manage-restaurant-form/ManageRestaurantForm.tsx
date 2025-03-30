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
  restaurant?: Restaurant | null;  // Now explicitly accepts null
  onSave: (restaurantFormData: FormData) => void;
  isLoading: boolean;
  isError?: boolean;              // New prop for error state
};

const ManageRestaurantForm = ({ onSave, isLoading, isError, restaurant = null }: Props) => {
  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: "",
      city: "",
      country: "",
      deliveryPrice: 0,
      estimatedDeliveryTime: 30,
      cuisines: [],
      menuItems: [{ name: "", price: 0 }],
      imageFile: undefined,
      imageUrl: undefined
    }
  });

  // Initialize form based on restaurant data or empty state
  useEffect(() => {
    const defaultValues = {
      restaurantName: "",
      city: "",
      country: "",
      deliveryPrice: 0,
      estimatedDeliveryTime: 30,
      cuisines: [],
      menuItems: [{ name: "", price: 0 }],
      imageFile: undefined,
      imageUrl: undefined
    };

    // If no restaurant or error, reset to defaults
    if (isError || restaurant === null) {
      form.reset(defaultValues);
      return;
    }

    // If we have restaurant data, format and set values
    if (restaurant) {
      const formatPrice = (price: number) => price ? Math.round(price / 100) : 0;

      form.reset({
        ...defaultValues,
        ...restaurant,
        deliveryPrice: formatPrice(restaurant.deliveryPrice),
        menuItems: restaurant.menuItems?.map(item => ({
          name: item.name,
          price: formatPrice(item.price)
        })) || defaultValues.menuItems
      });
    }
  }, [form, restaurant, isError]);

  const onSubmit = async (formDataJson: RestaurantFormData) => {
    try {
      const formData = new FormData();

      // Basic fields
      formData.append("restaurantName", formDataJson.restaurantName);
      formData.append("city", formDataJson.city);
      formData.append("country", formDataJson.country);

      // Convert prices to cents (backend format)
      formData.append("deliveryPrice", String(Math.round((formDataJson.deliveryPrice || 0) * 100)));
      formData.append("estimatedDeliveryTime", String(formDataJson.estimatedDeliveryTime));

      // Arrays
      formDataJson.cuisines?.forEach((cuisine, index) => {
        formData.append(`cuisines[${index}]`, cuisine);
      });

      formDataJson.menuItems?.forEach((menuItem, index) => {
        formData.append(`menuItems[${index}][name]`, menuItem.name);
        formData.append(`menuItems[${index}][price]`, String(Math.round((menuItem.price || 0) * 100)));
      });

      // Image handling
      if (formDataJson.imageFile) {
        formData.append("imageFile", formDataJson.imageFile);
      } else if (formDataJson.imageUrl) {
        formData.append("imageUrl", formDataJson.imageUrl);
      }

      await onSave(formData);
    } catch (error) {
      console.error("Form submission error:", error);
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