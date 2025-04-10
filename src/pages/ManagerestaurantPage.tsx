import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ManageRestaurantForm from "@/forms/manage-restaurant-form/ManageRestaurantForm";
import { useCreateMyRestaurant, useGetMyRestaurant, useGetMyRestaurantOrders, useUpdateRestaurant } from "@/api/MyRestaurantapi";
import { TabsList, Tabs, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OrderItemCard from "../components/OrderItemCard";
import { Order } from "@/types";

const ManageRestaurantPage = () => {
    const navigate = useNavigate();
    const { createRestaurant, isPending : isCreateLoading, isSuccess } = useCreateMyRestaurant();
    const { restaurant } = useGetMyRestaurant()
    const { updatedRestaurant, isPending: isUpdateLoading } = useUpdateRestaurant()

    const { orders } = useGetMyRestaurantOrders()

    const isEditing = !!restaurant

    useEffect(() => {
        if (isSuccess) {
            navigate("/"); // Redirect after success
        }
    }, [isSuccess, navigate]);

    return (
        <Tabs>
            <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="manage-restaurant">Manage Restaurant</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="space-y-5 bg-gray-50 py-10 rounded-lg">
                <h2 className="text-2xl font-bold">{orders?.length} active orders</h2>
                {orders?.map((order: Order) => (
                    <OrderItemCard order={order} />
                ))}
            </TabsContent>
            <TabsContent value="manage-restaurant">
            <ManageRestaurantForm 
                restaurant={restaurant}
                onSave={isEditing ? updatedRestaurant : createRestaurant}
                isLoading={isCreateLoading || isUpdateLoading} 
            />
            </TabsContent>
        </Tabs> 
    );
};

export default ManageRestaurantPage;