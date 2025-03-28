import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ManageRestaurantForm from "@/forms/manage-restaurant-form/ManageRestaurantForm";
import { useCreateMyRestaurant, useGetMyRestaurant, useUpdateRestaurant } from "@/api/MyRestaurantapi";

const ManageRestaurantPage = () => {
    const navigate = useNavigate();
    const { createRestaurant, isPending : isCreateLoading, isSuccess } = useCreateMyRestaurant();
    const { restaurant } = useGetMyRestaurant()
    const { updatedRestaurant, isPending: isUpdateLoading } = useUpdateRestaurant()

    const isEditing = !!restaurant

    useEffect(() => {
        if (isSuccess) {
            navigate("/"); // Redirect after success
        }
    }, [isSuccess, navigate]);

    return (
        <ManageRestaurantForm 
            restaurant={restaurant}
            onSave={isEditing ? updatedRestaurant : createRestaurant} 
            isLoading={isCreateLoading || isUpdateLoading} 
        />
    );
};

export default ManageRestaurantPage;