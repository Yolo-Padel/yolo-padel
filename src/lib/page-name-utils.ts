export const getPageName = (pathname: string) => {
    switch (pathname) {
        case "/admin/dashboard":
            return "Dashboard";
        case "/admin/dashboard/users":
            return "User Management";
        case "/admin/dashboard/court":
            return "Court Management";
        case "/admin/dashboard/venue":
            return "Venue Management";
        case "/admin/dashboard/booking":
            return "Booking Management";
        case "/admin/dashboard/profile":
            return "Profile";
        case "/dashboard/booking":
            return "Booking Court";
        case "/dashboard/order-history":
            return "Order History";
        case "/dashboard/membership":
            return "Membership";
        default:
            return "Dashboard";
    }
}