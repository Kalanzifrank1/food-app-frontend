import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import LoadingButton from "./LoadingButton";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import UserProfileForm, { UserFormData } from "@/forms/user-profile-form/UserProfileForm";
import { useGetMyUser } from "@/api/MyUserApi";

type Props = {
    onCheckOut: (userFormData: UserFormData) => void;
    disabled: boolean;
    isLoading: boolean;
};

const CheckOutButton = ({ onCheckOut, disabled, isLoading }: Props) => {
    const { 
        isAuthenticated, 
        isLoading: isAuthLoading, 
        loginWithRedirect 
    } = useAuth0();
    
    const { pathname } = useLocation();
    const { currentUser, isPending: isGetUserLoading } = useGetMyUser();

    const onLogin = async () => {
        await loginWithRedirect({
            appState: {
                returnTo: pathname
            }
        });
    };

    if (!isAuthenticated) {
        return (
            <Button onClick={onLogin} className="bg-orange-500 flex-1">
                Log in to check out
            </Button>
        );
    }

    if (isAuthLoading || !currentUser || isLoading) {
        return <LoadingButton />;
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {/* Ensure only one child is passed to DialogTrigger */}
                <div>
                    <Button disabled={disabled} className="bg-orange-500 flex-1">
                        Go to checkout
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[425px] md:min-w-[700px] bg-gray-50">
                <DialogTitle>Checkout</DialogTitle> 
                <UserProfileForm 
                    currentUser={currentUser} 
                    onSave={onCheckOut} 
                    isLoading={isGetUserLoading}
                    title="Confirm Delivery Details"
                    buttonText="Continue to payment"
                />
            </DialogContent>
        </Dialog>
    );
};

export default CheckOutButton;