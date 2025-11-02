type ProfileProps = {
    user?: {
        id: string;
        clerkId: string;
        email: string;

        userProfile: {
            name: string | null;
            avatarUrl: string | null;
            bio: string | null;
            country: string | null;
        } | null;

        enrollments: {
            id: string;
            course: {
                id: string;
                title: string;
                description: string;
                thumbnailUrl: string;
                price: string;
                modules: {
                    id: string;
                    title: string;
                    description: string;
                    order: number;
                    lessons: {
                        id: string;
                        title: string;
                        duration: number | null;
                    }[];
                }[];
            };
        }[];

        paymentsAsStudent: {
            id: string;
            amount: number;
            status: string;
            createdAt: string;
        }[];

        reviews: {
            id: string;
            rating: number;
            comment: string;
            course: {
                id: string;
                title: string;
                thumbnailUrl: string;
            };
        }[];

        courseProgresses: {
            id: string;
            progress: number;
            course: {
                id: string;
                title: string;
            };
            modules: {
                id: string;
                completed: boolean;
            }[];
        }[];
    };
};

export function Profile({ user }: ProfileProps) {
    if (!user) return null;

    return (
        <div className="flex items-center gap-3 border p-4 rounded-md">
            <img
                src={user.userProfile?.avatarUrl || "/default.png"}
                alt="avatar"
                className="h-14 w-14 rounded-full object-cover"
            />
            <div>
                <p className="font-semibold">
                    {user.userProfile?.name || "Unnamed User"}
                </p>
                <p className="text-sm text-gray-600">{user.email}</p>
            </div>
        </div>
    );
}
