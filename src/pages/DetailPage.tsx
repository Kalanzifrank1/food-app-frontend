import { useCreateCheckoutSession } from "@/api/OrderApi"
import { useGetRestaurant } from "@/api/RestaurantApi"
import CheckOutButton from "@/components/CheckOutButton"
import MenuItems from "@/components/MenuItems"
import OrderSummary from "@/components/OrderSummary"

import RestaurantInfo from "@/components/RestaurantInfo"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Card, CardFooter } from "@/components/ui/card"
import { UserFormData } from "@/forms/user-profile-form/UserProfileForm"
import { MenuItem } from "@/types"
import { useState } from "react"
import { useParams } from "react-router-dom"

export type CartItem = {
    _id: string;
    name: string;
    price: number;
    quantity: number
}

const DetailPage = () => {
    const { restaurantId } = useParams()
    const {restaurant, isPending} = useGetRestaurant(restaurantId)
    const { createCheckoutSession, isPending: isCheckoutLoading} = useCreateCheckoutSession()

    const [cartItems, setCartItem] = useState<CartItem[]>(() => {
        const storedCartItems = sessionStorage.getItem(`cartItems-${restaurantId}`)
        return storedCartItems ? JSON.parse(storedCartItems) : []
    })

    const addToCart = (menuItem: MenuItem) => {
        setCartItem((prevCartItems) => {
            //1. check if the item is already in the cart
            const existingCartItem = prevCartItems.find(
                (cartItem) => cartItem._id === menuItem._id
            )
            let updatedCartItems;

            //2. if item is in the cart, update the quantity
            if(existingCartItem){
                updatedCartItems = prevCartItems.map((cartItem) => 
                    cartItem._id === menuItem._id ?
                {...cartItem, quantity: cartItem.quantity + 1}
                : cartItem
                )
            }else{
                updatedCartItems = [
                    ...prevCartItems, {
                        _id: menuItem._id,
                        name: menuItem.name,
                        price: menuItem.price,
                        quantity: 1
                    }
                ]
            }

            //store cartitems into session storage
            sessionStorage.setItem(`cartItems-${restaurantId}`, JSON.stringify(updatedCartItems))
            //3. if item is not in the cart, add it as a new item
            return updatedCartItems 

        })
    }

    //removing a cart itrm
    const removeFromCart = (cartItem: CartItem) => {
        setCartItem((prevCartItems) => {
            const updatedCartItems = prevCartItems.filter(
                (item) => cartItem._id !== item._id
            )
            sessionStorage.setItem(`cartItems-${restaurantId}`, JSON.stringify(updatedCartItems))
            return updatedCartItems
        })
    }

    const onCheckOut = async (userFormData: UserFormData) => {
        console.log("userFormData", userFormData)

        if(!restaurant){
            return
        }

        const checkoutData = {
            cartItems: cartItems.map((cartItem) => ({
                menuItemId: cartItem._id,
                name: cartItem.name,
                quantity: cartItem.quantity.toString()
            })),
            restaurantId: restaurant._id,
            deliveryDetails: {
                name: userFormData.name,
                addressLine1: userFormData.addressLine1,
                city: userFormData.city,
                country: userFormData.country,
                email: userFormData.email as string
            }
        }

        const data = await createCheckoutSession(checkoutData)
        window.location.href = data.url
    }

    if(isPending || !restaurant){
        return "Loading..."
    }
    console.log(restaurant)
  return (
    <div className="flex flex-col gap-10">
        <AspectRatio ratio={16/5}>
            <img src={restaurant.imageUrl} className="rounded-md object-cover h-full w-full"/>
        </AspectRatio>
        <div className="grid md:grid-cols-[4fr_2fr] gap-5 md:px-32">
            <div className="flex flex-col gap-4">
                <RestaurantInfo restaurant={restaurant} />
                <span className="text-2xl font-bold tracking-tight">Menu</span>
                {restaurant.menuItems.map((menuItem) => (
                    <MenuItems  menuItem={menuItem} addToCart={()=> addToCart(menuItem)}/>
                ))}
            </div>

            {/**cart and items */}
            <div>
                <Card>
                    <OrderSummary 
                        restaurant={restaurant} 
                        cartItems={cartItems} 
                        removeFromCart={removeFromCart}
                    />
                    <CardFooter>
                        <CheckOutButton 
                            disabled={cartItems.length === 0} 
                            onCheckOut={onCheckOut}
                            isLoading={isCheckoutLoading}
                        />
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  )
}

export default DetailPage