import { Restaurant } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {toast} from "sonner"


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const useGetMyRestaurant = () => {
    const { getAccessTokenSilently } = useAuth0()

    const getMyRestaurantRequest = async (): Promise<Restaurant> => {
        const accessToken = await getAccessTokenSilently()

        const response = await fetch(`${API_BASE_URL}/api/my/restaurant`, {
            method: "GET",
            headers: { 
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            }
        })

        // if (response.status === 404) {
        //     //return null// No restaurant exists
        // }

        if(!response.ok){
            throw new Error("Failed to get restaurant")
        }
        return response.json()
    }

    const { data: restaurant, isPending, error } = useQuery({
        queryKey: ['fetchMyRestaurant'], // Query key should be an array
        queryFn: getMyRestaurantRequest // Your fetch function})
    })

    if(error){
        toast.error(error.toString())
    }

    return{
        restaurant, isPending
    }
}

export const useCreateMyRestaurant = () => {


    const { getAccessTokenSilently } = useAuth0();

    const createMyRestaurantRequest = async (restaurantFormData: FormData): Promise<Restaurant> => {
        const accessToken = await getAccessTokenSilently();

        const response = await fetch(`${API_BASE_URL}/api/my/restaurant`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: restaurantFormData,
        });

        if (!response.ok) {
            throw new Error("Failed to create restaurant");
        }

        return response.json();
    };

    const { 
        mutateAsync: createRestaurant, // ✅ Use `mutateAsync` instead of `mutate`
        isPending,
        isSuccess,
        error,
    } = useMutation({
        mutationFn: createMyRestaurantRequest,
        onSuccess: () => toast.success("Restaurant created!"),
        onError: () => toast.error("Unable to create restaurant"),
    });

    return { 
        createRestaurant, 
        isPending, 
        isSuccess, 
        error 
    };
};


export const useUpdateRestaurant = () => {
    const { getAccessTokenSilently } = useAuth0()

    const updatedRestaurantRequest = async (restaurantFormData: FormData): Promise<Restaurant> => {
        const accessToken = await getAccessTokenSilently()

        const response = await fetch(`${API_BASE_URL}/api/my/restaurant`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: restaurantFormData
        })

    if(!response){
        throw new Error("failed to update restaurant")
    }

    return response.json()
    }

    const {mutateAsync: updatedRestaurant, isPending, error, isSuccess}
     = useMutation({
        mutationFn: updatedRestaurantRequest,
        onSuccess: () => toast.success("Restaurant updated!"),
        onError: () => toast.error("Unable to update  restaurant"),
     })

    return{
        updatedRestaurant,
        isPending,
        error,
        isSuccess
    }
}

export const useGetMyRestaurantOrders = () => {
    const { getAccessTokenSilently} = useAuth0()

    const getMyRestaurantOrders = async () => {
        const accessToken = getAccessTokenSilently()

        const response = await fetch(`${API_BASE_URL}/api/my/restaurant/order`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        })
        if(!response.ok){
            throw new Error("Failed to fetch orders")
        }
        return response.json() 
    }

    const { data: orders, isPending } = useQuery({
        queryKey: ['fetchMyRestaurantOrder'],
        queryFn: getMyRestaurantOrders 
    })

    return {
        orders, isPending
    }
}

export type UpdateStatusOrderRequest = {
    orderId: string;
    status: string;
}

export const useUpdateMyRestaurantOrder = () => {
    const {getAccessTokenSilently} = useAuth0()

    const updateMyRestaurantOrder = async(updateStatusOrderRequest: UpdateStatusOrderRequest) => {
        const accessToken = await getAccessTokenSilently()

        const response = await fetch(`${API_BASE_URL}/api/my/restaurant/order/${updateStatusOrderRequest.orderId}/status`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: updateStatusOrderRequest.status})
        })

        if(!response.ok){
            throw new Error("Failed to update status")
        }

        return response.json()
    }

    const { mutateAsync: 
        updateRestaurantStatus, isPending, isError, reset,
         isSuccess} =
          useMutation({ mutationFn: updateMyRestaurantOrder})

    if(isSuccess){
        toast.success("order updated")
    }
    if(isError){
        toast.error("unable to update order")
        reset()
    }

    return {
        updateRestaurantStatus,
        isPending,
    }
}