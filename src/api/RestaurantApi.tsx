import { SearchState } from "@/pages/SearchPage"
import { Restaurant, RestaurantSearchResponse } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useGetRestaurant = (restaurantId?: string) => {
    const getRestaurantByIdRequest = async (): Promise<Restaurant> => {
        const response = await fetch(
            `${API_BASE_URL}/api/restaurant/${restaurantId}`
        )
        if(!response.ok){
            throw new Error("Failed to get restaurant")
        }

        return response.json()
    }

    const {data: restaurant, isPending} =  useQuery(
        {
            queryKey: ['fetchRestaurant'], // Query key should be an array
            queryFn: getRestaurantByIdRequest, 
            enabled: !!restaurantId
        }
    )

    return { restaurant, isPending}
} 


export const useSearchRestaurants = (
    searchState: SearchState,
    city?: string) => {
    const CreateSearchRequest = async(): Promise<RestaurantSearchResponse> => {

        const params = new URLSearchParams()
        params.set("searchQuery", searchState.searchQuery)
        params.set("page", searchState.page.toString())
        params.set("selectedCuisines", searchState.selectedCuisines.join(","))
        params.set("sortOption", searchState.sortOption)

        const response = await fetch(
            `${API_BASE_URL}/api/restaurant/search/${city}?${params.toString()}`
        )

        if(!response.ok){
            throw new Error("Failed to get restaurant")
        }

        return response.json()
    }

    const { data: results, isPending, error } = useQuery({
        queryKey: ['SearchRestaurants', searchState], // Query key should be an array
        queryFn: CreateSearchRequest, 
        enabled: !!city,
        
    })

     if(error){
            toast.error(error.toString())
        }

return {
    results,
    isPending
}
}