// Implements navigation bars for desktop and mobile

import { UserButton } from "@clerk/nextjs";

import MobileSidebar from "./mobile-sidebar"; // could use "@/components/mobile-sidebar"
import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const Navbar = async () => {
    const apiLimitCount = await getApiLimitCount(); // Fetches api limit count
    const isPro = await checkSubscription();        // Fetches subscription status

    return (
        <div className="flex items-center p-4">
            <MobileSidebar isPro={isPro} apiLimitCount={apiLimitCount} />
            <div className="flex w-full justify-end">
                <UserButton afterSignOutUrl="/"/>

            </div>
        </div>
    );
}

export default Navbar;
