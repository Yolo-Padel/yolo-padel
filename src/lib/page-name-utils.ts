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
        default:
            return "Dashboard";
    }
}